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
pip install -r requirements.txt --break-system-packages

# Perguntar se quer limpar o banco de dados
echo ""
echo "🗄️ Configuração do Banco de Dados:"
echo "1) Manter banco existente (apenas executar migrações)"
echo "2) Limpar e recriar banco do zero"
echo ""
read -p "Escolha uma opção (1 ou 2): " db_option

case $db_option in
    2)
        echo "🗑️ Limpando banco de dados..."
        if [ -f "db.sqlite3" ]; then
            rm db.sqlite3
            echo "✅ Banco de dados removido"
        else
            echo "ℹ️ Banco de dados não existe"
        fi
        
        echo "🔄 Recriando banco de dados..."
        python3 manage.py migrate
        
        echo ""
        read -p "🔐 Deseja criar um superusuário? (y/n): " create_super
        if [[ $create_super == "y" || $create_super == "Y" ]]; then
            echo "👤 Criando superusuário..."
            python3 manage.py createsuperuser
        fi
        ;;
    1|*)
        echo "🗄️ Executando migrações..."
        python3 manage.py migrate
        ;;
esac

# Verificar se tudo está funcionando
echo ""
echo "🔍 Verificando sistema..."
python3 manage.py check

if [ $? -eq 0 ]; then
    echo "✅ Sistema verificado com sucesso!"
else
    echo "❌ Problemas encontrados no sistema!"
    exit 1
fi

# Mostrar estatísticas do banco (se existir)
if [ -f "db.sqlite3" ]; then
    echo ""
    echo "📊 Estatísticas do banco:"
    python3 manage.py shell -c "
from api.models import RaceRegistration
total = RaceRegistration.objects.count()
pending = RaceRegistration.objects.filter(payment_status='PENDING').count()
paid = RaceRegistration.objects.filter(payment_status='PAID').count()
print(f'📝 Total de inscrições: {total}')
print(f'⏳ Pendentes: {pending}')
print(f'✅ Pagas: {paid}')
" 2>/dev/null || echo "ℹ️ Banco vazio ou sem dados"
fi

# Iniciar servidor
echo ""
echo "🌐 Iniciando servidor Django..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 ENDPOINTS DISPONÍVEIS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 API Root:          http://localhost:8000/api/"
echo "📍 Admin:             http://localhost:8000/admin/"
echo "📍 Health Check:      http://localhost:8000/api/health/"
echo "📍 Swagger Docs:      http://localhost:8000/api/docs/"
echo "📍 ReDoc:             http://localhost:8000/api/redoc/"
echo "📍 Inscrições:        http://localhost:8000/api/race-registrations/"
echo "📍 Estatísticas:      http://localhost:8000/api/race-statistics/"
echo "📍 Webhook Pagamento: http://localhost:8000/api/payment-webhook/"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⏹️ Pressione Ctrl+C para parar o servidor"
echo ""

python3 manage.py runserver 0.0.0.0:8000
