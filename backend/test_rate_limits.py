#!/usr/bin/env python3
"""
Script para testar rate limiting da API
"""

import requests
import time
import json
from datetime import datetime

# Configuração
API_BASE_URL = "http://localhost:8000/api"
TEST_IP = "127.0.0.1"

def test_endpoint(endpoint, method='GET', data=None, max_requests=15, delay=1):
    """
    Testa rate limiting em um endpoint específico
    """
    print(f"\n🧪 Testando {method} {endpoint}")
    print(f"📊 Fazendo {max_requests} requisições com delay de {delay}s")
    print("=" * 60)
    
    success_count = 0
    rate_limited_count = 0
    
    for i in range(max_requests):
        try:
            if method == 'GET':
                response = requests.get(f"{API_BASE_URL}{endpoint}")
            elif method == 'POST':
                response = requests.post(f"{API_BASE_URL}{endpoint}", json=data)
            
            if response.status_code == 200 or response.status_code == 201:
                success_count += 1
                print(f"✅ Requisição {i+1}: {response.status_code}")
            elif response.status_code == 429:
                rate_limited_count += 1
                print(f"🚫 Requisição {i+1}: RATE LIMITED (429)")
                try:
                    error_data = response.json()
                    print(f"   Mensagem: {error_data.get('message', 'N/A')}")
                except:
                    pass
            else:
                print(f"⚠️  Requisição {i+1}: {response.status_code}")
            
            time.sleep(delay)
            
        except Exception as e:
            print(f"❌ Erro na requisição {i+1}: {e}")
    
    print(f"\n📈 Resultados:")
    print(f"   ✅ Sucessos: {success_count}")
    print(f"   🚫 Rate Limited: {rate_limited_count}")
    print(f"   📊 Taxa de sucesso: {(success_count/max_requests)*100:.1f}%")

def test_registration_rate_limit():
    """
    Testa rate limiting no endpoint de inscrições
    """
    print("\n🏃‍♂️ TESTE: Rate Limiting de Inscrições")
    print("Limite: 10 inscrições por hora por IP")
    
    # Dados de teste para inscrição
    test_data = {
        "full_name": "João Teste",
        "cpf": "12345678901",
        "email": "joao.teste@email.com",
        "phone": "11999999999",
        "birth_date": "1990-01-01",
        "gender": "M",
        "modality": "ADULTO",
        "course": "RUN_5K",
        "shirt_size": "M",
        "athlete_declaration": True
    }
    
    test_endpoint("/race-registrations/", "POST", test_data, max_requests=15, delay=0.5)

def test_payment_rate_limit():
    """
    Testa rate limiting no endpoint de pagamento
    """
    print("\n💳 TESTE: Rate Limiting de Pagamento")
    print("Limite: 5 tentativas por minuto por IP")
    
    # Dados de teste para pagamento
    test_data = {
        "registration_id": 1
    }
    
    test_endpoint("/payment/create-session/", "POST", test_data, max_requests=10, delay=0.5)

def test_statistics_rate_limit():
    """
    Testa rate limiting no endpoint de estatísticas
    """
    print("\n📊 TESTE: Rate Limiting de Estatísticas")
    print("Limite: 100 requisições por hora por IP")
    
    test_endpoint("/race-statistics/", "GET", max_requests=15, delay=0.2)

def test_health_check():
    """
    Testa se health check não tem rate limiting
    """
    print("\n🏥 TESTE: Health Check (sem rate limiting)")
    
    for i in range(5):
        try:
            response = requests.get(f"{API_BASE_URL}/health/")
            print(f"✅ Health check {i+1}: {response.status_code}")
            time.sleep(0.1)
        except Exception as e:
            print(f"❌ Erro: {e}")

def main():
    """
    Executa todos os testes
    """
    print("🚀 INICIANDO TESTES DE RATE LIMITING")
    print(f"🌐 API: {API_BASE_URL}")
    print(f"🕐 Início: {datetime.now().strftime('%H:%M:%S')}")
    
    # Verificar se API está rodando
    try:
        response = requests.get(f"{API_BASE_URL}/health/")
        if response.status_code != 200:
            print("❌ API não está respondendo corretamente")
            return
    except:
        print("❌ Não foi possível conectar à API")
        print("   Certifique-se de que o servidor está rodando em http://localhost:8000")
        return
    
    print("✅ API está respondendo")
    
    # Executar testes
    test_health_check()
    test_registration_rate_limit()
    test_payment_rate_limit()
    test_statistics_rate_limit()
    
    print(f"\n🏁 TESTES CONCLUÍDOS")
    print(f"🕐 Fim: {datetime.now().strftime('%H:%M:%S')}")

if __name__ == "__main__":
    main()
