"""
Testes unitários para models
"""
import pytest
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import date, timedelta
from decimal import Decimal

from api.models import RaceRegistration


class RaceRegistrationModelTest(TestCase):
    """Testes para o modelo RaceRegistration"""
    
    def setUp(self):
        """Configuração inicial para cada teste"""
        self.valid_data = {
            'full_name': 'João Silva',
            'cpf': '12345678901',
            'email': 'joao@email.com',
            'phone': '11999999999',
            'birth_date': date(1990, 1, 1),
            'gender': 'M',
            'modality': 'ADULTO',
            'course': 'RUN_5K',
            'shirt_size': 'M',
            'athlete_declaration': True
        }
    
    def test_create_valid_registration(self):
        """Testa criação de inscrição válida"""
        registration = RaceRegistration.objects.create(**self.valid_data)
        
        self.assertEqual(registration.full_name, 'João Silva')
        self.assertEqual(registration.email, 'joao@email.com')
        self.assertEqual(registration.gender, 'M')
        self.assertEqual(registration.modality, 'ADULTO')
        self.assertEqual(registration.payment_status, 'PENDING')
        self.assertFalse(registration.payment_email_sent)
        self.assertIsNotNone(registration.created_at)
        self.assertIsNotNone(registration.updated_at)
    
    def test_registration_str_representation(self):
        """Testa representação string do modelo"""
        registration = RaceRegistration.objects.create(**self.valid_data)
        expected = f"{registration.full_name} - {registration.cpf} - {registration.get_payment_status_display()}"
        self.assertEqual(str(registration), expected)
    
    def test_age_property(self):
        """Testa cálculo da idade"""
        # Teste com data de nascimento de 30 anos atrás
        birth_date = date.today() - timedelta(days=30*365)
        self.valid_data['birth_date'] = birth_date
        
        registration = RaceRegistration.objects.create(**self.valid_data)
        self.assertEqual(registration.age, 30)
    
    def test_infantil_modality_derivation(self):
        """Testa derivação automática da modalidade infantil"""
        self.valid_data['course'] = 'KIDS'
        registration = RaceRegistration.objects.create(**self.valid_data)
        
        # A modalidade deve ser derivada automaticamente
        self.assertEqual(registration.modality, 'INFANTIL')
    
    def test_adulto_modality_derivation(self):
        """Testa derivação automática da modalidade adulto"""
        self.valid_data['course'] = 'RUN_5K'
        registration = RaceRegistration.objects.create(**self.valid_data)
        
        self.assertEqual(registration.modality, 'ADULTO')
    
    def test_payment_status_choices(self):
        """Testa escolhas válidas de status de pagamento"""
        registration = RaceRegistration.objects.create(**self.valid_data)
        
        # Teste status pendente
        registration.payment_status = 'PENDING'
        registration.save()
        self.assertEqual(registration.payment_status, 'PENDING')
        
        # Teste status pago
        registration.payment_status = 'PAID'
        registration.save()
        self.assertEqual(registration.payment_status, 'PAID')
    
    def test_gender_choices(self):
        """Testa escolhas válidas de gênero"""
        # Teste masculino
        self.valid_data['gender'] = 'M'
        registration = RaceRegistration.objects.create(**self.valid_data)
        self.assertEqual(registration.gender, 'M')
        
        # Teste feminino
        self.valid_data['email'] = 'maria@email.com'
        self.valid_data['gender'] = 'F'
        registration = RaceRegistration.objects.create(**self.valid_data)
        self.assertEqual(registration.gender, 'F')
    
    def test_shirt_size_choices(self):
        """Testa escolhas válidas de tamanho de camisa"""
        valid_sizes = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG']
        
        for size in valid_sizes:
            with self.subTest(size=size):
                self.valid_data['email'] = f'test_{size}@email.com'
                self.valid_data['shirt_size'] = size
                registration = RaceRegistration.objects.create(**self.valid_data)
                self.assertEqual(registration.shirt_size, size)
    
    def test_infant_shirt_size_choices(self):
        """Testa escolhas válidas de tamanho infantil"""
        self.valid_data['course'] = 'KIDS'
        self.valid_data['modality'] = 'INFANTIL'
        
        valid_infant_sizes = ['4', '6', '8', '10']
        
        for size in valid_infant_sizes:
            with self.subTest(size=size):
                self.valid_data['email'] = f'kid_{size}@email.com'
                self.valid_data['shirt_size'] = size
                registration = RaceRegistration.objects.create(**self.valid_data)
                self.assertEqual(registration.shirt_size, size)
    
    def test_coupon_fields(self):
        """Testa campos de cupom"""
        registration = RaceRegistration.objects.create(**self.valid_data)
        
        # Teste cupom
        registration.coupon_code = 'AD10'
        registration.coupon_discount = Decimal('5.00')
        registration.save()
        
        self.assertEqual(registration.coupon_code, 'AD10')
        self.assertEqual(registration.coupon_discount, Decimal('5.00'))
    
    def test_payment_amount_field(self):
        """Testa campo de valor do pagamento"""
        registration = RaceRegistration.objects.create(**self.valid_data)
        
        registration.payment_amount = Decimal('50.00')
        registration.save()
        
        self.assertEqual(registration.payment_amount, Decimal('50.00'))
    
    def test_registration_number_generation(self):
        """Testa geração de número de inscrição"""
        registration = RaceRegistration.objects.create(**self.valid_data)
        
        # Número deve ser gerado quando pagamento é confirmado
        registration.payment_status = 'PAID'
        registration.registration_number = '12345'
        registration.save()
        
        self.assertEqual(registration.registration_number, '12345')
    
    def test_payment_date_field(self):
        """Testa campo de data do pagamento"""
        registration = RaceRegistration.objects.create(**self.valid_data)
        
        now = timezone.now()
        registration.payment_date = now
        registration.save()
        
        self.assertEqual(registration.payment_date, now)
    
    def test_email_validation(self):
        """Testa validação de email"""
        # Email inválido deve ser rejeitado pelo Django
        self.valid_data['email'] = 'email-invalido'
        
        with self.assertRaises(ValidationError):
            registration = RaceRegistration(**self.valid_data)
            registration.full_clean()
    
    def test_required_fields(self):
        """Testa campos obrigatórios"""
        required_fields = [
            'full_name', 'email', 'phone', 'birth_date', 
            'gender', 'modality', 'shirt_size'
        ]
        
        for field in required_fields:
            with self.subTest(field=field):
                data = self.valid_data.copy()
                del data[field]
                
                with self.assertRaises(Exception):  # Pode ser ValidationError ou IntegrityError
                    RaceRegistration.objects.create(**data)
    
    def test_athlete_declaration_required(self):
        """Testa que declaração do atleta é obrigatória"""
        self.valid_data['athlete_declaration'] = False
        
        with self.assertRaises(ValidationError):
            registration = RaceRegistration(**self.valid_data)
            registration.full_clean()
    
    def test_verbose_names(self):
        """Testa nomes verbose dos campos"""
        registration = RaceRegistration()
        
        # Verificar alguns campos importantes
        self.assertEqual(registration._meta.get_field('full_name').verbose_name, 'Nome Completo')
        self.assertEqual(registration._meta.get_field('email').verbose_name, 'E-mail')
        self.assertEqual(registration._meta.get_field('phone').verbose_name, 'Telefone (WhatsApp)')
        self.assertEqual(registration._meta.get_field('gender').verbose_name, 'Sexo')
    
    def test_ordering(self):
        """Testa ordenação padrão do modelo"""
        # Criar múltiplas inscrições
        for i in range(3):
            data = self.valid_data.copy()
            data['email'] = f'test{i}@email.com'
            RaceRegistration.objects.create(**data)
        
        # Deve estar ordenado por created_at decrescente
        registrations = RaceRegistration.objects.all()
        self.assertEqual(len(registrations), 3)
        
        # Verificar se está ordenado corretamente
        for i in range(len(registrations) - 1):
            self.assertGreaterEqual(
                registrations[i].created_at, 
                registrations[i + 1].created_at
            )
