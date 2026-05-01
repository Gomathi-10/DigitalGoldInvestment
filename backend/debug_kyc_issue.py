import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digigold.settings')
django.setup()

from data.models import KYC, CustomUser

with open('backend/kyc_debug_output.txt', 'w', encoding='utf-8') as f:
    f.write("--- User List ---\n")
    users = CustomUser.objects.all()
    for u in users:
        has_kyc = hasattr(u, 'kyc')
        kyc_status = u.kyc.status if has_kyc else "N/A"
        f.write(f"ID: {u.id}, Email: {u.email}, Username: {u.username}, Has KYC: {has_kyc}, KYC Status: {kyc_status}\n")

    f.write("\n--- KYC Record List ---\n")
    kycs = KYC.objects.all()
    for k in kycs:
        f.write(f"ID: {k.id}, User Email: {k.user.email}, Full Name: {k.full_name}, Status: {k.status}, Submitted At: {k.submitted_at}\n")

    f.write("\n--- Debugging 'chinnaponu' ---\n")
    # Searching for user with username or email containing 'chinnaponu'
    target_users = CustomUser.objects.filter(email__icontains='chinnaponu') | CustomUser.objects.filter(username__icontains='chinnaponu')
    if target_users.exists():
        for tu in target_users:
            f.write(f"Found User - ID: {tu.id}, Email: {tu.email}, Username: {tu.username}\n")
            if hasattr(tu, 'kyc'):
                f.write(f"  KYC Status: {tu.kyc.status}\n")
                f.write(f"  KYC ID: {tu.kyc.id}\n")
                f.write(f"  KYC Details: {tu.kyc.full_name}, {tu.kyc.aadhar_number}\n")
            else:
                f.write(f"  No KYC record found for this user.\n")
    else:
        f.write("User 'chinnaponu' not found.\n")

