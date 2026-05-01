from django.test import TestCase
from core.services.math_generator import MathGenerator

class MathGeneratorTest(TestCase):
    def setUp(self):
        self.generator = MathGenerator()

    def test_generate_basic_algebra_question(self):
        """Teste se gera uma questão de álgebra básica com enunciado, opções e resposta correta."""
        question = self.generator.generate_question(topic="algebra_basica")
        
        self.assertIn("enunciado", question)
        self.assertIn("opcoes", question)
        self.assertIn("resposta_correta", question)
        self.assertIn("hash", question)
        self.assertEqual(len(question["opcoes"]), 4)
        self.assertIn(question["resposta_correta"], question["opcoes"])
        self.assertTrue(isinstance(question["enunciado"], str))

    def test_generate_basic_calculus_question(self):
        """Teste se gera uma questão de cálculo (derivada) com estrutura correta."""
        question = self.generator.generate_question(topic="calculo_basico")
        
        self.assertIn("enunciado", question)
        self.assertIn("opcoes", question)
        self.assertIn("resposta_correta", question)
        self.assertIn("hash", question)
        self.assertTrue(question["enunciado"].startswith("Qual a derivada de"))

    def test_generate_geometry_question(self):
        """Teste se gera uma questão de geometria com estrutura correta."""
        question = self.generator.generate_question(topic="geometria")
        
        self.assertIn("enunciado", question)
        self.assertIn("opcoes", question)
        self.assertIn("resposta_correta", question)
        self.assertIn("hash", question)
        self.assertTrue("área" in question["enunciado"].lower())

    def test_generate_linear_algebra_question(self):
        """Teste se gera uma questão de álgebra linear (determinante) com estrutura correta."""
        question = self.generator.generate_question(topic="algebra_linear")
        
        self.assertIn("enunciado", question)
        self.assertIn("hash", question)
        self.assertTrue("determinante" in question["enunciado"].lower())

    def test_generate_probability_question(self):
        """Teste se gera uma questão de probabilidade com estrutura correta."""
        question = self.generator.generate_question(topic="probabilidade")
        
        self.assertIn("enunciado", question)
        self.assertIn("hash", question)
        self.assertTrue("probabilidade" in question["enunciado"].lower())
