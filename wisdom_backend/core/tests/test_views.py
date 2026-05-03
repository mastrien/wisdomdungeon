from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from core.models import Profile

class CoreApiTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="api_user", email="api@test.com")
        self.profile = Profile.objects.create(user=self.user, firebase_uid="api_uid")
        self.client.force_authenticate(user=self.user)

    def test_get_topics(self):
        url = reverse('topics')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5)

    def test_generate_question(self):
        url = reverse('question')
        response = self.client.get(url, {'topic': 'algebra_basica'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('enunciado', response.data)
        self.assertIn('hash', response.data)

    def test_submit_answer(self):
        url = reverse('question')
        data = {
            "topic": "algebra_basica",
            "hash": "somehash",
            "enunciado": "some question",
            "selected_answer": "10",
            "correct_answer": "10"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_correct'])

    def test_get_profile(self):
        url = reverse('profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['username'], 'api_user')

    def test_get_history(self):
        url = reverse('history')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Agora o histórico retorna um objeto com 'results' e 'has_more'
        self.assertIn('results', response.data)
        self.assertIn('has_more', response.data)
        self.assertEqual(len(response.data['results']), 0)

    def test_get_mastery(self):
        url = reverse('mastery')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5) # 5 tópicos definidos no view
        self.assertEqual(response.data[0]['total_solved'], 0)

    def test_get_public_profile(self):
        # Deslogar para testar acesso público
        self.client.force_authenticate(user=None)
        url = reverse('public_profile', kwargs={'username': 'api_user'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['username'], 'api_user')
        self.assertEqual(response.data['xp'], 0)
        self.assertEqual(response.data['followers_count'], 0)
        self.assertEqual(response.data['following_count'], 0)
        self.assertEqual(response.data['is_following'], False)
