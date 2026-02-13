#!/bin/sh
# Loop que verifica pagamentos PIX pendentes a cada 2 minutos.
# Roda como serviço separado no docker-compose.

echo "[check_pix] Iniciando verificação periódica de pagamentos PIX (a cada 120s)..."

# Aguardar o banco estar pronto (migrations rodarem no serviço principal)
sleep 15

while true; do
    python manage.py check_pending_pix 2>&1
    sleep 120
done
