from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth.models import User
from core.models import Profile
import json

class AvatarSecurityTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', email='test@test.com')
        self.profile = Profile.objects.create(user=self.user, firebase_uid='uid123', level=1)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_avatar_update_blocked_below_level_5(self):
        url = reverse('profile')
        payload = {
            "avatar_url": "https://example.com/malicious.jpg"
        }
        response = self.client.patch(
            url, 
            data=payload, 
            format='json'
        )
        
        self.assertEqual(response.status_code, 403)

    def test_avatar_update_allowed_at_level_5(self):
        self.profile.level = 5
        self.profile.save()
        
        url = reverse('profile')
        payload = {
            "avatar_url": "https://example.com/safe.jpg"
        }
        response = self.client.patch(
            url, 
            data=payload, 
            format='json'
        )
        
        self.assertEqual(response.status_code, 200)
