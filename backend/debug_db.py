import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digigold.settings')
django.setup()

from data.models import KYC, CustomUser

print("--- KYC Records ---")
kycs = KYC.objects.all()
for kyc in kycs:
    print(f"ID: {kyc.id}, User: {kyc.user.email}, Status: {kyc.status}, Name: {kyc.full_name}, Submitted: {kyc.submitted_at}")

print("\n--- User Accounts ---")
users = CustomUser.objects.all()
for user in users:
    print(f"ID: {user.id}, Email: {user.email}, Is Staff: {user.is_staff}, Is Superuser: {user.is_superuser}, Last Login: {user.last_login}")
