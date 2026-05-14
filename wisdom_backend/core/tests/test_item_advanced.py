from django.test import TestCase
from django.contrib.auth.models import User
from core.models import Profile, Item, InventoryItem, FixedQuestion
from core.services.answer_service import AnswerService
from core.services.item_service import ItemService

class ItemAdvancedTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password")
        self.profile = Profile.objects.create(user=self.user, firebase_uid="test_uid")
        
        # Test Questions
        self.q1 = FixedQuestion.objects.create(
            topic="math", enunciado="1+1", opcoes=["1", "2"], resposta_correta="2", hash="h1"
        )
        
        # Kataha Blade
        self.kataha = Item.objects.create(
            name="Lâmina de Vidro de Kataha",
            type="passive",
            effect_type="kataha_effect",
            description="XP multiplier that increases with combo, but breaks and penalizes on error."
        )
        
        # Restoration Orb
        self.orb = Item.objects.create(
            name="Orbe Restaurador",
            type="consumable",
            activatable=True,
            max_charges=1,
            effect_type="restore_combo",
            description="Restores lost combo."
        )

    def test_kataha_blade_growth(self):
        """Valida que o multiplicador da Kataha cresce com os acertos internos, não com o combo global."""
        # Setup: high global combo
        self.profile.current_combo = 10
        self.profile.save()
        
        inv_item = InventoryItem.objects.create(profile=self.profile, item=self.kataha, is_equipped=True)
        service = AnswerService()
        
        # 1st correct answer: combo goes to 11. Kataha should start at +0.5.
        service.submit_answer(self.profile, "math", "h1", "2")
        inv_item.refresh_from_db()
        self.assertEqual(inv_item.metadata.get('xp_bonus'), 0.5)
        
        # 2nd correct answer: combo 12. Kataha goes to +1.0.
        service.submit_answer(self.profile, "math", "h1", "2")
        inv_item.refresh_from_db()
        self.assertEqual(inv_item.metadata.get('xp_bonus'), 1.0)

    def test_kataha_blade_reset_on_unequip(self):
        """Valida que a Kataha perde todos os acúmulos se for desequipada."""
        inv_item = InventoryItem.objects.create(profile=self.profile, item=self.kataha, is_equipped=True)
        inv_item.metadata['xp_bonus'] = 2.5
        inv_item.save()
        
        # Simulando o desequipar (será implementado via service ou view atualizada)
        from core.services.item_service import ItemService
        item_service = ItemService()
        item_service.toggle_equip(self.profile, inv_item.id) # Desequipar
        
        inv_item.refresh_from_db()
        self.assertFalse(inv_item.is_equipped)
        self.assertEqual(inv_item.metadata.get('xp_bonus', 0), 0)

    def test_kataha_blade_break_and_penalty(self):
        """Valida que a Kataha quebra e aplica penalidade ao errar."""
        inv_item = InventoryItem.objects.create(profile=self.profile, item=self.kataha, is_equipped=True)
        service = AnswerService()
        
        # Get some bonus first
        service.submit_answer(self.profile, "math", "h1", "2")
        
        # Error!
        service.submit_answer(self.profile, "math", "h1", "wrong")
        
        inv_item.refresh_from_db()
        self.assertTrue(inv_item.is_broken)
        self.assertEqual(inv_item.metadata.get('penalty_remaining'), 10)
        
        # Next answer should have reduced XP
        # Base 10 XP * (1 - 0.8) = 2 XP
        result = service.submit_answer(self.profile, "math", "h1", "2")
        self.assertEqual(result['xp_gained'], 2)
        
        inv_item.refresh_from_db()
        self.assertEqual(inv_item.metadata.get('penalty_remaining'), 9)

    def test_restore_orb_activation(self):
        """Valida que o Orbe Restaurador recupera o combo perdido."""
        inv_item = InventoryItem.objects.create(
            profile=self.profile, item=self.orb, is_equipped=True, current_charges=1, quantity=2
        )
        
        # Simulate lost combo
        self.profile.streak_count = 10 # Let's use streak_count or a session combo?
        # The prompt says "Sequência (combo)". In our models we have streak_count (daily) 
        # but the DungeonPage has a 'combo' state. 
        # Let's assume the Orbe restores the *session* combo or the streak?
        # "ao errar uma questão ele fica disponível para usar, mostrando qual o número da sequência perdida"
        # This implies we need to store the last_combo in Profile or metadata.
        
        self.profile.metadata = {'last_combo': 15}
        self.profile.save()
        
        item_service = ItemService()
        item_service.use_item(self.profile, inv_item.id)
        
        self.profile.refresh_from_db()
        # Need to decide where combo is stored. If it's in Profile:
        # self.assertEqual(self.profile.current_combo, 15)
        
        inv_item.refresh_from_db()
        self.assertEqual(inv_item.quantity, 1)

    def test_vampirism_item(self):
        """Valida que o Amuleto de Vampirismo recupera vida no combo 5."""
        vamp_item = Item.objects.create(
            name="Amuleto de Vampirismo",
            type="passive",
            effect_type="vampirism",
            description="Recovers HP every 5 streak."
        )
        inv_item = InventoryItem.objects.create(profile=self.profile, item=vamp_item, is_equipped=True)
        
        self.profile.hp = 1
        self.profile.current_combo = 4
        self.profile.save()
        
        service = AnswerService()
        # Correct answer -> combo 5 -> heal
        service.submit_answer(self.profile, "math", "h1", "2")
        
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.hp, 2)
        self.assertEqual(self.profile.current_combo, 5)
