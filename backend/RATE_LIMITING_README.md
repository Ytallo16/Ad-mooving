# 🛡️ RATE LIMITING - Ad-mooving

## 📋 Visão Geral

Sistema de rate limiting implementado para proteger a API contra abuso e garantir performance adequada.

## 🔧 Configuração

### Dependências Instaladas
- `django-ratelimit==4.1.0` - Biblioteca principal de rate limiting
- `django-redis==5.4.0` - Cache Redis para Django
- `redis==5.0.1` - Cliente Redis Python

### Redis
- **Desenvolvimento**: `redis://127.0.0.1:6379/1`
- **Produção**: Configurado via `REDIS_URL` no `.env`

## 📊 Limites Configurados

### Por Endpoint

| Endpoint | Método | Limite | Janela | Descrição |
|----------|--------|--------|--------|-----------|
| `/api/race-registrations/` | POST | 10 | 1 hora | Inscrições de corrida |
| `/api/payment/create-session/` | POST | 5 | 1 minuto | Criação de sessão de pagamento |
| `/api/payment/verify-status/` | GET | 30 | 1 minuto | Verificação de status |
| `/api/payment-webhook/` | POST | 100 | 1 hora | Webhooks de pagamento |
| `/api/race-statistics/` | GET | 100 | 1 hora | Estatísticas |
| `/api/health/` | GET | ∞ | - | Health check (sem limite) |

### Por IP
- **Identificação**: IP real do cliente (considera proxies)
- **Chave**: `rate_limit:{tipo}:{ip}`
- **Reset**: Automático após janela de tempo

## 🛠️ Implementação

### 1. Decorators nas Views
```python
from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='10/h', method='POST')
def create_registration(request):
    # Sua view aqui
    pass
```

### 2. Middleware Personalizado
- **RateLimitMiddleware**: Aplica limites baseados no endpoint
- **SecurityHeadersMiddleware**: Adiciona headers de segurança

### 3. Configuração no Settings
```python
# Redis Cache
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': config('REDIS_URL', default='redis://127.0.0.1:6379/1'),
    }
}

# Rate Limiting
RATELIMIT_USE_CACHE = 'default'
RATELIMIT_VIEW = 'api.views.rate_limit_exceeded'
```

## 🧪 Testando Rate Limits

### Script de Teste
```bash
cd backend
python test_rate_limits.py
```

### Teste Manual
```bash
# Testar inscrições (limite: 10/h)
for i in {1..15}; do
  curl -X POST http://localhost:8000/api/race-registrations/ \
    -H "Content-Type: application/json" \
    -d '{"full_name":"Teste","email":"test@test.com",...}'
  sleep 1
done
```

### Resposta de Rate Limit
```json
HTTP 429 Too Many Requests
{
  "error": "Rate limit exceeded",
  "message": "Muitas requisições. Tente novamente em alguns minutos.",
  "retry_after": 60,
  "status_code": 429
}
```

## 📈 Monitoramento

### Headers de Resposta
- `X-RateLimit-Limit`: Limite máximo
- `X-RateLimit-Remaining`: Requisições restantes
- `X-RateLimit-Reset`: Timestamp do reset

### Logs
```python
import logging
logger = logging.getLogger(__name__)

# Log automático quando rate limit é excedido
logger.warning(f"Rate limit exceeded for IP {ip} on {request.path}")
```

## 🔧 Configuração Avançada

### Ajustar Limites
Edite `RATE_LIMITS` no `settings.py`:
```python
RATE_LIMITS = {
    'registration': '20/h',    # Aumentar para 20/h
    'payment': '10/m',         # Aumentar para 10/m
}
```

### Whitelist de IPs
```python
# No middleware
WHITELIST_IPS = ['192.168.1.100', '10.0.0.1']

def should_apply_rate_limit(self, request):
    ip = self.get_client_ip(request)
    if ip in WHITELIST_IPS:
        return False
    return True
```

### Rate Limiting por Usuário
```python
@ratelimit(key='user', rate='50/h', method='POST')
def create_registration(request):
    # Limite por usuário autenticado
    pass
```

## 🚀 Deploy

### Docker Compose
```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  api:
    environment:
      - REDIS_URL=redis://redis:6379/1
    depends_on:
      - redis
```

### Variáveis de Ambiente
```bash
# .env
REDIS_URL=redis://localhost:6379/1
RATE_LIMIT_ENABLED=true
```

## ⚠️ Troubleshooting

### Redis não conecta
```bash
# Verificar se Redis está rodando
redis-cli ping

# Verificar logs do container
docker logs admooving_redis
```

### Rate limit muito restritivo
1. Ajustar limites no `settings.py`
2. Verificar logs para identificar padrões
3. Considerar whitelist para IPs confiáveis

### Performance
- Redis é muito rápido (sub-milissegundo)
- Impacto mínimo na performance
- Cache é limpo automaticamente

## 📚 Referências

- [django-ratelimit Documentation](https://github.com/Andrew-Chen-Wang/django-ratelimit)
- [django-redis Documentation](https://github.com/jazzband/django-redis)
- [Redis Documentation](https://redis.io/documentation)
