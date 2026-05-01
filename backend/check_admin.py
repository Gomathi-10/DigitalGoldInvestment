import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digigold.settings')
django.setup()

from data.models import CustomUser

print("--- Admin Search ---")
admin_users = CustomUser.objects.filter(is_staff=True)
if not admin_users.exists():
    print("No admin users (is_staff=True) found!")
else:
    for admin in admin_users:
        print(f"Admin: {admin.email}, Staff: {admin.is_staff}, Superuser: {admin.is_superuser}")

all_users = CustomUser.objects.all()
print(f"\n--- All {all_users.count()} Users ---")
for user in all_users:
    print(f"User: {user.email}, Staff: {user.is_staff}, KYC: {hasattr(user, 'kyc')}")
