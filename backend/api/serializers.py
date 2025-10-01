from rest_framework import serializers
from .models import RaceRegistration


class RaceRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer para inscrição de corrida
    """
    age = serializers.ReadOnlyField(help_text="Idade calculada automaticamente")
    gender_display = serializers.CharField(source='get_gender_display', read_only=True, help_text="Descrição do sexo")
    modality_display = serializers.CharField(source='get_modality_display', read_only=True, help_text="Descrição da modalidade")
    course_display = serializers.CharField(source='get_course_display', read_only=True, help_text="Descrição do percurso")
    shirt_size_display = serializers.CharField(source='get_shirt_size_display', read_only=True, help_text="Descrição do tamanho da camisa")
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True, help_text="Descrição do status do pagamento")
    
    # Campo CPF (entra cru; expomos também formato amigável em 'cpf_formatted')
    cpf = serializers.CharField(max_length=14, required=False, allow_blank=True, allow_null=True)
    cpf_formatted = serializers.SerializerMethodField(read_only=True, help_text="CPF formatado para exibição")
    
    # Campos para seleção dinâmica
    available_shirt_sizes = serializers.SerializerMethodField(help_text="Tamanhos disponíveis baseados na modalidade e sexo")
    
    class Meta:
        model = RaceRegistration
        fields = [
            'id', 'full_name', 'cpf', 'cpf_formatted', 'email', 'phone', 'birth_date', 
            'gender', 'gender_display', 'modality', 'modality_display', 'course', 'course_display',
            'shirt_size', 'shirt_size_display', 'available_shirt_sizes',
            'responsible_full_name', 'responsible_cpf', 'responsible_email', 'responsible_phone',
            'athlete_declaration', 'payment_status', 'payment_status_display',
            'payment_email_sent', 'coupon_code', 'coupon_discount', 'age', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'age', 'payment_email_sent', 'coupon_code', 'coupon_discount', 'created_at', 'updated_at']
    
    def get_available_shirt_sizes(self, obj):
        """
        Retorna os tamanhos de camisa disponíveis baseados na modalidade e sexo
        """
        if obj.modality == 'INFANTIL' or obj.course == 'KIDS':
            return dict(RaceRegistration.INFANT_SHIRT_SIZE_CHOICES)
        # Adulto: tamanhos tradicionais
        return {k: f'Tradicional {k}' for k, _ in RaceRegistration.SHIRT_SIZE_CHOICES}
    
    def to_internal_value(self, data):
        """
        Processa dados de entrada, removendo formatação do CPF
        """
        if 'cpf' in data and data['cpf']:
            # Remove formatação do CPF (pontos, traços, espaços)
            data['cpf'] = ''.join(filter(str.isdigit, data['cpf']))
        return super().to_internal_value(data)
    
    def to_representation(self, instance):
        """
        Mantém 'cpf' cru (apenas dígitos) e fornece 'cpf_formatted' separado.
        """
        return super().to_representation(instance)

    def validate_cpf(self, value):
        """
        Validação do CPF com restrição apenas para pagamentos confirmados
        Para KIDS, não validar duplicata de CPF do responsável
        """
        if not value:
            return value
            
        # Remove caracteres não numéricos
        cpf = ''.join(filter(str.isdigit, value))
        
        if len(cpf) != 11:
            raise serializers.ValidationError("CPF deve ter 11 dígitos.")
        
        # Verifica se todos os dígitos são iguais
        if cpf == cpf[0] * 11:
            raise serializers.ValidationError("CPF inválido.")
        
        # Validação dos dígitos verificadores
        for i in range(9, 11):
            value = sum((int(cpf[num]) * ((i + 1) - num) for num in range(0, i)))
            digit = ((value * 10) % 11) % 10
            if int(cpf[i]) != digit:
                raise serializers.ValidationError("CPF inválido.")
        
        # Obter dados do request para verificar se é KIDS
        request_data = getattr(self, 'initial_data', {})
        modality = request_data.get('modality')
        course = request_data.get('course')
        
        # Para KIDS/INFANTIL, não verificar duplicata de CPF (um pai pode inscrever vários filhos)
        if modality == 'INFANTIL' or course == 'KIDS':
            return cpf
        
        # Para ADULTO, verificar se já existe inscrição PAGA com este CPF
        from .models import RaceRegistration
        existing_paid = RaceRegistration.objects.filter(
            cpf=cpf, 
            payment_status='PAID'
        ).exists()
        
        if existing_paid:
            raise serializers.ValidationError(
                "Já existe uma inscrição paga com este CPF. "
                "Se você não completou o pagamento anterior, pode tentar novamente."
            )
        
        return cpf  # Retorna o CPF limpo (apenas dígitos)

    def get_cpf_formatted(self, obj):
        """Formata o CPF (somente para exibição)."""
        if obj.cpf and len(obj.cpf) == 11:
            return f"{obj.cpf[:3]}.{obj.cpf[3:6]}.{obj.cpf[6:9]}-{obj.cpf[9:]}"
        return obj.cpf
    
    def validate_phone(self, value):
        """
        Validação do telefone
        """
        # Remove caracteres não numéricos
        phone = ''.join(filter(str.isdigit, value))
        
        if len(phone) < 10 or len(phone) > 11:
            raise serializers.ValidationError("Telefone deve ter 10 ou 11 dígitos.")
        
        return value
    
    def validate_responsible_cpf(self, value):
        """
        Validação do CPF do responsável - permite duplicatas para KIDS
        """
        if not value:
            return value
            
        # Remove caracteres não numéricos
        cpf = ''.join(filter(str.isdigit, value))
        
        if len(cpf) != 11:
            raise serializers.ValidationError("CPF deve ter 11 dígitos.")
        
        # Verifica se todos os dígitos são iguais
        if cpf == cpf[0] * 11:
            raise serializers.ValidationError("CPF inválido.")
        
        # Validação dos dígitos verificadores
        for i in range(9, 11):
            value_sum = sum((int(cpf[num]) * ((i + 1) - num) for num in range(0, i)))
            digit = ((value_sum * 10) % 11) % 10
            if int(cpf[i]) != digit:
                raise serializers.ValidationError("CPF inválido.")
        
        # Para KIDS, permitir CPF do responsável repetido (um pai pode inscrever vários filhos)
        return cpf  # Retorna o CPF limpo (apenas dígitos)
    
    def validate_birth_date(self, value):
        """
        Validação da data de nascimento
        """
        from django.utils import timezone
        
        if value > timezone.now().date():
            raise serializers.ValidationError("A data de nascimento não pode ser no futuro.")
        
        # Para ADULTO, exigir pelo menos 12 anos; para KIDS/INFANTIL, permitir inferiores
        request_data = getattr(self, 'initial_data', {})
        modality = request_data.get('modality')
        course = request_data.get('course')
        today = timezone.now().date()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if (modality == 'ADULTO' or course in ['RUN_5K', 'WALK_3K']) and age < 12:
            raise serializers.ValidationError("Para adulto/percurso 5KM/3KM, o atleta deve ter pelo menos 12 anos.")
        
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
        
        # Sincronizar modalidade a partir do percurso
        course = data.get('course') or self.initial_data.get('course')
        modality = data.get('modality')
        if course and not modality:
            data['modality'] = 'INFANTIL' if course == 'KIDS' else 'ADULTO'
            modality = data['modality']

        # Validar tamanho da camisa baseado na modalidade/percurso
        shirt_size = data.get('shirt_size')
        if modality == 'INFANTIL' or course == 'KIDS':
            valid_sizes = ['4', '6', '8', '10']
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

        # Campos do responsável para KIDS
        if modality == 'INFANTIL' or course == 'KIDS':
            for field in ['responsible_full_name', 'responsible_cpf']:
                if not data.get(field) and not self.initial_data.get(field):
                    raise serializers.ValidationError({field: 'Campo obrigatório para inscrição infantil.'})
            # Para infantil: email/phone/cpf do atleta não são obrigatórios
            data['cpf'] = data.get('cpf') or None
            data['email'] = data.get('email') or data.get('responsible_email') or None
            data['phone'] = data.get('phone') or data.get('responsible_phone') or None
        
        return data 

    def create(self, validated_data):
        # Se inscrição infantil e email/phone do responsável fornecidos separadamente,
        # opcionalmente sincronizar (mantemos como estão; principal é que email/phone existam)
        return super().create(validated_data)