#!/usr/bin/env python3
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import RaceRegistration
from api.services import send_registration_confirmation_email

# Buscar uma inscrição existente
try:
    registration = RaceRegistration.objects.get(id=9)
    print(f"Testando email para: {registration.full_name} ({registration.email})")
    
    # Tentar enviar email
    result = send_registration_confirmation_email(registration)
    print(f"Resultado do envio: {result}")
    
    # Verificar se foi marcado como enviado
    registration.refresh_from_db()
    print(f"confirmation_email_sent: {registration.confirmation_email_sent}")
    
    print("\n" + "="*50)
    print("TESTANDO COM SEU EMAIL REAL:")
    print("="*50)
    
    # Criar uma nova inscrição com seu email
    new_registration = RaceRegistration.objects.create(
        full_name="Ytallo Gomes - Teste Real",
        cpf="55566677788",
        email="ytallogomes126@gmail.com",
        phone="11999999999",
        birth_date="1990-01-01",
        gender="M",
        modality="ADULTO",
        shirt_size="M",
        athlete_declaration=True
    )
    
    print(f"Nova inscrição criada: {new_registration.id}")
    print(f"Enviando email para: {new_registration.email}")
    
    # Enviar email
    result = send_registration_confirmation_email(new_registration)
    print(f"Resultado do envio: {result}")
    
    # Verificar status
    new_registration.refresh_from_db()
    print(f"confirmation_email_sent: {new_registration.confirmation_email_sent}")
    
except Exception as e:
    print(f"Erro: {e}")
    import traceback
    traceback.print_exc() 