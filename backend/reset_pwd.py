import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digigold.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
try:
    user = User.objects.get(email='gomathi@gmail.com')
    user.set_password('admin123')
    user.save()
    print('Password updated to admin123')
except Exception as e:
    print(f"Error: {e}")
