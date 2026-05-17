from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from core.models import Profile, WeeklyDungeon, DungeonRoom, FixedQuestion, UserDungeonProgress
from unittest.mock import patch
import json

class DungeonIndexErrorTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', email='test@test.com')
        self.profile = Profile.objects.create(user=self.user, firebase_uid='uid123')
        
        self.dungeon = WeeklyDungeon.objects.create(
            title="Algebra Dungeon",
            topic="algebra_basica",
            start_date="2026-05-01T00:00:00Z",
            end_date="2026-05-31T23:59:59Z",
            is_active=True
        )
        self.room = DungeonRoom.objects.create(dungeon=self.dungeon, order=1)
        # ONLY 5 QUESTIONS
        for i in range(5):
            q = FixedQuestion.objects.create(
                topic="algebra_basica",
                enunciado=f"Q{i}",
                opcoes=["A", "B"],
                resposta_correta="A",
                hash=f"hash{i}"
            )
            self.room.questions.add(q)
        
        self.progress = UserDungeonProgress.objects.create(
            profile=self.profile,
            dungeon=self.dungeon,
            current_room=self.room,
            current_question_index=0
        )
        
        self.client = Client()
        self.client.force_login(self.user)

    @patch('core.auth.FirebaseAuthentication.authenticate')
    def test_get_current_dungeon_with_out_of_bounds_index(self, mock_auth):
        mock_auth.return_value = (self.user, None)
        
        # Create a second room
        self.room2 = DungeonRoom.objects.create(dungeon=self.dungeon, order=2)
        q = FixedQuestion.objects.create(
            topic="algebra_basica", enunciado="Q_Room2", opcoes=["A"], resposta_correta="A", hash="hash_r2"
        )
        self.room2.questions.add(q)

        # Manually set index to 5 (out of bounds for 5 questions in room 1)
        self.progress.current_question_index = 5
        self.progress.save()
        
        url = reverse('dungeon_current') + "?topic=algebra_basica&type=normal"
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['room']['order'], 2)
        self.assertEqual(response.data['question_index'], 0)
        self.assertEqual(response.data['question']['enunciado'], "Q_Room2")
        
        self.progress.refresh_from_db()
        self.assertEqual(self.progress.current_room.order, 2)
        self.assertEqual(self.progress.current_question_index, 0)

    @patch('core.auth.FirebaseAuthentication.authenticate')
    def test_answer_service_dynamic_room_transition(self, mock_auth):
        mock_auth.return_value = (self.user, None)
        
        # Room 1 has 5 questions. We answer the 5th (index 4).
        self.progress.current_question_index = 4
        self.progress.save()
        
        # Create Room 2
        DungeonRoom.objects.create(dungeon=self.dungeon, order=2)

        url = reverse('answer')
        payload = {
            "topic": "algebra_basica",
            "type": "normal",
            "hash": "hash4", # 5th question
            "selected_answer": "A",
            "time_spent_ms": 1000
        }
        
        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['room_completed'])
        
        self.progress.refresh_from_db()
        self.assertEqual(self.progress.current_room.order, 2)
        self.assertEqual(self.progress.current_question_index, 0)
