from core.models import QuestionHistory

class AnswerService:
    XP_REWARD = 10
    GOLD_REWARD = 5

    def submit_answer(self, profile, topic, question_hash, enunciado, selected_answer, correct_answer):
        is_correct = selected_answer == correct_answer
        
        # Save history
        QuestionHistory.objects.create(
            profile=profile,
            topic=topic,
            question_hash=question_hash,
            enunciado=enunciado,
            is_correct=is_correct
        )
        
        if is_correct:
            profile.xp += self.XP_REWARD
            profile.gold += self.GOLD_REWARD
            profile.save()
            
        return {
            "is_correct": is_correct,
            "xp_gained": self.XP_REWARD if is_correct else 0,
            "gold_gained": self.GOLD_REWARD if is_correct else 0
        }
