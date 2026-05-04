from django.test import TestCase
from core.services.progression_service import ProgressionService

class ProgressionServiceTest(TestCase):
    def test_level_thresholds(self):
        self.assertEqual(ProgressionService.get_level_threshold(1), 0)
        self.assertEqual(ProgressionService.get_level_threshold(2), 100)
        self.assertEqual(ProgressionService.get_level_threshold(3), 400)
        self.assertEqual(ProgressionService.get_level_threshold(4), 900)

    def test_level_for_xp(self):
        self.assertEqual(ProgressionService.get_level_for_xp(0), 1)
        self.assertEqual(ProgressionService.get_level_for_xp(50), 1)
        self.assertEqual(ProgressionService.get_level_for_xp(100), 2)
        self.assertEqual(ProgressionService.get_level_for_xp(150), 2)
        self.assertEqual(ProgressionService.get_level_for_xp(399), 2)
        self.assertEqual(ProgressionService.get_level_for_xp(400), 3)
        self.assertEqual(ProgressionService.get_level_for_xp(899), 3)
        self.assertEqual(ProgressionService.get_level_for_xp(900), 4)

    def test_xp_for_next_level(self):
        self.assertEqual(ProgressionService.get_xp_for_next_level(1), 100)
        self.assertEqual(ProgressionService.get_xp_for_next_level(2), 400)
        self.assertEqual(ProgressionService.get_xp_for_next_level(3), 900)

    def test_rewards_count(self):
        rewards = ProgressionService.get_rewards()
        self.assertEqual(len(rewards), 30)
        self.assertEqual(rewards[0]['level'], 1)
        self.assertEqual(rewards[29]['level'], 30)

from core.models import Profile, User
from core.services.answer_service import AnswerService

class AnswerServiceProgressionTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.profile = Profile.objects.create(user=self.user, firebase_uid='uid123', xp=0, level=1)
        self.service = AnswerService()

    def test_level_up_on_answer(self):
        # Level 1 to 2 needs 100 XP. Default XP_REWARD is 10.
        # Let's give enough XP to level up.
        self.profile.xp = 95
        self.profile.save()
        
        # Submit correct answer (10 XP)
        self.service.submit_answer(self.profile, 'algebra_basica', 'somehash', 'ans', 'ans')
        
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.xp, 105)
        self.assertEqual(self.profile.level, 2)

    def test_multiple_level_ups(self):
        # From 0 XP to 500 XP should be Level 3 (Threshold for 3 is 400, for 4 is 900)
        self.profile.xp = 395
        self.profile.save()
        
        self.service.submit_answer(self.profile, 'algebra_basica', 'somehash', 'ans', 'ans')
        
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.xp, 405)
        self.assertEqual(self.profile.level, 3)
