from rest_framework import serializers
from django.contrib.auth.models import User
from core.models import Profile, QuestionHistory, FixedQuestion, WeeklyDungeon, DungeonRoom, Item, InventoryItem

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    followers_count = serializers.IntegerField(source='followers.count', read_only=True)
    following_count = serializers.IntegerField(source='following.count', read_only=True)
    is_following = serializers.SerializerMethodField()
    next_level_xp = serializers.SerializerMethodField()
    current_level_xp_threshold = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'user', 'xp', 'gold', 'level', 'firebase_uid', 'bio', 
            'followers_count', 'following_count', 'is_following',
            'streak_count', 'current_combo', 'max_combo',
            'total_normal_dungeons_completed', 'total_elite_dungeons_completed',
            'hp', 'max_hp', 'theme_color', 'font_size',
            'next_level_xp', 'current_level_xp_threshold', 'metadata'
        ]

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                return request.user.profile.following.filter(id=obj.id).exists()
            except Profile.DoesNotExist:
                return False
        return False

    def get_next_level_xp(self, obj):
        from core.services.progression_service import ProgressionService
        return ProgressionService.get_xp_for_next_level(obj.level)

    def get_current_level_xp_threshold(self, obj):
        from core.services.progression_service import ProgressionService
        return ProgressionService.get_level_threshold(obj.level)

class FixedQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FixedQuestion
        fields = ['enunciado', 'opcoes', 'hash']

class WeeklyDungeonSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    is_locked = serializers.SerializerMethodField()
    unlock_reason = serializers.SerializerMethodField()

    class Meta:
        model = WeeklyDungeon
        fields = ['id', 'title', 'type', 'topic', 'start_date', 'end_date', 'progress', 'is_locked', 'unlock_reason', 'level_required']

    def get_progress(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        
        from core.models import UserDungeonProgress
        progress = UserDungeonProgress.objects.filter(profile=request.user.profile, dungeon=obj).first()
        if not progress:
            return 0
        if progress.is_completed:
            return 100
        
        # Cada masmorra tem 10 salas de 10 questões = 100 total
        if not progress.current_room:
            return 0
        solved = ((progress.current_room.order - 1) * 10) + progress.current_question_index
        return solved

    def get_is_locked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return True
        
        profile = request.user.profile
        
        # 1. Level check
        if profile.level < obj.level_required:
            return True

        # 2. Prerequisites check for Elite
        if obj.type == 'elite':
            from core.models import WeeklyDungeon, UserDungeonProgress
            normal_dungeon = WeeklyDungeon.objects.filter(topic=obj.topic, type='normal', is_active=True).first()
            if normal_dungeon:
                progress = UserDungeonProgress.objects.filter(profile=profile, dungeon=normal_dungeon).first()
                return not (progress and progress.is_completed)
        
        return False

    def get_unlock_reason(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return "Faça login para desbloquear"
        
        profile = request.user.profile
        
        if profile.level < obj.level_required:
            return f"Requer Nível {obj.level_required}"

        if obj.type == 'elite':
            from core.models import WeeklyDungeon, UserDungeonProgress
            normal_dungeon = WeeklyDungeon.objects.filter(topic=obj.topic, type='normal', is_active=True).first()
            if normal_dungeon:
                progress = UserDungeonProgress.objects.filter(profile=profile, dungeon=normal_dungeon).first()
                if not (progress and progress.is_completed):
                    return "Conclua a Masmorra Normal"
        
        return None

class DungeonRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = DungeonRoom
        fields = ['order']

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = [
            'id', 'name', 'description', 'type', 'rarity', 
            'effect_type', 'effect_value', 'price', 
            'activatable', 'max_charges', 'recovery_rate'
        ]

class InventoryItemSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)
    class Meta:
        model = InventoryItem
        fields = [
            'id', 'item', 'quantity', 'is_equipped', 'acquired_at',
            'current_charges', 'is_broken', 'metadata'
        ]

class LeaderboardProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Profile
        fields = [
            'username', 'xp', 'level', 'max_combo', 
            'total_normal_dungeons_completed', 'total_elite_dungeons_completed'
        ]

class NetworkProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Profile
        fields = ['username', 'level']

class QuestionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionHistory
        fields = ['topic', 'enunciado', 'is_correct', 'time_spent_ms', 'created_at']
