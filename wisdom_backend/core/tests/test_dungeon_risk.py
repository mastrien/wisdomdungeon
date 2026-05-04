from django.test import TestCase
from django.contrib.auth.models import User
from core.models import Profile, WeeklyDungeon, DungeonRoom, FixedQuestion, UserDungeonProgress
from core.services.answer_service import AnswerService
from django.utils import timezone

class DungeonRiskTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="hero", email="hero@dungeon.com")
        # Note: hp and max_hp don't exist yet, but I'll write the test as if they do
        self.profile = Profile.objects.create(user=self.user, firebase_uid="hero_uid")
        self.service = AnswerService()
        
        # Setup a dungeon
        self.dungeon = WeeklyDungeon.objects.create(
            title="Masmorra de Teste",
            topic="algebra_basica",
            start_date=timezone.now(),
            end_date=timezone.now() + timezone.timedelta(days=7)
        )
        self.room = DungeonRoom.objects.create(dungeon=self.dungeon, order=1)
        
        self.questions = []
        for i in range(5):
            q = FixedQuestion.objects.create(
                topic="algebra_basica",
                enunciado=f"Questão {i}",
                opcoes=["A", "B", "C", "D"],
                resposta_correta="A",
                hash=f"hash_{i}"
            )
            self.room.questions.add(q)
            self.questions.append(q)
            
        self.progress = UserDungeonProgress.objects.create(
            profile=self.profile,
            dungeon=self.dungeon,
            current_room=self.room,
            current_question_index=0
        )

    def test_hp_loss_and_skip_on_wrong_answer(self):
        """Teste se ao errar perde HP e pula para a próxima questão."""
        # Setup initial HP (assuming default is 3)
        self.profile.hp = 3
        self.profile.save()
        
        question = self.questions[0]
        response = self.service.submit_answer(
            profile=self.profile,
            topic="algebra_basica",
            question_hash=question.hash,
            selected_answer="B", # Errada
            dungeon_type="normal"
        )
        
        self.profile.refresh_from_db()
        self.progress.refresh_from_db()
        
        self.assertFalse(response["is_correct"])
        self.assertEqual(self.profile.hp, 2) # Perdeu 1 HP
        self.assertEqual(self.progress.current_question_index, 1) # Pulou a questão
        self.assertEqual(response["correct_answer"], "A") # Mostra a resposta correta

    def test_reward_penalty_at_zero_hp(self):
        """Teste se com 0 HP o usuário recebe apenas 25% da recompensa."""
        self.profile.hp = 0
        self.profile.gold = 0
        self.profile.xp = 0
        self.profile.save()
        
        question = self.questions[0]
        # Resposta Correta
        response = self.service.submit_answer(
            profile=self.profile,
            topic="algebra_basica",
            question_hash=question.hash,
            selected_answer="A", 
            dungeon_type="normal"
        )
        
        self.profile.refresh_from_db()
        
        # Reward padrão: XP=10, Gold=5. 25% de 10 = 2.5 (int 2), 25% de 5 = 1.25 (int 1)
        # Ou podemos arredondar. O plano diz "25% por exemplo".
        # Vou assumir floor(REWARD * 0.25)
        self.assertEqual(response["xp_gained"], 2) 
        self.assertEqual(response["gold_gained"], 1)
        self.assertEqual(self.profile.xp, 2)
        self.assertEqual(self.profile.gold, 1)

    def test_no_hp_loss_on_correct_answer(self):
        """Teste se ao acertar NÃO perde HP."""
        self.profile.hp = 3
        self.profile.save()
        
        question = self.questions[0]
        response = self.service.submit_answer(
            profile=self.profile,
            topic="algebra_basica",
            question_hash=question.hash,
            selected_answer="A", 
            dungeon_type="normal"
        )
        
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.hp, 3)
        self.assertTrue(response["is_correct"])
