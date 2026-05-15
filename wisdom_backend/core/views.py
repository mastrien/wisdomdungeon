from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from core.models import (
    Profile, QuestionHistory, WeeklyDungeon, UserDungeonProgress, 
    DungeonRoom, FixedQuestion, Item, InventoryItem
)
from core.serializers import (
    ProfileSerializer, QuestionHistorySerializer, WeeklyDungeonSerializer, 
    DungeonRoomSerializer, FixedQuestionSerializer, ItemSerializer, InventoryItemSerializer
)

class InventoryView(APIView):
    def get(self, request):
        inventory = request.user.profile.inventory.all().order_by('-acquired_at')
        serializer = InventoryItemSerializer(inventory, many=True)
        return Response(serializer.data)

    def post(self, request, pk=None):
        """Action-based POST for equip/use."""
        action = request.path.split('/')[-2] # e.g., .../equip/
        try:
            inv_item = request.user.profile.inventory.get(id=pk)
            if action == 'equip':
                from core.services.item_service import ItemService
                service = ItemService()
                result = service.toggle_equip(request.user.profile, pk)
                if result.get('success'):
                    inv_item = request.user.profile.inventory.get(id=pk)
                    return Response(InventoryItemSerializer(inv_item).data)
                else:
                    return Response({"error": result.get('message')}, status=status.HTTP_400_BAD_REQUEST)

            elif action == 'use':

                from core.services.item_service import ItemService
                service = ItemService()
                result = service.use_item(request.user.profile, inv_item.id)
                if result['success']:
                    return Response(result)
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
                
        except InventoryItem.DoesNotExist:
            return Response({"error": "Item not found in inventory"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

class ShopView(APIView):
    def get(self, request):
        items = Item.objects.all().order_by('price')
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request, pk=None):
        """Buy an item."""
        try:
            item = Item.objects.get(id=pk)
            profile = request.user.profile
            
            if profile.gold >= item.price:
                profile.gold -= item.price
                profile.save()
                
                inv_item, created = InventoryItem.objects.get_or_create(
                    profile=profile,
                    item=item,
                    defaults={'current_charges': item.max_charges}
                )
                if not created:
                    inv_item.quantity += 1
                    # If it's a consumable, maybe refill charges?
                    if item.type == 'consumable':
                        inv_item.current_charges = item.max_charges
                    inv_item.save()
                
                return Response({
                    "success": True, 
                    "message": f"Você comprou {item.name}!",
                    "gold": profile.gold
                })
            else:
                return Response({"error": "Ouro insuficiente"}, status=status.HTTP_400_BAD_REQUEST)
        except Item.DoesNotExist:
            return Response({"error": "Item não encontrado"}, status=status.HTTP_404_NOT_FOUND)
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

class WeeklyDungeonListView(APIView):
    def get(self, request):
        dungeons = WeeklyDungeon.objects.filter(is_active=True).order_by('id')
        serializer = WeeklyDungeonSerializer(dungeons, many=True, context={'request': request})
        return Response(serializer.data)

class DungeonCurrentView(APIView):
    def get(self, request):
        topic = request.query_params.get('topic')
        dungeon_type = request.query_params.get('type', 'normal')
        profile = request.user.profile
        
        # Find active dungeon for this topic and type
        dungeon = WeeklyDungeon.objects.filter(topic=topic, is_active=True, type=dungeon_type).first()
        if not dungeon:
            return Response({"current_dungeon": None})
            
        # Get or start progress
        progress, created = UserDungeonProgress.objects.get_or_create(
            profile=profile,
            dungeon=dungeon,
            defaults={
                'current_room': dungeon.rooms.first(),
                'current_question_index': 0
            }
        )
        
        # Reset current_combo if it's a new session (starting at index 0 of room 1?)
        # For now, let's reset whenever we FETCH the current dungeon state if it was at 0
        # Actually, let's just ensure it starts at 0 when progress is created.
        if created:
            profile.current_combo = 0
            profile.save()
        
        if progress.is_completed:
             return Response({
                "completed": True,
                "summary_stats": {
                    "xp": progress.session_xp_gained,
                    "gold": progress.session_gold_gained,
                    "correct": progress.total_correct,
                    "wrong": progress.total_wrong,
                    "time_ms": progress.total_time_ms,
                    "max_combo": progress.max_combo
                }
             })

        room = progress.current_room
        question = room.questions.all()[progress.current_question_index]
        
        # Trigger item event for question start (e.g., Knowledge Amulet)
        from core.services.item_service import ItemService
        
        # Only clear revealed_wrong if it's NOT the same question as before 
        # (Using a simple check in profile metadata to track current question)
        last_q_hash = profile.metadata.get('last_question_hash')
        current_q_hash = question.hash
        
        if last_q_hash != current_q_hash:
            profile.metadata['revealed_wrong'] = None
            profile.metadata['last_question_hash'] = current_q_hash
            profile.save()
            ItemService().trigger_event(profile, "on_question_start", {"question": question})
            profile.refresh_from_db()
        return Response({
            "current_dungeon": WeeklyDungeonSerializer(dungeon).data,
            "room": DungeonRoomSerializer(room).data,
            "question_index": progress.current_question_index,
            "question": FixedQuestionSerializer(question).data,
            "revealed_wrong": profile.metadata.get('revealed_wrong'),
            "completed": progress.is_completed,
            "summary_stats": {
                "xp": progress.session_xp_gained,
                "gold": progress.session_gold_gained,
                "correct": progress.total_correct,
                "wrong": progress.total_wrong,
                "time_ms": progress.total_time_ms,
                "max_combo": progress.max_combo
            } if progress.is_completed else None
        })


class AnswerView(APIView):
    def post(self, request):
        data = request.data
        profile = request.user.profile
        
        service = AnswerService()
        result = service.submit_answer(
            profile=profile,
            topic=data.get('topic'),
            question_hash=data.get('hash'),
            selected_answer=data.get('selected_answer'),
            correct_answer=data.get('correct_answer'),
            time_spent_ms=data.get('time_spent_ms', 0),
            dungeon_type=data.get('type', 'normal')
        )
        
        return Response(result)

class QuestionView(APIView):
    """Old view, kept for backward compatibility or procedural mode."""
    def get(self, request):
        topic = request.query_params.get('topic', 'algebra_basica')
        generator = MathGenerator()
        question = generator.generate_question(topic)
        
        if not question:
            return Response({"error": "Topic not found"}, status=status.HTTP_404_NOT_FOUND)
            
        return Response(question)

    def post(self, request):
        # Delegate to AnswerView logic
        return AnswerView().post(request)

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
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        username = request.query_params.get('username')
        if username:
            try:
                profile = Profile.objects.get(user__username=username)
            except Profile.DoesNotExist:
                return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            if not request.user.is_authenticated:
                return Response({"error": "Authentication required"}, status=status.HTTP_403_FORBIDDEN)
            profile = request.user.profile
            
        histories = profile.history.all()
        
        # Check if we only want today's stats
        only_today = request.query_params.get('today') == 'true'
        if only_today:
            from django.utils import timezone
            import datetime
            today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
            histories = histories.filter(created_at__gte=today_start)

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

class ProgressionRewardsView(APIView):
    def get(self, request):
        from core.services.progression_service import ProgressionService
        rewards = ProgressionService.get_rewards()
        return Response(rewards)
