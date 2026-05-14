from .kataha_blade import KatahaBladeStrategy
from .reveal_wrong import RevealWrongAmuletStrategy
from .basic_stats import XPMultiplierStrategy, GoldBonusStrategy
from .consumables import RestoreComboStrategy, HealHPStrategy
from .vampirism import VampirismStrategy
from .engagement_items import RestfulAmuletStrategy, PhoenixAmuletStrategy

ITEM_REGISTRY = {
    "kataha_effect": KatahaBladeStrategy,
    "reveal_wrong": RevealWrongAmuletStrategy,
    "xp_multiplier": XPMultiplierStrategy,
    "gold_bonus_flat": GoldBonusStrategy,
    "restore_combo": RestoreComboStrategy,
    "heal_hp": HealHPStrategy,
    "vampirism": VampirismStrategy,
    "restful_amulet": RestfulAmuletStrategy,
    "phoenix_amulet": PhoenixAmuletStrategy,
}
