class BaseItemStrategy:
    """
    Base class for all item behaviors.
    Methods should be overridden to implement specific logic.
    """
    def on_correct(self, profile, inv_item, context=None):
        pass

    def on_wrong(self, profile, inv_item, context=None):
        pass

    def on_room_complete(self, profile, inv_item, context=None):
        pass
        
    def on_question_start(self, profile, inv_item, context=None):
        pass

    def on_equip(self, profile, inv_item):
        pass

    def on_unequip(self, profile, inv_item):
        pass

    def use(self, profile, inv_item):
        """Logic for activatable items."""
        return {"success": False, "message": "Item cannot be used."}

    def apply_modifiers(self, profile, inv_item, xp, gold):
        """Applies reward modifiers (XP, Gold)."""
        return xp, gold
