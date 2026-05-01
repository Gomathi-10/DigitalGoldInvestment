from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterAPI, LoginAPIView, AcceptTCView, AdminStatsView, AdminUserListView, GoldPriceView, KYCSubmitView, AdminKYCListView, AdminKYCApprovalView, CreateInvestmentView, VerifyPaymentView, UserGoldVaultView, HistoricalGoldPriceView, CoinProductView, PurchaseCoinView, InvestmentHistoryView, UserProfileView, SellGoldView, PhysicalWithdrawView, UserPurchasedCoinsView, SIPPreferenceView, ContactSubmitView, AdminContactMessagesView

urlpatterns = [
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('accept-tc/', AcceptTCView.as_view(), name='accept-tc'),
    path('gold-price/', GoldPriceView.as_view(), name='gold-price'),
    path('gold-history/', HistoricalGoldPriceView.as_view(), name='gold-history'),
    path('gold-vault/', UserGoldVaultView.as_view(), name='gold-vault'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('contact/submit/', ContactSubmitView.as_view(), name='contact-submit'),

    
    # KYC URLs
    path('kyc/submit/', KYCSubmitView.as_view(), name='kyc-submit'),
    path('kyc/status/', KYCSubmitView.as_view(), name='kyc-status'),

    # Admin URLs

    path('api/admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('api/admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('api/admin/kyc/', AdminKYCListView.as_view(), name='admin-kyc-list'),
    path('api/admin/kyc/<int:kyc_id>/approve/', AdminKYCApprovalView.as_view(), name='admin-kyc-approve'),
    path('api/admin/messages/', AdminContactMessagesView.as_view(), name='admin-messages'),


    # Investment URLs
    path('invest/create/', CreateInvestmentView.as_view(), name='invest-create'),
    path('invest/verify/', VerifyPaymentView.as_view(), name='invest-verify'),
    path('investments/', InvestmentHistoryView.as_view(), name='investment-history'),

    # Coin URLs
    path('coin-products/', CoinProductView.as_view(), name='coin-products'),
    path('coin-purchase/', PurchaseCoinView.as_view(), name='coin-purchase'),

    # Withdrawal URLs
    path('withdraw/sell-gold/', SellGoldView.as_view(), name='sell-gold'),
    path('withdraw/physical/', PhysicalWithdrawView.as_view(), name='physical-withdraw'),
    path('withdraw/purchased-coins/', UserPurchasedCoinsView.as_view(), name='purchased-coins'),
    path('sip-preference/', SIPPreferenceView.as_view(), name='sip-preference'),
]



