from django.db import models
from django.utils import timezone


class RaceRegistration(models.Model):
    """
    Modelo para inscrição de corrida
    """
    GENDER_CHOICES = [
        ('F', 'Feminino'),
        ('M', 'Masculino'),
    ]
    
    MODALITY_CHOICES = [
        ('INFANTIL', 'Infantil'),
        ('ADULTO', 'Adulto'),
    ]

    COURSE_CHOICES = [
        ('KIDS', 'Kids'),
        ('RUN_5K', '5KM (Corrida)'),
        ('WALK_3K', '3KM (Caminhada)'),
    ]
    
    SHIRT_SIZE_CHOICES = [
        ('PP', 'PP'),
        ('P', 'P'),
        ('M', 'M'),
        ('G', 'G'),
        ('GG', 'GG'),
        ('XG', 'XG'),
        ('XXG', 'XXG'),
    ]
    
    INFANT_SHIRT_SIZE_CHOICES = [
        ('4', '4 anos'),
        ('6', '6 anos'),
        ('8', '8 anos'),
        ('10', '10 anos'),
        ('12', '12 anos'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pendente'),
        ('PAID', 'Pago'),
    ]
    
    # Campos obrigatórios
    full_name = models.CharField(max_length=200, verbose_name="Nome Completo")
    cpf = models.CharField(max_length=14, blank=True, null=True, verbose_name="CPF")
    email = models.EmailField(verbose_name="E-mail")  # Removida restrição unique
    phone = models.CharField(max_length=20, verbose_name="Telefone (WhatsApp)")
    birth_date = models.DateField(verbose_name="Data de nascimento")
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, verbose_name="Sexo")
    
    # Campos da corrida
    modality = models.CharField(
        max_length=10, 
        choices=MODALITY_CHOICES, 
        verbose_name="Modalidade",
        help_text="Escolha entre Infantil ou Adulto",
        default='ADULTO'
    )
    course = models.CharField(
        max_length=10,
        choices=COURSE_CHOICES,
        verbose_name="Percurso",
        help_text="Kids, 5KM (Corrida) ou 3KM (Caminhada)",
        default='RUN_5K'
    )
    shirt_size = models.CharField(
        max_length=3, 
        verbose_name="Tamanho da Camisa",
        help_text="Escolha o tamanho da sua camisa",
        default='M'
    )

    # Dados do responsável (para inscrições Kids)
    responsible_full_name = models.CharField(
        max_length=200, blank=True, null=True, verbose_name="Nome do Responsável"
    )
    responsible_cpf = models.CharField(
        max_length=14, blank=True, null=True, verbose_name="CPF do Responsável"
    )
    responsible_email = models.EmailField(
        blank=True, null=True, verbose_name="E-mail do Responsável"
    )
    responsible_phone = models.CharField(
        max_length=20, blank=True, null=True, verbose_name="Telefone do Responsável"
    )
    
    # Campo de declaração obrigatória
    athlete_declaration = models.BooleanField(
        default=False, 
        verbose_name="Ciente",
        help_text="O atleta assume e expressamente declara que é conhecedor do seu estado de saúde e capacidade atlética e que treinou adequadamente para o evento"
    )
    
    # Status de pagamento
    payment_status = models.CharField(
        max_length=10,
        choices=PAYMENT_STATUS_CHOICES,
        default='PENDING',
        verbose_name="Status do Pagamento",
        help_text="Status atual do pagamento da inscrição"
    )
    
    # Campos para integração com Stripe
    stripe_payment_intent_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="ID do Payment Intent do Stripe"
    )
    stripe_checkout_session_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="ID da Sessão de Checkout do Stripe"
    )
    
    # Campos para integração com AbacatePay
    abacatepay_pix_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="ID do PIX no AbacatePay"
    )
    payment_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Valor do Pagamento"
    )
    payment_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Data do Pagamento"
    )
    
    # Número de inscrição (gerado quando pagamento é confirmado)
    registration_number = models.CharField(
        max_length=5,
        blank=True,
        null=True,
        unique=True,
        verbose_name="Número de Inscrição",
        help_text="Número único de 5 dígitos gerado quando pagamento é confirmado"
    )
    
    # Campos para controle de emails enviados
    payment_email_sent = models.BooleanField(
        default=False, 
        verbose_name="Email de confirmação de pagamento enviado"
    )
    
    # Cupom aplicado (se houver)
    coupon_code = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="Código do Cupom Aplicado"
    )
    coupon_discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Valor do Desconto (R$)",
        help_text="Valor fixo de desconto aplicado em reais"
    )
    
    # Campos de auditoria
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Inscrição de Corrida"
        verbose_name_plural = "Inscrições de Corrida"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.full_name} - {self.cpf} - {self.get_payment_status_display()}"
    
    def clean(self):
        """Validação customizada do modelo"""
        from django.core.exceptions import ValidationError
        
        # Verificar se a data de nascimento é válida
        if self.birth_date and self.birth_date > timezone.now().date():
            raise ValidationError("A data de nascimento não pode ser no futuro.")
    
    @property
    def age(self):
        """Calcula a idade do atleta"""
        if self.birth_date:
            today = timezone.now().date()
            return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))
        return None
    
    def get_shirt_size_display(self):
        """Retorna o tamanho da camisa formatado"""
        if self.modality == 'INFANTIL':
            # Para modalidade infantil, usar as opções de idade
            infant_choices = dict(self.INFANT_SHIRT_SIZE_CHOICES)
            return infant_choices.get(self.shirt_size, self.shirt_size)
        else:
            # Para modalidade adulto, usar as opções normais
            adult_choices = dict(self.SHIRT_SIZE_CHOICES)
            return adult_choices.get(self.shirt_size, self.shirt_size)

