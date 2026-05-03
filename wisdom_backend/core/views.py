from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from core.models import Profile, QuestionHistory
from core.serializers import ProfileSerializer, QuestionHistorySerializer
from core.services.math_generator import MathGenerator
from core.services.answer_service import AnswerService

class ProfileView(APIView):
    def get(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)
    
    def patch(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        
        if serializer.is_valid():
            user_data = request.data.get('user')
            if user_data:
                user = profile.user
                if 'username' in user_data:
                    new_username = user_data['username']
                    if new_username != user.username:
                        from django.contrib.auth.models import User
                        if User.objects.filter(username=new_username).exists():
                            return Response(
                                {"user": {"username": ["Este nome de aventureiro já está sendo usado."]}}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                        user.username = new_username
                if 'email' in user_data:
                    user.email = user_data['email']
                user.save()
            
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PublicProfileView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, username):
        try:
            profile = Profile.objects.get(user__username=username)
            serializer = ProfileSerializer(profile, context={'request': request})
            return Response(serializer.data)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

class FollowView(APIView):
    def post(self, request, username):
        if request.user.username == username:
            return Response({"error": "You cannot follow yourself"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            target_profile = Profile.objects.get(user__username=username)
            my_profile = request.user.profile
            
            if my_profile.following.filter(id=target_profile.id).exists():
                my_profile.following.remove(target_profile)
                return Response({"status": "unfollowed"})
            else:
                my_profile.following.add(target_profile)
                return Response({"status": "following"})
                
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

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
        limit = 20
        offset = int(request.query_params.get('offset', 0))
        
        history = request.user.profile.history.all().order_by('-created_at')[offset:offset+limit]
        serializer = QuestionHistorySerializer(history, many=True)
        
        has_more = request.user.profile.history.count() > (offset + limit)
        
        return Response({
            "results": serializer.data,
            "has_more": has_more
        })

class MasteryView(APIView):
    def get(self, request):
        profile = request.user.profile
        histories = profile.history.all()
        
        topics = [
            {"id": "algebra_basica", "name": "Álgebra Básica"},
            {"id": "calculo_basico", "name": "Cálculo Básico"},
            {"id": "geometria", "name": "Geometria"},
            {"id": "algebra_linear", "name": "Álgebra Linear"},
            {"id": "probabilidade", "name": "Probabilidade"},
        ]
        
        stats = []
        for topic in topics:
            topic_history = histories.filter(topic=topic['id'])
            total = topic_history.count()
            
            if total > 0:
                correct = topic_history.filter(is_correct=True).count()
                success_rate = round((correct / total) * 100, 1)
                # Mastery is XP earned in this dungeon. 
                # For MVP, assume 10 XP per correct answer (as defined in answer_service if applicable)
                # But to be precise, we should sum the history if we added a field, 
                # or just use correct * 10 as a simple placeholder for now.
                mastery = correct * 10 
            else:
                success_rate = 0
                mastery = 0
                
            stats.append({
                "topic": topic['name'],
                "topic_id": topic['id'],
                "total_solved": total,
                "success_rate": success_rate,
                "mastery": mastery
            })
            
        return Response(stats)

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
