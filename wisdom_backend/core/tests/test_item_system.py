from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from core.models import Profile, Item, InventoryItem, FixedQuestion
from core.services.answer_service import AnswerService

class ItemSystemTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="warrior", password="password")
        self.profile = Profile.objects.create(user=self.user, firebase_uid="uid_warrior")
        self.client.force_authenticate(user=self.user)
        
        # Fixed Question for testing rewards
        self.question = FixedQuestion.objects.create(
            topic="algebra_basica", enunciado="Q1", opcoes=["A"], resposta_correta="A", hash="h_item_test"
        )
        
        # XP Multiplier Item
        self.xp_item = Item.objects.create(
            name="Amuleto de Sabedoria",
            description="1.5x XP",
            type="passive",
            rarity="rare",
            effect_type="xp_multiplier",
            effect_value=1.5
        )
        
        # Gold Bonus Item
        self.gold_item = Item.objects.create(
            name="Bolsa de Moedas",
            description="+10 Gold per question",
            type="passive",
            rarity="common",
            effect_type="gold_bonus_flat",
            effect_value=10.0
        )

    def test_xp_multiplier_effect(self):
        """Valida que o multiplicador de XP do item é aplicado corretamente."""
        InventoryItem.objects.create(profile=self.profile, item=self.xp_item, is_equipped=True)
        self.profile.equipped_item_id = self.xp_item.id
        self.profile.save()
        
        service = AnswerService()
        result = service.submit_answer(self.profile, "algebra_basica", self.question.hash, "A", "A")
        
        # Base XP is 10. With 1.5x, should be 15.
        self.assertEqual(result['xp_gained'], 15)
        self.assertEqual(self.profile.xp, 15)

    def test_gold_bonus_flat_effect(self):
        """Valida que o bônus fixo de ouro do item é aplicado corretamente."""
        InventoryItem.objects.create(profile=self.profile, item=self.gold_item, is_equipped=True)
        self.profile.equipped_item_id = self.gold_item.id
        self.profile.save()
        
        service = AnswerService()
        result = service.submit_answer(self.profile, "algebra_basica", self.question.hash, "A", "A")
        
        # Base Gold is 5. With +10, should be 15.
        self.assertEqual(result['gold_gained'], 15)
        self.assertEqual(self.profile.gold, 15)

    def test_inventory_api_list_and_equip(self):
        """Valida a API de inventário para listagem e equipagem."""
        inv_item = InventoryItem.objects.create(profile=self.profile, item=self.xp_item, is_equipped=False)
        
        # List inventory
        response = self.client.get('/api/inventory/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertFalse(response.data[0]['is_equipped'])
        
        # Equip item
        equip_response = self.client.post(f'/api/inventory/{inv_item.id}/equip/')
        self.assertEqual(equip_response.status_code, 200)
        self.assertTrue(equip_response.data['is_equipped'])
        
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.equipped_item_id, self.xp_item.id)
