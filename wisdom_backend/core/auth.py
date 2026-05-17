import firebase_admin
from firebase_admin import auth, credentials
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import authentication, exceptions
from core.models import Profile
import datetime

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    try:
        if settings.FIREBASE_CREDENTIALS_PATH:
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
        else:
            print("Warning: FIREBASE_CREDENTIALS_PATH not set.")
    except Exception as e:
        print(f"Error initializing Firebase Admin: {e}")

class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None

        id_token = auth_header.split(' ').pop()
        try:
            decoded_token = auth.verify_id_token(id_token)
        except Exception as e:
            error_str = str(e)
            # Handle clock skew or transient network issues
            if "Token used too early" in error_str or "Could not deserialize key data" in error_str:
                import time
                max_retries = 3
                for i in range(max_retries):
                    time.sleep(1 + i) # 1s, 2s, 3s
                    try:
                        decoded_token = auth.verify_id_token(id_token)
                        break
                    except Exception as retry_e:
                        if i == max_retries - 1:
                            print(f"Firebase Token Verification Failed after {max_retries} retries: {retry_e}")
                            raise exceptions.AuthenticationFailed(f'Invalid Firebase token: {retry_e}')
            else:
                print(f"Firebase Token Verification Failed: {e}")
                raise exceptions.AuthenticationFailed(f'Invalid Firebase token: {e}')

        uid = decoded_token.get('uid')
        if not uid:
            raise exceptions.AuthenticationFailed('UID not found in token.')

        try:
            profile = Profile.objects.get(firebase_uid=uid)
            user = profile.user
        except Profile.DoesNotExist:
            email = decoded_token.get('email')
            username = email.split('@')[0] if email else uid
            
            if User.objects.filter(username=username).exists():
                username = f"{username}_{uid[:5]}"

            user = User.objects.create(username=username, email=email)
            profile = Profile.objects.create(user=user, firebase_uid=uid)

        return (user, None)
