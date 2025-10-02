from django.core.cache import cache
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
import time
import logging

logger = logging.getLogger(__name__)


class RateLimitMiddleware(MiddlewareMixin):
    """
    Middleware personalizado para rate limiting
    Aplica limites diferentes para diferentes tipos de endpoints
    """
    
    def process_request(self, request):
        """
        Processa a requisição antes de chegar na view
        """
        # Aplicar rate limiting apenas em endpoints da API
        if not request.path.startswith('/api/'):
            return None
            
        # Pular rate limiting para health check
        if request.path == '/api/health/':
            return None
            
        # Obter IP do cliente
        ip = self.get_client_ip(request)
        
        # Aplicar rate limiting baseado no endpoint
        if self.should_apply_rate_limit(request):
            if not self.check_rate_limit(request, ip):
                logger.warning(f"Rate limit exceeded for IP {ip} on {request.path}")
                return JsonResponse({
                    'error': 'Rate limit exceeded',
                    'message': 'Muitas requisições. Tente novamente em alguns minutos.',
                    'retry_after': 60,
                    'status_code': 429
                }, status=429)
        
        return None
    
    def get_client_ip(self, request):
        """
        Obtém o IP real do cliente considerando proxies
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def should_apply_rate_limit(self, request):
        """
        Determina se deve aplicar rate limiting para esta requisição
        """
        # Aplicar rate limiting em endpoints sensíveis
        sensitive_paths = [
            '/api/race-registrations/',
            '/api/payment/',
            '/api/race-statistics/',
        ]
        
        return any(request.path.startswith(path) for path in sensitive_paths)
    
    def check_rate_limit(self, request, ip):
        """
        Verifica se o IP está dentro do limite de requisições
        """
        # Definir limites baseados no endpoint
        limits = self.get_rate_limits(request)
        
        for limit_type, (max_requests, window_seconds) in limits.items():
            key = f"rate_limit:{limit_type}:{ip}"
            
            # Obter contador atual
            current_requests = cache.get(key, 0)
            
            # Verificar se excedeu o limite
            if current_requests >= max_requests:
                return False
            
            # Incrementar contador
            cache.set(key, current_requests + 1, window_seconds)
        
        return True
    
    def get_rate_limits(self, request):
        """
        Retorna os limites de rate para o endpoint específico
        """
        path = request.path
        method = request.method
        
        # Limites por endpoint e método
        if path.startswith('/api/race-registrations/') and method == 'POST':
            return {'registration': (10, 3600)}  # 10 por hora
        
        elif path.startswith('/api/payment/create-session/') and method == 'POST':
            return {'payment_create': (5, 60)}  # 5 por minuto
        
        elif path.startswith('/api/payment/verify-status/') and method == 'GET':
            return {'payment_verify': (30, 60)}  # 30 por minuto
        
        elif path.startswith('/api/payment-webhook/') and method == 'POST':
            return {'webhook': (100, 3600)}  # 100 por hora
        
        elif path.startswith('/api/race-statistics/') and method == 'GET':
            return {'statistics': (100, 3600)}  # 100 por hora
        
        # Limite geral para outros endpoints da API
        return {'general': (1000, 3600)}  # 1000 por hora


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware para adicionar headers de segurança
    """
    
    def process_response(self, request, response):
        """
        Adiciona headers de segurança à resposta
        """
        # Rate limiting headers
        if hasattr(request, 'rate_limit_info'):
            response['X-RateLimit-Limit'] = request.rate_limit_info.get('limit', '')
            response['X-RateLimit-Remaining'] = request.rate_limit_info.get('remaining', '')
            response['X-RateLimit-Reset'] = request.rate_limit_info.get('reset', '')
        
        # Headers de segurança
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        
        # CORS headers (se necessário)
        if request.path.startswith('/api/'):
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        
        return response