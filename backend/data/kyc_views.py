from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone

# ----------------- KYC Views -----------------
from .models import KYC
from .serializers import KYCSerializer

class KYCSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        print(f"DEBUG: KYC Submission attempt by user: {request.user.email}")
        # Check if user already has KYC
        if hasattr(request.user, 'kyc'):
            existing_kyc = request.user.kyc
            # Allow re-submission only if previously rejected
            if existing_kyc.status == 'rejected':
                print(f"DEBUG: User {request.user.email} resubmitting rejected KYC")
                existing_kyc.delete()  # Delete old rejected record to allow fresh submission
            else:
                print(f"DEBUG: User {request.user.email} already has KYC with status: {existing_kyc.status}")
                return Response({
                    "error": "KYC already submitted",
                    "status": existing_kyc.status
                }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = KYCSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            print(f"DEBUG: KYC saved successfully for {request.user.email}")
            return Response({
                "message": "KYC submitted successfully. Awaiting admin review.",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        
        print(f"DEBUG: KYC validation failed for {request.user.email}: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        # Get user's KYC status
        print(f"DEBUG: Checking KYC status for user: {request.user.email}")
        try:
            kyc = request.user.kyc
            serializer = KYCSerializer(kyc)
            print(f"DEBUG: Found KYC status: {kyc.status}")
            return Response(serializer.data)
        except KYC.DoesNotExist:
            print(f"DEBUG: No KYC found for user: {request.user.email}")
            return Response({

                "status": "not_submitted",
                "message": "KYC not submitted yet"
            })


class AdminKYCListView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        print(f"DEBUG: Admin {request.user.email} requesting KYC list")
        status_filter = request.query_params.get('status', None)
        print(f"DEBUG: Status filter: {status_filter}")
        kycs = KYC.objects.select_related('user').all()
        print(f"DEBUG: Total KYC records in DB: {KYC.objects.count()}")
        
        if status_filter:
            kycs = kycs.filter(status=status_filter)
        
        print(f"DEBUG: Found {kycs.count()} KYC records after filter")
        
        data = []
        for kyc in kycs:
            kyc_data = KYCSerializer(kyc).data
            kyc_data['user_email'] = kyc.user.email
            kyc_data['user_id'] = kyc.user.id
            data.append(kyc_data)
        
        print(f"DEBUG: Returning {len(data)} records")
        return Response(data)



class AdminKYCApprovalView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, kyc_id):
        try:
            kyc = KYC.objects.get(id=kyc_id)
            action = request.data.get('action')  # 'approve' or 'reject'
            
            if action == 'approve':
                kyc.status = 'approved'
                kyc.reviewed_by = request.user
                kyc.reviewed_at = timezone.now()
                kyc.save()
                return Response({"message": "KYC approved successfully"})
            
            elif action == 'reject':
                kyc.status = 'rejected'
                kyc.rejection_reason = request.data.get('reason', '')
                kyc.reviewed_by = request.user
                kyc.reviewed_at = timezone.now()
                kyc.save()
                return Response({"message": "KYC rejected"})
            
            else:
                return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
                
        except KYC.DoesNotExist:
            return Response({"error": "KYC not found"}, status=status.HTTP_404_NOT_FOUND)
