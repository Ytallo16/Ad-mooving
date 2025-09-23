from django.http import JsonResponse
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
import json


class TokenAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware para validar token de autenticação fixo em todas as requisições da API
    """
    
    def process_request(self, request):
        # Pular autenticação para certas URLs
        skip_auth_paths = [
            '/admin/',
            '/api/docs/',
            '/api/redoc/',
            '/api/schema/',
            '/api/payment/stripe-webhook/',
            '/api/payment-webhook/',
        ]
        
        # Verificar se a URL atual deve pular a autenticação
        for path in skip_auth_paths:
            if request.path.startswith(path):
                return None
        
        # Verificar apenas requisições para a API
        if not request.path.startswith('/api/'):
            return None
        
        # Obter o token do header X-API-KEY
        token = request.headers.get('X-API-KEY') or request.META.get('HTTP_X_API_KEY')
        if not token:
            return JsonResponse({
                'error': 'Token de autenticação necessário',
                'message': 'Envie o header X-API-KEY com a chave de API válida.'
            }, status=401)
        
        # Verificar se o token é válido
        expected_token = getattr(settings, 'API_SECRET_KEY', None)
        if token != expected_token:
            return JsonResponse({
                'error': 'Token inválido',
                'message': 'O token fornecido não é válido'
            }, status=401)
        
        # Token válido, continuar com a requisição
        return None
