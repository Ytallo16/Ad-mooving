#!/usr/bin/env python3
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

print("=== DEBUG EMAIL ===")
print(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
print(f"DEFAULT_FROM_EMAIL type: {type(settings.DEFAULT_FROM_EMAIL)}")
print(f"DEFAULT_FROM_EMAIL bytes: {repr(settings.DEFAULT_FROM_EMAIL)}")

# Teste simples
try:
    print("\n=== TESTE SIMPLES ===")
    result = send_mail(
        subject='Teste Simples',
        message='Mensagem de teste',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=['teste@teste.com'],
        fail_silently=False,
    )
    print(f"Resultado: {result}")
except Exception as e:
    print(f"Erro: {e}")
    import traceback
    traceback.print_exc()

# Teste com subject em português
try:
    print("\n=== TESTE COM SUBJECT EM PORTUGUES ===")
    result = send_mail(
        subject='Confirmação de Inscrição',
        message='Mensagem de teste',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=['teste@teste.com'],
        fail_silently=False,
    )
    print(f"Resultado: {result}")
except Exception as e:
    print(f"Erro: {e}")
    import traceback
    traceback.print_exc() 