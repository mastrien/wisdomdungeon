from core.models import InventoryItem, Profile

class ItemService:
    def trigger_event(self, profile, event_name, context=None):
        """
        Triggers an event for all equipped items.
        event_name: 'on_correct', 'on_wrong', 'on_room_complete', 'on_question_start'
        """
        equipped_items = InventoryItem.objects.filter(profile=profile, is_equipped=True, is_broken=False)
        broken_items = InventoryItem.objects.filter(profile=profile, is_broken=True)
        
        # 1. Handle Broken Item Logic (Decrements penalty count every answer)
        if event_name in ["on_correct", "on_wrong"]:
            for inv_item in broken_items:
                if inv_item.item.effect_type == "kataha_effect":
                    penalty = inv_item.metadata.get('penalty_remaining', 0)
                    if penalty > 0:
                        inv_item.metadata['penalty_remaining'] = penalty - 1
                        if inv_item.metadata['penalty_remaining'] <= 0:
                            inv_item.delete()
                        else:
                            inv_item.save()

        # 2. Trigger active item events
        for inv_item in equipped_items:
            effect_type = inv_item.item.effect_type
            
            if effect_type == "kataha_effect":
                self._handle_kataha_event(profile, inv_item, event_name)
            elif effect_type == "reveal_wrong":
                self._handle_reveal_wrong(profile, inv_item, event_name, context)
        
        self._update_profile_multiplier(profile)

    def _handle_reveal_wrong(self, profile, inv_item, event_name, context):
        if event_name == "on_question_start" and context and 'question' in context:
            if inv_item.current_charges > 0:
                question = context['question']
                correct = question.resposta_correta
                # Find options that are NOT correct
                wrongs = [o for o in question.opcoes if o != correct]
                if wrongs:
                    import random
                    revealed = random.choice(wrongs)
                    # Store in context or profile metadata temporarily
                    if not hasattr(profile, 'metadata') or profile.metadata is None:
                        profile.metadata = {}
                    profile.metadata['revealed_wrong'] = revealed
                    profile.save()
                    
                    inv_item.current_charges -= 1
                    inv_item.save()

    def _update_profile_multiplier(self, profile):
        multiplier = 1.0
        # Bonus only from equipped active
        equipped_active = InventoryItem.objects.filter(profile=profile, is_equipped=True, is_broken=False)
        for inv_item in equipped_active:
            effect_type = inv_item.item.effect_type
            if effect_type == "xp_multiplier":
                multiplier *= inv_item.item.effect_value
            elif effect_type == "kataha_effect":
                bonus = inv_item.metadata.get('xp_bonus', 0.0)
                multiplier *= (1 + bonus)
        
        # Penalty from ANY broken
        all_broken = InventoryItem.objects.filter(profile=profile, is_broken=True)
        for inv_item in all_broken:
            if inv_item.item.effect_type == "kataha_effect":
                if inv_item.metadata.get('penalty_remaining', 0) > 0:
                    multiplier *= 0.2
        
        if not hasattr(profile, 'metadata') or profile.metadata is None:
            profile.metadata = {}
        profile.metadata['xp_multiplier'] = round(multiplier, 2)
        profile.save()

    def _handle_kataha_event(self, profile, inv_item, event_name):
        if event_name == "on_correct":
            # Increase bonus based on internal stacks
            # Bônus = +0.5 per hit, max +5.0
            current_bonus = inv_item.metadata.get('xp_bonus', 0.0)
            new_bonus = min(5.0, current_bonus + 0.5)
            inv_item.metadata['xp_bonus'] = round(new_bonus, 2)
            inv_item.save()
            
        elif event_name == "on_wrong":
            # Breaks and sets penalty
            inv_item.is_broken = True
            inv_item.metadata['penalty_remaining'] = 10
            inv_item.metadata['xp_bonus'] = 0.0 # Reset bonus
            inv_item.save()
            
            # Save the last combo for potential restoration
            profile.metadata['last_combo'] = profile.current_combo
            profile.save()

    def use_item(self, profile, user_item_id):
        """Manually uses an activatable item."""
        try:
            inv_item = InventoryItem.objects.get(id=user_item_id, profile=profile)
            if not inv_item.item.activatable or inv_item.is_broken:
                return {"success": False, "message": "Item cannot be used."}
            
            if inv_item.item.type == 'consumable' and inv_item.quantity <= 0:
                 return {"success": False, "message": "Item esgotado."}
            elif inv_item.item.type == 'passive' and inv_item.current_charges <= 0:
                 return {"success": False, "message": "Sem cargas."}

            effect_type = inv_item.item.effect_type
            result = {"success": True}
            
            if effect_type == "restore_combo":
                last_combo = profile.metadata.get('last_combo', 0)
                profile.current_combo = last_combo
                profile.save()
                result["message"] = f"Combo restaurado para {last_combo}!"
                
            elif effect_type == "heal_hp":
                profile.hp = min(profile.max_hp, profile.hp + 1)
                profile.save()
                result["message"] = "Vida restaurada!"
            
            # Consume
            if inv_item.item.type == 'consumable':
                inv_item.quantity -= 1
                if inv_item.quantity <= 0:
                    inv_item.delete()
                else:
                    inv_item.save()
            else:
                inv_item.current_charges -= 1
                inv_item.save()
                
            return result
            
        except InventoryItem.DoesNotExist:
            return {"success": False, "message": "Item not found."}

    def toggle_equip(self, profile, inventory_item_id):
        """Toggles equipping a passive item."""
        try:
            inv_item = InventoryItem.objects.get(id=inventory_item_id, profile=profile)
            if inv_item.item.type != 'passive':
                return {"success": False, "message": "Somente itens passivos podem ser equipados"}

            is_currently_equipped = inv_item.is_equipped

            # Unequip all others
            equipped_items = InventoryItem.objects.filter(profile=profile, is_equipped=True)
            for item in equipped_items:
                if item.id != inv_item.id:
                    item.is_equipped = False
                    self._handle_unequip(item)
                    item.save()

            if not is_currently_equipped:
                inv_item.is_equipped = True
                inv_item.save()
                profile.equipped_item_id = inv_item.item.id
            else:
                inv_item.is_equipped = False
                self._handle_unequip(inv_item)
                inv_item.save()
                profile.equipped_item_id = None
            
            profile.save()
            self._update_profile_multiplier(profile)
            return {"success": True, "is_equipped": inv_item.is_equipped}
            
        except InventoryItem.DoesNotExist:
            return {"success": False, "message": "Item not found."}

    def _handle_unequip(self, inv_item):
        """Internal logic for when an item is unequipped."""
        if inv_item.item.effect_type == "kataha_effect":
            inv_item.metadata['xp_bonus'] = 0.0
            # inv_item.save() is called by the caller

    def apply_modifiers(self, profile, xp, gold):
        """Applies all active item modifiers to rewards."""
        # Penalty applies from ANY broken item in inventory
        broken_items = InventoryItem.objects.filter(profile=profile, is_broken=True)
        # Bonus applies only from EQUIPPED items
        equipped_items = InventoryItem.objects.filter(profile=profile, is_equipped=True, is_broken=False)
        
        final_xp = xp
        final_gold = gold
        
        # Apply penalties first
        for inv_item in broken_items:
            if inv_item.item.effect_type == "kataha_effect":
                if inv_item.metadata.get('penalty_remaining', 0) > 0:
                    final_xp = int(round(final_xp * 0.2))

        # Apply bonuses
        for inv_item in equipped_items:
            effect_type = inv_item.item.effect_type
            if effect_type == "xp_multiplier":
                final_xp = int(final_xp * inv_item.item.effect_value)
            elif effect_type == "gold_bonus_flat":
                final_gold += int(inv_item.item.effect_value)
            elif effect_type == "kataha_effect":
                bonus = inv_item.metadata.get('xp_bonus', 0.0)
                final_xp = int(final_xp * (1 + bonus))
                
        return final_xp, final_gold
