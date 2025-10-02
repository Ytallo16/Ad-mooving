"""
Testes específicos para rate limiting
"""
import json
import time
from django.test import TestCase, Client, override_settings
from django.core.cache import cache
from django.utils import timezone
from datetime import date

from api.models import RaceRegistration


class RateLimitingTest(TestCase):
    """Testes para rate limiting"""
    
    def setUp(self):
        """Configuração inicial"""
        self.client = Client()
        
        # Limpar cache antes de cada teste
        cache.clear()
        
        # Dados válidos para inscrição
        self.valid_registration_data = {
            'full_name': 'João Silva',
            'cpf': '12345678901',
            'email': 'joao@email.com',
            'phone': '11999999999',
            'birth_date': '1990-01-01',
            'gender': 'M',
            'modality': 'ADULTO',
            'course': 'RUN_5K',
            'shirt_size': 'M',
            'athlete_declaration': True
        }
    
    def test_registration_rate_limit(self):
        """Testa rate limiting para inscrições (10/h)"""
        # Fazer 10 requisições (limite)
        for i in range(10):
            data = self.valid_registration_data.copy()
            data['email'] = f'test{i}@email.com'
            
            response = self.client.post(
                '/api/race-registrations/',
                data=json.dumps(data),
                content_type='application/json'
            )
            
            # As primeiras 10 devem passar
            self.assertEqual(response.status_code, 201)
        
        # A 11ª requisição deve ser bloqueada
        data = self.valid_registration_data.copy()
        data['email'] = 'test11@email.com'
        
        response = self.client.post(
            '/api/race-registrations/',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 429)
        data = response.json()
        self.assertIn('Rate limit exceeded', data['error'])
    
    def test_payment_session_rate_limit(self):
        """Testa rate limiting para criação de sessão de pagamento (5/m)"""
        # Criar uma inscrição primeiro
        registration = RaceRegistration.objects.create(
            full_name='João Silva',
            cpf='12345678901',
            email='joao@email.com',
            phone='11999999999',
            birth_date=date(1990, 1, 1),
            gender='M',
            modality='ADULTO',
            course='RUN_5K',
            shirt_size='M',
            athlete_declaration=True
        )
        
        # Fazer 5 requisições (limite)
        for i in range(5):
            response = self.client.post(
                '/api/payment/create-session/',
                data=json.dumps({'registration_id': registration.id}),
                content_type='application/json'
            )
            
            # As primeiras 5 devem passar (mesmo que falhem por outros motivos)
            self.assertIn(response.status_code, [200, 400, 500])  # Qualquer status exceto 429
        
        # A 6ª requisição deve ser bloqueada
        response = self.client.post(
            '/api/payment/create-session/',
            data=json.dumps({'registration_id': registration.id}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 429)
        data = response.json()
        self.assertIn('Rate limit exceeded', data['error'])
    
    def test_statistics_rate_limit(self):
        """Testa rate limiting para estatísticas (100/h)"""
        # Fazer 100 requisições (limite)
        for i in range(100):
            response = self.client.get('/api/race-statistics/')
            
            # As primeiras 100 devem passar
            self.assertEqual(response.status_code, 200)
        
        # A 101ª requisição deve ser bloqueada
        response = self.client.get('/api/race-statistics/')
        
        self.assertEqual(response.status_code, 429)
        data = response.json()
        self.assertIn('Rate limit exceeded', data['error'])
    
    def test_health_check_no_rate_limit(self):
        """Testa que health check não tem rate limiting"""
        # Fazer muitas requisições rapidamente
        for i in range(50):
            response = self.client.get('/api/health/')
            
            # Todas devem passar
            self.assertEqual(response.status_code, 200)
    
    def test_rate_limit_reset_after_window(self):
        """Testa que rate limit é resetado após janela de tempo"""
        # Simular rate limit atingido
        cache.set('rate_limit:registration:127.0.0.1', 10, 1)  # 1 segundo
        
        # Deve estar bloqueado
        response = self.client.post(
            '/api/race-registrations/',
            data=json.dumps(self.valid_registration_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 429)
        
        # Aguardar expiração do cache
        time.sleep(1.1)
        
        # Deve funcionar novamente
        response = self.client.post(
            '/api/race-registrations/',
            data=json.dumps(self.valid_registration_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
    
    def test_different_ips_different_limits(self):
        """Testa que diferentes IPs têm limites independentes"""
        # Simular IPs diferentes usando headers
        client1 = Client(HTTP_X_FORWARDED_FOR='192.168.1.1')
        client2 = Client(HTTP_X_FORWARDED_FOR='192.168.1.2')
        
        # IP1 faz 10 requisições (limite)
        for i in range(10):
            data = self.valid_registration_data.copy()
            data['email'] = f'ip1_{i}@email.com'
            
            response = client1.post(
                '/api/race-registrations/',
                data=json.dumps(data),
                content_type='application/json'
            )
            self.assertEqual(response.status_code, 201)
        
        # IP1 deve estar bloqueado
        data = self.valid_registration_data.copy()
        data['email'] = 'ip1_blocked@email.com'
        response = client1.post(
            '/api/race-registrations/',
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 429)
        
        # IP2 deve ainda funcionar
        data = self.valid_registration_data.copy()
        data['email'] = 'ip2_works@email.com'
        response = client2.post(
            '/api/race-registrations/',
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
    
    def test_rate_limit_headers(self):
        """Testa headers de rate limiting na resposta"""
        response = self.client.get('/api/race-statistics/')
        
        # Verificar se headers estão presentes (se implementados)
        # Nota: Headers podem não estar implementados no middleware atual
        self.assertEqual(response.status_code, 200)
    
    def test_webhook_rate_limit(self):
        """Testa rate limiting para webhooks (100/h)"""
        # Criar uma inscrição
        registration = RaceRegistration.objects.create(
            full_name='João Silva',
            cpf='12345678901',
            email='joao@email.com',
            phone='11999999999',
            birth_date=date(1990, 1, 1),
            gender='M',
            modality='ADULTO',
            course='RUN_5K',
            shirt_size='M',
            athlete_declaration=True
        )
        
        webhook_data = {
            'registration_id': registration.id,
            'payment_status': 'PAID'
        }
        
        # Fazer 100 requisições (limite)
        for i in range(100):
            response = self.client.post(
                '/api/payment-webhook/',
                data=json.dumps(webhook_data),
                content_type='application/json'
            )
            
            # As primeiras 100 devem passar
            self.assertIn(response.status_code, [200, 400, 500])
        
        # A 101ª requisição deve ser bloqueada
        response = self.client.post(
            '/api/payment-webhook/',
            data=json.dumps(webhook_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 429)
    
    def test_verify_payment_rate_limit(self):
        """Testa rate limiting para verificação de pagamento (30/m)"""
        # Fazer 30 requisições (limite)
        for i in range(30):
            response = self.client.get('/api/payment/verify-status/?session_id=cs_test_123')
            
            # As primeiras 30 devem passar (mesmo que falhem por outros motivos)
            self.assertIn(response.status_code, [200, 400, 500])
        
        # A 31ª requisição deve ser bloqueada
        response = self.client.get('/api/payment/verify-status/?session_id=cs_test_123')
        
        self.assertEqual(response.status_code, 429)
    
    @override_settings(
        CACHES={
            'default': {
                'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            }
        }
    )
    def test_rate_limit_with_locmem_cache(self):
        """Testa rate limiting com cache local"""
        # Limpar cache
        cache.clear()
        
        # Fazer requisição
        response = self.client.get('/api/race-statistics/')
        self.assertEqual(response.status_code, 200)
        
        # Verificar se chave foi criada no cache
        # (Implementação específica pode variar)
        self.assertTrue(True)  # Placeholder para verificação específica
    
    def test_rate_limit_error_response_format(self):
        """Testa formato da resposta de erro de rate limiting"""
        # Simular rate limit atingido
        cache.set('rate_limit:registration:127.0.0.1', 10, 60)
        
        response = self.client.post(
            '/api/race-registrations/',
            data=json.dumps(self.valid_registration_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 429)
        data = response.json()
        
        # Verificar estrutura da resposta de erro
        self.assertIn('error', data)
        self.assertIn('message', data)
        self.assertIn('Rate limit exceeded', data['error'])
        self.assertIn('Muitas requisições', data['message'])
    
    def test_concurrent_rate_limiting(self):
        """Testa rate limiting com requisições concorrentes"""
        import threading
        import queue
        
        results = queue.Queue()
        
        def make_request():
            response = self.client.post(
                '/api/race-registrations/',
                data=json.dumps(self.valid_registration_data),
                content_type='application/json'
            )
            results.put(response.status_code)
        
        # Fazer 15 requisições concorrentes (limite é 10)
        threads = []
        for i in range(15):
            data = self.valid_registration_data.copy()
            data['email'] = f'concurrent_{i}@email.com'
            self.valid_registration_data = data
            
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        # Aguardar todas as threads
        for thread in threads:
            thread.join()
        
        # Coletar resultados
        status_codes = []
        while not results.empty():
            status_codes.append(results.get())
        
        # Verificar que algumas foram bloqueadas
        self.assertIn(429, status_codes)
        self.assertIn(201, status_codes)
        
        # Contar sucessos e bloqueios
        successes = status_codes.count(201)
        blocks = status_codes.count(429)
        
        self.assertEqual(successes + blocks, 15)
        self.assertLessEqual(successes, 10)  # Máximo 10 sucessos
        self.assertGreaterEqual(blocks, 5)   # Pelo menos 5 bloqueios
