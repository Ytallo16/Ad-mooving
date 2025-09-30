from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from django.utils.encoding import force_str, force_bytes
from decouple import config
from email.header import Header
from email.utils import formataddr
import stripe
import random

# Configurar Stripe com a chave secreta
stripe.api_key = settings.STRIPE_SECRET_KEY

def generate_unique_registration_number():
    """
    Gera um número único de 5 dígitos para inscrição
    """
    from .models import RaceRegistration
    
    max_attempts = 100  # Evitar loop infinito
    attempts = 0
    
    while attempts < max_attempts:
        # Gera número de 5 dígitos (10000 a 99999)
        number = str(random.randint(10000, 99999))
        
        # Verifica se já existe
        if not RaceRegistration.objects.filter(registration_number=number).exists():
            return number
        
        attempts += 1
    
    # Se não conseguir gerar um número único, usar timestamp
    return str(int(timezone.now().timestamp()))[-5:].zfill(5)

## Removido: envio de email de confirmação de inscrição (apenas email de pagamento é mantido)

def send_payment_confirmation_email(registration):
    """
    Envia email de confirmação do pagamento (quando o pagamento é aprovado)
    """
    # Gera número de inscrição único se ainda não existe
    if not registration.registration_number:
        registration.registration_number = generate_unique_registration_number()
        registration.save(update_fields=['registration_number'])
    
    # Assunto simples, sem emojis
    subject_text = 'Pagamento confirmado – Corrida Ad-moving'
    subject = str(Header(subject_text, 'utf-8'))
    
    # Informações da corrida (configuráveis via .env)
    race_info = {
        'name': config('RACE_NAME', default='Corrida Ad-moving 2025'),
        'date': config('RACE_DATE', default='14 de Dezembro de 2025'),
        'location': config('RACE_LOCATION', default='A ser informado'),
        'start_time': config('RACE_START_TIME', default='06:00h'),
        'kit_pickup': {
            'date': config('KIT_PICKUP_DATE', default='A ser informado'),
            'time': config('KIT_PICKUP_TIME', default='A ser informado'),
            'location': config('KIT_PICKUP_LOCATION', default='A ser informado'),
            'required_docs': config('KIT_PICKUP_DOCS', default='CPF e comprovante de inscrição')
        }
    }
    
    # Contexto para o template
    # Ajustar data/hora para timezone local configurado (America/Sao_Paulo)
    local_payment_dt = timezone.localtime(timezone.now())

    context = {
        'registration': registration,
        'race_info': race_info,
        'payment_date': local_payment_dt.strftime('%d/%m/%Y às %H:%M'),
        'contact_email': config('CONTACT_EMAIL', default='admoving@addirceu.com.br'),
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
        
        # Remetente simples, sem emoji
        friendly_from = formataddr((str(Header('Equipe Ad-moving', 'utf-8')), settings.DEFAULT_FROM_EMAIL))
        
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


def create_stripe_checkout_session(registration, base_url: str | None = None):
    """
    Cria uma sessão de checkout do Stripe para o pagamento da inscrição
    """
    try:
        # Determinar o valor baseado na modalidade
        if registration.modality == 'INFANTIL':
            amount = 5000  # R$ 50,00 em centavos
            description = f"Inscrição Infantil - Corrida Ad-mooving - {registration.full_name}"
        else:
            amount = 8000  # R$ 80,00 em centavos  
            description = f"Inscrição Adulto - Corrida Ad-mooving - {registration.full_name}"
        
        # URLs: prioridade desejada -> 1) produção fixa, 2) localhost (se detectado), 3) PUBLIC_BASE_URL/env
        prod_base = 'https://admoving.demo.addirceu.com.br'
        local_base = None
        if base_url and ('localhost' in base_url or '127.0.0.1' in base_url):
            local_base = base_url.rstrip('/')
        env_base = (config('PUBLIC_BASE_URL', default='') or '').rstrip('/') or None

        base = prod_base
        if local_base:
            base = local_base
        elif not base:
            base = env_base or prod_base

        success_url = config('STRIPE_SUCCESS_URL', default=f'{base}/pagamento/sucesso')
        cancel_url = config('STRIPE_CANCEL_URL', default=f'{base}/pagamento/cancelado')

        # Métodos de pagamento: cartão sempre, Pix opcional
        enable_pix = getattr(settings, 'STRIPE_ENABLE_PIX', True)
        payment_method_types = ['card']
        if enable_pix:
            payment_method_types.append('pix')

        # Opções específicas do Pix (expiração do QR Code, opcional)
        pix_expires = config('STRIPE_PIX_EXPIRES_AFTER_SECONDS', default=None)
        if pix_expires:
            pix_expires = int(pix_expires)
        payment_method_options = {}
        if enable_pix and pix_expires:
            payment_method_options['pix'] = {
                'expires_after_seconds': pix_expires
            }
        
        # Configurar parcelamento para cartão de crédito (Brasil)
        payment_method_options['card'] = {
            'installments': {
                'enabled': True
            },
            'request_three_d_secure': 'automatic'
        }
        
        # Monta dados do PaymentIntent (metadados sempre + Connect opcional)
        payment_intent_data = {
            'metadata': {
                'registration_id': registration.id,
                'registration_cpf': registration.cpf,
            }
        }

        # Suporte opcional a Stripe Connect (destino dos fundos)
        connect_account = getattr(settings, 'STRIPE_CONNECT_ACCOUNT_ID', '')
        application_fee_amount = getattr(settings, 'STRIPE_APPLICATION_FEE_AMOUNT', 0)
        if connect_account:
            transfer_data = { 'destination': connect_account }
            payment_intent_data['transfer_data'] = transfer_data
            if application_fee_amount and application_fee_amount > 0:
                payment_intent_data['application_fee_amount'] = application_fee_amount

        # Criar a sessão de checkout
        checkout_kwargs = dict(
            payment_method_types=payment_method_types,
            line_items=[
                {
                    'price_data': {
                        'currency': 'brl',
                        'product_data': {
                            'name': f'Corrida Ad-mooving - {registration.get_modality_display()}',
                            'description': description,
                        },
                        'unit_amount': amount,
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=f"{success_url}?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{cancel_url}?registration_id={registration.id}",
            metadata={
                'registration_id': registration.id,
                'registration_cpf': registration.cpf,
                'registration_email': registration.email,
                'modality': registration.modality,
            },
            customer_email=registration.email,
            locale='pt-BR',
            payment_intent_data=payment_intent_data
        )
        if payment_method_options:
            checkout_kwargs['payment_method_options'] = payment_method_options
        checkout_session = stripe.checkout.Session.create(**checkout_kwargs)
        
        # Salvar o ID da sessão na inscrição
        registration.stripe_checkout_session_id = checkout_session.id
        registration.payment_amount = amount / 100  # Converter centavos para reais
        registration.save(update_fields=['stripe_checkout_session_id', 'payment_amount'])
        
        return {
            'success': True,
            'checkout_url': checkout_session.url,
            'session_id': checkout_session.id,
            'amount': amount / 100
        }
        
    except stripe.error.StripeError as e:
        print(f"Erro do Stripe: {e}")
        return {
            'success': False,
            'error': f'Erro no Stripe: {str(e)}'
        }
    except Exception as e:
        print(f"Erro geral ao criar sessão de checkout: {e}")
        import traceback
        traceback.print_exc()
        return {
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }


def verify_stripe_checkout_session(session_id):
    """
    Verifica o status de uma sessão de checkout do Stripe
    """
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        
        return {
            'success': True,
            'session': session,
            'payment_status': session.payment_status,
            'amount_total': session.amount_total,
            'customer_email': session.customer_email,
            'metadata': session.metadata
        }
        
    except stripe.error.StripeError as e:
        print(f"Erro do Stripe ao verificar sessão: {e}")
        return {
            'success': False,
            'error': f'Erro no Stripe: {str(e)}'
        }
    except Exception as e:
        print(f"Erro geral ao verificar sessão: {e}")
        return {
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }


def process_stripe_webhook_event(event):
    """
    Processa eventos de webhook do Stripe
    """
    try:
        # Importar o modelo aqui para evitar importação circular
        from .models import RaceRegistration
        
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            
            # Obter o ID da inscrição dos metadados
            registration_id = session['metadata'].get('registration_id')
            
            if registration_id:
                try:
                    registration = RaceRegistration.objects.get(id=registration_id)
                    
                    # Atualizar o status do pagamento
                    registration.payment_status = 'PAID'
                    registration.payment_date = timezone.now()
                    try:
                        amt_total = session.get('amount_total')
                        if amt_total is not None:
                            registration.payment_amount = (amt_total or 0) / 100.0
                    except Exception:
                        pass
                    
                    # Salvar o Payment Intent ID se disponível
                    if session.get('payment_intent'):
                        registration.stripe_payment_intent_id = session['payment_intent']
                    
                    # Gerar número de inscrição único se ainda não existe
                    if not registration.registration_number:
                        registration.registration_number = generate_unique_registration_number()
                    
                    registration.save(update_fields=[
                        'payment_status', 
                        'payment_date', 
                        'stripe_payment_intent_id',
                        'registration_number',
                        'payment_amount'
                    ])
                    
                    # Enviar email de confirmação de pagamento
                    send_payment_confirmation_email(registration)
                    
                    return {
                        'success': True,
                        'message': f'Pagamento processado para inscrição {registration_id}'
                    }
                    
                except RaceRegistration.DoesNotExist:
                    return {
                        'success': False,
                        'error': f'Inscrição {registration_id} não encontrada'
                    }
            else:
                return {
                    'success': False,
                    'error': 'ID da inscrição não encontrado nos metadados'
                }
                
        elif event['type'] == 'payment_intent.payment_failed':
            # Tratar pagamento falhou
            payment_intent = event['data']['object']
            registration_id = payment_intent['metadata'].get('registration_id')
            
            if registration_id:
                try:
                    registration = RaceRegistration.objects.get(id=registration_id)
                    # Manter status PENDING ou criar um status FAILED se necessário
                    print(f"Pagamento falhou para inscrição {registration_id}")
                    
                    return {
                        'success': True,
                        'message': f'Pagamento falhou processado para inscrição {registration_id}'
                    }
                except RaceRegistration.DoesNotExist:
                    return {
                        'success': False,
                        'error': f'Inscrição {registration_id} não encontrada'
                    }
        
        return {
            'success': True,
            'message': f'Evento {event["type"]} recebido mas não processado'
        }
        
    except Exception as e:
        print(f"Erro ao processar evento webhook: {e}")
        import traceback
        traceback.print_exc()
        return {
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }


def get_race_prices():
    """
    Retorna os preços das modalidades da corrida
    """
    return {
        'INFANTIL': {
            'amount': 5000,  # em centavos
            'amount_brl': 50.00,  # em reais
            'description': 'Inscrição modalidade infantil'
        },
        'ADULTO': {
            'amount': 8000,  # em centavos
            'amount_brl': 80.00,  # em reais
            'description': 'Inscrição modalidade adulto'
        }
    }