from django.test import TestCase
from django.contrib.auth.models import User
from core.models import (
    Profile, FixedQuestion, WeeklyDungeon, 
    DungeonRoom, UserDungeonProgress, Item, InventoryItem
)
from django.utils import timezone
import datetime

class EngagementModelsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="explorer", password="password")
        self.profile = Profile.objects.create(user=self.user, firebase_uid="test_uid_123")

    def test_profile_expansion(self):
        """Valida os novos campos de engajamento no Profile."""
        profile = self.user.profile
        profile.streak_count = 5
        profile.total_dungeons_completed = 2
        profile.save()
        
        p = Profile.objects.get(id=profile.id)
        self.assertEqual(p.streak_count, 5)
        self.assertEqual(p.total_dungeons_completed, 2)

    def test_fixed_question_model(self):
        """Valida a criação de uma questão fixa com telemetria."""
        question = FixedQuestion.objects.create(
            topic="algebra_basica",
            enunciado="Quanto é 2+2?",
            opcoes=["1", "2", "3", "4"],
            resposta_correta="4",
            hash="test_hash_123"
        )
        self.assertEqual(question.topic, "algebra_basica")
        self.assertEqual(question.total_attempts, 0)

    def test_dungeon_structure(self):
        """Valida a estrutura de masmorras semanais e salas."""
        dungeon = WeeklyDungeon.objects.create(
            title="Desafio de Álgebra",
            type="normal",
            start_date=timezone.now(),
            end_date=timezone.now() + datetime.timedelta(days=7),
            topic="algebra_basica"
        )
        
        room = DungeonRoom.objects.create(dungeon=dungeon, order=1)
        q = FixedQuestion.objects.create(
            topic="algebra_basica", enunciado="Q1", opcoes=[], resposta_correta="A", hash="h1"
        )
        room.questions.add(q)
        
        self.assertEqual(dungeon.rooms.count(), 1)
        self.assertEqual(room.questions.count(), 1)

    def test_user_progress(self):
        """Valida o rastreamento de progresso do usuário."""
        dungeon = WeeklyDungeon.objects.create(
            title="D1", type="normal", start_date=timezone.now(), 
            end_date=timezone.now() + datetime.timedelta(days=7), topic="T1"
        )
        room = DungeonRoom.objects.create(dungeon=dungeon, order=1)
        
        progress = UserDungeonProgress.objects.create(
            profile=self.user.profile,
            dungeon=dungeon,
            current_room=room,
            current_question_index=5
        )
        self.assertEqual(progress.current_question_index, 5)
        self.assertFalse(progress.is_completed)

    def test_item_and_inventory(self):
        """Valida o sistema de itens e inventário."""
        item = Item.objects.create(
            name="Cajado de Cristal",
            description="Aumenta XP",
            type="passive",
            rarity="rare",
            effect_type="xp_multiplier",
            effect_value=1.5
        )
        
        inv = InventoryItem.objects.create(
            profile=self.user.profile,
            item=item,
            is_equipped=True
        )
        self.user.profile.equipped_item_id = item.id
        self.user.profile.save()
        
        self.assertEqual(inv.profile.user.username, "explorer")
        self.assertTrue(inv.is_equipped)
        self.assertEqual(self.user.profile.equipped_item_id, item.id)
