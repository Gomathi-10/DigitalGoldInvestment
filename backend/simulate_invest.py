import os
import django
import json
from django.test import Client
from django.contrib.auth import get_user_model

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digigold.settings')
django.setup()

User = get_user_model()

def simulate_invest():
    client = Client(enforce_csrf_checks=False)
    user = User.objects.filter(is_staff=False).first()
    if not user:
        print("No regular user found")
        return

    print(f"Testing with user: {user.email}")
    
    # 1. Test without token
    response = client.post('/invest/create/', data=json.dumps({'amount': 1000}), content_type='application/json')
    print(f"Unauthenticated status: {response.status_code}")
    print(f"Unauthenticated response: {response.content[:500]}")
    
    # 2. Test with manual auth
    client.force_login(user)
    response = client.post('/invest/create/', data=json.dumps({'amount': 200}), content_type='application/json')
    print(f"Authenticated status: {response.status_code}")
    print(f"Response: {response.content[:500]}")



if __name__ == "__main__":
    simulate_invest()
