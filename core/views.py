from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.models import Profile, QuestionHistory
from core.serializers import ProfileSerializer, QuestionHistorySerializer
from core.services.math_generator import MathGenerator
from core.services.answer_service import AnswerService

class ProfileView(APIView):
    def get(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

class QuestionView(APIView):
    def get(self, request):
        topic = request.query_params.get('topic', 'algebra_basica')
        generator = MathGenerator()
        question = generator.generate_question(topic)
        
        if not question:
            return Response({"error": "Topic not found"}, status=status.HTTP_404_NOT_FOUND)
            
        return Response(question)

    def post(self, request):
        data = request.data
        profile = request.user.profile
        
        service = AnswerService()
        result = service.submit_answer(
            profile=profile,
            topic=data.get('topic'),
            question_hash=data.get('hash'),
            enunciado=data.get('enunciado'),
            selected_answer=data.get('selected_answer'),
            correct_answer=data.get('correct_answer') # In a real app, we shouldn't trust the client for the correct answer
        )
        
        return Response(result)

class HistoryView(APIView):
    def get(self, request):
        history = request.user.profile.history.all().order_by('-created_at')
        serializer = QuestionHistorySerializer(history, many=True)
        return Response(serializer.data)

class TopicsView(APIView):
    def get(self, request):
        topics = [
            {"id": "algebra_basica", "name": "Álgebra Básica"},
            {"id": "calculo_basico", "name": "Cálculo Básico"},
            {"id": "geometria", "name": "Geometria"},
            {"id": "algebra_linear", "name": "Álgebra Linear"},
            {"id": "probabilidade", "name": "Probabilidade"},
        ]
        return Response(topics)
