from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from django.db import models

from .models import ExampleModel, RaceRegistration
from .serializers import ExampleModelSerializer, RaceRegistrationSerializer
from .services import send_registration_confirmation_email

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
            'examples': reverse('api:example-list', request=request),
            'race_registrations': reverse('api:race-registration-list', request=request),
            'race_statistics': reverse('api:race_statistics', request=request),
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


@extend_schema(
    tags=['examples'],
    summary='Modelos de Exemplo',
    description='CRUD completo para modelos de exemplo da aplicação'
)
class ExampleModelViewSet(ModelViewSet):
    """
    ViewSet para gerenciar modelos de exemplo
    
    Permite criar, listar, atualizar e deletar modelos de exemplo.
    """
    queryset = ExampleModel.objects.all()
    serializer_class = ExampleModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    @extend_schema(
        summary='Listar modelos de exemplo',
        description='Retorna uma lista paginada de todos os modelos de exemplo',
        parameters=[
            OpenApiParameter(
                name='is_active',
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                description='Filtrar por status ativo',
                required=False
            ),
            OpenApiParameter(
                name='search',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Buscar por nome ou descrição',
                required=False
            )
        ],
        responses={
            200: ExampleModelSerializer(many=True),
            400: {'description': 'Parâmetros inválidos'},
        }
    )
    def list(self, request, *args, **kwargs):
        """
        Lista modelos de exemplo com filtros opcionais
        """
        queryset = self.get_queryset()
        
        # Filtro por status ativo
        is_active = request.query_params.get('is_active')
        if is_active is not None:
            if is_active.lower() == 'true':
                queryset = queryset.filter(is_active=True)
            elif is_active.lower() == 'false':
                queryset = queryset.filter(is_active=False)
        
        # Busca por nome ou descrição
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search) | 
                models.Q(description__icontains=search)
            )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary='Criar modelo de exemplo',
        description='Cria um novo modelo de exemplo',
        request=ExampleModelSerializer,
        responses={
            201: ExampleModelSerializer,
            400: {'description': 'Dados inválidos'},
        }
    )
    def create(self, request, *args, **kwargs):
        """
        Cria um novo modelo de exemplo
        """
        return super().create(request, *args, **kwargs)
    
    @extend_schema(
        summary='Recuperar modelo de exemplo',
        description='Retorna detalhes de um modelo de exemplo específico',
        responses={
            200: ExampleModelSerializer,
            404: {'description': 'Modelo não encontrado'},
        }
    )
    def retrieve(self, request, *args, **kwargs):
        """
        Recupera um modelo de exemplo específico
        """
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        summary='Atualizar modelo de exemplo',
        description='Atualiza um modelo de exemplo existente',
        request=ExampleModelSerializer,
        responses={
            200: ExampleModelSerializer,
            400: {'description': 'Dados inválidos'},
            404: {'description': 'Modelo não encontrado'},
        }
    )
    def update(self, request, *args, **kwargs):
        """
        Atualiza um modelo de exemplo
        """
        return super().update(request, *args, **kwargs)
    
    @extend_schema(
        summary='Deletar modelo de exemplo',
        description='Remove um modelo de exemplo da base de dados',
        responses={
            204: {'description': 'Modelo deletado com sucesso'},
            404: {'description': 'Modelo não encontrado'},
        }
    )
    def destroy(self, request, *args, **kwargs):
        """
        Deleta um modelo de exemplo
        """
        return super().destroy(request, *args, **kwargs)


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
    
    @extend_schema(
        tags=['corrida'],
        summary='Criar inscrição de corrida',
        description='Cria uma nova inscrição de corrida e envia email de confirmação',
        request=RaceRegistrationSerializer,
        responses={
            201: RaceRegistrationSerializer,
            400: {'description': 'Dados inválidos'},
            401: {'description': 'Não autorizado'},
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
                'Exemplo de inscrição - Adulto Feminino (Babylook)',
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
        Usa o comportamento padrão de criação; o envio do email ocorre em perform_create.
        """
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        instance = serializer.save()
        try:
            send_registration_confirmation_email(instance)
        except Exception:
            # Não interromper a criação se o email falhar
            pass
    
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
    tags=['corrida'],
    summary='Estatísticas das inscrições',
    description='Retorna estatísticas gerais das inscrições de corrida',
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
        'modality_stats': modality_stats,
        'shirt_size_stats': shirt_size_stats,
        'timestamp': timezone.now()
    })
