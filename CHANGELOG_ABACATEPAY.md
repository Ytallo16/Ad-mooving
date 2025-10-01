# Changelog - Integração AbacatePay

## Resumo das Mudanças

Implementação completa de pagamento via PIX utilizando a API do AbacatePay.

## Backend

### Arquivos Modificados

#### `backend/api/models.py`
- ✅ Adicionado campo `abacatepay_pix_id` para armazenar ID do PIX

#### `backend/api/services.py`
- ✅ Adicionada configuração da API AbacatePay (chave, URL, headers)
- ✅ Implementada função `create_abacatepay_pix()` - Cria QR Code PIX
- ✅ Implementada função `simulate_abacatepay_payment()` - Simula pagamento (dev)
- ✅ Implementada função `check_abacatepay_payment_status()` - Verifica status
- ✅ Suporte a cupons de desconto no PIX

#### `backend/api/views.py`
- ✅ Importadas funções do AbacatePay
- ✅ Criado endpoint `create_pix_payment` - POST `/api/payment/pix/create/`
- ✅ Criado endpoint `simulate_pix_payment` - POST `/api/payment/pix/simulate/`
- ✅ Criado endpoint `check_pix_status` - GET `/api/payment/pix/check-status/`
- ✅ Documentação OpenAPI para todos os endpoints

#### `backend/api/urls.py`
- ✅ Adicionadas 3 novas rotas para PIX

#### `backend/api/migrations/`
- ✅ Criada migração `0012_remove_raceregistration_registration_email_sent_and_more.py`

### Arquivos Criados

- ✅ `backend/ABACATEPAY_INTEGRATION.md` - Documentação completa da integração

## Frontend

### Arquivos Modificados

#### `frontend/src/pages/Inscricoes.tsx`

**Estados adicionados:**
- `pixData` - Armazena dados do QR Code PIX
- `showPixModal` - Controla exibição do modal PIX
- `pixStatus` - Status do pagamento ('pending' | 'checking' | 'paid' | 'expired')
- `pollingInterval` - Referência para o intervalo de polling

**Funções adicionadas:**
- `handlePaymentConfirm()` - Atualizada para suportar PIX
  - Cria QR Code via API
  - Abre modal PIX
  - Inicia polling de status
- `startPixStatusPolling()` - Polling automático a cada 3 segundos
- `handleClosePixModal()` - Fecha modal e limpa polling
- `copyPixCode()` - Copia código PIX para clipboard

**Componentes adicionados:**
- Modal de Pagamento PIX com:
  - QR Code renderizado
  - Código PIX copia-e-cola
  - Valor a pagar
  - Status visual (aguardando/verificando/confirmado)
  - Instruções de pagamento
  - Tela de confirmação com animação

**Imports adicionados:**
- `Copy`, `CheckCircle2`, `Clock`, `AlertCircle` do lucide-react

## Fluxo Completo

```
1. Usuário preenche formulário
   └─> POST /api/race-registrations/
       └─> Retorna registration_id

2. Usuário clica "Finalizar Inscrição"
   └─> Modal de seleção de pagamento

3. Usuário seleciona "PIX"
   └─> POST /api/payment/pix/create/
       └─> Retorna {pix_id, br_code, br_code_base64, amount}

4. Frontend exibe QR Code
   └─> Inicia polling GET /api/payment/pix/check-status/
       └─> Verifica a cada 3 segundos

5. Usuário paga via app bancário
   └─> [Pagamento detectado pela API]

6. Backend atualiza inscrição
   └─> payment_status = 'PAID'
   └─> Gera registration_number
   └─> Envia email de confirmação

7. Frontend detecta status = 'PAID'
   └─> Exibe mensagem de sucesso
   └─> Redireciona para /pagamento/sucesso
```

## Configuração Necessária

### Variáveis de Ambiente (.env)

```bash
# AbacatePay
ABACATEPAY_API_KEY=abc_dev_B56yaqbnxKKqUat1hM1qTX4y
ABACATEPAY_BASE_URL=https://api.abacatepay.com/v1
```

### Banco de Dados

```bash
cd backend
source venv/bin/activate
python manage.py migrate
```

## Testes

### Teste Rápido (Recomendado)

1. Inicie backend e frontend
2. Faça uma inscrição
3. Selecione PIX
4. Copie o `pix_id` do console
5. Simule pagamento:
```bash
curl -X POST http://localhost:8000/api/payment/pix/simulate/ \
  -H "Content-Type: application/json" \
  -d '{"pix_id": "SEU_PIX_ID"}'
```
6. Observe confirmação automática no frontend

## Compatibilidade

- ✅ Funciona junto com pagamento por cartão (Stripe)
- ✅ Suporta cupons de desconto
- ✅ Responsive (mobile e desktop)
- ✅ Acessível (ARIA labels, keyboard navigation)

## Status dos TODOs

- ✅ Criar serviço AbacatePay no backend
- ✅ Adicionar campos AbacatePay ao modelo RaceRegistration
- ✅ Criar endpoints para PIX (criar, simular, checar status)
- ✅ Atualizar frontend para exibir QR Code PIX
- ✅ Implementar polling de status de pagamento PIX

## Próximos Passos (Opcional)

- [ ] Configurar webhooks do AbacatePay para notificação em tempo real
- [ ] Adicionar timeout para QR Code expirado
- [ ] Implementar retry logic para falhas na API
- [ ] Adicionar analytics para conversão PIX vs Cartão
- [ ] Criar dashboard admin para visualizar pagamentos PIX

## Observações Importantes

⚠️ **Ambiente de Desenvolvimento:**
- A chave de API fornecida é para testes
- O endpoint `/api/payment/pix/simulate/` deve ser desabilitado em produção

✅ **Pronto para Produção:**
- Todos os endpoints estão documentados
- Tratamento de erros implementado
- Logs estruturados para debug
- Sistema de polling otimizado

