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

# Detectar comando do Docker Compose (v1 ou v2)
if command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
elif docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    error "Docker Compose não está instalado. Instale 'docker-compose' ou 'docker compose'."
fi

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    error "Docker não está rodando. Por favor, inicie o Docker e tente novamente."
fi

# Verificar arquivos .env esperados (raiz usa compose com backend/.env e frontend/.env)
if [ ! -f "./backend/.env" ]; then
    error "Arquivo ./backend/.env não encontrado."
fi
if [ ! -f "./frontend/.env" ]; then
    warn "Arquivo ./frontend/.env não encontrado (VITE_*). O build do frontend pode usar apenas defaults."
fi

# Build do frontend ocorrerá apenas dentro do Dockerfile do frontend durante o docker compose build

# Função para parar containers existentes
stop_containers() {
    log "Parando containers existentes..."
    ${COMPOSE_CMD} down --remove-orphans || true
}

# Função para fazer pull das imagens mais recentes
pull_images() {
    log "Fazendo pull das imagens mais recentes..."
    ${COMPOSE_CMD} pull
}

# Função para iniciar os containers
start_containers() {
    log "Iniciando containers..."
    ${COMPOSE_CMD} up -d --build
    log "✅ Containers iniciados!"
}

# Função para mostrar logs
show_logs() {
    log "Mostrando logs dos containers..."
    ${COMPOSE_CMD} logs --tail=50
}

# Menu principal
case $ENVIRONMENT in
    "production")
        log "Iniciando deploy para PRODUÇÃO"
        stop_containers
        pull_images
        start_containers
        log "🎉 Deploy para produção concluído!"
        ;;
    "staging")
        log "Iniciando deploy para STAGING"
        stop_containers
        pull_images
        start_containers
        log "🎉 Deploy para staging concluído!"
        ;;
    "logs")
        show_logs
        ;;
    "status")
        ${COMPOSE_CMD} ps
        ;;
    *)
        echo "Uso: $0 [production|staging|logs|status]"
        echo ""
        echo "Comandos disponíveis:"
        echo "  production  - Deploy para produção"
        echo "  staging     - Deploy para staging"
        echo "  logs        - Mostrar logs"
        echo "  status      - Mostrar status dos containers"
        exit 1
        ;;
esac

log "Deploy script finalizado!"
