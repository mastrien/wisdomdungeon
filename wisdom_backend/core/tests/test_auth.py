from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from unittest.mock import patch, MagicMock
from django.contrib.auth.models import User
from core.models import Profile

class FirebaseAuthTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('profile')

    @patch('firebase_admin.auth.verify_id_token')
    def test_firebase_auth_success_new_user(self, mock_verify):
        # Mock successful token verification for a new user
        mock_verify.return_value = {
            'uid': 'google_uid_123',
            'email': 'newuser@gmail.com'
        }
        
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_token')
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['username'], 'newuser')
        self.assertTrue(Profile.objects.filter(firebase_uid='google_uid_123').exists())

    @patch('firebase_admin.auth.verify_id_token')
    def test_firebase_auth_token_too_early_retry_success(self, mock_verify):
        # First call fails with too early, second call succeeds
        mock_verify.side_effect = [
            ValueError("Token used too early"),
            {'uid': 'retry_user', 'email': 'retry@test.com'}
        ]
        
        self.client.credentials(HTTP_AUTHORIZATION='Bearer retry_token')
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_verify.call_count, 2)
        self.assertEqual(response.data['user']['username'], 'retry')

    @patch('firebase_admin.auth.verify_id_token')
    def test_firebase_auth_token_too_early_retry_failure(self, mock_verify):
        # Both calls fail
        mock_verify.side_effect = [
            ValueError("Token used too early"),
            ValueError("Token used too early")
        ]
        
        self.client.credentials(HTTP_AUTHORIZATION='Bearer failing_token')
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Invalid Firebase token (Retry)', response.data['detail'])
        self.assertEqual(mock_verify.call_count, 2)

    @patch('firebase_admin.auth.verify_id_token')
    def test_firebase_auth_duplicate_username_handling(self, mock_verify):
        # Create a user that already has the username 'duplicate'
        existing_user = User.objects.create_user(username='duplicate', email='existing@test.com')
        
        mock_verify.return_value = {
            'uid': 'new_google_uid',
            'email': 'duplicate@gmail.com' # This would normally result in 'duplicate' username
        }
        
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_token')
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Username should have been modified to avoid conflict
        self.assertNotEqual(response.data['user']['username'], 'duplicate')
        self.assertTrue(response.data['user']['username'].startswith('duplicate_'))
