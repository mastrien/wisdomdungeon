from django.test import TestCase
from django.contrib.auth.models import User
from core.models import Profile, QuestionHistory
from core.services.math_generator import MathGenerator
from core.services.answer_service import AnswerService

class AnswerServiceTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tester", email="test@test.com")
        self.profile = Profile.objects.create(user=self.user, firebase_uid="test_uid")
        self.generator = MathGenerator()
        self.service = AnswerService()

    def test_submit_correct_answer(self):
        """Teste se ao enviar resposta correta o XP aumenta e o histórico é salvo."""
        question = self.generator.generate_question(topic="algebra_basica")
        
        initial_xp = self.profile.xp
        response = self.service.submit_answer(
            profile=self.profile,
            topic="algebra_basica",
            question_hash=question["hash"],
            selected_answer=question["resposta_correta"],
            correct_answer=question["resposta_correta"]
        )
        
        self.profile.refresh_from_db()
        self.assertTrue(response["is_correct"])
        self.assertGreater(self.profile.xp, initial_xp)
        self.assertEqual(QuestionHistory.objects.count(), 1)
        self.assertTrue(QuestionHistory.objects.first().is_correct)

    def test_submit_wrong_answer(self):
        """Teste se ao enviar resposta errada o XP NÃO aumenta mas o histórico é salvo."""
        question = self.generator.generate_question(topic="algebra_basica")
        
        # Encontrar uma opção errada
        wrong_answer = [opt for opt in question["opcoes"] if opt != question["resposta_correta"]][0]
        
        initial_xp = self.profile.xp
        response = self.service.submit_answer(
            profile=self.profile,
            topic="algebra_basica",
            question_hash=question["hash"],
            selected_answer=wrong_answer,
            correct_answer=question["resposta_correta"]
        )
        
        self.profile.refresh_from_db()
        self.assertFalse(response["is_correct"])
        self.assertEqual(self.profile.xp, initial_xp)
        self.assertEqual(QuestionHistory.objects.count(), 1)
        self.assertFalse(QuestionHistory.objects.first().is_correct)
