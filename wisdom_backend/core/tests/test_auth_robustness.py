from django.test import TestCase, RequestFactory
from unittest.mock import patch, MagicMock
from core.auth import FirebaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import time

class AuthRobustnessTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.auth = FirebaseAuthentication()

    @patch('firebase_admin.auth.verify_id_token')
    def test_verify_token_retry_on_early_token(self, mock_verify):
        # First call fails with "Token used too early", second succeeds
        mock_verify.side_effect = [
            Exception("Token used too early"),
            {'uid': 'test_uid', 'email': 'test@example.com'}
        ]
        
        request = self.factory.get('/')
        request.META['HTTP_AUTHORIZATION'] = 'Bearer valid_token'
        
        # This should call sleep and then succeed
        user, _ = self.auth.authenticate(request)
        
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(mock_verify.call_count, 2)

    @patch('firebase_admin.auth.verify_id_token')
    def test_verify_token_fails_after_all_retries(self, mock_verify):
        mock_verify.side_effect = Exception("Token used too early")
        
        request = self.factory.get('/')
        request.META['HTTP_AUTHORIZATION'] = 'Bearer valid_token'
        
        with self.assertRaises(AuthenticationFailed):
            self.auth.authenticate(request)
        
        # Initial call + 3 retries = 4 total calls
        self.assertEqual(mock_verify.call_count, 4)
