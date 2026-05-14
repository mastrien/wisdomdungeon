import random
from .base_item import BaseItemStrategy

class RevealWrongAmuletStrategy(BaseItemStrategy):
    def use(self, profile, inv_item):
        if inv_item.is_broken:
            return {"success": False, "message": "Item está quebrado."}
        
        if inv_item.current_charges <= 0:
            return {"success": False, "message": "Sem cargas."}

        # Check if already used in this question
        if profile.metadata.get('revealed_wrong'):
            return {"success": False, "message": "Efeito já ativo para esta questão."}

        # Get current question
        from core.models import UserDungeonProgress
        # We need to know which dungeon the user is in. 
        # For simplicity, let's assume the user only has one active progress or we find the latest updated one.
        progress = UserDungeonProgress.objects.filter(profile=profile, is_completed=False).order_by('-updated_at').first()
        
        if not progress or not progress.current_room:
            return {"success": False, "message": "Nenhuma masmorra ativa encontrada."}

        try:
            question = progress.current_room.questions.all()[progress.current_question_index]
        except IndexError:
            return {"success": False, "message": "Erro ao localizar questão."}

        correct = question.resposta_correta
        wrongs = [o for o in question.opcoes if o != correct]
        
        if wrongs:
            revealed = random.choice(wrongs)
            if not profile.metadata:
                profile.metadata = {}
            profile.metadata['revealed_wrong'] = revealed
            profile.save()
            
            return {"success": True, "message": f"Uma alternativa incorreta foi revelada: {revealed}"}
        
        return {"success": False, "message": "Não foi possível revelar uma alternativa."}
