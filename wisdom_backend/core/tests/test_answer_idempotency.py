from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from core.models import Profile, WeeklyDungeon, DungeonRoom, FixedQuestion, UserDungeonProgress
from unittest.mock import patch
import json

class AnswerIdempotencyTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', email='test@test.com')
        self.profile = Profile.objects.create(user=self.user, firebase_uid='uid123')
        
        self.dungeon = WeeklyDungeon.objects.create(
            title="Algebra Dungeon",
            topic="algebra_basica",
            start_date="2026-05-01T00:00:00Z",
            end_date="2026-05-31T23:59:59Z"
        )
        self.room = DungeonRoom.objects.create(dungeon=self.dungeon, order=1)
        self.question = FixedQuestion.objects.create(
            topic="algebra_basica",
            enunciado="2+2?",
            opcoes=["3", "4", "5"],
            resposta_correta="4",
            hash="hash123"
        )
        self.room.questions.add(self.question)
        
        self.progress = UserDungeonProgress.objects.create(
            profile=self.profile,
            dungeon=self.dungeon,
            current_room=self.room,
            current_question_index=0
        )
        
        self.client = Client()
        self.client.force_login(self.user)

    @patch('core.auth.FirebaseAuthentication.authenticate')
    def test_duplicate_answer_submission(self, mock_auth):
        """
        Submitting the exact same answer multiple times shouldn't advance the question 
        index more than once for the same question.
        """
        mock_auth.return_value = (self.user, None)
        
        payload = {
            "topic": "algebra_basica",
            "type": "normal",
            "hash": "hash123",
            "selected_answer": "4",
            "correct_answer": "4",
            "time_spent_ms": 1000
        }
        
        url = reverse('answer') # Assuming the URL name is 'answer'
        
        # First submission
        response1 = self.client.post(
            url, 
            data=json.dumps(payload), 
            content_type='application/json'
        )
        self.assertEqual(response1.status_code, 200)
        self.progress.refresh_from_db()
        self.assertEqual(self.progress.current_question_index, 1)
        
        # Second submission (immediate retry/duplicate)
        response2 = self.client.post(
            url, 
            data=json.dumps(payload), 
            content_type='application/json'
        )
        # It should probably return success but NOT increment index again 
        # (or return an error indicating it was already processed)
        self.progress.refresh_from_db()
        self.assertEqual(self.progress.current_question_index, 1, "Question index should not increment twice for the same hash")
