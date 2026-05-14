from core.models import InventoryItem, Profile
from .items.registry import ITEM_REGISTRY

class ItemService:
    def _get_strategy(self, effect_type):
        StrategyClass = ITEM_REGISTRY.get(effect_type)
        if StrategyClass:
            return StrategyClass()
        return None

    def trigger_event(self, profile, event_name, context=None):
        """
        Triggers an event for all relevant items (equipped and broken).
        event_name: 'on_correct', 'on_wrong', 'on_room_complete', 'on_question_start'
        """
        # 1. Trigger events for broken items FIRST (to handle penalty decay from PREVIOUS turns)
        if event_name in ["on_correct", "on_wrong"]:
            broken_items = InventoryItem.objects.filter(profile=profile, is_broken=True)
            for inv_item in broken_items:
                strategy = self._get_strategy(inv_item.item.effect_type)
                if strategy:
                    method = getattr(strategy, event_name, None)
                    if method:
                        method(profile, inv_item, context)

        # 2. Trigger events for equipped items
        equipped_items = InventoryItem.objects.filter(profile=profile, is_equipped=True, is_broken=False)
        for inv_item in equipped_items:
            strategy = self._get_strategy(inv_item.item.effect_type)
            if strategy:
                method = getattr(strategy, event_name, None)
                if method:
                    method(profile, inv_item, context)
        
        self._update_profile_multiplier(profile)

    def _update_profile_multiplier(self, profile):
        multiplier = 1.0
        
        # Penalties from broken items
        broken_items = InventoryItem.objects.filter(profile=profile, is_broken=True)
        for inv_item in broken_items:
             strategy = self._get_strategy(inv_item.item.effect_type)
             if strategy:
                 temp_xp, _ = strategy.apply_modifiers(profile, inv_item, 100, 0)
                 multiplier *= (temp_xp / 100.0)

        # Bonuses from equipped active items
        equipped_items = InventoryItem.objects.filter(profile=profile, is_equipped=True, is_broken=False)
        equipped_item_info = None
        for inv_item in equipped_items:
             strategy = self._get_strategy(inv_item.item.effect_type)
             if strategy:
                 temp_xp, _ = strategy.apply_modifiers(profile, inv_item, 100, 0)
                 multiplier *= (temp_xp / 100.0)
                 
                 # Store info about the equipped item (assuming only one for now)
                 equipped_item_info = {
                     "id": inv_item.id,
                     "name": inv_item.item.name,
                     "is_broken": inv_item.is_broken,
                     "current_charges": inv_item.current_charges,
                     "max_charges": inv_item.item.max_charges,
                     "activatable": inv_item.item.activatable,
                     "effect_type": inv_item.item.effect_type,
                     "xp_bonus": inv_item.metadata.get('xp_bonus', 0.0)
                 }
        
        if not hasattr(profile, 'metadata') or profile.metadata is None:
            profile.metadata = {}
        profile.metadata['xp_multiplier'] = round(multiplier, 2)
        profile.metadata['equipped_item'] = equipped_item_info
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

            strategy = self._get_strategy(inv_item.item.effect_type)
            if not strategy:
                return {"success": False, "message": "Effect not implemented."}

            result = strategy.use(profile, inv_item)
            
            if result.get("success"):
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
                    strategy = self._get_strategy(item.item.effect_type)
                    if strategy:
                        strategy.on_unequip(profile, item)
                    item.save()

            if not is_currently_equipped:
                inv_item.is_equipped = True
                inv_item.save()
                profile.equipped_item_id = inv_item.item.id
            else:
                inv_item.is_equipped = False
                strategy = self._get_strategy(inv_item.item.effect_type)
                if strategy:
                    strategy.on_unequip(profile, inv_item)
                inv_item.save()
                profile.equipped_item_id = None
            
            profile.save()
            self._update_profile_multiplier(profile)
            return {"success": True, "is_equipped": inv_item.is_equipped}
            
        except InventoryItem.DoesNotExist:
            return {"success": False, "message": "Item not found."}

    def apply_modifiers(self, profile, xp, gold):
        """Applies all active item modifiers to rewards."""
        final_xp = xp
        final_gold = gold
        
        # Penalties apply from ALL items (broken)
        broken_items = InventoryItem.objects.filter(profile=profile, is_broken=True)
        for inv_item in broken_items:
            strategy = self._get_strategy(inv_item.item.effect_type)
            if strategy:
                final_xp, final_gold = strategy.apply_modifiers(profile, inv_item, final_xp, final_gold)

        # Bonuses apply from EQUIPPED items
        equipped_items = InventoryItem.objects.filter(profile=profile, is_equipped=True, is_broken=False)
        for inv_item in equipped_items:
            strategy = self._get_strategy(inv_item.item.effect_type)
            if strategy:
                final_xp, final_gold = strategy.apply_modifiers(profile, inv_item, final_xp, final_gold)
                
        return final_xp, final_gold
