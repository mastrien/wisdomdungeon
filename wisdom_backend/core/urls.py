from django.urls import path
from core.views import (
    ProfileView, PublicProfileView, FollowView, QuestionView, 
    HistoryView, TopicsView, MasteryView, DungeonCurrentView, AnswerView, InventoryView, WeeklyDungeonListView
)

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/<str:username>/', PublicProfileView.as_view(), name='public_profile'),
    path('profile/<str:username>/follow/', FollowView.as_view(), name='follow_user'),
    path('topics/', TopicsView.as_view(), name='topics'),
    path('question/', QuestionView.as_view(), name='question'),
    path('answer/', AnswerView.as_view(), name='answer'),
    path('dungeons/', WeeklyDungeonListView.as_view(), name='dungeons_list'),
    path('dungeon/current/', DungeonCurrentView.as_view(), name='dungeon_current'),
    path('inventory/', InventoryView.as_view(), name='inventory'),
    path('inventory/<int:pk>/equip/', InventoryView.as_view(), name='inventory_equip'),
    path('history/', HistoryView.as_view(), name='history'),
    path('mastery/', MasteryView.as_view(), name='mastery'),
]
