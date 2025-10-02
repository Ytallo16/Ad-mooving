#!/usr/bin/env python3
"""
Teste HTTP simples para verificar se o backend está funcionando
"""
import requests
import json

def test_backend():
    """Teste básico via HTTP"""
    print("🚀 TESTE HTTP DO BACKEND")
    print("=" * 40)
    
    base_url = "http://localhost:8000/api"
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
        requests.get(f"{base_url}/health/").status_code == 200
    )
    
    # Teste 2: API Root
    run_test("API Root", lambda:
        requests.get(f"{base_url}/").status_code == 200
    )
    
    # Teste 3: Estatísticas
    run_test("Estatísticas", lambda:
        requests.get(f"{base_url}/race-statistics/").status_code == 200
    )
    
    # Teste 4: Preços
    run_test("Preços", lambda:
        requests.get(f"{base_url}/payment/prices/").status_code == 200
    )
    
    # Teste 5: Validação de Cupom
    def test_coupon():
        response = requests.post(f"{base_url}/payment/validate-coupon/", 
                               json={"coupon_code": "AD10", "modality": "ADULTO"})
        return response.status_code == 200
    
    run_test("Validação de Cupom", test_coupon)
    
    # Teste 6: Criação de Inscrição
    def test_registration():
        response = requests.post(f"{base_url}/race-registrations/", 
                               json={
                                   "full_name": "Teste HTTP",
                                   "cpf": "11144477735",
                                   "email": "teste@http.com",
                                   "phone": "11999999999",
                                   "birth_date": "1990-01-01",
                                   "gender": "M",
                                   "modality": "ADULTO",
                                   "course": "RUN_5K",
                                   "shirt_size": "M",
                                   "athlete_declaration": True
                               })
        return response.status_code == 201
    
    run_test("Criação de Inscrição", test_registration)
    
    # Teste 7: Rate Limiting
    def test_rate_limiting():
        # Fazer várias requisições para testar rate limiting
        responses = []
        for i in range(15):
            response = requests.post(f"{base_url}/race-registrations/", 
                                   json={
                                       "full_name": f"Rate Test {i}",
                                       "cpf": f"1114447773{i}",
                                       "email": f"ratetest{i}@test.com",
                                       "phone": "11999999999",
                                       "birth_date": "1990-01-01",
                                       "gender": "M",
                                       "modality": "ADULTO",
                                       "course": "RUN_5K",
                                       "shirt_size": "M",
                                       "athlete_declaration": True
                                   })
            responses.append(response.status_code)
        
        # Pelo menos uma deve ser 429 (rate limited)
        assert 429 in responses
    
    run_test("Rate Limiting", test_rate_limiting)
    
    # Resultado
    print("\n" + "=" * 40)
    print(f"📊 RESULTADO: {tests_passed}/{total_tests} testes passaram")
    
    if tests_passed == total_tests:
        print("🎉 TODOS OS TESTES PASSARAM! Backend está funcionando.")
        return True
    else:
        print("⚠️ ALGUNS TESTES FALHARAM! Verifique os erros acima.")
        return False

if __name__ == '__main__':
    import sys
    success = test_backend()
    sys.exit(0 if success else 1)
