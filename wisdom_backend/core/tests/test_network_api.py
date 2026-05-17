from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from core.models import Profile
from unittest.mock import patch
import json

class NetworkAPITest(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', email='u1@test.com')
        self.p1 = Profile.objects.create(user=self.user1, firebase_uid='uid1')
        
        self.user2 = User.objects.create_user(username='user2', email='u2@test.com')
        self.p2 = Profile.objects.create(user=self.user2, firebase_uid='uid2')
        
        self.user3 = User.objects.create_user(username='user3', email='u3@test.com')
        self.p3 = Profile.objects.create(user=self.user3, firebase_uid='uid3')
        
        # p1 follows p2 and p3
        self.p1.following.add(self.p2, self.p3)
        # p2 follows p1
        self.p2.following.add(self.p1)
        
        self.client = Client()

    def test_get_network_lists(self):
        url = reverse('profile_network', kwargs={'username': 'user1'})
        response = self.client.get(url)
        
        # Should fail initially (404/ReverseMatch)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # User1 followers: user2
        self.assertEqual(len(data['followers']), 1)
        self.assertEqual(data['followers'][0]['username'], 'user2')
        
        # User1 following: user2, user3
        self.assertEqual(len(data['following']), 2)
        following_usernames = [u['username'] for u in data['following']]
        self.assertIn('user2', following_usernames)
        self.assertIn('user3', following_usernames)
