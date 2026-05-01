from django.urls import path
from core.views import ProfileView, QuestionView, HistoryView, TopicsView

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='profile'),
    path('topics/', TopicsView.as_view(), name='topics'),
    path('question/', QuestionView.as_view(), name='question'),
    path('history/', HistoryView.as_view(), name='history'),
]
