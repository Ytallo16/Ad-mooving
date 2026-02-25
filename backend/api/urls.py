from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'api'

# Configuração do router para ViewSets
router = DefaultRouter()
router.register(r'race-registrations', views.RaceRegistrationViewSet, basename='race-registration')

urlpatterns = [
    path('', views.api_root, name='api_root'),
    path('health/', views.health_check, name='health_check'),
    path('race-statistics/', views.race_statistics, name='race_statistics'),
    path('payment-webhook/', views.payment_webhook, name='payment_webhook'),
    
    # Novos endpoints para pagamento com Stripe
    path('payment/create-session/', views.create_payment_session, name='create_payment_session'),
    path('payment/verify-status/', views.verify_payment_status, name='verify_payment_status'),
    path('payment/stripe-webhook/', views.stripe_webhook, name='stripe_webhook'),
    path('payment/prices/', views.race_prices, name='race_prices'),
    path('payment/validate-coupon/', views.validate_coupon, name='validate_coupon'),
    
    # Novos endpoints para pagamento com AbacatePay (PIX)
    path('payment/pix/create/', views.create_pix_payment, name='create_pix_payment'),
    path('payment/pix/simulate/', views.simulate_pix_payment, name='simulate_pix_payment'),
    path('payment/pix/check-status/', views.check_pix_status, name='check_pix_status'),
    
    # Endpoints administrativos
    path('admin/paid-registrations/', views.list_paid_registrations, name='list_paid_registrations'),
    path('admin/resend-email/', views.resend_confirmation_email, name='resend_confirmation_email'),
    path('admin/update-registration/', views.update_registration, name='update_registration'),
    path('admin/enviar-notificacao/', views.send_broadcast_email, name='send_broadcast_email'),
    path('admin/status-notificacao/<str:task_id>/', views.check_broadcast_status, name='check_broadcast_status'),
    
    path('', include(router.urls)),  # Inclui as URLs do router
] 