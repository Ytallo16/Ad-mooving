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
    path('', include(router.urls)),  # Inclui as URLs do router
] 