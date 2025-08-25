from django.contrib import admin
from .models import ExampleModel, RaceRegistration

@admin.register(ExampleModel)
class ExampleModelAdmin(admin.ModelAdmin):
    """
    Configuração do admin para o modelo ExampleModel
    """
    list_display = ['name', 'is_active', 'created_at', 'updated_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'description', 'is_active')
        }),
        ('Metadados', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    list_per_page = 20
    ordering = ['-created_at']
    
    def status(self, obj):
        """Exibe o status do modelo"""
        return obj.status
    status.short_description = 'Status'


@admin.register(RaceRegistration)
class RaceRegistrationAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'cpf', 'email', 'gender', 'modality', 'shirt_info', 'birth_date', 'confirmation_email_sent', 'created_at']
    list_filter = ['gender', 'modality', 'shirt_size', 'birth_date', 'confirmation_email_sent', 'created_at', 'athlete_declaration']
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
        ('Declaração', {
            'fields': ('athlete_declaration',),
            'description': 'Declaração obrigatória para inscrição'
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
