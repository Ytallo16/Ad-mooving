#!/bin/bash

# Script de Deploy para Produção
# Uso: ./deploy.sh [environment]
# Exemplo: ./deploy.sh production

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="admooving"

echo "🚀 Iniciando deploy para ambiente: $ENVIRONMENT"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    error "Docker não está rodando. Por favor, inicie o Docker e tente novamente."
fi

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    error "Arquivo .env não encontrado. Por favor, crie o arquivo de configuração."
fi

# Função para parar containers existentes
stop_containers() {
    log "Parando containers existentes..."
    docker compose down --remove-orphans || true
}

# Função para fazer pull das imagens mais recentes
pull_images() {
    log "Fazendo pull das imagens mais recentes..."
    docker compose pull
}

# Função para iniciar os containers
start_containers() {
    log "Iniciando containers..."
    docker compose up -d
    
    # Aguardar os containers ficarem saudáveis
    log "Aguardando containers ficarem saudáveis..."
    sleep 30
    
    # Verificar status dos containers
    if docker ps | grep -q "admooving"; then
        log "✅ Containers iniciados com sucesso!"
    else
        error "❌ Falha ao iniciar containers"
    fi
}

# Função para verificar saúde dos serviços
health_check() {
    log "Verificando saúde dos serviços..."
    
    # Verificar backend
    if curl -f http://localhost:8000/api/health/ > /dev/null 2>&1; then
        log "✅ Backend está saudável"
    else
        warn "⚠️  Backend pode não estar respondendo corretamente"
    fi
    
    # Verificar frontend
    if curl -f http://localhost:3000/ > /dev/null 2>&1; then
        log "✅ Frontend está saudável"
    else
        warn "⚠️  Frontend pode não estar respondendo corretamente"
    fi
}

# Função para mostrar logs
show_logs() {
    log "Mostrando logs dos containers..."
    docker compose logs --tail=50
}

# Função para rollback
rollback() {
    log "Executando rollback..."
    # Aqui você pode implementar lógica de rollback
    # Por exemplo, voltar para uma versão anterior das imagens
    warn "Rollback não implementado ainda"
}

# Menu principal
case $ENVIRONMENT in
    "production")
        log "Iniciando deploy para PRODUÇÃO"
        stop_containers
        pull_images
        start_containers
        health_check
        log "🎉 Deploy para produção concluído!"
        ;;
    "staging")
        log "Iniciando deploy para STAGING"
        # Implementar lógica para staging se necessário
        warn "Deploy para staging não implementado ainda"
        ;;
    "rollback")
        rollback
        ;;
    "logs")
        show_logs
        ;;
    "status")
        docker compose ps
        ;;
    *)
        echo "Uso: $0 [production|staging|rollback|logs|status]"
        echo ""
        echo "Comandos disponíveis:"
        echo "  production  - Deploy para produção"
        echo "  staging     - Deploy para staging"
        echo "  rollback    - Fazer rollback"
        echo "  logs        - Mostrar logs"
        echo "  status      - Mostrar status dos containers"
        exit 1
        ;;
esac

log "Deploy script finalizado!"
