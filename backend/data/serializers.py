from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

User = get_user_model()

# ----------------- Login Serializer -----------------
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email', '').strip()
        password = data.get('password')

        if email and password:
            # Try keyword-based authentication (robust for varied backends)
            user = authenticate(email=email, password=password)
            
            # If that fails, try standard username keyword (Django default)
            if user is None:
                user = authenticate(username=email, password=password)
                
            if user is None:
                raise serializers.ValidationError("Invalid email or password")
        else:
            raise serializers.ValidationError("Email and password are required")

        data['user'] = user
        return data

    def to_representation(self, instance):
        # Hide password in representation
        ret = super().to_representation(instance)
        ret.pop('password', None)
        return ret


# ----------------- Register Serializer -----------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data.get('username', ''),
            password=validated_data['password']
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'date_joined')

# ----------------- KYC Serializer -----------------
from .models import KYC
from datetime import date

class KYCSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYC
        fields = [
            'id', 'full_name', 'date_of_birth', 'phone_number',
            'address_line1', 'address_line2', 'city', 'state', 'pincode', 'country',
            'aadhar_number', 'aadhar_document', 'pan_number', 'pan_document',
            'status', 'submitted_at', 'reviewed_at', 'rejection_reason'
        ]
        read_only_fields = ['status', 'submitted_at', 'reviewed_at', 'rejection_reason']
    
    def validate_date_of_birth(self, value):
        """Validate that user is at least 18 years old"""
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise serializers.ValidationError("You must be at least 18 years old to complete KYC.")
        return value
    
    def validate_aadhar_number(self, value):
        """Validate Aadhar number format (12 digits)"""
        if not value.isdigit() or len(value) != 12:
            raise serializers.ValidationError("Aadhar number must be exactly 12 digits.")
        return value
    
    def validate_pan_number(self, value):
        """Validate PAN number format (10 alphanumeric characters)"""
        import re
        if not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', value.upper()):
            raise serializers.ValidationError("Invalid PAN number format. Must be in format: ABCDE1234F")
        return value.upper()


# ----------------- Investment Serializers -----------------
from .models import GoldVault, Investment, ContactMessage, SIPPreference

class GoldVaultSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoldVault
        fields = ['total_gold_grams', 'purchased_coins_grams', 'updated_at']

class InvestmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investment
        fields = ['id', 'amount_inr', 'gold_grams', 'razorpay_order_id', 'status', 'created_at']

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'user', 'name', 'email', 'message', 'created_at', 'is_read']
        read_only_fields = ['id', 'created_at', 'is_read']

class SIPPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SIPPreference
        fields = ['id', 'user', 'frequency', 'amount', 'days', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


