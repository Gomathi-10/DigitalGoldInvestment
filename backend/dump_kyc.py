import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digigold.settings')
django.setup()

from data.models import KYC

kyc_data = []
for kyc in KYC.objects.all():
    kyc_data.append({
        'id': kyc.id,
        'user_email': kyc.user.email,
        'status': kyc.status,
        'full_name': kyc.full_name,
        'submitted_at': str(kyc.submitted_at)
    })

with open('kyc_debug.json', 'w') as f:
    json.dump(kyc_data, f, indent=4)

print(f"Dumped {len(kyc_data)} KYC records to kyc_debug.json")
