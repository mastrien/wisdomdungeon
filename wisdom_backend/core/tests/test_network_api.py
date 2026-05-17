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

    def test_get_network_lists_pagination(self):
        url = reverse('profile_network', kwargs={'username': 'user1'})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # User1 followers: user2
        self.assertEqual(len(data['followers']), 1)
        self.assertEqual(data['total_followers'], 1)
        self.assertFalse(data['has_more_followers'])
        
        # User1 following: user2, user3
        self.assertEqual(len(data['following']), 2)
        self.assertEqual(data['total_following'], 2)
        self.assertFalse(data['has_more_following'])

    def test_get_network_pagination_offset(self):
        # Create many users following p1
        for i in range(20):
            u = User.objects.create_user(username=f'fan{i}', email=f'f{i}@test.com')
            p = Profile.objects.create(user=u, firebase_uid=f'uidfan{i}')
            p.following.add(self.p1)
        
        url = reverse('profile_network', kwargs={'username': 'user1'})
        # Page 1 (0 to 15)
        response = self.client.get(url)
        data = response.json()
        self.assertEqual(len(data['followers']), 15)
        self.assertTrue(data['has_more_followers'])
        self.assertEqual(data['total_followers'], 21) # 1 original + 20 fans

        # Page 2 (15 to 30)
        response2 = self.client.get(url + "?followers_offset=15")
        data2 = response2.json()
        self.assertEqual(len(data2['followers']), 6) # remaining 6
        self.assertFalse(data2['has_more_followers'])
