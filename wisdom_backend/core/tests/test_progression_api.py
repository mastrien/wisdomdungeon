from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from core.models import Profile, WeeklyDungeon, DungeonRoom, FixedQuestion, UserDungeonProgress
from django.utils import timezone
import datetime

class ProgressionAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="student", password="password")
        self.profile = Profile.objects.create(user=self.user, firebase_uid="uid_student")
        self.client.force_authenticate(user=self.user)
        
        # Setup a dungeon
        self.dungeon = WeeklyDungeon.objects.create(
            title="Algebra Semanal", type="normal", start_date=timezone.now(),
            end_date=timezone.now() + datetime.timedelta(days=7), topic="algebra_basica"
        )
        self.room1 = DungeonRoom.objects.create(dungeon=self.dungeon, order=1)
        self.room2 = DungeonRoom.objects.create(dungeon=self.dungeon, order=2)
        
        for i in range(10):
            q = FixedQuestion.objects.create(
                topic="algebra_basica", enunciado=f"Q{i}", opcoes=["A", "B"], 
                resposta_correta="A", hash=f"h{i}_r1"
            )
            self.room1.questions.add(q)

    def test_get_current_dungeon_initial(self):
        """Valida que inicialmente não há masmorra ativa no progresso."""
        response = self.client.get('/api/dungeon/current/')
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data['current_dungeon'])

    def test_start_dungeon_and_answer(self):
        """Valida o início de uma masmorra e a submissão de respostas."""
        # Start dungeon (implicitly by getting first question or explicitly via endpoint)
        # Let's assume GET /api/dungeon/current/?topic=algebra_basica starts it if not active
        response = self.client.get('/api/dungeon/current/?topic=algebra_basica')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['current_dungeon']['id'], self.dungeon.id)
        self.assertEqual(response.data['room']['order'], 1)
        self.assertEqual(response.data['question_index'], 0)
        
        # Answer correctly
        q_hash = response.data['question']['hash']
        ans_response = self.client.post('/api/answer/', {
            "topic": "algebra_basica",
            "hash": q_hash,
            "selected_answer": "A",
            "correct_answer": "A",
            "time_spent_ms": 5000
        })
        self.assertEqual(ans_response.status_code, 200)
        self.assertTrue(ans_response.data['is_correct'])
        
        # Check progress updated
        progress = UserDungeonProgress.objects.get(profile=self.profile, dungeon=self.dungeon)
        self.assertEqual(progress.current_question_index, 1)

    def test_complete_room_and_streak(self):
        """Valida a conclusão de uma sala e o ganho de streak."""
        progress = UserDungeonProgress.objects.create(
            profile=self.profile, dungeon=self.dungeon, current_room=self.room1, current_question_index=9
        )
        
        # Last question of the room
        q = self.room1.questions.all()[9]
        response = self.client.post('/api/answer/', {
            "topic": "algebra_basica",
            "hash": q.hash,
            "selected_answer": "A",
            "correct_answer": "A",
            "time_spent_ms": 1000
        })
        
        self.assertEqual(response.status_code, 200)
        
        # Should have moved to room 2
        progress.refresh_from_db()
        self.assertEqual(progress.current_room.order, 2)
        self.assertEqual(progress.current_question_index, 0)
        
    def test_list_weekly_dungeons(self):
        """Valida a listagem de masmorras semanais ativas."""
        response = self.client.get('/api/dungeons/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['topic'], "algebra_basica")
