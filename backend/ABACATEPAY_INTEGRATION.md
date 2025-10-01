# Integração AbacatePay - Pagamento via PIX

Este documento descreve como funciona a integração com AbacatePay para pagamentos via PIX na aplicação Ad-moving.

## Configuração

### Variáveis de Ambiente

Adicione as seguintes variáveis no seu arquivo `.env`:

```bash
# AbacatePay API Key
ABACATEPAY_API_KEY=abc_dev_B56yaqbnxKKqUat1hM1qTX4y

# AbacatePay Base URL (padrão)
ABACATEPAY_BASE_URL=https://api.abacatepay.com/v1
```

**Nota:** A chave de API fornecida é para ambiente de desenvolvimento/teste. Para produção, você precisa obter uma chave real no painel do AbacatePay.

## Migração do Banco de Dados

Para aplicar as migrações necessárias:

```bash
cd backend
source venv/bin/activate
python manage.py migrate
```

## Como Funciona

### Fluxo de Pagamento PIX

1. **Usuário se inscreve**: O usuário preenche o formulário de inscrição
2. **Seleciona PIX**: Na modal de pagamento, o usuário escolhe "PIX"
3. **QR Code é gerado**: Backend chama API do AbacatePay e gera QR Code
4. **Usuário paga**: Usuário escaneia o QR Code ou copia o código PIX
5. **Polling automático**: Frontend verifica status a cada 3 segundos
6. **Confirmação**: Quando pagamento é detectado, inscrição é atualizada
7. **Redirecionamento**: Usuário é redirecionado para página de sucesso

### Endpoints da API

#### 1. Criar QR Code PIX

```
POST /api/payment/pix/create/
```

**Payload:**
```json
{
  "registration_id": 123,
  "coupon_code": "AD10"  // opcional
}
```

**Resposta:**
```json
{
  "success": true,
  "pix_id": "pix_char_123456",
  "br_code": "00020126...",
  "br_code_base64": "data:image/png;base64,...",
  "amount": 50.00,
  "expires_at": "2025-03-25T21:50:20.772Z",
  "status": "PENDING"
}
```

#### 2. Verificar Status do PIX

```
GET /api/payment/pix/check-status/?pix_id=pix_char_123456
```

**Resposta:**
```json
{
  "success": true,
  "status": "PAID",
  "expires_at": "2025-03-25T21:50:20.772Z",
  "registration_updated": true
}
```

#### 3. Simular Pagamento (Apenas Dev)

```
POST /api/payment/pix/simulate/
```

**Payload:**
```json
{
  "pix_id": "pix_char_123456"
}
```

**Resposta:**
```json
{
  "success": true,
  "status": "PAID",
  "pix_id": "pix_char_123456"
}
```

## Testando a Integração

### Teste Completo (Frontend + Backend)

1. **Iniciar o Backend:**
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

2. **Iniciar o Frontend:**
```bash
cd frontend
npm run dev
# ou
bun dev
```

3. **Acessar a aplicação:**
   - Abra `http://localhost:8080` (ou porta do Vite)
   - Preencha o formulário de inscrição
   - Clique em "Finalizar Inscrição"
   - Selecione "PIX" na modal de pagamento
   - Clique em "Continuar com PIX"

4. **Testar o pagamento:**

   **Opção A - Manual via API:**
   ```bash
   # Obtenha o pix_id do QR Code exibido no frontend
   # Então simule o pagamento:
   curl -X POST http://localhost:8000/api/payment/pix/simulate/ \
     -H "Content-Type: application/json" \
     -d '{"pix_id": "pix_char_SEU_ID_AQUI"}'
   ```

   **Opção B - Via navegador:**
   - Copie o `pix_id` exibido no console do navegador
   - Use uma ferramenta como Postman ou Thunder Client
   - Faça uma requisição POST para `/api/payment/pix/simulate/`

5. **Verificar confirmação:**
   - O frontend detectará automaticamente o pagamento
   - Mensagem de sucesso será exibida
   - Usuário será redirecionado para página de sucesso

### Teste Apenas Backend (API)

1. **Criar uma inscrição:**
```bash
curl -X POST http://localhost:8000/api/race-registrations/ \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "João Silva",
    "cpf": "12345678901",
    "email": "joao@teste.com",
    "phone": "11999999999",
    "birth_date": "1990-01-01",
    "gender": "M",
    "modality": "ADULTO",
    "course": "RUN_5K",
    "shirt_size": "M",
    "athlete_declaration": true
  }'
```

2. **Criar QR Code PIX:**
```bash
# Use o ID da inscrição retornado no passo anterior
curl -X POST http://localhost:8000/api/payment/pix/create/ \
  -H "Content-Type: application/json" \
  -d '{"registration_id": 1}'
```

3. **Simular pagamento:**
```bash
# Use o pix_id retornado no passo anterior
curl -X POST http://localhost:8000/api/payment/pix/simulate/ \
  -H "Content-Type: application/json" \
  -d '{"pix_id": "pix_char_XXXXX"}'
```

4. **Verificar status:**
```bash
curl -X GET "http://localhost:8000/api/payment/pix/check-status/?pix_id=pix_char_XXXXX"
```

## Recursos Implementados

### Backend

✅ Serviço de integração com AbacatePay (`services.py`)
✅ Criação de QR Code PIX com desconto de cupom
✅ Verificação de status de pagamento
✅ Simulação de pagamento para testes
✅ Atualização automática da inscrição ao confirmar pagamento
✅ Envio de email de confirmação
✅ Geração de número de inscrição único
✅ Campo `abacatepay_pix_id` no modelo RaceRegistration

### Frontend

✅ Modal de pagamento com opções Card e PIX
✅ Exibição de QR Code PIX
✅ Código PIX copia-e-cola
✅ Polling automático de status (3 em 3 segundos)
✅ Feedback visual de status (aguardando/verificando/confirmado)
✅ Redirecionamento automático após confirmação
✅ Suporte a cupons de desconto no PIX

## Produção

Para usar em produção:

1. **Obtenha uma chave de API real:**
   - Acesse o painel do AbacatePay
   - Gere uma chave de API de produção
   - Atualize a variável `ABACATEPAY_API_KEY` no `.env`

2. **Desabilite o endpoint de simulação:**
   - Comente ou remova o endpoint `simulate_pix_payment` em produção
   - Ou adicione verificação de ambiente:
   ```python
   if not settings.DEBUG:
       return Response({'error': 'Endpoint não disponível em produção'}, status=403)
   ```

3. **Configure Webhooks (opcional):**
   - AbacatePay pode enviar webhooks para notificar pagamentos
   - Configure um endpoint webhook se necessário

## Suporte

Para mais informações sobre a API do AbacatePay:
- Documentação: https://docs.abacatepay.com
- Suporte: contato@abacatepay.com

## Observações

- **Tempo de expiração:** QR Codes expiram em 1 hora (3600 segundos)
- **Polling:** Frontend verifica status a cada 3 segundos
- **Valor mínimo:** Não há valor mínimo definido pela integração
- **Cupons:** Sistema de cupons funciona tanto para cartão quanto para PIX
- **Ambiente de teste:** A chave padrão é para desenvolvimento/teste

