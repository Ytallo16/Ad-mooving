from django.contrib import admin
from .models import RaceRegistration


@admin.register(RaceRegistration)
class RaceRegistrationAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'cpf', 'email', 'gender', 'modality', 'shirt_info', 'payment_status_colored', 'payment_email_sent', 'created_at']
    list_filter = ['gender', 'modality', 'shirt_size', 'payment_status', 'payment_email_sent', 'birth_date', 'created_at', 'athlete_declaration']
    search_fields = ['full_name', 'cpf', 'email', 'phone']
    readonly_fields = ['created_at', 'updated_at', 'age']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Informações Pessoais', {
            'fields': ('full_name', 'cpf', 'email', 'phone', 'birth_date', 'gender')
        }),
        ('Corrida', {
            'fields': ('modality', 'shirt_size'),
            'description': 'Informações da corrida'
        }),
        ('Pagamento', {
            'fields': ('payment_status',),
            'description': 'Status do pagamento da inscrição'
        }),
        ('Declaração', {
            'fields': ('athlete_declaration',),
            'description': 'Declaração obrigatória para inscrição'
        }),
        ('Controle de Emails', {
            'fields': ('payment_email_sent',),
            'description': 'Controle dos emails enviados',
            'classes': ('collapse',)
        }),
        ('Auditoria', {
            'fields': ('created_at', 'updated_at', 'age'),
            'classes': ('collapse',)
        }),
    )
    
    def age(self, obj):
        """Exibe a idade calculada"""
        return obj.age if obj.age else 'N/A'
    age.short_description = 'Idade'
    
    def shirt_info(self, obj):
        """Exibe informações especiais da camisa"""
        if obj.modality == 'INFANTIL':
            return f"Infantil - {obj.get_shirt_size_display()}"
        elif obj.gender == 'F':
            return f"{obj.get_shirt_size_display()} (Babylook)"
        else:
            return obj.get_shirt_size_display()
    shirt_info.short_description = 'Camisa'
    
    def payment_status_colored(self, obj):
        """Exibe o status do pagamento com cores"""
        if obj.payment_status == 'PAID':
            return f'<span style="color: green; font-weight: bold;">✅ {obj.get_payment_status_display()}</span>'
        else:
            return f'<span style="color: orange; font-weight: bold;">⏳ {obj.get_payment_status_display()}</span>'
    payment_status_colored.short_description = 'Status Pagamento'
    payment_status_colored.allow_tags = True
    
    actions = ['mark_as_paid', 'mark_as_pending', 'resend_payment_email']
    
    def mark_as_paid(self, request, queryset):
        """Marca inscrições como pagas"""
        from .services import send_payment_confirmation_email
        
        updated = 0
        emails_sent = 0
        
        for registration in queryset:
            if registration.payment_status != 'PAID':
                registration.payment_status = 'PAID'
                registration.save(update_fields=['payment_status'])
                updated += 1
                
                # Enviar email de confirmação de pagamento se ainda não foi enviado
                if not registration.payment_email_sent:
                    try:
                        send_payment_confirmation_email(registration)
                        emails_sent += 1
                    except Exception:
                        pass
        
        self.message_user(request, f'{updated} inscrições marcadas como pagas. {emails_sent} emails de confirmação enviados.')
    mark_as_paid.short_description = "Marcar como pago e enviar email"
    
    def mark_as_pending(self, request, queryset):
        """Marca inscrições como pendentes"""
        updated = queryset.update(payment_status='PENDING')
        self.message_user(request, f'{updated} inscrições marcadas como pendentes.')
    mark_as_pending.short_description = "Marcar como pendente"
    
    # Removido: ação de reenviar email de inscrição
    
    def resend_payment_email(self, request, queryset):
        """Reenviar email de confirmação de pagamento"""
        from .services import send_payment_confirmation_email
        
        sent = 0
        for registration in queryset.filter(payment_status='PAID'):
            try:
                send_payment_confirmation_email(registration)
                sent += 1
            except Exception:
                pass
        
        self.message_user(request, f'{sent} emails de confirmação de pagamento reenviados.')
    resend_payment_email.short_description = "Reenviar email de pagamento (apenas pagos)"
