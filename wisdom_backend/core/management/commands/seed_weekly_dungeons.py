from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import WeeklyDungeon, DungeonRoom, FixedQuestion
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
                
                dungeon, created = WeeklyDungeon.objects.get_or_create(
                    title=d_title,
                    type=d_type,
                    topic=topic_id,
                    defaults={
                        'start_date': start_date,
                        'end_date': end_date,
                        'is_active': True
                    }
                )
                
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
