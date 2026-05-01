import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digigold.settings')
django.setup()

from data.models import CustomUser

print("--- Comprehensive User Check ---")
users = CustomUser.objects.all()
print(f"Total Users: {users.count()}")

for user in users:
    print(f"ID: {user.id} | Email: {user.email} | Staff: {user.is_staff} | Super: {user.is_superuser} | Active: {user.is_active}")

# Check if there is any user at all that can access admin views
admin_candidates = CustomUser.objects.filter(is_staff=True) | CustomUser.objects.filter(is_superuser=True)
print(f"\n--- Admin Candidates: {admin_candidates.count()} ---")
for admin in admin_candidates:
    print(f"ID: {admin.id} | Email: {admin.email}")
