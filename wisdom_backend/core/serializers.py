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

    class Meta:
        model = Profile
        fields = [
            'user', 'xp', 'gold', 'level', 'firebase_uid', 'bio', 
            'followers_count', 'following_count', 'is_following',
            'streak_count', 'total_normal_dungeons_completed', 'total_elite_dungeons_completed',
            'hp', 'max_hp', 'theme_color', 'font_size'
        ]

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                return request.user.profile.following.filter(id=obj.id).exists()
            except Profile.DoesNotExist:
                return False
        return False

class FixedQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FixedQuestion
        fields = ['enunciado', 'opcoes', 'hash']

class WeeklyDungeonSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    is_locked = serializers.SerializerMethodField()

    class Meta:
        model = WeeklyDungeon
        fields = ['id', 'title', 'type', 'topic', 'start_date', 'end_date', 'progress', 'is_locked']

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
        solved = ((progress.current_room.order - 1) * 10) + progress.current_question_index
        return solved

    def get_is_locked(self, obj):
        if obj.type == 'normal':
            return False
        
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return True
            
        from core.models import WeeklyDungeon, UserDungeonProgress
        # Verifica se a masmorra Normal do mesmo tópico foi concluída
        normal_dungeon = WeeklyDungeon.objects.filter(topic=obj.topic, type='normal', is_active=True).first()
        if not normal_dungeon:
            return False
            
        progress = UserDungeonProgress.objects.filter(profile=request.user.profile, dungeon=normal_dungeon).first()
        return not (progress and progress.is_completed)

class DungeonRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = DungeonRoom
        fields = ['order']

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'name', 'description', 'type', 'rarity', 'effect_type', 'effect_value']

class InventoryItemSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)
    class Meta:
        model = InventoryItem
        fields = ['id', 'item', 'quantity', 'is_equipped', 'acquired_at']

class QuestionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionHistory
        fields = ['topic', 'enunciado', 'is_correct', 'time_spent_ms', 'created_at']
