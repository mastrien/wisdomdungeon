from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import WeeklyDungeon, DungeonRoom, FixedQuestion, Item
from core.services.math_generator import MathGenerator
import datetime

class Command(BaseCommand):
    help = 'Seeds the weekly dungeons and rooms'

    def handle(self, *args, **options):
        generator = MathGenerator()
        topics = [
            ("algebra_basica", "Álgebra Básica"),
            ("calculo_basico", "Cálculo Básico"),
            ("geometria", "Geometria"),
            ("algebra_linear", "Álgebra Linear"),
            ("probabilidade", "Probabilidade"),
        ]
        
        start_date = timezone.now()
        end_date = start_date + datetime.timedelta(days=7)

        for topic_id, topic_name in topics:
            for d_type in ['normal', 'elite']:
                d_title = f"{topic_name} - {'Elite' if d_type == 'elite' else 'Semanal'}"
                level_req = 1 # Removing level 10 requirement as requested
                
                dungeon, created = WeeklyDungeon.objects.get_or_create(
                    title=d_title,
                    type=d_type,
                    topic=topic_id,
                    defaults={
                        'start_date': start_date,
                        'end_date': end_date,
                        'is_active': True,
                        'level_required': level_req
                    }
                )
                
                if not created:
                    dungeon.level_required = level_req
                    dungeon.save()
                
                if created:
                    self.stdout.write(f"Created dungeon: {d_title}")
                
                # Create 10 rooms
                for room_order in range(1, 11):
                    room, r_created = DungeonRoom.objects.get_or_create(
                        dungeon=dungeon,
                        order=room_order
                    )
                    
                    # Fill room with 10 questions if it's empty
                    if room.questions.count() < 10:
                        for _ in range(10 - room.questions.count()):
                            q_data = generator.generate_question(topic_id)
                            
                            # Get or create fixed question
                            fixed_q, _ = FixedQuestion.objects.get_or_create(
                                hash=q_data['hash'],
                                defaults={
                                    'topic': topic_id,
                                    'enunciado': q_data['enunciado'],
                                    'opcoes': q_data['opcoes'],
                                    'resposta_correta': q_data['resposta_correta']
                                }
                            )
                            room.questions.add(fixed_q)
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded weekly dungeons'))

        # Seed Items
        items_to_seed = [
            {
                "name": "Lâmina de Vidro de Kataha",
                "description": "Concede +0.5 de multiplicador de XP por sequência de acertos que acumula até +5.0, mas se a sequência for quebrada você recebe uma penalidade de -80% de XP pelas próximas 10 questões e o item quebra.",
                "type": "passive",
                "rarity": "rare",
                "price": 150,
                "effect_type": "kataha_effect",
                "effect_value": 0.0,
            },
            {
                "name": "Orbe Restaurador de Zotikotita",
                "description": "Recupera uma sequência que acabou de ser perdida.",
                "type": "consumable",
                "rarity": "rare",
                "price": 100,
                "effect_type": "restore_combo",
                "activatable": True,
                "max_charges": 0,
            },
            {
                "name": "Amuleto do Conhecimento",
                "description": "Revela uma das alternativas erradas em cada questão. (3 Cargas)",
                "type": "passive",
                "rarity": "common",
                "price": 50,
                "effect_type": "reveal_wrong",
                "activatable": True,
                "max_charges": 3,
                "recovery_rate": 1,
            },
            {
                "name": "Amuleto de Vampirismo",
                "description": "Restaura 1 de vida a cada 5 acertos seguidos (Combo).",
                "type": "passive",
                "rarity": "rare",
                "price": 200,
                "effect_type": "vampirism",
                "activatable": False,
                "max_charges": 0,
            },
            {
                "name": "Amuleto do Descanso",
                "description": "Restaura 1 de vida ao completar uma sala.",
                "type": "passive",
                "rarity": "common",
                "price": 100,
                "effect_type": "restful_amulet",
                "activatable": False,
                "max_charges": 0,
            },
            {
                "name": "Amuleto da Fênix",
                "description": "Uma vida extra: se seu HP chegar a 0, restaura 1 e o item quebra.",
                "type": "passive",
                "rarity": "legendary",
                "price": 500,
                "effect_type": "phoenix_amulet",
                "activatable": False,
                "max_charges": 0,
            },
            {
                "name": "Poção de Vida",
                "description": "Restaura 1 de vida do jogador.",
                "type": "consumable",
                "rarity": "common",
                "price": 25,
                "effect_type": "heal_hp",
                "activatable": True,
                "max_charges": 0,
            }
        ]

        for item_data in items_to_seed:
            item, created = Item.objects.get_or_create(
                name=item_data["name"],
                defaults=item_data
            )
            if created:
                self.stdout.write(f"Created item: {item.name}")
            else:
                # Update existing for testing
                for key, value in item_data.items():
                    setattr(item, key, value)
                item.save()

        self.stdout.write(self.style.SUCCESS('Successfully seeded items'))
