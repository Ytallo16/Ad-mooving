#!/bin/bash

# Script para iniciar o ambiente de desenvolvimento Django

echo "🚀 Iniciando ambiente de desenvolvimento Django..."

# Verificar se o ambiente virtual existe
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
echo "🔧 Ativando ambiente virtual..."
source venv/bin/activate

# Instalar dependências
echo "📥 Instalando dependências..."
pip install -r requirements.txt

# Executar migrações
echo "🗄️ Executando migrações..."
python manage.py migrate

# Iniciar servidor
echo "🌐 Iniciando servidor Django..."
echo "📍 API disponível em: http://localhost:8000/api/"
echo "📍 Admin disponível em: http://localhost:8000/admin/"
echo "📍 Health Check disponível em: http://localhost:8000/api/health/"
echo ""
echo "⏹️ Pressione Ctrl+C para parar o servidor"
echo ""

python manage.py runserver 0.0.0.0:8000
