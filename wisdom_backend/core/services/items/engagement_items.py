from .base_item import BaseItemStrategy

class RestfulAmuletStrategy(BaseItemStrategy):
    """Restaura 1 de vida ao completar uma sala."""
    def on_room_complete(self, profile, inv_item, context=None):
        if inv_item.is_broken:
            return
            
        if profile.hp < profile.max_hp:
            profile.hp += 1
            profile.save()

class PhoenixAmuletStrategy(BaseItemStrategy):
    """Uma vida extra: se o HP chegar a 0, restaura 1 e o item quebra."""
    def on_death(self, profile, inv_item, context=None):
        if inv_item.is_broken:
            return
            
        profile.hp = 1
        profile.save()
        
        inv_item.is_broken = True
        inv_item.save()
        # Item stays in inventory but broken. 
        # Requirement: "A espada se quebra e some... após a penalidade ser aplicada".
        # Phoenix doesn't have penalty, so it just stays broken.
