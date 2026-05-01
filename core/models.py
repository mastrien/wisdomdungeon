from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    firebase_uid = models.CharField(max_length=128, unique=True)
    xp = models.IntegerField(default=0)
    gold = models.IntegerField(default=0)
    level = models.IntegerField(default=1)

    def __str__(self):
        return self.user.username

class QuestionHistory(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='history')
    topic = models.CharField(max_length=50)
    question_hash = models.CharField(max_length=64)
    enunciado = models.TextField()
    is_correct = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Question Histories"

    def __str__(self):
        status = "Correct" if self.is_correct else "Wrong"
        return f"{self.profile.user.username} - {self.topic} ({status})"
