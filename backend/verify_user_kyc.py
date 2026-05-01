import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digigold.settings')
django.setup()

from data.models import CustomUser, KYC
from data.serializers import KYCSerializer

def verify_kyc():
    try:
        user = CustomUser.objects.get(email='reena@gmail.com')
        kyc = user.kyc
        serializer = KYCSerializer(kyc)
        print(f"User Email: {user.email}")
        print(f"KYC Status in Model: {kyc.status}")
        print(f"KYC Status in Serializer: {serializer.data.get('status')}")
    except CustomUser.DoesNotExist:
        print("User reena@gmail.com not found")
    except KYC.DoesNotExist:
        print("KYC for reena@gmail.com not found")

if __name__ == "__main__":
    verify_kyc()
