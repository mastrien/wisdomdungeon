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
            'streak_count', 'total_dungeons_completed'
        ]

class FixedQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FixedQuestion
        fields = ['enunciado', 'opcoes', 'hash']

class WeeklyDungeonSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyDungeon
        fields = ['id', 'title', 'type', 'topic', 'start_date', 'end_date']

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
