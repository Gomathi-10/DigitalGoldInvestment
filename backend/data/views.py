from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView 
from rest_framework.response import Response 
from django.contrib.auth import get_user_model, authenticate
from knox.models import AuthToken
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer, KYCSerializer, ContactMessageSerializer, SIPPreferenceSerializer
from .models import ContactMessage, SIPPreference
from django.utils import timezone
from datetime import timedelta

from django.db.models import Sum
User = get_user_model()

# Import KYC views
from .kyc_views import KYCSubmitView, AdminKYCListView, AdminKYCApprovalView

# ----------------- Gold Rate Caching -----------------
import requests
GOLD_RATE_CACHE = {
    "rate": 7728.00,
    "last_updated": None
}

def get_live_gold_rate():
    """
    Fetches live gold rate with a 5-minute cache.
    """
    global GOLD_RATE_CACHE
    now = timezone.now()
    
    # Check if cache is valid (5 minutes)
    if GOLD_RATE_CACHE["last_updated"] and (now - GOLD_RATE_CACHE["last_updated"]) < timedelta(minutes=5):
        print("DEBUG: Using cached gold rate")
        return GOLD_RATE_CACHE["rate"]
    
    print("DEBUG: Fetching live gold rate from API")
    API_KEY = "goldapi-3qk7asmkmapj3r-io"
    try:
        response = requests.get(
            "https://www.goldapi.io/api/XAU/INR",
            headers={"x-access-token": API_KEY},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            gold_inr_per_oz = data.get('price', 0)
            if gold_inr_per_oz > 0:
                gold_inr_per_gram = gold_inr_per_oz / 31.1035
                GOLD_RATE_CACHE["rate"] = gold_inr_per_gram
                GOLD_RATE_CACHE["last_updated"] = now
                return gold_inr_per_gram
    except Exception as e:
        print(f"DEBUG Error fetching gold rate: {str(e)}")
    
    return GOLD_RATE_CACHE["rate"]  # Return fallback or last successful rate

# ----------------- Login API -----------------
class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            _, token = AuthToken.objects.create(user)
            
            from django.contrib.auth.models import update_last_login
            update_last_login(None, user)          

            return Response({
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                    "has_accepted_tc": user.has_accepted_tc
                },
                "token": token
            }, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ----------------- Register API -----------------
class RegisterAPI(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            _, token = AuthToken.objects.create(user)
            return Response({
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_staff": user.is_staff,
                     "is_superuser": user.is_superuser,
                     "has_accepted_tc": user.has_accepted_tc
                },
                "token": token
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ----------------- Accept T&C API -----------------
class AcceptTCView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        user.has_accepted_tc = True
        user.save()
        return Response({"status": "success", "message": "Terms and conditions accepted."}, status=status.HTTP_200_OK)

# ----------------- Admin Stats API -----------------
class AdminStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        # 1. Total Users in DB
        user_count = User.objects.count()
        
        # 2. Daily Active Users (Last 24h)
        time_threshold = timezone.now() - timedelta(hours=24)
        active_recent = User.objects.filter(last_login__gte=time_threshold).count()

        # 3. Live Active Sessions (Knox Tokens)
        # AuthToken objects represent active login sessions
        from knox.models import AuthToken
        live_sessions = AuthToken.objects.count()
        
        return Response({
            "total_users": user_count,
            "active_now": active_recent,
            "live_sessions": live_sessions
        })

# ----------------- Admin User List API -----------------
class AdminUserListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users_list = []
        for user in User.objects.all().order_by('-last_login'):
            kyc_status = 'not_submitted'
            if hasattr(user, 'kyc'):
                kyc_status = user.kyc.status
                
            users_list.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'date_joined': user.date_joined,
                'last_login': user.last_login,
                'is_active': user.is_active,
                'kyc_status': kyc_status
            })
        return Response(users_list)


# ----------------- Gold Price API -----------------
class GoldPriceView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        rate = get_live_gold_rate()
        return Response({
            "rate": round(rate, 2),
            "currency": "INR",
            "unit": "gram",
            "purity": "24K",
            "last_updated": GOLD_RATE_CACHE["last_updated"] or timezone.now(),
            "source": "goldapi.io" if GOLD_RATE_CACHE["last_updated"] else "fallback"
        })

# ----------------- Investment Views -----------------
import stripe
import os 
from django.conf import settings
from .serializers import InvestmentSerializer, GoldVaultSerializer
from .models import GoldVault, Investment

# Initialize Stripe (Using the secret key provided by the user)
from dotenv import load_dotenv
load_dotenv(settings.BASE_DIR / 'secret.env')
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
stripe.api_key = STRIPE_SECRET_KEY

class CreateInvestmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        print(f"DEBUG: CreateInvestmentView POST by user: {request.user}")
        print(f"DEBUG: Request Data: {request.data}")
        try:
            user = request.user
            
            # 1. Check KYC Status
            if not hasattr(user, 'kyc') or user.kyc.status != 'approved':
                print(f"DEBUG Error: User {user.email} KYC not approved")
                return Response({"error": "KYC must be approved to invest."}, status=status.HTTP_403_FORBIDDEN)
            
            raw_amount = request.data.get('amount', 0)
            print(f"DEBUG: Processing amount: {raw_amount}")
            try:
                amount = float(raw_amount)
            except (ValueError, TypeError):
                return Response({"error": f"Invalid amount format: {raw_amount}"}, status=status.HTTP_400_BAD_REQUEST)

            if amount <= 0:
                return Response({"error": "Amount must be greater than zero"}, status=status.HTTP_400_BAD_REQUEST)
            
            # 2. Get Gold Rate
            current_rate_per_gram = get_live_gold_rate()
            
            gold_grams = amount / current_rate_per_gram
            print(f"DEBUG: Calculated gold grams: {gold_grams}")
            
            is_mock = request.data.get('is_mock', False)
            
            if is_mock:
                print("DEBUG: Processing MOCK investment (Instant Success)")
                investment = Investment.objects.create(
                    user=user,
                    amount_inr=amount,
                    gold_grams=gold_grams,
                    razorpay_order_id=f"mock_{int(timezone.now().timestamp())}",
                    status='success'
                )
                
                # Immediately update vault
                vault, _ = GoldVault.objects.get_or_create(user=user)
                vault.total_gold_grams = float(vault.total_gold_grams) + float(gold_grams)
                vault.save()
                
                return Response({
                    "status": "success",
                    "message": f"Successfully invested ₹{amount} (Mock Success)",
                    "amount": amount,
                    "gold_grams": round(gold_grams, 4),
                    "investment_id": investment.id
                })

            # 3. Create Stripe Checkout Session
            print("DEBUG: Creating Stripe Checkout Session...")
            try:

                # In a real app, success_url should point to a verify endpoint or a frontend success page
                # For this demo, we'll redirect back to dashboard and use a webhook or immediate verify
                checkout_session = stripe.checkout.Session.create(
                    payment_method_types=['card'],
                    line_items=[{
                        'price_data': {
                            'currency': 'inr',
                            'product_data': {
                                'name': 'Digital Gold Investment',
                                'description': f'Purchasing {round(gold_grams, 4)}g of 24K Digital Gold',
                            },
                            'unit_amount': int(amount * 100),
                        },
                        'quantity': 1,
                    }],
                    mode='payment',
                    success_url=f'http://localhost:5173/dashboard?session_id={{CHECKOUT_SESSION_ID}}&investment_id={user.id}',
                    cancel_url='http://localhost:5173/invest',
                    metadata={
                        'user_id': user.id,
                        'email': user.email,
                        'grams': round(gold_grams, 4),
                        'amount': amount
                    }
                )
                print(f"DEBUG: Stripe Checkout Session created: {checkout_session.id}")
            except Exception as stripe_err:
                print(f"DEBUG Error: Stripe Checkout Session creation failed: {str(stripe_err)}")
                return Response({"error": f"Payment gateway error: {str(stripe_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # 4. Save Investment Record
            investment = Investment.objects.create(
                user=user,
                amount_inr=amount,
                gold_grams=gold_grams,
                razorpay_order_id=checkout_session.id, # Using this field for session ID
                status='pending'
            )
            print(f"DEBUG: Investment record created with ID: {investment.id}")
            
            return Response({
                "checkout_url": checkout_session.url,
                "amount": amount,
                "gold_grams": round(gold_grams, 4),
                "investment_id": investment.id
            })


        except Exception as e:
            import traceback
            print(f"DEBUG Critical Error in CreateInvestmentView: {str(e)}")
            print(traceback.format_exc())
            return Response({"error": f"Internal Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            data = request.data
            session_id = data.get('session_id')
            
            # Check status of Checkout Session
            session = stripe.checkout.Session.retrieve(session_id)
            
            if session.payment_status == 'paid':
                # Update Investment
                print(f"DEBUG: Payment successful for session {session_id}")
                investment = Investment.objects.get(razorpay_order_id=session_id)

                if investment.status == 'success':
                    print(f"DEBUG: Investment {session_id} already processed")
                    return Response({"status": "success", "message": "Already processed"}, status=status.HTTP_200_OK)

                investment.status = 'success'
                investment.razorpay_payment_id = getattr(session, 'payment_intent', session_id)
                investment.save()

                vault, created = GoldVault.objects.get_or_create(user=investment.user)

                # Check if this is a coin purchase (negative gold_grams) or a regular investment (positive)
                if float(investment.gold_grams) < 0:
                    # Coin purchase: add the weight to purchased_coins_grams (not deduct from vault)
                    coin_weight = abs(float(investment.gold_grams))
                    vault.purchased_coins_grams = float(vault.purchased_coins_grams) + coin_weight
                    vault.save()
                    return Response({"status": "success", "message": "Payment verified and coin purchase completed"}, status=status.HTTP_200_OK)
                else:
                    # Regular investment: add gold to vault
                    vault.total_gold_grams = float(vault.total_gold_grams) + float(investment.gold_grams)
                    vault.save()
                    return Response({"status": "success", "message": "Payment verified and gold credited"}, status=status.HTTP_200_OK)
            else:
                print(f"DEBUG: Payment verification failed. Status: {session.payment_status}")
                return Response({"error": f"Payment not successful. Status: {session.payment_status}"}, status=status.HTTP_400_BAD_REQUEST)



        except stripe.error.StripeError as e:
            return Response({"error": f"Stripe Error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Investment.DoesNotExist:
             return Response({"error": "Investment not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            print(f"DEBUG Critical Error in VerifyPaymentView: {str(e)}")
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HistoricalGoldPriceView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Generate mock data for the last 3 years (monthly intervals)
        import random
        from datetime import datetime
        
        data = []
        # Current base rate around 7700
        base_rate = 5500 
        
        # 3 years = 36 months
        for i in range(36, -1, -1):
            date = timezone.now() - timedelta(days=i*30)
            # Add some upward trend and randomness
            increase = (36 - i) * 65 # Roughly 65 INR increase per month
            random_fluctuation = random.uniform(-100, 100)
            rate = base_rate + increase + random_fluctuation
            
            data.append({
                "date": date.strftime("%b %Y"),
                "rate": round(rate, 2),
                "timestamp": date.timestamp()
            })
            
        return Response(data)

class UserGoldVaultView(APIView):

    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        vault, created = GoldVault.objects.get_or_create(user=request.user)
        
        # Calculate total amount invested from successful investments
        total_invested = Investment.objects.filter(
            user=request.user, 
            status='success'
        ).aggregate(total=Sum('amount_inr'))['total'] or 0
        
        response_data = {
            "total_gold_grams": float(vault.total_gold_grams),
            "purchased_coins_grams": float(vault.purchased_coins_grams),
            "total_invested_inr": float(total_invested),
            "updated_at": vault.updated_at
        }
        return Response(response_data)

class CoinProductView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Enforce KYC check
        if not hasattr(request.user, 'kyc') or request.user.kyc.status != 'approved':
            kyc_status = request.user.kyc.status if hasattr(request.user, 'kyc') else 'not_submitted'
            return Response({
                "error": "KYC must be approved to purchase gold coins.",
                "kyc_status": kyc_status
            }, status=status.HTTP_403_FORBIDDEN)

        # Fetch current gold rate per gram
        current_rate_per_gram = get_live_gold_rate()

        coins = [
            {"id": "coin_1g", "weight": 1, "name": "24K Gold Coin - 1g", "image": "/coins/1g.jpg"},
            {"id": "coin_2g", "weight": 2, "name": "24K Gold Coin - 2g", "image": "/coins/2g.jpg"},
            {"id": "coin_3g", "weight": 3, "name": "24K Gold Coin - 3g", "image": "/coins/3g.jpg"},
            {"id": "coin_4g", "weight": 4, "name": "24K Gold Coin - 4g", "image": "/coins/4g.jpg"},
            {"id": "coin_5g", "weight": 5, "name": "24K Gold Coin - 5g", "image": "/coins/5g.jpg"},
        ]


        # Get user vault info
        user_vault, _ = GoldVault.objects.get_or_create(user=request.user)
        user_balance_grams = max(0.0, float(user_vault.total_gold_grams))
        purchased_coins_grams = max(0.0, float(user_vault.purchased_coins_grams))
        
        # Calculate current total invested INR balance
        total_invested_inr = Investment.objects.filter(
            user=request.user, 
            status='success'
        ).aggregate(total=Sum('amount_inr'))['total'] or 0
        total_invested_inr = max(0.0, float(total_invested_inr))

        for coin in coins:
            coin["price_inr"] = round(coin["weight"] * current_rate_per_gram, 2)
            # User must have enough portfolio value (invested INR) to purchase the coin
            coin["can_afford"] = total_invested_inr >= coin["price_inr"]
            coin["funds_needed_inr"] = round(max(0, coin["price_inr"] - total_invested_inr), 2)

        return Response({
            "gold_rate": round(current_rate_per_gram, 2),
            "user_balance": user_balance_grams,
            "purchased_coins_grams": purchased_coins_grams,
            "total_invested_inr": total_invested_inr,
            "coins": coins
        })

class PurchaseCoinView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        coin_id = request.data.get('coin_id')
        weight = float(request.data.get('weight', 0))
        use_balance = request.data.get('use_balance', False)

        if weight <= 0:
            return Response({"error": "Invalid coin weight"}, status=status.HTTP_400_BAD_REQUEST)

        vault, _ = GoldVault.objects.get_or_create(user=user)

        current_rate_per_gram = get_live_gold_rate()
        amount_inr = weight * current_rate_per_gram

        # Calculate current total invested to prevent going negative
        total_invested = Investment.objects.filter(
            user=user, 
            status='success'
        ).aggregate(total=Sum('amount_inr'))['total'] or 0
        total_invested = float(total_invested)

        # CHECK: User must have enough portfolio value to cover the coin price
        if not use_balance and total_invested < amount_inr:
            return Response({
                "error": f"Insufficient portfolio value. You have ₹{round(total_invested, 2)} but this coin costs ₹{round(amount_inr, 2)}. Invest ₹{round(amount_inr - total_invested, 2)} more first."
            }, status=status.HTTP_400_BAD_REQUEST)

        if use_balance:
            # REDEEM FROM VAULT — requires vault gold balance
            current_vault_balance = max(0.0, float(vault.total_gold_grams))
            if current_vault_balance < weight:
                return Response({
                    "error": f"Insufficient vault balance. You have {current_vault_balance}g but need {weight}g. Please invest more gold first."
                }, status=status.HTTP_400_BAD_REQUEST)
            try:
                vault.total_gold_grams = max(0.0, current_vault_balance - weight)
                vault.save()
                
                amount_to_deduct = min(amount_inr, total_invested)
                Investment.objects.create(
                    user=user,
                    amount_inr=-amount_to_deduct,  
                    gold_grams=-weight,             
                    razorpay_order_id=f"coin_{coin_id}_{int(timezone.now().timestamp())}",
                    status='success'
                )
                return Response({
                    "status": "success", 
                    "message": f"Successfully purchased {weight}g coin using vault balance! (Value: ₹{round(amount_inr, 2)})"
                })
            except Exception as e:
                return Response({"error": f"Internal Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        else:
            # DIRECT PURCHASE via Stripe or Mock — no vault balance needed
            is_mock = request.data.get('is_mock', False)
            if is_mock:
                # MOCK PURCHASE: Add coins to purchased_coins_grams, deduct cost from portfolio
                vault.purchased_coins_grams = float(vault.purchased_coins_grams) + weight
                vault.save()

                amount_to_deduct = min(amount_inr, total_invested)
                Investment.objects.create(
                    user=user,
                    amount_inr=-amount_to_deduct, 
                    gold_grams=-weight,
                    razorpay_order_id=f"coin_mock_{coin_id}_{int(timezone.now().timestamp())}",
                    status='success'
                )
                return Response({
                    "status": "success", 
                    "message": f"Successfully purchased {weight}g gold coin via Mock Gateway. Your invested amount has been updated."
                })

            try:
                # STRIPE PURCHASE: Create checkout session
                checkout_session = stripe.checkout.Session.create(
                    payment_method_types=['card'],
                    line_items=[{
                        'price_data': {
                            'currency': 'inr',
                            'product_data': {
                                'name': f'{weight}g 24K Gold Coin',
                                'description': f'Purchase of {weight}g 24K Gold Coin',
                            },
                            'unit_amount': int(amount_inr * 100),
                        },
                        'quantity': 1,
                    }],
                    mode='payment',
                    success_url=f'http://localhost:5173/dashboard?session_id={{CHECKOUT_SESSION_ID}}&purchase_type=coin&weight={weight}',
                    cancel_url='http://localhost:5173/buy-coins',
                    metadata={
                        'user_id': user.id,
                        'weight': weight,
                        'purchase_type': 'coin'
                    }
                )

                # Save a pending Investment record so VerifyPaymentView can find it
                amount_to_deduct = min(amount_inr, total_invested)
                Investment.objects.create(
                    user=user,
                    amount_inr=-amount_to_deduct,
                    gold_grams=-weight,
                    razorpay_order_id=checkout_session.id,
                    status='pending'
                )

                return Response({"checkout_url": checkout_session.url})
            except Exception as e:
                return Response({"error": f"Payment Gateway Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        user_data = UserSerializer(user).data
        
        # Get KYC data if exists
        kyc_data = None
        try:
            kyc = user.kyc
            kyc_data = KYCSerializer(kyc).data
        except Exception:
            pass

        return Response({
            "user": user_data,
            "kyc": kyc_data
        })

class InvestmentHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        investments = Investment.objects.filter(user=request.user).order_by('-created_at')
        serializer = InvestmentSerializer(investments, many=True)
        return Response(serializer.data)

class SellGoldView(APIView):
    """
    Allows users to sell their digital gold for INR.
    The amount is subtracted from their vault and a redemption record is created.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        try:
            amount_inr = float(request.data.get('amount', 0))
            if amount_inr <= 0:
                return Response({"error": "Invalid amount to withdraw"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate grams to sell based on INR amount
            current_rate = get_live_gold_rate()
            grams_to_sell = amount_inr / current_rate
            
            vault, _ = GoldVault.objects.get_or_create(user=user)
            if float(vault.total_gold_grams) < grams_to_sell:
                return Response({"error": f"Insufficient gold balance. You need {round(grams_to_sell, 4)}g for ₹{amount_inr}"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Deduct from vault
            vault.total_gold_grams = float(vault.total_gold_grams) - grams_to_sell
            vault.save()
            
            # Create a redemption investment record (negative amounts)
            Investment.objects.create(
                user=user,
                amount_inr=-amount_inr,
                gold_grams=-grams_to_sell,
                razorpay_order_id=f"sell_{int(timezone.now().timestamp())}",
                status='success'
            )
            
            return Response({
                "status": "success",
                "message": f"Successfully sold {round(grams_to_sell, 4)}g of gold for ₹{round(amount_inr, 2)}. The amount will be transferred to your account.",
                "grams_sold": round(grams_to_sell, 4),
                "amount_withdrawn": round(amount_inr, 2)
            })

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserPurchasedCoinsView(APIView):
    """
    Returns a list of gold coins the user has successfully purchased.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Successful investments with 'coin_' prefix
        coin_txns = Investment.objects.filter(
            user=request.user,
            status='success',
            razorpay_order_id__icontains='coin'
        ).order_by('-created_at')
        
        coins_list = []
        for txn in coin_txns:
            # Try to extract weight/name from ID or metadata if we had it
            # For now, we'll use a simple parser for the ID formats we created
            name = "Purchased Gold Coin"
            weight = 0
            
            if "1g" in txn.razorpay_order_id: weight = 1
            elif "2g" in txn.razorpay_order_id: weight = 2
            elif "3g" in txn.razorpay_order_id: weight = 3
            elif "4g" in txn.razorpay_order_id: weight = 4
            elif "5g" in txn.razorpay_order_id: weight = 5
            elif "10g" in txn.razorpay_order_id: weight = 10
            
            # If weight found, refine name
            if weight > 0:
                name = f"24K Gold Coin - {weight}g"
            else:
                # Fallback: estimate weight from amount/rate ratio if possible
                # But since it's a fixed coin purchase, it's better to store it properly.
                # For this session, we'll assume weight is available in the ID as per PurchaseCoinView
                pass

            coins_list.append({
                "id": txn.razorpay_order_id,
                "name": name,
                "weight": weight,
                "purchase_date": txn.created_at,
                "amount": abs(txn.amount_inr)
            })
            
        return Response(coins_list)

class PhysicalWithdrawView(APIView):
    """
    Allows users to withdraw their digital gold as physical coins.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        try:
            coin_id = request.data.get('coin_id')
            weight = float(request.data.get('weight', 0))
            
            if weight <= 0:
                return Response({"error": "Invalid coin weight"}, status=status.HTTP_400_BAD_REQUEST)
            
            vault, _ = GoldVault.objects.get_or_create(user=user)
            if float(vault.total_gold_grams) < weight:
                return Response({"error": "Insufficient gold balance for this withdrawal"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Deduct from vault
            vault.total_gold_grams = float(vault.total_gold_grams) - weight
            vault.save()
            
            # Record the transaction
            current_rate = get_live_gold_rate()
            value_inr = weight * current_rate
            
            Investment.objects.create(
                user=user,
                amount_inr=-value_inr,
                gold_grams=-weight,
                razorpay_order_id=f"withdraw_{coin_id}_{int(timezone.now().timestamp())}",
                status='success'
            )
            
            return Response({
                "status": "success",
                "message": f"Withdrawal request for {weight}g physical gold coin placed successfully.",
                "weight": weight,
                "asset": coin_id
            })
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




class ContactSubmitView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data.copy()
        if request.user.is_authenticated:
            data['user'] = request.user.id
            if not data.get('name'):
                data['name'] = request.user.username
            if not data.get('email'):
                data['email'] = request.user.email
        
        serializer = ContactMessageSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": "success", "message": "Your message has been sent successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminContactMessagesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Specific check for gomathi@gmail.com as requested
        # Allowing superusers and staff if they are the special email
        is_gomathi = request.user.email == 'gomathi@gmail.com'
        if not (request.user.is_superuser or is_gomathi):
            return Response({"error": "Unauthorized Access"}, status=status.HTTP_403_FORBIDDEN)
        
        messages = ContactMessage.objects.all().order_by('-created_at')
        serializer = ContactMessageSerializer(messages, many=True)
        return Response(serializer.data)

class SIPPreferenceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            preference = request.user.sip_preference
            serializer = SIPPreferenceSerializer(preference)
            return Response(serializer.data)
        except SIPPreference.DoesNotExist:
            return Response({"status": "not_set"}, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        try:
            preference, created = SIPPreference.objects.get_or_create(user=request.user, defaults={
                'frequency': data.get('frequency'),
                'amount': data.get('amount'),
                'days': data.get('days')
            })
            if not created:
                preference.frequency = data.get('frequency', preference.frequency)
                preference.amount = data.get('amount', preference.amount)
                preference.days = data.get('days', preference.days)
                preference.save()
            
            serializer = SIPPreferenceSerializer(preference)
            return Response({
                "status": "success",
                "message": "SIP Preference saved successfully",
                "data": serializer.data
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
