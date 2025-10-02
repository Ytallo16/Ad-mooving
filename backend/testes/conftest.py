"""
Configuração global para testes
"""
import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner

# Configurar Django para testes
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Configurações específicas para testes
TEST_SETTINGS = {
    'DEBUG': True,
    'DATABASES': {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    },
    'CACHES': {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        }
    },
    'EMAIL_BACKEND': 'django.core.mail.backends.locmem.EmailBackend',
    'SECRET_KEY': 'test-secret-key-for-testing',
    'ALLOWED_HOSTS': ['*'],
    'RATELIMIT_USE_CACHE': 'default',
}

# Aplicar configurações de teste
for key, value in TEST_SETTINGS.items():
    setattr(settings, key, value)
