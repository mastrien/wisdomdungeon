from rest_framework import serializers
from django.contrib.auth.models import User
from core.models import Profile, QuestionHistory

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = ['user', 'xp', 'gold', 'level', 'firebase_uid']

class QuestionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionHistory
        fields = ['topic', 'enunciado', 'is_correct', 'created_at']
