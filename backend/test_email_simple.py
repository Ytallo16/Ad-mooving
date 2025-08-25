#!/usr/bin/env python3
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import RaceRegistration
from api.services import send_registration_confirmation_email

# Buscar a inscrição mais recente
try:
    registration = RaceRegistration.objects.get(id=17)
    print(f"Testando email para: {registration.full_name} ({registration.email})")
    
    # Tentar enviar email
    result = send_registration_confirmation_email(registration)
    print(f"Resultado do envio: {result}")
    
    # Verificar se foi marcado como enviado
    registration.refresh_from_db()
    print(f"confirmation_email_sent: {registration.confirmation_email_sent}")
    
except Exception as e:
    print(f"Erro: {e}")
    import traceback
    traceback.print_exc() 