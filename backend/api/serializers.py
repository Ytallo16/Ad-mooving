from rest_framework import serializers
from .models import ExampleModel, RaceRegistration

class ExampleModelSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo ExampleModel
    """
    status = serializers.ReadOnlyField(help_text="Status do modelo (Ativo/Inativo)")
    
    class Meta:
        model = ExampleModel
        fields = ['id', 'name', 'description', 'is_active', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_name(self, value):
        """
        Validação customizada para o campo name
        """
        if len(value.strip()) < 3:
            raise serializers.ValidationError("O nome deve ter pelo menos 3 caracteres.")
        return value.strip()
    
    def validate_description(self, value):
        """
        Validação customizada para o campo description
        """
        if value and len(value.strip()) < 10:
            raise serializers.ValidationError("A descrição deve ter pelo menos 10 caracteres.")
        return value.strip() if value else value


class RaceRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer para inscrição de corrida
    """
    age = serializers.ReadOnlyField(help_text="Idade calculada automaticamente")
    gender_display = serializers.CharField(source='get_gender_display', read_only=True, help_text="Descrição do sexo")
    modality_display = serializers.CharField(source='get_modality_display', read_only=True, help_text="Descrição da modalidade")
    shirt_size_display = serializers.CharField(source='get_shirt_size_display', read_only=True, help_text="Descrição do tamanho da camisa")
    
    # Campos para seleção dinâmica
    available_shirt_sizes = serializers.SerializerMethodField(help_text="Tamanhos disponíveis baseados na modalidade e sexo")
    
    class Meta:
        model = RaceRegistration
        fields = [
            'id', 'full_name', 'cpf', 'email', 'phone', 'birth_date', 
            'gender', 'gender_display', 'modality', 'modality_display',
            'shirt_size', 'shirt_size_display', 'available_shirt_sizes',
            'athlete_declaration', 'confirmation_email_sent', 'age', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'age', 'confirmation_email_sent', 'created_at', 'updated_at']
    
    def get_available_shirt_sizes(self, obj):
        """
        Retorna os tamanhos de camisa disponíveis baseados na modalidade e sexo
        """
        if obj.modality == 'INFANTIL':
            return dict(RaceRegistration.INFANT_SHIRT_SIZE_CHOICES)
        elif obj.gender == 'F':
            # Para mulheres, sempre retorna tamanhos babylook
            return {
                'PP': 'PP (Babylook)',
                'P': 'P (Babylook)',
                'M': 'M (Babylook)',
                'G': 'G (Babylook)',
                'GG': 'GG (Babylook)',
                'XG': 'XG (Babylook)',
                'XXG': 'XXG (Babylook)',
            }
        else:
            # Para homens adultos
            return dict(RaceRegistration.SHIRT_SIZE_CHOICES)
    
    def validate_cpf(self, value):
        """
        Validação básica do CPF - DESABILITADA TEMPORARIAMENTE
        """
        # Validação desabilitada para testes
        return value
        
        # Remove caracteres não numéricos
        # cpf = ''.join(filter(str.isdigit, value))
        
        # if len(cpf) != 11:
        #     raise serializers.ValidationError("CPF deve ter 11 dígitos.")
        
        # # Verifica se todos os dígitos são iguais
        # if cpf == cpf[0] * 11:
        #     raise serializers.ValidationError("CPF inválido.")
        
        # # Validação dos dígitos verificadores
        # for i in range(9, 11):
        #     value = sum((int(cpf[num]) * ((i + 1) - num) for num in range(0, i)))
        #     digit = ((value * 10) % 11) % 10
        #     if int(cpf[i]) != digit:
        #         raise serializers.ValidationError("CPF inválido.")
        
        # return value
    
    def validate_phone(self, value):
        """
        Validação do telefone
        """
        # Remove caracteres não numéricos
        phone = ''.join(filter(str.isdigit, value))
        
        if len(phone) < 10 or len(phone) > 11:
            raise serializers.ValidationError("Telefone deve ter 10 ou 11 dígitos.")
        
        return value
    
    def validate_birth_date(self, value):
        """
        Validação da data de nascimento
        """
        from django.utils import timezone
        
        if value > timezone.now().date():
            raise serializers.ValidationError("A data de nascimento não pode ser no futuro.")
        
        # Verificar se a pessoa tem pelo menos 12 anos
        today = timezone.now().date()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        
        if age < 12:
            raise serializers.ValidationError("O atleta deve ter pelo menos 12 anos para se inscrever.")
        
        return value
    

    
    def validate(self, data):
        """
        Validação entre campos
        """
        # Verificar se a declaração foi aceita
        if not data.get('athlete_declaration'):
            raise serializers.ValidationError(
                "Você deve marcar 'Ciente' para se inscrever."
            )
        
        # Validar tamanho da camisa baseado na modalidade
        modality = data.get('modality')
        shirt_size = data.get('shirt_size')
        
        if modality == 'INFANTIL':
            valid_sizes = ['2', '4', '6', '8', '10', '12', '14', '16']
            if shirt_size not in valid_sizes:
                raise serializers.ValidationError(
                    f"Para modalidade infantil, o tamanho deve ser: {', '.join(valid_sizes)}"
                )
        else:
            valid_sizes = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG']
            if shirt_size not in valid_sizes:
                raise serializers.ValidationError(
                    f"Para modalidade adulto, o tamanho deve ser: {', '.join(valid_sizes)}"
                )
        
        return data 