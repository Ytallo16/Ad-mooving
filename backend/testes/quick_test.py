#!/usr/bin/env python3
"""
Teste rápido para verificar se o backend está funcionando
"""
import os
import sys
import django
from django.test import TestCase, Client
from django.core import mail

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def quick_test():
    """Executa um teste rápido do backend"""
    print("🚀 TESTE RÁPIDO DO BACKEND AD-MOOVING")
    print("=" * 50)
    
    client = Client()
    tests_passed = 0
    total_tests = 0
    
    def run_test(test_name, test_func):
        nonlocal tests_passed, total_tests
        total_tests += 1
        
        try:
            test_func()
            print(f"✅ {test_name}")
            tests_passed += 1
        except Exception as e:
            print(f"❌ {test_name}: {e}")
    
    # Teste 1: Health Check
    run_test("Health Check", lambda: 
        client.get('/api/health/').status_code == 200
    )
    
    # Teste 2: API Root
    run_test("API Root", lambda:
        client.get('/api/').status_code == 200
    )
    
    # Teste 3: Estatísticas
    run_test("Estatísticas", lambda:
        client.get('/api/race-statistics/').status_code == 200
    )
    
    # Teste 4: Criação de Inscrição
    run_test("Criação de Inscrição", lambda:
        client.post('/api/race-registrations/', {
            'full_name': 'João Teste',
            'cpf': '12345678901',
            'email': 'joao@teste.com',
            'phone': '11999999999',
            'birth_date': '1990-01-01',
            'gender': 'M',
            'modality': 'ADULTO',
            'course': 'RUN_5K',
            'shirt_size': 'M',
            'athlete_declaration': True
        }, content_type='application/json').status_code == 201
    )
    
    # Teste 5: Validação de Cupom
    run_test("Validação de Cupom", lambda:
        client.post('/api/payment/validate-coupon/', {
            'coupon_code': 'AD10',
            'modality': 'ADULTO'
        }, content_type='application/json').status_code == 200
    )
    
    # Teste 6: Rate Limiting (deve funcionar)
    def test_rate_limiting():
        # Fazer várias requisições para testar rate limiting
        responses = []
        for i in range(15):  # Mais que o limite de 10
            response = client.post('/api/race-registrations/', {
                'full_name': f'Teste {i}',
                'cpf': f'1234567890{i}',
                'email': f'teste{i}@teste.com',
                'phone': '11999999999',
                'birth_date': '1990-01-01',
                'gender': 'M',
                'modality': 'ADULTO',
                'course': 'RUN_5K',
                'shirt_size': 'M',
                'athlete_declaration': True
            }, content_type='application/json')
            responses.append(response.status_code)
        
        # Pelo menos uma deve ser 429 (rate limited)
        assert 429 in responses
    
    run_test("Rate Limiting Ativo", test_rate_limiting)
    
    # Teste 7: Health Check sem Rate Limiting
    def test_health_check_no_rate_limit():
        # Fazer muitas requisições de health check
        for i in range(20):
            response = client.get('/api/health/')
            assert response.status_code == 200
    
    run_test("Health Check sem Rate Limiting", test_health_check_no_rate_limit)
    
    # Resultado
    print("\n" + "=" * 50)
    print(f"📊 RESULTADO: {tests_passed}/{total_tests} testes passaram")
    
    if tests_passed == total_tests:
        print("🎉 TODOS OS TESTES PASSARAM! Backend está funcionando.")
        return True
    else:
        print("⚠️ ALGUNS TESTES FALHARAM! Verifique os erros acima.")
        return False

if __name__ == '__main__':
    success = quick_test()
    sys.exit(0 if success else 1)
