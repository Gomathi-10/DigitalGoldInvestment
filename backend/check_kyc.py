import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digigold.settings')
django.setup()

from data.models import KYC, CustomUser

print("Checking KYC records...")
kycs = KYC.objects.all()
print(f"Total KYC records: {kycs.count()}")

for kyc in kycs:
    print(f"ID: {kyc.id}, User: {kyc.user.email}, Status: {kyc.status}, Name: {kyc.full_name}")

users = CustomUser.objects.all()
print(f"\nTotal users: {users.count()}")
for user in users:
    print(f"ID: {user.id}, Email: {user.email}, Is Staff: {user.is_staff}")
