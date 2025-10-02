#!/bin/bash

# Script para executar testes no Docker
# Uso: ./test_docker.sh [tipo]

echo "🐳 EXECUTANDO TESTES NO DOCKER"
echo "================================"

# Verificar se container está rodando
if ! docker ps | grep -q "admooving_api"; then
    echo "❌ Container admooving_api não está rodando!"
    echo "Execute: docker-compose up -d"
    exit 1
fi

# Tipo de teste (padrão: quick)
TEST_TYPE=${1:-quick}

case $TEST_TYPE in
    "quick")
        echo "🚀 Executando teste rápido..."
        docker exec -it admooving_api python testes/quick_test.py
        ;;
    "all")
        echo "🧪 Executando todos os testes..."
        docker exec -it admooving_api python testes/run_tests.py
        ;;
    "models")
        echo "📊 Executando testes de models..."
        docker exec -it admooving_api python testes/run_tests.py --type specific --module test_models
        ;;
    "api")
        echo "🌐 Executando testes de API..."
        docker exec -it admooving_api python testes/run_tests.py --type specific --module test_api
        ;;
    "rate")
        echo "🛡️ Executando testes de rate limiting..."
        docker exec -it admooving_api python testes/run_tests.py --type specific --module test_rate_limiting
        ;;
    "integration")
        echo "🔗 Executando testes de integração..."
        docker exec -it admooving_api python testes/run_tests.py --type specific --module test_integration
        ;;
    "coverage")
        echo "📈 Executando testes com cobertura..."
        docker exec -it admooving_api python testes/run_tests.py --type coverage
        ;;
    "performance")
        echo "⚡ Executando testes de performance..."
        docker exec -it admooving_api python testes/run_tests.py --type performance
        ;;
    "shell")
        echo "🐚 Entrando no container..."
        docker exec -it admooving_api bash
        ;;
    *)
        echo "Uso: $0 [tipo]"
        echo ""
        echo "Tipos disponíveis:"
        echo "  quick        - Teste rápido (padrão)"
        echo "  all          - Todos os testes"
        echo "  models       - Testes de models"
        echo "  api          - Testes de API"
        echo "  rate         - Testes de rate limiting"
        echo "  integration  - Testes de integração"
        echo "  coverage     - Testes com cobertura"
        echo "  performance  - Testes de performance"
        echo "  shell        - Entrar no container"
        echo ""
        echo "Exemplos:"
        echo "  $0 quick      # Teste rápido"
        echo "  $0 all        # Todos os testes"
        echo "  $0 models     # Apenas models"
        exit 1
        ;;
esac

echo ""
echo "✅ Teste concluído!"
