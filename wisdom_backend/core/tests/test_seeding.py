from django.test import TestCase
from django.core.management import call_command
from core.models import WeeklyDungeon, FixedQuestion, DungeonRoom
from io import StringIO

class SeedingTest(TestCase):
    def test_seed_weekly_dungeons_command(self):
        """Valida que o comando de seed gera a estrutura correta de masmorras."""
        out = StringIO()
        call_command('seed_weekly_dungeons', stdout=out)
        
        # Deve gerar 2 masmorras para cada tópico (Normal e Elite)
        # Atualmente temos 5 tópicos (algebra_basica, calculo_basico, geometria, algebra_linear, probabilidade)
        # Total esperado: 5 * 2 = 10 WeeklyDungeons
        self.assertEqual(WeeklyDungeon.objects.count(), 10)
        
        # Cada masmorra deve ter 10 salas
        first_dungeon = WeeklyDungeon.objects.first()
        self.assertEqual(first_dungeon.rooms.count(), 10)
        
        # Cada sala deve ter 10 questões
        first_room = first_dungeon.rooms.first()
        self.assertEqual(first_room.questions.count(), 10)
        
        # Total de questões fixas geradas (pode haver reuso, mas pelo menos 100 por tópico se forem únicas)
        # No seed básico, esperamos que existam questões suficientes.
        self.assertGreater(FixedQuestion.objects.count(), 0)
        self.assertIn("Successfully seeded weekly dungeons", out.getvalue())
