#!/usr/bin/env python3
"""
Teste simples para verificar se o backend está funcionando
"""
import os
import sys
import django
from django.test import TestCase, Client

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def test_basic_functionality():
    """Teste básico de funcionalidade"""
    print("🚀 TESTE BÁSICO DO BACKEND")
    print("=" * 40)
    
    client = Client()
    
    # Teste 1: Health Check
    try:
        response = client.get('/api/health/')
        if response.status_code == 200:
            print("✅ Health Check: OK")
        else:
            print(f"❌ Health Check: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health Check: {e}")
        return False
    
    # Teste 2: API Root
    try:
        response = client.get('/api/')
        if response.status_code == 200:
            print("✅ API Root: OK")
        else:
            print(f"❌ API Root: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API Root: {e}")
        return False
    
    # Teste 3: Estatísticas
    try:
        response = client.get('/api/race-statistics/')
        if response.status_code == 200:
            print("✅ Estatísticas: OK")
        else:
            print(f"❌ Estatísticas: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Estatísticas: {e}")
        return False
    
    print("\n🎉 TODOS OS TESTES BÁSICOS PASSARAM!")
    return True

if __name__ == '__main__':
    success = test_basic_functionality()
    sys.exit(0 if success else 1)
