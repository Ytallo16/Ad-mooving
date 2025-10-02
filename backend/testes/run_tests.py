#!/usr/bin/env python3
"""
Script para executar todos os testes do backend Ad-mooving
"""
import os
import sys
import subprocess
import time
from datetime import datetime

# Adicionar o diretório do backend ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from django.test.utils import get_runner
from django.conf import settings


class TestRunner:
    """Classe para executar e gerenciar testes"""
    
    def __init__(self):
        self.start_time = None
        self.end_time = None
        self.results = {}
    
    def print_header(self, title):
        """Imprime cabeçalho formatado"""
        print("\n" + "="*80)
        print(f" {title}")
        print("="*80)
    
    def print_section(self, title):
        """Imprime seção formatada"""
        print(f"\n🔍 {title}")
        print("-" * 60)
    
    def run_django_tests(self, test_module=None, verbosity=2):
        """Executa testes do Django"""
        TestRunner = get_runner(settings)
        test_runner = TestRunner(verbosity=verbosity, interactive=False)
        
        if test_module:
            test_labels = [f'testes.{test_module}']
        else:
            test_labels = ['testes']
        
        return test_runner.run_tests(test_labels)
    
    def run_specific_tests(self):
        """Executa testes específicos"""
        test_modules = [
            'test_models',
            'test_services', 
            'test_api',
            'test_rate_limiting',
            'test_integration'
        ]
        
        for module in test_modules:
            self.print_section(f"Executando {module}")
            
            try:
                result = self.run_django_tests(module, verbosity=1)
                self.results[module] = {
                    'status': 'PASSED' if result == 0 else 'FAILED',
                    'exit_code': result
                }
                
                if result == 0:
                    print(f"✅ {module}: PASSOU")
                else:
                    print(f"❌ {module}: FALHOU")
                    
            except Exception as e:
                print(f"❌ {module}: ERRO - {e}")
                self.results[module] = {
                    'status': 'ERROR',
                    'error': str(e)
                }
    
    def run_all_tests(self):
        """Executa todos os testes"""
        self.print_section("Executando TODOS os testes")
        
        try:
            result = self.run_django_tests(verbosity=2)
            self.results['all'] = {
                'status': 'PASSED' if result == 0 else 'FAILED',
                'exit_code': result
            }
            
            if result == 0:
                print("✅ TODOS OS TESTES: PASSARAM")
            else:
                print("❌ ALGUNS TESTES: FALHARAM")
                
        except Exception as e:
            print(f"❌ ERRO GERAL: {e}")
            self.results['all'] = {
                'status': 'ERROR',
                'error': str(e)
            }
    
    def run_coverage_tests(self):
        """Executa testes com cobertura de código"""
        self.print_section("Executando testes com cobertura")
        
        try:
            # Instalar coverage se não estiver instalado
            subprocess.run([sys.executable, '-m', 'pip', 'install', 'coverage'], 
                         check=True, capture_output=True)
            
            # Executar testes com coverage
            cmd = [
                sys.executable, '-m', 'coverage', 'run', '--source=api',
                'manage.py', 'test', 'testes'
            ]
            
            result = subprocess.run(cmd, cwd=os.path.dirname(__file__), 
                                  capture_output=True, text=True)
            
            if result.returncode == 0:
                # Gerar relatório de cobertura
                subprocess.run([sys.executable, '-m', 'coverage', 'report'], 
                             cwd=os.path.dirname(__file__))
                subprocess.run([sys.executable, '-m', 'coverage', 'html'], 
                             cwd=os.path.dirname(__file__))
                print("✅ Relatório de cobertura gerado em htmlcov/index.html")
            else:
                print(f"❌ Erro na execução: {result.stderr}")
                
        except Exception as e:
            print(f"❌ Erro no coverage: {e}")
    
    def run_performance_tests(self):
        """Executa testes de performance"""
        self.print_section("Executando testes de performance")
        
        try:
            # Teste de carga simples
            import requests
            import time
            
            base_url = "http://localhost:8000"
            
            # Verificar se API está rodando
            try:
                response = requests.get(f"{base_url}/api/health/", timeout=5)
                if response.status_code != 200:
                    print("⚠️ API não está rodando. Inicie com: python manage.py runserver")
                    return
            except:
                print("⚠️ API não está rodando. Inicie com: python manage.py runserver")
                return
            
            # Teste de performance
            print("Testando performance da API...")
            
            # Health check
            start_time = time.time()
            for _ in range(10):
                response = requests.get(f"{base_url}/api/health/")
            end_time = time.time()
            
            avg_time = (end_time - start_time) / 10
            print(f"Health check - Tempo médio: {avg_time:.3f}s")
            
            # Estatísticas
            start_time = time.time()
            for _ in range(5):
                response = requests.get(f"{base_url}/api/race-statistics/")
            end_time = time.time()
            
            avg_time = (end_time - start_time) / 5
            print(f"Estatísticas - Tempo médio: {avg_time:.3f}s")
            
            if avg_time < 1.0:
                print("✅ Performance: BOA")
            elif avg_time < 2.0:
                print("⚠️ Performance: ACEITÁVEL")
            else:
                print("❌ Performance: RUIM")
                
        except Exception as e:
            print(f"❌ Erro nos testes de performance: {e}")
    
    def print_summary(self):
        """Imprime resumo dos resultados"""
        self.print_header("RESUMO DOS TESTES")
        
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results.values() if r['status'] == 'PASSED')
        failed_tests = sum(1 for r in self.results.values() if r['status'] == 'FAILED')
        error_tests = sum(1 for r in self.results.values() if r['status'] == 'ERROR')
        
        print(f"📊 Total de módulos testados: {total_tests}")
        print(f"✅ Passou: {passed_tests}")
        print(f"❌ Falhou: {failed_tests}")
        print(f"💥 Erro: {error_tests}")
        
        if self.end_time and self.start_time:
            duration = self.end_time - self.start_time
            print(f"⏱️ Tempo total: {duration:.2f}s")
        
        print("\n📋 Detalhes por módulo:")
        for module, result in self.results.items():
            status_icon = "✅" if result['status'] == 'PASSED' else "❌" if result['status'] == 'FAILED' else "💥"
            print(f"  {status_icon} {module}: {result['status']}")
            if 'error' in result:
                print(f"      Erro: {result['error']}")
    
    def run(self, test_type='all'):
        """Executa os testes conforme o tipo especificado"""
        self.start_time = time.time()
        
        self.print_header("TESTES DO BACKEND AD-MOOVING")
        print(f"🕐 Início: {datetime.now().strftime('%H:%M:%S')}")
        print(f"🎯 Tipo: {test_type.upper()}")
        
        if test_type == 'all':
            self.run_all_tests()
        elif test_type == 'specific':
            self.run_specific_tests()
        elif test_type == 'coverage':
            self.run_coverage_tests()
        elif test_type == 'performance':
            self.run_performance_tests()
        else:
            print(f"❌ Tipo de teste inválido: {test_type}")
            print("Tipos válidos: all, specific, coverage, performance")
            return
        
        self.end_time = time.time()
        self.print_summary()


def main():
    """Função principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Executar testes do backend Ad-mooving')
    parser.add_argument('--type', choices=['all', 'specific', 'coverage', 'performance'],
                       default='all', help='Tipo de teste a executar')
    parser.add_argument('--module', help='Módulo específico para testar (apenas com --type specific)')
    
    args = parser.parse_args()
    
    runner = TestRunner()
    
    if args.type == 'specific' and args.module:
        runner.print_section(f"Executando apenas {args.module}")
        result = runner.run_django_tests(args.module)
        sys.exit(result)
    else:
        runner.run(args.type)


if __name__ == '__main__':
    main()
