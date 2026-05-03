from rest_framework import serializers
from django.contrib.auth.models import User
from core.models import Profile, QuestionHistory

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
        fields = ['user', 'xp', 'gold', 'level', 'firebase_uid', 'bio', 'followers_count', 'following_count', 'is_following']

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                return request.user.profile.following.filter(id=obj.id).exists()
            except Profile.DoesNotExist:
                return False
        return False

class QuestionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionHistory
        fields = ['topic', 'enunciado', 'is_correct', 'created_at']
