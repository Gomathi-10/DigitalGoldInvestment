from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager


class CustomUserManager(BaseUserManager):
    """
    Custom manager where email is the unique identifier
    for authentication instead of username.
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is a required field')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)  # Important for superuser

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    username = models.CharField(max_length=150, blank=True, null=True)
    birth_date = models.DateField(null=True, blank=True)
    email = models.EmailField(unique=True)

    # Remove password fields, AbstractUser already has password
    # password = models.CharField(max_length=200) 
    # confirm_password = models.CharField(max_length=200)

    has_accepted_tc = models.BooleanField(default=False)
    
    objects = CustomUserManager()

    USERNAME_FIELD = 'email'  # email is used to login
    REQUIRED_FIELDS = ['username']  # required when creating superuser

    def __str__(self):
        return self.email


class KYC(models.Model):
    """
    KYC (Know Your Customer) model for user verification
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='kyc')
    
    # Personal Details
    full_name = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    phone_number = models.CharField(max_length=15)
    
    # Address Details
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    country = models.CharField(max_length=100, default='India')
    
    # Document Details
    aadhar_number = models.CharField(max_length=12)
    aadhar_document = models.FileField(upload_to='kyc/aadhar/', null=True, blank=True)
    pan_number = models.CharField(max_length=10)
    pan_document = models.FileField(upload_to='kyc/pan/', null=True, blank=True)
    
    # Status and Timestamps
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_kycs')
    rejection_reason = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = 'KYC'
        verbose_name_plural = 'KYCs'
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"KYC - {self.user.email} ({self.status})"
    
    def is_adult(self):
        """Check if user is 18 years or older"""
        from datetime import date
        today = date.today()
        age = today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        return age >= 18

class GoldVault(models.Model):
    """
    Stores the user's total digital gold balance.
    """
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='gold_vault')
    total_gold_grams = models.DecimalField(max_digits=10, decimal_places=4, default=0.0000)
    purchased_coins_grams = models.DecimalField(max_digits=10, decimal_places=4, default=0.0000)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.total_gold_grams}g (coins: {self.purchased_coins_grams}g)"

class Investment(models.Model):
    """
    Records each investment transaction.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='investments')
    amount_inr = models.DecimalField(max_digits=10, decimal_places=2)
    gold_grams = models.DecimalField(max_digits=10, decimal_places=4)
    razorpay_order_id = models.CharField(max_length=100)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.amount_inr} INR - {self.status}"

class ContactMessage(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='contact_messages')
    name = models.CharField(max_length=255)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message from {self.name} ({self.email}) at {self.created_at}"

class SIPPreference(models.Model):
    """
    Stores user SIP (Systematic Investment Plan) settings.
    """
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('monthly', 'Monthly'),
    ]
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='sip_preference')
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    days = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.frequency} - ₹{self.amount}"
