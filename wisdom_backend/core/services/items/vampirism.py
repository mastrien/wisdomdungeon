from .base_item import BaseItemStrategy

class VampirismStrategy(BaseItemStrategy):
    def on_correct(self, profile, inv_item, context=None):
        if inv_item.is_broken:
            return

        # Trigger effect every 5-hit streak
        if profile.current_combo > 0 and profile.current_combo % 5 == 0:
            if profile.hp < profile.max_hp:
                profile.hp += 1
                profile.save()
                # We could add a message to metadata or context if we had a log system
