from core.models import QuestionHistory, UserDungeonProgress, DungeonRoom, FixedQuestion, Item, InventoryItem
from django.utils import timezone
from core.services.item_service import ItemService

class AnswerService:
    XP_REWARD = 10
    GOLD_REWARD = 5

    def submit_answer(self, profile, topic, question_hash, selected_answer, correct_answer=None, time_spent_ms=0, dungeon_type='normal'):
        item_service = ItemService()
        
        # 1. Get FixedQuestion and validate
        actual_correct_answer = correct_answer
        try:
            fixed_q = FixedQuestion.objects.get(hash=question_hash)
            actual_correct_answer = fixed_q.resposta_correta
            is_correct = selected_answer == actual_correct_answer
            
            fixed_q.total_attempts += 1
            if is_correct:
                fixed_q.total_correct += 1
            # Simple moving average for time
            if fixed_q.avg_time_ms == 0:
                fixed_q.avg_time_ms = time_spent_ms
            else:
                fixed_q.avg_time_ms = (fixed_q.avg_time_ms + time_spent_ms) // 2
            fixed_q.save()
        except FixedQuestion.DoesNotExist:
            fixed_q = None
            # Fallback to procedural validation
            is_correct = selected_answer == actual_correct_answer

        # 2. Save history
        QuestionHistory.objects.create(
            profile=profile,
            topic=topic,
            dungeon_type=dungeon_type,
            question_hash=question_hash,
            enunciado=fixed_q.enunciado if fixed_q else "Questão Procedural",
            is_correct=is_correct,
            time_spent_ms=time_spent_ms
        )
        
        # 3. Handle Combo
        if is_correct:
            profile.current_combo += 1
            if profile.current_combo > profile.max_combo:
                profile.max_combo = profile.current_combo
        else:
            profile.current_combo = 0
        profile.save()
        profile.refresh_from_db() # IMPORTANT: ensures item_service sees updated combo

        # 4. Trigger Reactive Events (NOW with updated combo)
        if is_correct:
            item_service.trigger_event(profile, "on_correct")
        else:
            item_service.trigger_event(profile, "on_wrong")
            
        # 5. Handle HP Loss
        if not is_correct:
            profile.hp = max(0, profile.hp - 1)
            profile.save()
        
        # 5. Update UserDungeonProgress (always advance even on error)
        progress = UserDungeonProgress.objects.filter(
            profile=profile, 
            dungeon__topic=topic, 
            dungeon__type=dungeon_type,
            dungeon__is_active=True
        ).first()
        
        room_completed = False
        dungeon_completed = False

        if progress:
            progress.current_question_index += 1
            
            # Check if room completed
            if progress.current_question_index >= 10:
                progress.current_question_index = 0
                next_room = DungeonRoom.objects.filter(dungeon=progress.dungeon, order=progress.current_room.order + 1).first()
                
                if next_room:
                    progress.current_room = next_room
                    room_completed = True
                    # Recover Charges
                    self._recover_item_charges(profile)
                else:
                    # Dungeon completed
                    progress.is_completed = True
                    dungeon_completed = True
                    if progress.dungeon.type == 'elite':
                        profile.total_elite_dungeons_completed += 1
                    else:
                        profile.total_normal_dungeons_completed += 1
                
                # Update Streak on room completion (only if they are actually progressing)
                if is_correct or room_completed or dungeon_completed:
                    self._update_streak(profile)
                
            progress.save()

        # 6. Rewards with Item Modifiers and HP Penalty
        xp_gained = 0
        gold_gained = 0
        if is_correct:
            if profile.hp > 0:
                xp_gained = self.XP_REWARD
                gold_gained = self.GOLD_REWARD
                
                # Apply Item Modifiers
                xp_gained, gold_gained = item_service.apply_modifiers(profile, xp_gained, gold_gained)
                
                profile.xp += xp_gained
                profile.gold += gold_gained
                
                # Recalculate level
                from core.services.progression_service import ProgressionService
                new_level = ProgressionService.get_level_for_xp(profile.xp)
                level_up_rewards = []
                if new_level > profile.level:
                    # Give rewards for each level skipped
                    for lv in range(profile.level + 1, new_level + 1):
                        rewards = ProgressionService.get_rewards_for_level(lv)
                        for r in rewards:
                            if r['type'] == 'gold':
                                profile.gold += r['amount']
                                level_up_rewards.append(r)
                            # Handle other reward types if needed
                    
                    profile.level = new_level
            else:
                # User is dead (0 HP), no rewards
                xp_gained = 0
                gold_gained = 0
                
            profile.save()
            
        return {
            "is_correct": is_correct,
            "correct_answer": actual_correct_answer,
            "xp_gained": xp_gained,
            "gold_gained": gold_gained,
            "room_completed": room_completed,
            "dungeon_completed": dungeon_completed,
            "next_question_index": progress.current_question_index if progress else None,
            "combo": profile.current_combo,
            "hp": profile.hp
        }

    def _recover_item_charges(self, profile):
        equipped_items = InventoryItem.objects.filter(profile=profile, is_equipped=True, is_broken=False)
        for inv_item in equipped_items:
            if inv_item.item.recovery_rate > 0:
                inv_item.current_charges = min(inv_item.item.max_charges, inv_item.current_charges + inv_item.item.recovery_rate)
                inv_item.save()

    def _update_streak(self, profile):
        today = timezone.now().date()
        
        # Only process if it's a new day
        if profile.last_activity_date == today:
            return

        # If it's the next day exactly, increment streak
        if profile.last_activity_date == today - timezone.timedelta(days=1):
            profile.streak_count += 1
        else:
            # If it's more than 1 day or first activity, reset to 1
            # (unless they are within a protection period - logic can be added later)
            profile.streak_count = 1
        
        profile.last_activity_date = today
        profile.save()
