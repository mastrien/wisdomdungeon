from core.models import QuestionHistory, UserDungeonProgress, DungeonRoom, FixedQuestion, Item
from django.utils import timezone

class AnswerService:
    XP_REWARD = 10
    GOLD_REWARD = 5

    def submit_answer(self, profile, topic, question_hash, selected_answer, correct_answer=None, time_spent_ms=0, dungeon_type='normal'):
        # 1. Get FixedQuestion and validate
        try:
            fixed_q = FixedQuestion.objects.get(hash=question_hash)
            is_correct = selected_answer == fixed_q.resposta_correta
            
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
            # Fallback to procedural validation if correct_answer was provided
            is_correct = selected_answer == correct_answer

        # 2. Save history
        QuestionHistory.objects.create(
            profile=profile,
            topic=topic,
            question_hash=question_hash,
            enunciado=fixed_q.enunciado if fixed_q else "Questão Procedural",
            is_correct=is_correct,
            time_spent_ms=time_spent_ms
        )
        
        # 3. Update UserDungeonProgress
        progress = UserDungeonProgress.objects.filter(
            profile=profile, 
            dungeon__topic=topic, 
            dungeon__type=dungeon_type,
            dungeon__is_active=True
        ).first()
        
        room_completed = False
        dungeon_completed = False

        if progress and is_correct:
            progress.current_question_index += 1
            
            # Check if room completed
            if progress.current_question_index >= 10:
                progress.current_question_index = 0
                next_room = DungeonRoom.objects.filter(dungeon=progress.dungeon, order=progress.current_room.order + 1).first()
                
                if next_room:
                    progress.current_room = next_room
                    room_completed = True
                else:
                    # Dungeon completed
                    progress.is_completed = True
                    dungeon_completed = True
                    if progress.dungeon.type == 'elite':
                        profile.total_elite_dungeons_completed += 1
                    else:
                        profile.total_normal_dungeons_completed += 1
                
                # Update Streak on room completion
                self._update_streak(profile)
                
            progress.save()

        # 4. Rewards with Item Modifiers
        xp_gained = 0
        gold_gained = 0
        if is_correct:
            xp_gained = self.XP_REWARD
            gold_gained = self.GOLD_REWARD
            
            # Apply Item Modifiers
            if profile.equipped_item_id:
                try:
                    item = Item.objects.get(id=profile.equipped_item_id)
                    if item.effect_type == "xp_multiplier":
                        xp_gained = int(xp_gained * item.effect_value)
                    elif item.effect_type == "gold_bonus_flat":
                        gold_gained += int(item.effect_value)
                except Item.DoesNotExist:
                    profile.equipped_item_id = None
            
            profile.xp += xp_gained
            profile.gold += gold_gained
            profile.save()
            
        return {
            "is_correct": is_correct,
            "xp_gained": xp_gained,
            "gold_gained": gold_gained,
            "room_completed": room_completed,
            "dungeon_completed": dungeon_completed,
            "next_question_index": progress.current_question_index if progress else None
        }

    def _update_streak(self, profile):
        today = timezone.now().date()
        if profile.last_activity_date != today:
            # If it's the next day, increment
            if profile.last_activity_date == today - timezone.timedelta(days=1):
                profile.streak_count += 1
            elif profile.last_activity_date is None or profile.last_activity_date < today - timezone.timedelta(days=1):
                # Reset if broke streak, unless protected
                profile.streak_count = 1
            
            profile.last_activity_date = today
            profile.save()
