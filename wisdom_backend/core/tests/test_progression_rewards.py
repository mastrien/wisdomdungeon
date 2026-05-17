from django.test import TestCase
from core.services.progression_service import ProgressionService

class ProgressionRewardsTest(TestCase):
    def test_level_5_reward_includes_avatar(self):
        rewards = ProgressionService.get_rewards()
        # Find level 5 reward
        lvl5 = next((r for r in rewards if r['level'] == 5), None)
        self.assertIsNotNone(lvl5)
        # Find custom_avatar feature
        avatar_feature = next((reward for reward in lvl5['rewards'] if reward.get('id') == 'custom_avatar'), None)
        self.assertIsNotNone(avatar_feature)
        self.assertEqual(avatar_feature['name'], "Avatar Customizado")
