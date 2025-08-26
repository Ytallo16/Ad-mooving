from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from django.utils.encoding import force_str, force_bytes
from decouple import config

def send_registration_confirmation_email(registration):
    """
    Envia email de confirmacao da inscricao
    """
    # Teste com subject simples primeiro
    subject = 'Confirmacao de Inscricao - Corrida Ad-mooving'
    
    # Informacoes da corrida (configuraveis via .env)
    
    race_info = {
        'name': config('RACE_NAME', default='Corrida Ad-mooving 2024'),
        'date': config('RACE_DATE', default='15 de Dezembro de 2024'),
        'location': config('RACE_LOCATION', default='Parque Ibirapuera - Sao Paulo/SP'),
        'start_time': config('RACE_START_TIME', default='07:00h'),
        'kit_pickup': {
            'date': config('KIT_PICKUP_DATE', default='13 e 14 de Dezembro de 2024'),
            'time': config('KIT_PICKUP_TIME', default='10:00h as 18:00h'),
            'location': config('KIT_PICKUP_LOCATION', default='Loja Ad-mooving - Shopping Morumbi'),
            'required_docs': config('KIT_PICKUP_DOCS', default='CPF e comprovante de inscricao')
        }
    }
    
    # Contexto para o template
    context = {
        'registration': registration,
        'race_info': race_info,
        'confirmation_date': timezone.now().strftime('%d/%m/%Y as %H:%M'),
        'contact_email': config('CONTACT_EMAIL', default='contato@ad-mooving.com'),
        'contact_whatsapp': config('CONTACT_WHATSAPP', default='(11) 99999-9999'),
    }
    
    # Renderiza o template HTML
    html_message = render_to_string('api/emails/registration_confirmation.html', context)
    
    # Renderiza o template de texto plano
    text_message = render_to_string('api/emails/registration_confirmation.txt', context)
    
    try:
        # Garante que as mensagens estao em UTF-8
        subject = force_str(subject, encoding='utf-8')
        text_message = force_str(text_message, encoding='utf-8')
        html_message = force_str(html_message, encoding='utf-8')
        
        # Cria a mensagem de email com encoding UTF-8 explicito
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[registration.email]
        )
        
        # Define o encoding UTF-8
        email.encoding = 'utf-8'
        
        # Adiciona a versao HTML
        email.attach_alternative(html_message, "text/html")
        
        # Envia o email
        email.send(fail_silently=False)
        
        # Marca que o email foi enviado
        registration.confirmation_email_sent = True
        registration.save(update_fields=['confirmation_email_sent'])
        
        return True
    except Exception as e:
        print(f"Erro ao enviar email: {e}")
        import traceback
        traceback.print_exc()
        return False 