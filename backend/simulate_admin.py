import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digigold.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from data.models import CustomUser
from data.kyc_views import AdminKYCListView

def simulate_admin_request():
    factory = APIRequestFactory()
    admin_user = CustomUser.objects.filter(is_staff=True).first()
    if not admin_user:
        print("No admin user found for simulation!")
        return

    print(f"Simulating request by admin: {admin_user.email}")
    view = AdminKYCListView.as_view()
    request = factory.get('/api/admin/kyc/')
    force_authenticate(request, user=admin_user)
    
    response = view(request)
    print(f"Status Code: {response.status_code}")
    print(f"Data: {response.data}")

if __name__ == "__main__":
    simulate_admin_request()
