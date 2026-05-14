from .base_item import BaseItemStrategy

class RestoreComboStrategy(BaseItemStrategy):
    def use(self, profile, inv_item):
        if inv_item.is_broken:
            return {"success": False, "message": "Item is broken."}
            
        last_combo = profile.metadata.get('last_combo', 0)
        profile.current_combo = last_combo
        profile.save()
        return {"success": True, "message": f"Combo restaurado para {last_combo}!"}

class HealHPStrategy(BaseItemStrategy):
    def use(self, profile, inv_item):
        if inv_item.is_broken:
            return {"success": False, "message": "Item is broken."}
            
        profile.hp = min(profile.max_hp, profile.hp + 1)
        profile.save()
        return {"success": True, "message": "Vida restaurada!"}
