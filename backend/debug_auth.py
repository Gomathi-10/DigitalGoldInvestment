import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digigold.settings')
django.setup()

from django.contrib.auth import authenticate, get_user_model

User = get_user_model()

email = "gomathi@gmail.com"
try:
    user = User.objects.get(email=email)
    print(f"User found: {user.email}, Username: {user.username}, Is Staff: {user.is_staff}, Is Super: {user.is_superuser}")
    print(f"Password hash: {user.password}")
except User.DoesNotExist:
    print("User NOT found")


from django.conf import settings
print(f"Auth User Model: {settings.AUTH_USER_MODEL}")
print(f"Auth Backends: {settings.AUTHENTICATION_BACKENDS}")
