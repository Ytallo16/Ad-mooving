from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from decouple import config

def send_registration_confirmation_email(registration):
    """
    Envia email de confirmação da inscrição
    """
    subject = f'Confirmação de Inscrição - Corrida Ad-mooving'
    
    # Informações da corrida (configuráveis via .env)
    
    race_info = {
        'name': config('RACE_NAME', default='Corrida Ad-mooving 2024'),
        'date': config('RACE_DATE', default='15 de Dezembro de 2024'),
        'location': config('RACE_LOCATION', default='Parque Ibirapuera - São Paulo/SP'),
        'start_time': config('RACE_START_TIME', default='07:00h'),
        'kit_pickup': {
            'date': config('KIT_PICKUP_DATE', default='13 e 14 de Dezembro de 2024'),
            'time': config('KIT_PICKUP_TIME', default='10:00h às 18:00h'),
            'location': config('KIT_PICKUP_LOCATION', default='Loja Ad-mooving - Shopping Morumbi'),
            'required_docs': config('KIT_PICKUP_DOCS', default='CPF e comprovante de inscrição')
        }
    }
    
    # Contexto para o template
    context = {
        'registration': registration,
        'race_info': race_info,
        'confirmation_date': timezone.now().strftime('%d/%m/%Y às %H:%M'),
        'contact_email': config('CONTACT_EMAIL', default='contato@ad-mooving.com'),
        'contact_whatsapp': config('CONTACT_WHATSAPP', default='(11) 99999-9999'),
    }
    
    # Renderiza o template HTML
    html_message = render_to_string('api/emails/registration_confirmation.html', context)
    
    # Renderiza o template de texto plano
    text_message = render_to_string('api/emails/registration_confirmation.txt', context)
    
    try:
        # Envia o email
        send_mail(
            subject=subject,
            message=text_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[registration.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        # Marca que o email foi enviado
        registration.confirmation_email_sent = True
        registration.save(update_fields=['confirmation_email_sent'])
        
        return True
    except Exception as e:
        print(f"Erro ao enviar email: {e}")
        return False 