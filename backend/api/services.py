from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from django.utils.encoding import force_str, force_bytes
from decouple import config
from email.header import Header
from email.utils import formataddr

def send_registration_confirmation_email(registration):
    """
    Envia email de confirmação da inscrição (quando o usuário se inscreve)
    """
    # Assunto com acentos e emojis
    subject_text = 'Inscrição Recebida – Corrida Ad-mooving 🏃✨'
    subject = str(Header(subject_text, 'utf-8'))
    
    # Informações da corrida (configuráveis via .env)
    race_info = {
        'name': config('RACE_NAME', default='Corrida Ad-mooving 2024'),
        'date': config('RACE_DATE', default='15 de Dezembro de 2024'),
        'location': config('RACE_LOCATION', default='Parque potycabana'),
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
        'contact_whatsapp': config('CONTACT_WHATSAPP', default='+55 86 9410-8906'),
        'email_type': 'registration'
    }
    
    # Renderiza o template HTML
    html_message = render_to_string('api/emails/registration_confirmation.html', context)
    
    # Renderiza o template de texto plano
    text_message = render_to_string('api/emails/registration_confirmation.txt', context)
    
    try:
        # Garante que as mensagens estão em UTF-8
        subject = force_str(subject, encoding='utf-8')
        text_message = force_str(text_message, encoding='utf-8')
        html_message = force_str(html_message, encoding='utf-8')
        
        # Remetente amigável com emoji
        friendly_from = formataddr((str(Header('Equipe Ad-mooving 🏁', 'utf-8')), settings.DEFAULT_FROM_EMAIL))
        
        # Cria a mensagem de email com encoding UTF-8 explícito
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_message,
            from_email=friendly_from,
            to=[registration.email]
        )
        
        # Define o encoding UTF-8
        email.encoding = 'utf-8'
        
        # Adiciona a versão HTML com charset
        email.attach_alternative(html_message, 'text/html; charset=utf-8')
        
        # Envia o email
        email.send(fail_silently=False)
        
        # Marca que o email de inscrição foi enviado
        registration.registration_email_sent = True
        registration.save(update_fields=['registration_email_sent'])
        
        return True
    except Exception as e:
        print(f"Erro ao enviar email de confirmação de inscrição: {e}")
        import traceback
        traceback.print_exc()
        return False

def send_payment_confirmation_email(registration):
    """
    Envia email de confirmação do pagamento (quando o pagamento é aprovado)
    """
    # Assunto com acentos e emojis
    subject_text = 'Pagamento Confirmado – Corrida Ad-mooving 🎉💳'
    subject = str(Header(subject_text, 'utf-8'))
    
    # Informações da corrida (configuráveis via .env)
    race_info = {
        'name': config('RACE_NAME', default='Corrida Ad-mooving 2024'),
        'date': config('RACE_DATE', default='15 de Dezembro de 2024'),
        'location': config('RACE_LOCATION', default='Parque potycabana'),
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
        'payment_date': timezone.now().strftime('%d/%m/%Y às %H:%M'),
        'contact_email': config('CONTACT_EMAIL', default='contato@ad-mooving.com'),
        'contact_whatsapp': config('CONTACT_WHATSAPP', default='+55 86 9410-8906'),
        'email_type': 'payment'
    }
    
    # Renderiza o template HTML
    html_message = render_to_string('api/emails/payment_confirmation.html', context)
    
    # Renderiza o template de texto plano
    text_message = render_to_string('api/emails/payment_confirmation.txt', context)
    
    try:
        # Garante que as mensagens estão em UTF-8
        subject = force_str(subject, encoding='utf-8')
        text_message = force_str(text_message, encoding='utf-8')
        html_message = force_str(html_message, encoding='utf-8')
        
        # Remetente amigável com emoji
        friendly_from = formataddr((str(Header('Equipe Ad-mooving 🏁', 'utf-8')), settings.DEFAULT_FROM_EMAIL))
        
        # Cria a mensagem de email com encoding UTF-8 explícito
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_message,
            from_email=friendly_from,
            to=[registration.email]
        )
        
        # Define o encoding UTF-8
        email.encoding = 'utf-8'
        
        # Adiciona a versão HTML com charset
        email.attach_alternative(html_message, 'text/html; charset=utf-8')
        
        # Envia o email
        email.send(fail_silently=False)
        
        # Marca que o email de pagamento foi enviado
        registration.payment_email_sent = True
        registration.save(update_fields=['payment_email_sent'])
        
        return True
    except Exception as e:
        print(f"Erro ao enviar email de confirmação de pagamento: {e}")
        import traceback
        traceback.print_exc()
        return False 