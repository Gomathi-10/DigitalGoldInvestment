import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digigold.settings')
django.setup()

from data.models import CustomUser

users_data = []
for user in CustomUser.objects.all():
    users_data.append({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_staff': user.is_staff,
        'has_kyc': hasattr(user, 'kyc')
    })

with open('users_debug_v2.json', 'w') as f:
    json.dump(users_data, f, indent=4)

print(f"Dumped {len(users_data)} users to users_debug_v2.json")
