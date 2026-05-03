from django.urls import path
from core.views import ProfileView, PublicProfileView, FollowView, QuestionView, HistoryView, TopicsView, MasteryView

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/<str:username>/', PublicProfileView.as_view(), name='public_profile'),
    path('profile/<str:username>/follow/', FollowView.as_view(), name='follow_user'),
    path('topics/', TopicsView.as_view(), name='topics'),
    path('question/', QuestionView.as_view(), name='question'),
    path('history/', HistoryView.as_view(), name='history'),
    path('mastery/', MasteryView.as_view(), name='mastery'),
]
