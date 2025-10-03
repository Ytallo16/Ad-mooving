from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from drf_spectacular.utils import extend_schema, OpenApiExample
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator

from .models import RaceRegistration
from .serializers import RaceRegistrationSerializer
from .services import (
    send_payment_confirmation_email,
    create_stripe_checkout_session,
    verify_stripe_checkout_session,
    process_stripe_webhook_event,
    get_race_prices,
    validate_coupon_code,
    create_abacatepay_pix,
    simulate_abacatepay_payment,
    check_abacatepay_payment_status,
    mark_registration_paid_atomic
)

# Create your views here.

@extend_schema(
    tags=['api'],
    summary='Endpoint raiz da API',
    description='Retorna informações sobre a API e endpoints disponíveis',
    responses={
        200: {
            'description': 'Informações da API',
            'examples': [
                {
                    'application/json': {
                        'message': 'Bem-vindo à API do Ad-mooving!',
                        'version': '1.0.0',
                        'endpoints': {
                            'health': '/api/health/',
                            'admin': '/admin/',
                            'docs': '/api/docs/',
                            'schema': '/api/schema/'
                        }
                    }
                }
            ]
        }
    }
)
@api_view(['GET'])
def api_root(request):
    """
    Endpoint raiz da API
    
    Retorna informações sobre a API, versão e endpoints disponíveis.
    """
    return Response({
        'message': 'Bem-vindo à API do Ad-mooving!',
        'version': '1.0.0',
        'endpoints': {
            'health': reverse('api:health_check', request=request),
            'admin': reverse('admin:index', request=request),
            'docs': reverse('swagger-ui', request=request),
            'schema': reverse('schema', request=request),
            'redoc': reverse('redoc', request=request),
            'race_registrations': reverse('api:race-registration-list', request=request),
            'race_statistics': reverse('api:race_statistics', request=request),
            'payment_webhook': reverse('api:payment_webhook', request=request),
        }
    })

@extend_schema(
    tags=['health'],
    summary='Verificação de saúde da API',
    description='Endpoint para verificar se a API está funcionando corretamente',
    responses={
        200: {
            'description': 'API funcionando corretamente',
            'examples': [
                {
                    'application/json': {
                        'status': 'healthy',
                        'message': 'API funcionando corretamente',
                        'timestamp': '2024-08-25T16:00:00Z'
                    }
                }
            ]
        }
    },
    examples=[
        OpenApiExample(
            'Resposta de sucesso',
            value={
                'status': 'healthy',
                'message': 'API funcionando corretamente',
                'timestamp': '2024-08-25T16:00:00Z'
            },
            response_only=True,
            status_codes=['200']
        )
    ]
)
@api_view(['GET'])
def health_check(request):
    """
    Endpoint para verificar a saúde da API
    
    Retorna o status atual da API e uma mensagem de confirmação.
    """
    from datetime import datetime
    
    return Response({
        'status': 'healthy',
        'message': 'API funcionando corretamente',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'uptime': 'running'
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def rate_limit_exceeded(request, exception=None):
    """
    View chamada quando o rate limit é excedido
    """
    return Response({
        'error': 'Rate limit exceeded',
        'message': 'Muitas requisições. Tente novamente em alguns minutos.',
        'retry_after': 60,
        'status_code': 429
    }, status=status.HTTP_429_TOO_MANY_REQUESTS)


class RaceRegistrationViewSet(ModelViewSet):
    """
    ViewSet para gerenciar inscrições de corrida
    """
    queryset = RaceRegistration.objects.all()
    serializer_class = RaceRegistrationSerializer
    permission_classes = []  # Permite acesso sem autenticação
    
    def get_permissions(self):
        """
        Permite criação sem autenticação, mas requer autenticação para outras operações
        """
        if self.action == 'create':
            return []  # Sem permissões para criação
        return [IsAuthenticatedOrReadOnly()]
    
    @extend_schema(
        tags=['corrida'],
        summary='Listar inscrições de corrida',
        description='Retorna todas as inscrições de corrida',
        responses={
            200: RaceRegistrationSerializer(many=True),
            401: {'description': 'Não autorizado'},
            403: {'description': 'Proibido'},
        }
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @method_decorator(ratelimit(key='ip', rate='10/h', method='POST'))
    @extend_schema(
        tags=['corrida'],
        summary='Criar inscrição de corrida',
        description='Cria uma nova inscrição de corrida com status PENDING e envia email de confirmação',
        request=RaceRegistrationSerializer,
        responses={
            201: RaceRegistrationSerializer,
            400: {'description': 'Dados inválidos'},
            401: {'description': 'Não autorizado'},
            429: {'description': 'Rate limit exceeded'},
        },
        examples=[
            OpenApiExample(
                'Exemplo de inscrição - Adulto Masculino',
                value={
                    'full_name': 'João Silva',
                    'cpf': '12345678901',
                    'email': 'joao@email.com',
                    'phone': '11999999999',
                    'birth_date': '1990-01-01',
                    'gender': 'M',
                    'modality': 'ADULTO',
                    'shirt_size': 'M',
                    'athlete_declaration': True
                },
                request_only=True,
                status_codes=['201']
            ),
            OpenApiExample(
                'Exemplo de inscrição - Adulto Feminino',
                value={
                    'full_name': 'Maria Santos',
                    'cpf': '98765432100',
                    'email': 'maria@email.com',
                    'phone': '11888888888',
                    'birth_date': '1985-05-15',
                    'gender': 'F',
                    'modality': 'ADULTO',
                    'shirt_size': 'M',
                    'athlete_declaration': True
                },
                request_only=True,
                status_codes=['201']
            ),
            OpenApiExample(
                'Exemplo de inscrição - Infantil',
                value={
                    'full_name': 'Pedro Santos',
                    'cpf': '11122233344',
                    'email': 'pedro@email.com',
                    'phone': '11777777777',
                    'birth_date': '2010-05-15',
                    'gender': 'M',
                    'modality': 'INFANTIL',
                    'shirt_size': '10',
                    'athlete_declaration': True
                },
                request_only=True,
                status_codes=['201']
            )
        ]
    )
    def create(self, request, *args, **kwargs):
        """
        Cria uma nova inscrição com status PENDING, envia email de confirmação
        e automaticamente cria uma sessão de pagamento Stripe.
        """
        try:
            print(f"DEBUG: Content-Type: {getattr(request, 'content_type', None)}")
            try:
                raw_body = request.body.decode('utf-8', errors='ignore') if hasattr(request, 'body') else None
                print(f"DEBUG: Raw body (first 300): {raw_body[:300] if raw_body else None}")
            except Exception as _e:
                print(f"DEBUG: Raw body decode error: {_e}")
            print(f"DEBUG: Dados recebidos: {request.data}")
            try:
                raw_cpf = request.data.get('cpf')
                print(f"DEBUG: CPF recebido (raw): {raw_cpf} len={len(str(raw_cpf)) if raw_cpf is not None else None}")
            except Exception:
                pass
            
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                print(f"DEBUG: Erros de validação: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Salva a inscrição
            try:
                val_cpf = serializer.validated_data.get('cpf')
                print(f"DEBUG: CPF validado (limpo): {val_cpf} len={len(str(val_cpf)) if val_cpf is not None else None}")
            except Exception:
                pass
            instance = serializer.save()
            try:
                print(f"DEBUG: CPF salvo no banco: {instance.cpf} len={len(str(instance.cpf)) if instance.cpf is not None else None}")
            except Exception:
                pass
            print(f"DEBUG: Inscrição criada: ID {instance.id}")
            
            # Email de confirmação de inscrição removido: enviaremos apenas email de pagamento
            
            # Criar automaticamente sessão de pagamento Stripe
            try:
                print("DEBUG: Criando sessão de pagamento Stripe...")
                # Detecta base_url do request para priorizar prod e cair para localhost quando aplicável
                try:
                    host = request.get_host() if hasattr(request, 'get_host') else ''
                except Exception:
                    host = ''
                scheme = 'https' if request.is_secure() else 'http'
                derived_base = f"{scheme}://{host}" if host else None
                # Pegar cupom dos dados da requisição com fallback para chaves alternativas e query params
                coupon_code = (
                    request.data.get('coupon_code')
                    or request.data.get('coupon')
                    or request.data.get('cupom')
                    or request.query_params.get('coupon_code')
                    or request.query_params.get('coupon')
                    or request.query_params.get('cupom')
                )
                try:
                    keys_list = list(getattr(request, 'data', {}).keys()) if hasattr(request, 'data') else []
                except Exception:
                    keys_list = []
                print(f"DEBUG VIEW: Keys em request.data: {keys_list}")
                print(f"DEBUG VIEW: Cupom recebido na view: '{coupon_code}' (tipo: {type(coupon_code)})")
                payment_result = create_stripe_checkout_session(instance, base_url=derived_base, coupon_code=coupon_code)
                print(f"DEBUG: Resultado do pagamento: {payment_result}")
                
                if payment_result['success']:
                    # Retorna os dados da inscrição + dados do pagamento
                    response_data = serializer.data
                    if payment_result.get('auto_paid'):
                        response_data['payment'] = {
                            'auto_paid': True,
                            'amount': 0.0
                        }
                    else:
                        response_data['payment'] = {
                            'checkout_url': payment_result['checkout_url'],
                            'session_id': payment_result['session_id'],
                            'amount': payment_result['amount']
                        }
                    
                    print(f"DEBUG: Resposta final: {response_data}")
                    headers = self.get_success_headers(serializer.data)
                    return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)
                else:
                    # Se falhou ao criar sessão, retorna erro mas mantém inscrição
                    error_response = {
                        'registration': serializer.data,
                        'error': 'Inscrição criada mas falha ao criar pagamento',
                        'payment_error': payment_result['error']
                    }
                    print(f"DEBUG: Erro no pagamento: {error_response}")
                    return Response(error_response, status=status.HTTP_201_CREATED)
                    
            except Exception as e:
                # Se falhou completamente, retorna só a inscrição
                print(f"DEBUG: Erro crítico no pagamento: {e}")
                import traceback
                traceback.print_exc()
                headers = self.get_success_headers(serializer.data)
                return Response({
                    'registration': serializer.data,
                    'error': 'Inscrição criada mas erro no sistema de pagamento',
                    'detailed_error': str(e)
                }, status=status.HTTP_201_CREATED, headers=headers)
                
        except Exception as e:
            print(f"DEBUG: Erro geral na view: {e}")
            import traceback
            traceback.print_exc()
            return Response({
                'error': 'Erro interno do servidor',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @extend_schema(
        tags=['corrida'],
        summary='Recuperar inscrição de corrida',
        description='Retorna uma inscrição específica de corrida',
        responses={
            200: RaceRegistrationSerializer,
            404: {'description': 'Não encontrado'},
        }
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        tags=['corrida'],
        summary='Atualizar inscrição de corrida',
        description='Atualiza uma inscrição existente de corrida',
        request=RaceRegistrationSerializer,
        responses={
            200: RaceRegistrationSerializer,
            400: {'description': 'Dados inválidos'},
            404: {'description': 'Não encontrado'},
        }
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @extend_schema(
        tags=['corrida'],
        summary='Excluir inscrição de corrida',
        description='Remove uma inscrição de corrida',
        responses={
            204: {'description': 'Sem conteúdo'},
            404: {'description': 'Não encontrado'},
        }
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)


@extend_schema(
    tags=['pagamento'],
    summary='Webhook de confirmação de pagamento',
    description='Endpoint para receber confirmações de pagamento e atualizar status',
    request={
        'type': 'object',
        'properties': {
            'registration_id': {'type': 'integer', 'description': 'ID da inscrição'},
            'payment_status': {'type': 'string', 'enum': ['PAID', 'PENDING'], 'description': 'Status do pagamento'},
            'payment_id': {'type': 'string', 'description': 'ID do pagamento no gateway'},
            'amount': {'type': 'number', 'description': 'Valor pago'},
        },
        'required': ['registration_id', 'payment_status']
    },
    responses={
        200: {
            'description': 'Pagamento processado com sucesso',
            'examples': [
                {
                    'application/json': {
                        'status': 'success',
                        'message': 'Pagamento confirmado com sucesso',
                        'registration_id': 123,
                        'payment_status': 'PAID'
                    }
                }
            ]
        },
        400: {'description': 'Dados inválidos'},
        404: {'description': 'Inscrição não encontrada'},
    }
)
@ratelimit(key='ip', rate='100/h', method='POST')
@api_view(['POST'])
@permission_classes([AllowAny])
def payment_webhook(request):
    """
    Webhook para processar confirmações de pagamento
    
    Recebe dados do gateway de pagamento e atualiza o status da inscrição.
    Se o pagamento for confirmado, envia email de confirmação de pagamento.
    """
    try:
        data = request.data
        registration_id = data.get('registration_id')
        payment_status = data.get('payment_status')
        payment_id = data.get('payment_id')
        amount = data.get('amount')
        
        if not registration_id or not payment_status:
            return Response({
                'status': 'error',
                'message': 'registration_id e payment_status são obrigatórios'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Busca a inscrição
        registration = get_object_or_404(RaceRegistration, id=registration_id)
        
        # Atualiza o status de pagamento
        old_status = registration.payment_status
        registration.payment_status = payment_status
        
        # Se o pagamento foi confirmado, gerar número de inscrição
        if payment_status == 'PAID' and not registration.registration_number:
            from .services import generate_unique_registration_number
            registration.registration_number = generate_unique_registration_number()
        
        registration.save(update_fields=['payment_status', 'registration_number', 'updated_at'])
        
        # Se o pagamento foi confirmado e ainda não enviou email de pagamento
        if payment_status == 'PAID' and not registration.payment_email_sent:
            try:
                send_payment_confirmation_email(registration)
            except Exception as e:
                print(f"Erro ao enviar email de confirmação de pagamento: {e}")
        
        return Response({
            'status': 'success',
            'message': f'Pagamento {payment_status.lower()} processado com sucesso',
            'registration_id': registration_id,
            'payment_status': payment_status,
            'old_status': old_status,
            'email_sent': registration.payment_email_sent if payment_status == 'PAID' else False
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Erro ao processar webhook: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    tags=['corrida'],
    summary='Estatísticas das inscrições',
    description='Retorna estatísticas gerais das inscrições de corrida incluindo status de pagamento',
    responses={
        200: {
            'description': 'Estatísticas das inscrições',
            'examples': [
                {
                    'application/json': {
                        'total_inscriptions': 150,
                        'male_count': 85,
                        'female_count': 65,
                        'inscriptions_today': 5,
                        'payment_stats': {
                            'pending': 30,
                            'paid': 120
                        },
                        'modality_stats': {
                            'infantil': 45,
                            'adulto': 105
                        },
                        'shirt_size_stats': {
                            'PP': 10,
                            'P': 25,
                            'M': 40,
                            'G': 35,
                            'GG': 25,
                            'XG': 10,
                            'XXG': 5
                        }
                    }
                }
            ]
        }
    }
)
@ratelimit(key='ip', rate='100/h', method='GET')
@api_view(['GET'])
def race_statistics(request):
    """
    Endpoint para estatísticas das inscrições de corrida
    """
    from django.utils import timezone
    
    today = timezone.now().date()
    
    # Estatísticas gerais
    total_inscriptions = RaceRegistration.objects.count()
    male_count = RaceRegistration.objects.filter(gender='M').count()
    female_count = RaceRegistration.objects.filter(gender='F').count()
    
    # Inscrições de hoje
    inscriptions_today = RaceRegistration.objects.filter(
        created_at__date=today
    ).count()
    
    # Estatísticas de pagamento
    payment_stats = {
        'pending': RaceRegistration.objects.filter(payment_status='PENDING').count(),
        'paid': RaceRegistration.objects.filter(payment_status='PAID').count(),
    }
    
    # Estatísticas por modalidade
    modality_stats = {
        'infantil': RaceRegistration.objects.filter(modality='INFANTIL').count(),
        'adulto': RaceRegistration.objects.filter(modality='ADULTO').count(),
    }
    
    # Estatísticas por tamanho de camisa
    shirt_size_stats = {}
    for size_code, size_name in RaceRegistration.SHIRT_SIZE_CHOICES:
        shirt_size_stats[size_name] = RaceRegistration.objects.filter(shirt_size=size_code).count()
    
    return Response({
        'total_inscriptions': total_inscriptions,
        'male_count': male_count,
        'female_count': female_count,
        'inscriptions_today': inscriptions_today,
        'payment_stats': payment_stats,
        'modality_stats': modality_stats,
        'shirt_size_stats': shirt_size_stats,
        'timestamp': timezone.now()
    })


@extend_schema(
    tags=['pagamento'],
    summary='Criar sessão de checkout do Stripe',
    description='Cria uma sessão de checkout do Stripe para pagamento da inscrição',
    request={
        'type': 'object',
        'properties': {
            'registration_id': {'type': 'integer', 'description': 'ID da inscrição'},
            'coupon_code': {'type': 'string', 'description': 'Código do cupom (opcional)'},
        },
        'required': ['registration_id']
    },
    responses={
        200: {
            'description': 'Sessão de checkout criada com sucesso',
            'examples': [
                {
                    'application/json': {
                        'success': True,
                        'checkout_url': 'https://checkout.stripe.com/pay/cs_test_...',
                        'session_id': 'cs_test_...',
                        'amount': 50.00
                    }
                }
            ]
        },
        400: {'description': 'Dados inválidos'},
        404: {'description': 'Inscrição não encontrada'},
    }
)
@ratelimit(key='ip', rate='5/m', method='POST')
@api_view(['POST'])
@permission_classes([AllowAny])
def create_payment_session(request):
    """
    Cria uma sessão de checkout do Stripe para pagamento da inscrição
    """
    try:
        registration_id = request.data.get('registration_id')
        coupon_code = request.data.get('coupon_code')
        
        if not registration_id:
            return Response({
                'success': False,
                'error': 'registration_id é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Buscar a inscrição
        try:
            registration = RaceRegistration.objects.get(id=registration_id)
        except RaceRegistration.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Inscrição não encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Verificar se já não está pago
        if registration.payment_status == 'PAID':
            return Response({
                'success': False,
                'error': 'Esta inscrição já foi paga'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Criar sessão de checkout
        result = create_stripe_checkout_session(registration, coupon_code=coupon_code)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    tags=['pagamento'],
    summary='Verificar status de pagamento',
    description='Verifica o status de uma sessão de checkout do Stripe',
    parameters=[
        {
            'name': 'session_id',
            'in': 'query',
            'description': 'ID da sessão de checkout do Stripe',
            'required': True,
            'type': 'string'
        }
    ],
    responses={
        200: {
            'description': 'Status do pagamento verificado',
            'examples': [
                {
                    'application/json': {
                        'success': True,
                        'payment_status': 'paid',
                        'amount_total': 5000,
                        'customer_email': 'usuario@email.com',
                        'registration_updated': True
                    }
                }
            ]
        },
        400: {'description': 'Parâmetros inválidos'},
        404: {'description': 'Sessão não encontrada'},
    }
)
@ratelimit(key='ip', rate='30/m', method='GET')
@api_view(['GET'])
@permission_classes([AllowAny])
def verify_payment_status(request):
    """
    Verifica o status de uma sessão de checkout do Stripe
    """
    try:
        session_id = request.query_params.get('session_id')
        
        if not session_id:
            return Response({
                'success': False,
                'error': 'session_id é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar sessão no Stripe
        result = verify_stripe_checkout_session(session_id)
        
        if not result['success']:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
        session = result['session']
        registration_updated = False
        
        # Se o pagamento foi concluído, atualizar a inscrição
        if session.payment_status == 'paid':
            registration_id = session.metadata.get('registration_id')
            
            if registration_id:
                try:
                    registration = RaceRegistration.objects.get(id=registration_id)
                    
                    if registration.payment_status != 'PAID':
                        registration.payment_status = 'PAID'
                        registration.payment_date = timezone.now()
                        if session.payment_intent:
                            registration.stripe_payment_intent_id = session.payment_intent
                        try:
                            amt_total = getattr(session, 'amount_total', None)
                            if amt_total is not None:
                                registration.payment_amount = (amt_total or 0) / 100.0
                        except Exception:
                            pass
                        
                        # Gerar número de inscrição único se ainda não existe
                        if not registration.registration_number:
                            from .services import generate_unique_registration_number
                            registration.registration_number = generate_unique_registration_number()
                        
                        registration.save(update_fields=[
                            'payment_status', 
                            'payment_date', 
                            'stripe_payment_intent_id',
                            'registration_number',
                            'payment_amount'
                        ])
                        
                        # Enviar email de confirmação se ainda não enviado
                        if not registration.payment_email_sent:
                            send_payment_confirmation_email(registration)
                        
                        registration_updated = True
                        
                except RaceRegistration.DoesNotExist:
                    pass
        
        return Response({
            'success': True,
            'payment_status': session.payment_status,
            'amount_total': session.amount_total,
            'customer_email': session.customer_email,
            'registration_updated': registration_updated
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    tags=['pagamento'],
    summary='Webhook do Stripe',
    description='Endpoint para receber eventos de webhook do Stripe',
    request={
        'type': 'object',
        'description': 'Evento do webhook do Stripe'
    },
    responses={
        200: {'description': 'Webhook processado com sucesso'},
        400: {'description': 'Dados inválidos ou assinatura inválida'},
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    """
    Endpoint para processar webhooks do Stripe
    """
    import stripe
    from django.conf import settings
    from django.http import HttpResponse
    
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET
    
    try:
        if endpoint_secret:
            # Verificar a assinatura do webhook
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        else:
            # Se não há secret configurado, aceitar qualquer evento (apenas para desenvolvimento)
            event = stripe.Event.construct_from(
                stripe.util.json.loads_object(payload), stripe.api_key
            )
        
        # Processar o evento
        result = process_stripe_webhook_event(event)
        
        if result['success']:
            return HttpResponse(status=200)
        else:
            print(f"Erro ao processar webhook: {result['error']}")
            return HttpResponse(status=400)
            
    except ValueError as e:
        print(f"Payload inválido: {e}")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        print(f"Assinatura inválida: {e}")
        return HttpResponse(status=400)
    except Exception as e:
        print(f"Erro geral no webhook: {e}")
        return HttpResponse(status=500)


@extend_schema(
    tags=['pagamento'],
    summary='Obter preços das modalidades',
    description='Retorna os preços das modalidades infantil e adulto',
    responses={
        200: {
            'description': 'Preços das modalidades',
            'examples': [
                {
                    'application/json': {
                        'INFANTIL': {
                            'amount': 3000,
                            'amount_brl': 30.00,
                            'description': 'Inscrição modalidade infantil'
                        },
                        'ADULTO': {
                            'amount': 5000,
                            'amount_brl': 50.00,
                            'description': 'Inscrição modalidade adulto'
                        }
                    }
                }
            ]
        }
    }
)
@api_view(['GET'])
@permission_classes([AllowAny])
def race_prices(request):
    """
    Retorna os preços das modalidades da corrida
    """
    return Response(get_race_prices())


@extend_schema(
    tags=['pagamento'],
    summary='Validar cupom de desconto',
    description='Valida um código de cupom e retorna o desconto aplicável',
    request={
        'type': 'object',
        'properties': {
            'coupon_code': {'type': 'string', 'description': 'Código do cupom'},
            'modality': {'type': 'string', 'enum': ['INFANTIL', 'ADULTO'], 'description': 'Modalidade da inscrição'},
        },
        'required': ['coupon_code']
    },
    responses={
        200: {
            'description': 'Cupom válido',
            'examples': [
                {
                    'application/json': {
                        'valid': True,
                        'discount_amount': 10.0,
                        'message': 'Cupom válido'
                    }
                }
            ]
        },
        400: {
            'description': 'Cupom inválido',
            'examples': [
                {
                    'application/json': {
                        'valid': False,
                        'discount_amount': 0,
                        'message': 'Cupom não encontrado'
                    }
                }
            ]
        }
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def validate_coupon(request):
    """
    Valida um código de cupom e retorna informações sobre o desconto
    """
    try:
        coupon_code = request.data.get('coupon_code', '').strip().upper()
        modality = request.data.get('modality')
        
        if not coupon_code:
            return Response({
                'valid': False,
                'discount_amount': 0,
                'message': 'Código do cupom é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar cupom usando a configuração fixa
        is_valid, message, discount_amount = validate_coupon_code(coupon_code, modality)
        
        if is_valid:
            return Response({
                'valid': True,
                'discount_amount': float(discount_amount),
                'message': message,
                'coupon_code': coupon_code.strip().upper()
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'valid': False,
                'discount_amount': 0,
                'message': message
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'valid': False,
            'discount_amount': 0,
            'message': f'Erro interno: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============== AbacatePay Endpoints ==============

@extend_schema(
    tags=['pagamento'],
    summary='Criar QR Code PIX via AbacatePay',
    description='Cria um QR Code PIX para pagamento da inscrição',
    request={
        'type': 'object',
        'properties': {
            'registration_id': {'type': 'integer', 'description': 'ID da inscrição'},
            'coupon_code': {'type': 'string', 'description': 'Código do cupom (opcional)'},
        },
        'required': ['registration_id']
    },
    responses={
        200: {
            'description': 'QR Code PIX criado com sucesso',
            'examples': [
                {
                    'application/json': {
                        'success': True,
                        'pix_id': 'pix_char_123456',
                        'br_code': '00020126...',
                        'br_code_base64': 'data:image/png;base64,...',
                        'amount': 50.00,
                        'expires_at': '2025-03-25T21:50:20.772Z',
                        'status': 'PENDING'
                    }
                }
            ]
        },
        400: {'description': 'Dados inválidos'},
        404: {'description': 'Inscrição não encontrada'},
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def create_pix_payment(request):
    """
    Cria um QR Code PIX via AbacatePay para pagamento da inscrição
    """
    try:
        registration_id = request.data.get('registration_id')
        coupon_code = request.data.get('coupon_code')
        
        if not registration_id:
            return Response({
                'success': False,
                'error': 'registration_id é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Buscar a inscrição
        try:
            registration = RaceRegistration.objects.get(id=registration_id)
        except RaceRegistration.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Inscrição não encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Verificar se já não está pago
        if registration.payment_status == 'PAID':
            return Response({
                'success': False,
                'error': 'Esta inscrição já foi paga'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Criar QR Code PIX
        result = create_abacatepay_pix(registration, coupon_code=coupon_code)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    tags=['pagamento'],
    summary='Simular pagamento PIX (dev)',
    description='Simula o pagamento de um PIX - apenas para desenvolvimento/teste',
    request={
        'type': 'object',
        'properties': {
            'pix_id': {'type': 'string', 'description': 'ID do PIX no AbacatePay'},
        },
        'required': ['pix_id']
    },
    responses={
        200: {
            'description': 'Pagamento simulado com sucesso',
            'examples': [
                {
                    'application/json': {
                        'success': True,
                        'status': 'PAID',
                        'pix_id': 'pix_char_123456'
                    }
                }
            ]
        },
        400: {'description': 'Dados inválidos'},
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def simulate_pix_payment(request):
    """
    Simula o pagamento de um PIX (apenas para desenvolvimento/teste)
    """
    try:
        pix_id = request.data.get('pix_id')
        
        if not pix_id:
            return Response({
                'success': False,
                'error': 'pix_id é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Simular pagamento
        result = simulate_abacatepay_payment(pix_id)
        
        if result['success'] and result['status'] == 'PAID':
            # Atualizar a inscrição de forma transacional e idempotente
            try:
                registration = RaceRegistration.objects.get(abacatepay_pix_id=pix_id)
                mark_registration_paid_atomic(registration.id)
            except RaceRegistration.DoesNotExist:
                pass
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    tags=['pagamento'],
    summary='Verificar status de pagamento PIX',
    description='Verifica o status de um pagamento PIX no AbacatePay',
    parameters=[
        {
            'name': 'pix_id',
            'in': 'query',
            'description': 'ID do PIX no AbacatePay',
            'required': True,
            'type': 'string'
        }
    ],
    responses={
        200: {
            'description': 'Status verificado com sucesso',
            'examples': [
                {
                    'application/json': {
                        'success': True,
                        'status': 'PAID',
                        'expires_at': '2025-03-25T21:50:20.772Z',
                        'registration_updated': True
                    }
                }
            ]
        },
        400: {'description': 'Parâmetros inválidos'},
    }
)
@api_view(['GET'])
@permission_classes([AllowAny])
def check_pix_status(request):
    """
    Verifica o status de um pagamento PIX
    """
    try:
        pix_id = request.query_params.get('pix_id')
        
        if not pix_id:
            return Response({
                'success': False,
                'error': 'pix_id é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar status
        result = check_abacatepay_payment_status(pix_id)
        
        if not result['success']:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
        registration_updated = False
        
        # Se o pagamento foi concluído, atualizar a inscrição
        if result['status'] == 'PAID':
            try:
                registration = RaceRegistration.objects.get(abacatepay_pix_id=pix_id)
                changed = mark_registration_paid_atomic(registration.id)
                registration_updated = changed or registration_updated
            except RaceRegistration.DoesNotExist:
                pass
        
        return Response({
            'success': True,
            'status': result['status'],
            'expires_at': result.get('expires_at'),
            'registration_updated': registration_updated
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
