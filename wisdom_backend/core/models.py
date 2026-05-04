from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    firebase_uid = models.CharField(max_length=128, unique=True)
    xp = models.IntegerField(default=0)
    gold = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    bio = models.TextField(blank=True, max_length=500)
    following = models.ManyToManyField(
        'self', 
        symmetrical=False, 
        related_name='followers', 
        blank=True
    )
    
    # Engagement expansion
    streak_count = models.IntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    streak_protected_until = models.DateField(null=True, blank=True)
    equipped_item_id = models.IntegerField(null=True, blank=True)
    total_normal_dungeons_completed = models.IntegerField(default=0)
    total_elite_dungeons_completed = models.IntegerField(default=0)

    def __str__(self):
        return self.user.username

class FixedQuestion(models.Model):
    topic = models.CharField(max_length=50)
    enunciado = models.TextField()
    opcoes = models.JSONField() # Lista de strings
    resposta_correta = models.CharField(max_length=255)
    hash = models.CharField(max_length=64, unique=True)
    
    # Telemetry
    total_attempts = models.IntegerField(default=0)
    total_correct = models.IntegerField(default=0)
    avg_time_ms = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.topic} - {self.hash[:8]}"

class WeeklyDungeon(models.Model):
    TYPE_CHOICES = [
        ('normal', 'Normal'),
        ('elite', 'Elite'),
    ]
    title = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='normal')
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    topic = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.title} ({self.get_type_display()})"

class DungeonRoom(models.Model):
    dungeon = models.ForeignKey(WeeklyDungeon, on_delete=models.CASCADE, related_name='rooms')
    order = models.IntegerField() # 1 a 10
    questions = models.ManyToManyField(FixedQuestion, related_name='rooms')
    
    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.dungeon.title} - Sala {self.order}"

class UserDungeonProgress(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='dungeon_progress')
    dungeon = models.ForeignKey(WeeklyDungeon, on_delete=models.CASCADE)
    current_room = models.ForeignKey(DungeonRoom, on_delete=models.SET_NULL, null=True)
    current_question_index = models.IntegerField(default=0) # 0 a 9
    is_completed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('profile', 'dungeon')

class Item(models.Model):
    TYPE_CHOICES = [
        ('passive', 'Passivo'),
        ('consumable', 'Consumível'),
    ]
    name = models.CharField(max_length=100)
    description = models.TextField()
    type = models.CharField(max_length=15, choices=TYPE_CHOICES)
    rarity = models.CharField(max_length=20) # e.g., common, rare, legendary
    
    # Efeito simplificado para o plano
    effect_type = models.CharField(max_length=50) # e.g., xp_multiplier, gold_bonus, combo_shield
    effect_value = models.FloatField(default=0.0)
    
    def __str__(self):
        return self.name

class InventoryItem(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='inventory')
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    is_equipped = models.BooleanField(default=False)
    acquired_at = models.DateTimeField(auto_now_add=True)

class QuestionHistory(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='history')
    topic = models.CharField(max_length=50)
    question_hash = models.CharField(max_length=64)
    enunciado = models.TextField()
    is_correct = models.BooleanField()
    time_spent_ms = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Question Histories"

    def __str__(self):
        status = "Correct" if self.is_correct else "Wrong"
        return f"{self.profile.user.username} - {self.topic} ({status})"
