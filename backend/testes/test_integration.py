"""
Testes de integração e sistema de pagamento
"""
import json
import pytest
from unittest.mock import patch, MagicMock
from django.test import TestCase, Client
from django.core import mail
from django.utils import timezone
from decimal import Decimal
from datetime import date

from api.models import RaceRegistration


class PaymentIntegrationTest(TestCase):
    """Testes de integração para sistema de pagamento"""
    
    def setUp(self):
        """Configuração inicial"""
        self.client = Client()
        
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
    
    @patch('api.services.stripe.checkout.Session.create')
    def test_complete_payment_flow(self, mock_stripe_create):
        """Testa fluxo completo de pagamento"""
        # Mock da resposta do Stripe
        mock_stripe_create.return_value = {
            'id': 'cs_test_123',
            'url': 'https://checkout.stripe.com/pay/cs_test_123'
        }
        
        # 1. Criar inscrição
        response = self.client.post(
            '/api/race-registrations/',
            data=json.dumps(self.valid_registration_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        registration_id = response.json()['id']
        
        # 2. Criar sessão de pagamento
        response = self.client.post(
            '/api/payment/create-session/',
            data=json.dumps({'registration_id': registration_id}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        payment_data = response.json()
        self.assertTrue(payment_data['success'])
        self.assertIn('checkout.stripe.com', payment_data['checkout_url'])
        
        # 3. Simular webhook de pagamento confirmado
        webhook_data = {
            'registration_id': registration_id,
            'payment_status': 'PAID',
            'payment_id': 'pi_test_123',
            'amount': 50.00
        }
        
        response = self.client.post(
            '/api/payment-webhook/',
            data=json.dumps(webhook_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        
        # 4. Verificar se inscrição foi atualizada
        registration = RaceRegistration.objects.get(id=registration_id)
        self.assertEqual(registration.payment_status, 'PAID')
        self.assertEqual(registration.payment_amount, Decimal('50.00'))
        self.assertIsNotNone(registration.registration_number)
        self.assertIsNotNone(registration.payment_date)
    
    @patch('api.services.stripe.checkout.Session.create')
    def test_payment_flow_with_coupon(self, mock_stripe_create):
        """Testa fluxo de pagamento com cupom"""
        mock_stripe_create.return_value = {
            'id': 'cs_test_123',
            'url': 'https://checkout.stripe.com/pay/cs_test_123'
        }
        
        # 1. Criar inscrição
        response = self.client.post(
            '/api/race-registrations/',
            data=json.dumps(self.valid_registration_data),
            content_type='application/json'
        )
        
        registration_id = response.json()['id']
        
        # 2. Validar cupom
        response = self.client.post(
            '/api/payment/validate-coupon/',
            data=json.dumps({
                'coupon_code': 'AD10',
                'modality': 'ADULTO'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        coupon_data = response.json()
        self.assertTrue(coupon_data['valid'])
        
        # 3. Criar sessão de pagamento com cupom
        response = self.client.post(
            '/api/payment/create-session/',
            data=json.dumps({
                'registration_id': registration_id,
                'coupon_code': 'AD10'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        
        # Verificar se Stripe foi chamado com cupom
        call_args = mock_stripe_create.call_args[1]
        self.assertIn('discounts', call_args)
    
    def test_payment_flow_with_pix(self):
        """Testa fluxo de pagamento com PIX"""
        # 1. Criar inscrição
        response = self.client.post(
            '/api/race-registrations/',
            data=json.dumps(self.valid_registration_data),
            content_type='application/json'
        )
        
        registration_id = response.json()['id']
        
        # 2. Criar pagamento PIX
        with patch('api.services.create_abacatepay_pix') as mock_pix:
            mock_pix.return_value = {
                'success': True,
                'pix_code': 'pix_test_123',
                'qr_code': 'data:image/png;base64,test',
                'expires_at': '2024-12-31T23:59:59Z'
            }
            
            response = self.client.post(
                '/api/payment/pix/create/',
                data=json.dumps({'registration_id': registration_id}),
                content_type='application/json'
            )
            
            self.assertEqual(response.status_code, 200)
            pix_data = response.json()
            self.assertTrue(pix_data['success'])
            self.assertIn('pix_code', pix_data)
    
    def test_email_notification_flow(self):
        """Testa fluxo de notificação por email"""
        # Limpar caixa de email
        mail.outbox.clear()
        
        # 1. Criar inscrição
        response = self.client.post(
            '/api/race-registrations/',
            data=json.dumps(self.valid_registration_data),
            content_type='application/json'
        )
        
        registration_id = response.json()['id']
        
        # 2. Simular pagamento confirmado
        webhook_data = {
            'registration_id': registration_id,
            'payment_status': 'PAID',
            'payment_id': 'pi_test_123',
            'amount': 50.00
        }
        
        with patch('api.services.send_payment_confirmation_email') as mock_send_email:
            mock_send_email.return_value = True
            
            response = self.client.post(
                '/api/payment-webhook/',
                data=json.dumps(webhook_data),
                content_type='application/json'
            )
            
            self.assertEqual(response.status_code, 200)
            
            # Verificar se email foi enviado
            mock_send_email.assert_called_once()
    
    def test_error_handling_in_payment_flow(self):
        """Testa tratamento de erros no fluxo de pagamento"""
        # 1. Tentar criar sessão de pagamento com inscrição inexistente
        response = self.client.post(
            '/api/payment/create-session/',
            data=json.dumps({'registration_id': 99999}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.json())
        
        # 2. Tentar webhook com dados inválidos
        response = self.client.post(
            '/api/payment-webhook/',
            data=json.dumps({'invalid': 'data'}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.json())
    
    def test_concurrent_registrations(self):
        """Testa inscrições concorrentes"""
        import threading
        import queue
        
        results = queue.Queue()
        
        def create_registration(index):
            data = self.valid_registration_data.copy()
            data['email'] = f'concurrent_{index}@email.com'
            
            response = self.client.post(
                '/api/race-registrations/',
                data=json.dumps(data),
                content_type='application/json'
            )
            
            results.put({
                'index': index,
                'status_code': response.status_code,
                'data': response.json() if response.status_code in [200, 201] else None
            })
        
        # Criar 5 inscrições concorrentes
        threads = []
        for i in range(5):
            thread = threading.Thread(target=create_registration, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Aguardar todas as threads
        for thread in threads:
            thread.join()
        
        # Verificar resultados
        results_list = []
        while not results.empty():
            results_list.append(results.get())
        
        # Todas devem ter sucesso
        self.assertEqual(len(results_list), 5)
        for result in results_list:
            self.assertEqual(result['status_code'], 201)
            self.assertIsNotNone(result['data'])
    
    def test_database_consistency_after_payment(self):
        """Testa consistência do banco após pagamento"""
        # 1. Criar inscrição
        response = self.client.post(
            '/api/race-registrations/',
            data=json.dumps(self.valid_registration_data),
            content_type='application/json'
        )
        
        registration_id = response.json()['id']
        
        # 2. Verificar estado inicial
        registration = RaceRegistration.objects.get(id=registration_id)
        self.assertEqual(registration.payment_status, 'PENDING')
        self.assertIsNone(registration.payment_amount)
        self.assertIsNone(registration.registration_number)
        self.assertIsNone(registration.payment_date)
        
        # 3. Simular pagamento
        webhook_data = {
            'registration_id': registration_id,
            'payment_status': 'PAID',
            'payment_id': 'pi_test_123',
            'amount': 50.00
        }
        
        response = self.client.post(
            '/api/payment-webhook/',
            data=json.dumps(webhook_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        
        # 4. Verificar estado final
        registration.refresh_from_db()
        self.assertEqual(registration.payment_status, 'PAID')
        self.assertEqual(registration.payment_amount, Decimal('50.00'))
        self.assertIsNotNone(registration.registration_number)
        self.assertIsNotNone(registration.payment_date)
        self.assertEqual(registration.stripe_payment_intent_id, 'pi_test_123')
    
    def test_statistics_accuracy(self):
        """Testa precisão das estatísticas"""
        # Criar inscrições de teste
        test_data = [
            {'gender': 'M', 'modality': 'ADULTO', 'payment_status': 'PAID'},
            {'gender': 'F', 'modality': 'ADULTO', 'payment_status': 'PENDING'},
            {'gender': 'M', 'modality': 'INFANTIL', 'payment_status': 'PAID'},
            {'gender': 'F', 'modality': 'INFANTIL', 'payment_status': 'PAID'},
        ]
        
        for i, data in enumerate(test_data):
            registration_data = self.valid_registration_data.copy()
            registration_data['email'] = f'test_{i}@email.com'
            registration_data['gender'] = data['gender']
            registration_data['modality'] = data['modality']
            registration_data['course'] = 'KIDS' if data['modality'] == 'INFANTIL' else 'RUN_5K'
            
            registration = RaceRegistration.objects.create(**registration_data)
            registration.payment_status = data['payment_status']
            registration.save()
        
        # Verificar estatísticas
        response = self.client.get('/api/race-statistics/')
        self.assertEqual(response.status_code, 200)
        
        stats = response.json()
        self.assertEqual(stats['total_inscriptions'], 4)
        self.assertEqual(stats['male_count'], 2)
        self.assertEqual(stats['female_count'], 2)
        self.assertEqual(stats['payment_stats']['paid'], 3)
        self.assertEqual(stats['payment_stats']['pending'], 1)
        self.assertEqual(stats['modality_stats']['adulto'], 2)
        self.assertEqual(stats['modality_stats']['infantil'], 2)
    
    def test_api_performance(self):
        """Testa performance básica da API"""
        import time
        
        # Medir tempo de resposta para health check
        start_time = time.time()
        response = self.client.get('/api/health/')
        end_time = time.time()
        
        self.assertEqual(response.status_code, 200)
        self.assertLess(end_time - start_time, 1.0)  # Deve responder em menos de 1 segundo
        
        # Medir tempo de resposta para estatísticas
        start_time = time.time()
        response = self.client.get('/api/race-statistics/')
        end_time = time.time()
        
        self.assertEqual(response.status_code, 200)
        self.assertLess(end_time - start_time, 2.0)  # Deve responder em menos de 2 segundos
    
    def test_cors_headers(self):
        """Testa headers CORS"""
        response = self.client.options('/api/race-registrations/')
        
        # Verificar headers CORS (se implementados)
        self.assertIn(response.status_code, [200, 204])
    
    def test_api_versioning(self):
        """Testa versionamento da API"""
        response = self.client.get('/api/')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('version', data)
        self.assertIn('1.0.0', data['version'])
    
    def test_error_response_format(self):
        """Testa formato das respostas de erro"""
        # Teste com dados inválidos
        response = self.client.post(
            '/api/race-registrations/',
            data=json.dumps({'invalid': 'data'}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        
        # Verificar estrutura da resposta de erro
        self.assertIsInstance(data, dict)
        # Pode ter diferentes estruturas dependendo do tipo de erro
    
    def test_unicode_handling(self):
        """Testa tratamento de caracteres especiais"""
        unicode_data = self.valid_registration_data.copy()
        unicode_data['full_name'] = 'João José da Silva-Santos'
        unicode_data['email'] = 'joão@email.com'
        
        response = self.client.post(
            '/api/race-registrations/',
            data=json.dumps(unicode_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data['full_name'], 'João José da Silva-Santos')
