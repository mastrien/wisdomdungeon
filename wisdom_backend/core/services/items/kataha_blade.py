from .base_item import BaseItemStrategy

class KatahaBladeStrategy(BaseItemStrategy):
    def on_correct(self, profile, inv_item, context=None):
        if inv_item.is_broken:
            self._handle_penalty(inv_item)
            return

        # Increase bonus based on internal stacks
        current_bonus = inv_item.metadata.get('xp_bonus', 0.0)
        new_bonus = min(5.0, current_bonus + 0.5)
        inv_item.metadata['xp_bonus'] = round(new_bonus, 2)
        inv_item.save()
            
    def on_wrong(self, profile, inv_item, context=None):
        if inv_item.is_broken:
            self._handle_penalty(inv_item)
            return

        # Breaks and sets penalty
        inv_item.is_broken = True
        inv_item.metadata['penalty_remaining'] = 10
        inv_item.metadata['xp_bonus'] = 0.0 # Reset bonus
        inv_item.save()
        
        # Save the last combo for potential restoration
        if not profile.metadata:
            profile.metadata = {}
        profile.metadata['last_combo'] = profile.current_combo
        profile.save()

    def _handle_penalty(self, inv_item):
        penalty = inv_item.metadata.get('penalty_remaining', 0)
        if penalty > 0:
            inv_item.metadata['penalty_remaining'] = penalty - 1
            if inv_item.metadata['penalty_remaining'] <= 0:
                inv_item.delete()
            else:
                inv_item.save()

    def on_unequip(self, profile, inv_item):
        inv_item.metadata['xp_bonus'] = 0.0
        # save() is handled by the dispatcher

    def apply_modifiers(self, profile, inv_item, xp, gold):
        if inv_item.is_broken:
            if inv_item.metadata.get('penalty_remaining', 0) > 0:
                return int(round(xp * 0.2)), gold
            return xp, gold
        
        bonus = inv_item.metadata.get('xp_bonus', 0.0)
        return int(xp * (1 + bonus)), gold
