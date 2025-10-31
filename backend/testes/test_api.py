"""
Testes de API endpoints
"""
import json
import pytest
from django.test import TestCase, Client
from django.urls import reverse
from django.core import mail
from django.utils import timezone
from decimal import Decimal
from datetime import date
from unittest.mock import patch, MagicMock

from api.models import RaceRegistration


class APITestCase(TestCase):
    """Classe base para testes de API"""
    
    def setUp(self):
        """Configuração inicial"""
        self.client = Client()
        self.base_url = '/api/'
        
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


class HealthCheckTest(APITestCase):
    """Testes para health check"""
    
    def test_health_check_success(self):
        """Testa health check bem-sucedido"""
        response = self.client.get('/api/health/')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data['status'], 'healthy')
        self.assertIn('message', data)
        self.assertIn('timestamp', data)
        self.assertIn('version', data)
    
    def test_health_check_no_rate_limit(self):
        """Testa que health check não tem rate limiting"""
        # Fazer múltiplas requisições rapidamente
        for _ in range(10):
            response = self.client.get('/api/health/')
            self.assertEqual(response.status_code, 200)


class RaceRegistrationAPITest(APITestCase):
    """Testes para endpoints de inscrições"""
    
    def test_create_registration_success(self):
        """Testa criação bem-sucedida de inscrição"""
        response = self.client.post(
            '/api/race-registrations/',
            data=json.dumps(self.valid_registration_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        data = response.json()
        
        # Verificar dados retornados
        self.assertEqual(data['full_name'], 'João Silva')
        self.assertEqual(data['email'], 'joao@email.com')
        self.assertEqual(data['payment_status'], 'PENDING')
        self.assertTrue(data['athlete_declaration'])
        
        # Verificar se foi salvo no banco
        registration = RaceRegistration.objects.get(email='joao@email.com')
        self.assertEqual(registration.full_name, 'João Silva')
    
    def test_create_registration_invalid_data(self):
        """Testa criação com dados inválidos"""
        invalid_data = self.valid_registration_data.copy()
        del invalid_data['email']  # Campo obrigatório
        
        response = self.client.post(
            '/api/race-registrations/',
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.json())
    
    def test_create_registration_invalid_email(self):
        """Testa criação com email inválido"""
        invalid_data = self.valid_registration_data.copy()
        invalid_data['email'] = 'email-invalido'
        
        response = self.client.post(
            '/api/race-registrations/',
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
    
    def test_create_registration_without_declaration(self):
        """Testa criação sem declaração do atleta"""
        invalid_data = self.valid_registration_data.copy()
        invalid_data['athlete_declaration'] = False
        
        response = self.client.post(
            '/api/race-registrations/',
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
    
    def test_create_infantil_registration(self):
        """Testa criação de inscrição infantil"""
        infant_data = self.valid_registration_data.copy()
        infant_data['course'] = 'KIDS'
        infant_data['modality'] = 'INFANTIL'
        infant_data['shirt_size'] = '6'
        infant_data['email'] = 'crianca@email.com'
        
        response = self.client.post(
            '/api/race-registrations/',
            data=json.dumps(infant_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data['modality'], 'INFANTIL')
        self.assertEqual(data['course'], 'KIDS')
    
    def test_list_registrations(self):
        """Testa listagem de inscrições"""
        # Criar algumas inscrições
        for i in range(3):
            data = self.valid_registration_data.copy()
            data['email'] = f'test{i}@email.com'
            RaceRegistration.objects.create(**data)
        
        response = self.client.get('/api/race-registrations/')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data['results']), 3)
    
    def test_get_registration_detail(self):
        """Testa obtenção de detalhes de inscrição"""
        registration = RaceRegistration.objects.create(**self.valid_registration_data)
        
        response = self.client.get(f'/api/race-registrations/{registration.id}/')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['full_name'], 'João Silva')
    
    def test_get_nonexistent_registration(self):
        """Testa obtenção de inscrição inexistente"""
        response = self.client.get('/api/race-registrations/99999/')
        
        self.assertEqual(response.status_code, 404)


class RaceStatisticsAPITest(APITestCase):
    """Testes para endpoint de estatísticas"""
    
    def test_race_statistics_empty(self):
        """Testa estatísticas com banco vazio"""
        response = self.client.get('/api/race-statistics/')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data['total_inscriptions'], 0)
        self.assertEqual(data['male_count'], 0)
        self.assertEqual(data['female_count'], 0)
        self.assertEqual(data['inscriptions_today'], 0)
        self.assertEqual(data['payment_stats']['pending'], 0)
        self.assertEqual(data['payment_stats']['paid'], 0)
    
    def test_race_statistics_with_data(self):
        """Testa estatísticas com dados"""
        # Criar inscrições de teste
        RaceRegistration.objects.create(
            **self.valid_registration_data,
            gender='M',
            payment_status='PAID'
        )
        
        RaceRegistration.objects.create(
            **self.valid_registration_data,
            email='maria@email.com',
            gender='F',
            payment_status='PENDING'
        )
        
        RaceRegistration.objects.create(
            **self.valid_registration_data,
            email='joao2@email.com',
            gender='M',
            payment_status='PAID'
        )
        
        response = self.client.get('/api/race-statistics/')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data['total_inscriptions'], 3)
        self.assertEqual(data['male_count'], 2)
        self.assertEqual(data['female_count'], 1)
        self.assertEqual(data['payment_stats']['pending'], 1)
        self.assertEqual(data['payment_stats']['paid'], 2)
    
    def test_race_statistics_modality_breakdown(self):
        """Testa breakdown por modalidade"""
        # Criar inscrições infantil e adulto
        RaceRegistration.objects.create(
            **self.valid_registration_data,
            modality='INFANTIL',
            course='KIDS'
        )
        
        RaceRegistration.objects.create(
            **self.valid_registration_data,
            email='adulto@email.com',
            modality='ADULTO',
            course='RUN_5K'
        )
        
        response = self.client.get('/api/race-statistics/')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data['modality_stats']['infantil'], 1)
        self.assertEqual(data['modality_stats']['adulto'], 1)
    
    def test_race_statistics_shirt_sizes(self):
        """Testa breakdown por tamanhos de camisa"""
        sizes = ['PP', 'P', 'M', 'G', 'GG']
        
        for i, size in enumerate(sizes):
            data = self.valid_registration_data.copy()
            data['email'] = f'test{i}@email.com'
            data['shirt_size'] = size
            RaceRegistration.objects.create(**data)
        
        response = self.client.get('/api/race-statistics/')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        for size in sizes:
            self.assertEqual(data['shirt_size_stats'][size], 1)


class PaymentAPITest(APITestCase):
    """Testes para endpoints de pagamento"""
    
    def setUp(self):
        """Configuração inicial"""
        super().setUp()
        self.registration = RaceRegistration.objects.create(**self.valid_registration_data)
    
    @patch('api.views.create_stripe_checkout_session')
    def test_create_payment_session_success(self, mock_create_session):
        """Testa criação bem-sucedida de sessão de pagamento"""
        mock_create_session.return_value = {
            'success': True,
            'checkout_url': 'https://checkout.stripe.com/pay/cs_test_123',
            'session_id': 'cs_test_123',
            'amount': 50.00
        }
        
        response = self.client.post(
            '/api/payment/create-session/',
            data=json.dumps({'registration_id': self.registration.id}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertTrue(data['success'])
        self.assertIn('checkout.stripe.com', data['checkout_url'])
        self.assertEqual(data['session_id'], 'cs_test_123')
    
    def test_create_payment_session_invalid_registration(self):
        """Testa criação de sessão com inscrição inválida"""
        response = self.client.post(
            '/api/payment/create-session/',
            data=json.dumps({'registration_id': 99999}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.json())
    
    def test_create_payment_session_missing_registration_id(self):
        """Testa criação de sessão sem registration_id"""
        response = self.client.post(
            '/api/payment/create-session/',
            data=json.dumps({}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.json())
    
    @patch('api.views.verify_stripe_checkout_session')
    def test_verify_payment_status_success(self, mock_verify):
        """Testa verificação bem-sucedida de status de pagamento"""
        mock_verify.return_value = {
            'success': True,
            'session': MagicMock(
                payment_status='paid',
                amount_total=10000,
                customer_email='joao@email.com'
            )
        }
        
        response = self.client.get('/api/payment/verify-status/?session_id=cs_test_123')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertTrue(data['success'])
        self.assertEqual(data['payment_status'], 'paid')
        self.assertEqual(data['amount_total'], 10000)
    
    def test_verify_payment_status_missing_session_id(self):
        """Testa verificação sem session_id"""
        response = self.client.get('/api/payment/verify-status/')
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.json())
    
    def test_payment_webhook_success(self):
        """Testa webhook de pagamento bem-sucedido"""
        webhook_data = {
            'registration_id': self.registration.id,
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
        data = response.json()
        
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['payment_status'], 'PAID')
        
        # Verificar se inscrição foi atualizada
        self.registration.refresh_from_db()
        self.assertEqual(self.registration.payment_status, 'PAID')
    
    def test_payment_webhook_invalid_data(self):
        """Testa webhook com dados inválidos"""
        webhook_data = {
            'registration_id': self.registration.id,
            # payment_status ausente
        }
        
        response = self.client.post(
            '/api/payment-webhook/',
            data=json.dumps(webhook_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.json())
    
    def test_payment_webhook_nonexistent_registration(self):
        """Testa webhook com inscrição inexistente"""
        webhook_data = {
            'registration_id': 99999,
            'payment_status': 'PAID'
        }
        
        response = self.client.post(
            '/api/payment-webhook/',
            data=json.dumps(webhook_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 404)


class CouponAPITest(APITestCase):
    """Testes para endpoints de cupom"""
    
    def test_validate_coupon_success(self):
        """Testa validação bem-sucedida de cupom"""
        response = self.client.post(
            '/api/payment/validate-coupon/',
            data=json.dumps({
                'coupon_code': 'AD10',
                'modality': 'ADULTO'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertTrue(data['valid'])
        self.assertEqual(data['discount_amount'], '5.00')
        self.assertEqual(data['description'], 'Desconto de R$ 5,00')
    
    def test_validate_coupon_invalid(self):
        """Testa validação de cupom inválido"""
        response = self.client.post(
            '/api/payment/validate-coupon/',
            data=json.dumps({
                'coupon_code': 'INVALID',
                'modality': 'ADULTO'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertFalse(data['valid'])
        self.assertIn('error', data)
    
    def test_validate_coupon_missing_data(self):
        """Testa validação sem dados obrigatórios"""
        response = self.client.post(
            '/api/payment/validate-coupon/',
            data=json.dumps({}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.json())


class APIRootTest(APITestCase):
    """Testes para endpoint raiz da API"""
    
    def test_api_root(self):
        """Testa endpoint raiz da API"""
        response = self.client.get('/api/')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertIn('message', data)
        self.assertIn('version', data)
        self.assertIn('endpoints', data)
        self.assertIn('documentation', data)
