from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from core.models import Profile

class FollowingTest(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", email="user1@test.com")
        self.profile1 = Profile.objects.create(user=self.user1, firebase_uid="uid1")
        
        self.user2 = User.objects.create_user(username="user2", email="user2@test.com")
        self.profile2 = Profile.objects.create(user=self.user2, firebase_uid="uid2")
        
        self.client.force_authenticate(user=self.user1)

    def test_follow_user(self):
        url = reverse('follow_user', kwargs={'username': 'user2'})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'following')
        
        self.assertTrue(self.profile1.following.filter(user__username='user2').exists())
        self.assertEqual(self.profile2.followers.count(), 1)

    def test_unfollow_user(self):
        # First follow
        self.profile1.following.add(self.profile2)
        
        url = reverse('follow_user', kwargs={'username': 'user2'})
        response = self.client.post(url) # Toggle behavior: if already following, unfollow
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'unfollowed')
        
        self.assertFalse(self.profile1.following.filter(user__username='user2').exists())
        self.assertEqual(self.profile2.followers.count(), 0)

    def test_cannot_follow_self(self):
        url = reverse('follow_user', kwargs={'username': 'user1'})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_public_profile_shows_follow_stats(self):
        self.profile1.following.add(self.profile2)
        
        url = reverse('public_profile', kwargs={'username': 'user2'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['followers_count'], 1)
        self.assertEqual(response.data['following_count'], 0)
        self.assertEqual(response.data['is_following'], True)
