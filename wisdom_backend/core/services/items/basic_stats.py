from .base_item import BaseItemStrategy

class XPMultiplierStrategy(BaseItemStrategy):
    def apply_modifiers(self, profile, inv_item, xp, gold):
        if inv_item.is_broken:
            return xp, gold
        return int(xp * inv_item.item.effect_value), gold

class GoldBonusStrategy(BaseItemStrategy):
    def apply_modifiers(self, profile, inv_item, xp, gold):
        if inv_item.is_broken:
            return xp, gold
        return xp, gold + int(inv_item.item.effect_value)
