"""
Configurações específicas para testes
"""
import os
import sys

# Adicionar o diretório do backend ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Configurações de teste
TEST_SETTINGS = {
    'DEBUG': True,
    'SECRET_KEY': 'test-secret-key-for-testing-only',
    'ALLOWED_HOSTS': ['*'],
    
    # Banco de dados em memória para testes
    'DATABASES': {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    },
    
    # Cache em memória para testes
    'CACHES': {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        }
    },
    
    # Email em memória para testes
    'EMAIL_BACKEND': 'django.core.mail.backends.locmem.EmailBackend',
    'DEFAULT_FROM_EMAIL': 'test@admoving.com',
    
    # Rate limiting para testes
    'RATELIMIT_USE_CACHE': 'default',
    'RATELIMIT_VIEW': 'api.views.rate_limit_exceeded',
    
    # Stripe para testes
    'STRIPE_PUBLIC_KEY': 'pk_test_fake_key',
    'STRIPE_SECRET_KEY': 'sk_test_fake_key',
    'STRIPE_WEBHOOK_SECRET': 'whsec_fake_secret',
    
    # AbacatePay para testes
    'ABACATEPAY_API_KEY': 'test_fake_key',
    'ABACATEPAY_BASE_URL': 'https://api.abacatepay.com/v1',
    
    # Configurações de logging para testes
    'LOGGING': {
        'version': 1,
        'disable_existing_loggers': False,
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
            },
        },
        'loggers': {
            'api': {
                'handlers': ['console'],
                'level': 'WARNING',
            },
        },
    },
    
    # Desabilitar migrações para testes mais rápidos
    'MIGRATION_MODULES': {
        'api': None,
    },
    
    # Configurações de timezone para testes
    'USE_TZ': True,
    'TIME_ZONE': 'UTC',
    
    # Configurações de idioma para testes
    'LANGUAGE_CODE': 'pt-br',
    'USE_I18N': True,
    'USE_L10N': True,
}

# Aplicar configurações
for key, value in TEST_SETTINGS.items():
    globals()[key] = value
