from django.db import models
from django.utils import timezone

class ExampleModel(models.Model):
    """
    Modelo de exemplo para demonstrar o funcionamento do Swagger
    """
    name = models.CharField(max_length=100, verbose_name="Nome")
    description = models.TextField(blank=True, verbose_name="Descrição")
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Modelo de Exemplo"
        verbose_name_plural = "Modelos de Exemplo"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    @property
    def status(self):
        """Retorna o status baseado no campo is_active"""
        return "Ativo" if self.is_active else "Inativo"


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
        ('2', '2 anos'),
        ('4', '4 anos'),
        ('6', '6 anos'),
        ('8', '8 anos'),
        ('10', '10 anos'),
        ('12', '12 anos'),
        ('14', '14 anos'),
        ('16', '16 anos'),
    ]
    
    # Campos obrigatórios
    full_name = models.CharField(max_length=200, verbose_name="Nome Completo")
    cpf = models.CharField(max_length=14, unique=True, verbose_name="CPF")
    email = models.EmailField(verbose_name="E-mail")
    phone = models.CharField(max_length=20, verbose_name="Telefone (WhatsApp)")
    birth_date = models.DateField(verbose_name="Data de nascimento")
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, verbose_name="Sexo")
    
    # Novos campos
    modality = models.CharField(
        max_length=10, 
        choices=MODALITY_CHOICES, 
        verbose_name="Modalidade",
        help_text="Escolha entre Infantil ou Adulto",
        default='ADULTO'
    )
    shirt_size = models.CharField(
        max_length=3, 
        verbose_name="Tamanho da Camisa",
        help_text="Escolha o tamanho da sua camisa",
        default='M'
    )
    
    # Campo para controle de email enviado
    confirmation_email_sent = models.BooleanField(
        default=False, 
        verbose_name="Email de confirmação enviado"
    )
    
    # Campo de declaração obrigatória
    athlete_declaration = models.BooleanField(
        default=False, 
        verbose_name="Ciente",
        help_text="O atleta assume e expressamente declara que é conhecedor do seu estado de saúde e capacidade atlética e que treinou adequadamente para o evento"
    )
    
    # Campos de auditoria
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Inscrição de Corrida"
        verbose_name_plural = "Inscrições de Corrida"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.full_name} - {self.cpf}"
    
    def clean(self):
        """Validação customizada do modelo"""
        from django.core.exceptions import ValidationError
        
        # Verificar se a data de nascimento é válida
        if self.birth_date and self.birth_date > timezone.now().date():
            raise ValidationError("A data de nascimento não pode ser no futuro.")
        
        # Verificar se a data da corrida é válida
        if self.race_date and self.race_date < timezone.now().date():
            raise ValidationError("A data da corrida não pode ser no passado.")
    
    @property
    def age(self):
        """Calcula a idade do atleta"""
        if self.birth_date:
            today = timezone.now().date()
            return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))
        return None
