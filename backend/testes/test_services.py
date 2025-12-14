"""
Testes unitários para services
"""
import pytest
from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.core import mail
from django.utils import timezone
from decimal import Decimal
from datetime import date

from api.models import RaceRegistration
from api.services import (
    validate_coupon_code,
    send_payment_confirmation_email,
    generate_unique_registration_number,
    mark_registration_paid_atomic
)


class CouponValidationTest(TestCase):
    """Testes para validação de cupons"""
    
    def test_valid_coupon_adult(self):
        """Testa cupom válido para adulto"""
        result = validate_coupon_code('AD10', 'ADULTO')
        
        self.assertTrue(result['valid'])
        self.assertEqual(result['discount_amount'], Decimal('5.00'))
        self.assertEqual(result['description'], 'Desconto de R$ 5,00')
    
    def test_valid_coupon_infantil(self):
        """Testa cupom válido para infantil"""
        result = validate_coupon_code('AD10', 'INFANTIL')
        
        self.assertTrue(result['valid'])
        self.assertEqual(result['discount_amount'], Decimal('5.00'))
    
    def test_invalid_coupon(self):
        """Testa cupom inválido"""
        result = validate_coupon_code('INVALID', 'ADULTO')
        
        self.assertFalse(result['valid'])
        self.assertEqual(result['error'], 'Cupom inválido')
    
    def test_coupon_without_modality(self):
        """Testa cupom sem especificar modalidade"""
        result = validate_coupon_code('AD10')
        
        self.assertTrue(result['valid'])
        self.assertEqual(result['discount_amount'], Decimal('5.00'))


class EmailServiceTest(TestCase):
    """Testes para serviços de email"""
    
    def setUp(self):
        """Configuração inicial"""
        self.registration = RaceRegistration.objects.create(
            full_name='João Silva',
            cpf='12345678901',
            email='joao@email.com',
            phone='11999999999',
            birth_date=date(1990, 1, 1),
            gender='M',
            modality='ADULTO',
            course='RUN_5K',
            shirt_size='M',
            athlete_declaration=True,
            payment_status='PAID',
            payment_amount=Decimal('50.00')
        )
    
    @patch('api.services.config')
    def test_send_payment_confirmation_email_success(self, mock_config):
        """Testa envio bem-sucedido de email de confirmação"""
        # Mock das configurações
        mock_config.side_effect = lambda key, default: {
            'RACE_NAME': 'Corrida Ad-moving 2025',
            'RACE_DATE': '01 de Março de 2026',
            'RACE_LOCATION': 'Local da Corrida',
            'RACE_START_TIME': '06:00h',
            'KIT_PICKUP_DATE': '28 de Fevereiro de 2026',
            'KIT_PICKUP_TIME': '14:00h às 18:00h',
            'KIT_PICKUP_LOCATION': 'Local de Retirada',
            'KIT_PICKUP_DOCS': 'CPF e comprovante de inscrição',
            'CONTACT_EMAIL': 'contato@admoving.com',
            'CONTACT_WHATSAPP': '+55 86 99999-9999'
        }.get(key, default)
        
        # Limpar caixa de email
        mail.outbox.clear()
        
        # Enviar email
        result = send_payment_confirmation_email(self.registration)
        
        # Verificar resultado
        self.assertTrue(result)
        self.assertEqual(len(mail.outbox), 1)
        
        # Verificar conteúdo do email
        email = mail.outbox[0]
        self.assertEqual(email.to, ['joao@email.com'])
        self.assertIn('Pagamento confirmado', email.subject)
        self.assertIn('João Silva', email.body)
        self.assertIn('Corrida Ad-moving 2025', email.body)
    
    @patch('api.services.config')
    def test_send_payment_confirmation_email_with_registration_number(self, mock_config):
        """Testa envio de email com número de inscrição"""
        mock_config.side_effect = lambda key, default: {
            'RACE_NAME': 'Corrida Ad-moving 2025',
            'RACE_DATE': '01 de Março de 2026',
            'RACE_LOCATION': 'Local da Corrida',
            'RACE_START_TIME': '06:00h',
            'KIT_PICKUP_DATE': '28 de Fevereiro de 2026',
            'KIT_PICKUP_TIME': '14:00h às 18:00h',
            'KIT_PICKUP_LOCATION': 'Local de Retirada',
            'KIT_PICKUP_DOCS': 'CPF e comprovante de inscrição',
            'CONTACT_EMAIL': 'contato@admoving.com',
            'CONTACT_WHATSAPP': '+55 86 99999-9999'
        }.get(key, default)
        
        # Adicionar número de inscrição
        self.registration.registration_number = '12345'
        self.registration.save()
        
        mail.outbox.clear()
        
        result = send_payment_confirmation_email(self.registration)
        
        self.assertTrue(result)
        self.assertEqual(len(mail.outbox), 1)
        
        email = mail.outbox[0]
        self.assertIn('12345', email.body)
    
    @patch('api.services.EmailMultiAlternatives')
    def test_send_payment_confirmation_email_failure(self, mock_email_class):
        """Testa falha no envio de email"""
        # Mock para simular erro
        mock_email_instance = MagicMock()
        mock_email_instance.send.side_effect = Exception("SMTP Error")
        mock_email_class.return_value = mock_email_instance
        
        result = send_payment_confirmation_email(self.registration)
        
        self.assertFalse(result)


class RegistrationNumberTest(TestCase):
    """Testes para geração de número de inscrição"""
    
    def test_generate_unique_registration_number(self):
        """Testa geração de número único de inscrição"""
        number = generate_unique_registration_number()
        
        # Verificar formato (5 dígitos)
        self.assertEqual(len(number), 5)
        self.assertTrue(number.isdigit())
        
        # Verificar que é único
        number2 = generate_unique_registration_number()
        self.assertNotEqual(number, number2)
    
    def test_generate_multiple_unique_numbers(self):
        """Testa geração de múltiplos números únicos"""
        numbers = set()
        
        # Gerar 100 números e verificar unicidade
        for _ in range(100):
            number = generate_unique_registration_number()
            self.assertNotIn(number, numbers)
            numbers.add(number)
        
        self.assertEqual(len(numbers), 100)


class PaymentServiceTest(TestCase):
    """Testes para serviços de pagamento"""
    
    def setUp(self):
        """Configuração inicial"""
        self.registration = RaceRegistration.objects.create(
            full_name='João Silva',
            cpf='12345678901',
            email='joao@email.com',
            phone='11999999999',
            birth_date=date(1990, 1, 1),
            gender='M',
            modality='ADULTO',
            course='RUN_5K',
            shirt_size='M',
            athlete_declaration=True,
            payment_status='PENDING'
        )
    
    @patch('api.services.send_payment_confirmation_email')
    def test_mark_registration_paid_atomic_success(self, mock_send_email):
        """Testa marcação bem-sucedida de inscrição como paga"""
        mock_send_email.return_value = True
        
        result = mark_registration_paid_atomic(
            self.registration.id,
            amount_reais=50.00,
            payment_intent_id='pi_test_123'
        )
        
        # Verificar resultado
        self.assertTrue(result)
        
        # Verificar se foi atualizada
        self.registration.refresh_from_db()
        self.assertEqual(self.registration.payment_status, 'PAID')
        self.assertEqual(self.registration.payment_amount, Decimal('50.00'))
        self.assertEqual(self.registration.stripe_payment_intent_id, 'pi_test_123')
        self.assertIsNotNone(self.registration.payment_date)
        self.assertIsNotNone(self.registration.registration_number)
        
        # Verificar se email foi enviado
        mock_send_email.assert_called_once_with(self.registration)
    
    def test_mark_registration_paid_atomic_already_paid(self):
        """Testa tentativa de marcar inscrição já paga"""
        # Marcar como paga primeiro
        self.registration.payment_status = 'PAID'
        self.registration.save()
        
        result = mark_registration_paid_atomic(self.registration.id)
        
        # Deve retornar False (já estava paga)
        self.assertFalse(result)
    
    @patch('api.services.send_payment_confirmation_email')
    def test_mark_registration_paid_atomic_with_existing_number(self, mock_send_email):
        """Testa marcação com número de inscrição já existente"""
        # Adicionar número existente
        self.registration.registration_number = '12345'
        self.registration.save()
        
        mock_send_email.return_value = True
        
        result = mark_registration_paid_atomic(self.registration.id)
        
        self.assertTrue(result)
        
        # Verificar que número não foi alterado
        self.registration.refresh_from_db()
        self.assertEqual(self.registration.registration_number, '12345')
    
    def test_mark_registration_paid_atomic_nonexistent_registration(self):
        """Testa marcação de inscrição inexistente"""
        with self.assertRaises(RaceRegistration.DoesNotExist):
            mark_registration_paid_atomic(99999)


class StripeServiceTest(TestCase):
    """Testes para serviços do Stripe"""
    
    def setUp(self):
        """Configuração inicial"""
        self.registration = RaceRegistration.objects.create(
            full_name='João Silva',
            cpf='12345678901',
            email='joao@email.com',
            phone='11999999999',
            birth_date=date(1990, 1, 1),
            gender='M',
            modality='ADULTO',
            course='RUN_5K',
            shirt_size='M',
            athlete_declaration=True,
            payment_status='PENDING'
        )
    
    @patch('api.services.stripe.checkout.Session.create')
    def test_create_stripe_checkout_session_success(self, mock_stripe_create):
        """Testa criação bem-sucedida de sessão Stripe"""
        # Mock da resposta do Stripe
        mock_stripe_create.return_value = {
            'id': 'cs_test_123',
            'url': 'https://checkout.stripe.com/pay/cs_test_123'
        }
        
        from api.services import create_stripe_checkout_session
        
        result = create_stripe_checkout_session(
            self.registration,
            base_url='http://localhost:3000'
        )
        
        # Verificar resultado
        self.assertTrue(result['success'])
        self.assertEqual(result['session_id'], 'cs_test_123')
        self.assertIn('checkout.stripe.com', result['checkout_url'])
        
        # Verificar se Stripe foi chamado corretamente
        mock_stripe_create.assert_called_once()
        call_args = mock_stripe_create.call_args[1]
        self.assertEqual(call_args['metadata']['registration_id'], str(self.registration.id))
    
    @patch('api.services.stripe.checkout.Session.create')
    def test_create_stripe_checkout_session_with_coupon(self, mock_stripe_create):
        """Testa criação de sessão Stripe com cupom"""
        mock_stripe_create.return_value = {
            'id': 'cs_test_123',
            'url': 'https://checkout.stripe.com/pay/cs_test_123'
        }
        
        from api.services import create_stripe_checkout_session
        
        result = create_stripe_checkout_session(
            self.registration,
            base_url='http://localhost:3000',
            coupon_code='AD10'
        )
        
        self.assertTrue(result['success'])
        
        # Verificar se cupom foi aplicado
        call_args = mock_stripe_create.call_args[1]
        self.assertIn('discounts', call_args)
    
    @patch('api.services.stripe.checkout.Session.create')
    def test_create_stripe_checkout_session_failure(self, mock_stripe_create):
        """Testa falha na criação de sessão Stripe"""
        mock_stripe_create.side_effect = Exception("Stripe API Error")
        
        from api.services import create_stripe_checkout_session
        
        result = create_stripe_checkout_session(self.registration)
        
        self.assertFalse(result['success'])
        self.assertIn('error', result)
