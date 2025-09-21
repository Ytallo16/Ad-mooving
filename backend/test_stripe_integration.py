#!/usr/bin/env python3
"""
Script de teste para verificar a integração Stripe
"""

import os
import sys
import django
from pathlib import Path

# Adicionar o diretório backend ao path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Importar modelos e services
from api.models import RaceRegistration
from api.services import create_stripe_checkout_session, get_race_prices
from api.views import *

def test_stripe_integration():
    """Testa a integração com Stripe"""
    print("🚀 Testando Integração Stripe - Corrida Ad-mooving")
    print("=" * 50)
    
    # 1. Testar preços
    print("\n1️⃣ Testando preços das modalidades:")
    prices = get_race_prices()
    for modality, info in prices.items():
        print(f"   {modality}: R$ {info['amount_brl']:.2f}")
    
    # 2. Criar inscrição de teste
    print("\n2️⃣ Criando inscrição de teste...")
    try:
        # Limpar inscrições de teste anteriores
        RaceRegistration.objects.filter(email="teste@admooving.com").delete()
        
        registration = RaceRegistration.objects.create(
            full_name="João Teste Silva",
            cpf="12345678901",
            email="teste@admooving.com",
            phone="11999999999",
            birth_date="1990-01-01",
            gender="M",
            modality="ADULTO",
            shirt_size="M",
            athlete_declaration=True
        )
        print(f"   ✅ Inscrição criada: ID {registration.id}")
        
        # 3. Testar criação de sessão de checkout
        print("\n3️⃣ Testando criação de sessão de checkout Stripe...")
        result = create_stripe_checkout_session(registration)
        
        if result['success']:
            print(f"   ✅ Sessão criada com sucesso!")
            print(f"   📄 Session ID: {result['session_id']}")
            print(f"   🔗 URL de Checkout: {result['checkout_url']}")
            print(f"   💰 Valor: R$ {result['amount']:.2f}")
        else:
            print(f"   ❌ Erro ao criar sessão: {result['error']}")
            
        # 4. Verificar se os campos foram salvos
        registration.refresh_from_db()
        print(f"\n4️⃣ Verificando campos salvos:")
        print(f"   Stripe Session ID: {registration.stripe_checkout_session_id}")
        print(f"   Valor do Pagamento: R$ {registration.payment_amount}")
        print(f"   Status: {registration.payment_status}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_stripe_config():
    """Testa configurações do Stripe"""
    print("\n🔧 Verificando Configurações Stripe:")
    print("=" * 30)
    
    from django.conf import settings
    import stripe
    
    # Verificar chaves
    public_key = getattr(settings, 'STRIPE_PUBLIC_KEY', '')
    secret_key = getattr(settings, 'STRIPE_SECRET_KEY', '')
    webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')
    
    print(f"Public Key: {'✅ Configurada' if public_key else '❌ Não configurada'}")
    print(f"Secret Key: {'✅ Configurada' if secret_key else '❌ Não configurada'}")
    print(f"Webhook Secret: {'✅ Configurada' if webhook_secret else '⚠️  Não configurada (OK para desenvolvimento)'}")
    
    # Testar conexão com Stripe
    if secret_key:
        try:
            stripe.api_key = secret_key
            # Fazer uma chamada simples para testar
            account = stripe.Account.retrieve()
            print(f"✅ Conexão com Stripe OK - Conta: {account.id}")
            return True
        except Exception as e:
            print(f"❌ Erro na conexão com Stripe: {str(e)}")
            return False
    else:
        print("❌ Chave secreta não configurada")
        return False

if __name__ == "__main__":
    print("🧪 SISTEMA DE TESTES - STRIPE INTEGRATION")
    print("=" * 60)
    
    # Testar configurações
    config_ok = test_stripe_config()
    
    if config_ok:
        # Testar integração
        integration_ok = test_stripe_integration()
        
        if integration_ok:
            print("\n🎉 SUCESSO! Integração Stripe funcionando perfeitamente!")
            print("\n📋 Próximos passos:")
            print("   1. Integrar no frontend React")
            print("   2. Configurar webhook em produção")
            print("   3. Testar com cartões de teste do Stripe")
        else:
            print("\n❌ Falha na integração. Verifique os logs acima.")
    else:
        print("\n❌ Configurações incorretas. Verifique o arquivo .env")
    
    print("\n" + "=" * 60)
