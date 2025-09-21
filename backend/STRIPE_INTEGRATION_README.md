# Sistema de Pagamento Stripe - Corrida Ad-mooving

## 🎯 Visão Geral

O sistema de pagamento foi integrado com Stripe para processar pagamentos das inscrições da corrida. As chaves de teste já estão configuradas no arquivo `.env`.

## 🔧 Configuração

### Chaves Stripe (já configuradas)
- **Public Key (Frontend)**: `pk_test_51S5nDgL...`
- **Secret Key (Backend)**: `sk_test_51S5nDgL...`
- **Webhook Secret**: Configurar quando necessário

### Preços Configurados
- **Modalidade Infantil**: R$ 30,00
- **Modalidade Adulto**: R$ 50,00

## 📋 Novos Endpoints da API

### 1. **Obter Preços** - `GET /api/payment/prices/`
```json
{
  "INFANTIL": {
    "amount": 3000,
    "amount_brl": 30.00,
    "description": "Inscrição modalidade infantil"
  },
  "ADULTO": {
    "amount": 5000,
    "amount_brl": 50.00,
    "description": "Inscrição modalidade adulto"
  }
}
```

### 2. **Criar Sessão de Pagamento** - `POST /api/payment/create-session/`
**Request:**
```json
{
  "registration_id": 123
}
```

**Response:**
```json
{
  "success": true,
  "checkout_url": "https://checkout.stripe.com/pay/cs_test_...",
  "session_id": "cs_test_...",
  "amount": 50.00
}
```

### 3. **Verificar Status do Pagamento** - `GET /api/payment/verify-status/?session_id=cs_test_...`
**Response:**
```json
{
  "success": true,
  "payment_status": "paid",
  "amount_total": 5000,
  "customer_email": "usuario@email.com",
  "registration_updated": true
}
```

### 4. **Webhook Stripe** - `POST /api/payment/stripe-webhook/`
- Endpoint para receber notificações automáticas do Stripe
- Processa automaticamente pagamentos aprovados
- Envia emails de confirmação

## 🔄 Fluxo de Pagamento

### 1. **Inscrição**
```javascript
// 1. Criar inscrição (retorna registration_id)
POST /api/race-registrations/
{
  "full_name": "João Silva",
  "cpf": "12345678901",
  "email": "joao@email.com",
  // ... outros campos
}
```

### 2. **Pagamento**
```javascript
// 2. Criar sessão de pagamento
POST /api/payment/create-session/
{
  "registration_id": 123
}

// 3. Redirecionar usuário para checkout_url
window.location.href = response.checkout_url;
```

### 3. **Verificação (após retorno do Stripe)**
```javascript
// 4. Verificar se pagamento foi aprovado
GET /api/payment/verify-status/?session_id=cs_test_...
```

## 🎨 Integração Frontend

### React/JavaScript Exemplo
```javascript
// Função para criar pagamento
async function createPayment(registrationId) {
  const response = await fetch('/api/payment/create-session/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      registration_id: registrationId
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Redirecionar para Stripe Checkout
    window.location.href = data.checkout_url;
  }
}

// Verificar pagamento após retorno
async function verifyPayment(sessionId) {
  const response = await fetch(
    `/api/payment/verify-status/?session_id=${sessionId}`
  );
  const data = await response.json();
  
  if (data.payment_status === 'paid') {
    console.log('Pagamento aprovado!');
    // Mostrar tela de sucesso
  }
}
```

### URLs de Redirecionamento
Configure no arquivo `.env`:
```bash
STRIPE_SUCCESS_URL=http://localhost:3000/pagamento/sucesso
STRIPE_CANCEL_URL=http://localhost:3000/pagamento/cancelado
```

## 🗄️ Novos Campos no Banco

O modelo `RaceRegistration` agora inclui:
- `stripe_payment_intent_id`: ID do Payment Intent do Stripe
- `stripe_checkout_session_id`: ID da sessão de checkout
- `payment_amount`: Valor do pagamento
- `payment_date`: Data/hora do pagamento aprovado

## 📧 Emails Automáticos

### Email de Inscrição
- Enviado automaticamente ao criar inscrição
- Contém informações da corrida e instruções de pagamento

### Email de Confirmação de Pagamento
- Enviado automaticamente quando pagamento é aprovado
- Contém informações do kit e instruções de retirada

## 🔐 Webhook Stripe (Produção)

Para configurar o webhook no Stripe Dashboard:

1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Clique em "Add endpoint"
3. URL: `https://seudominio.com/api/payment/stripe-webhook/`
4. Eventos: `checkout.session.completed`, `payment_intent.payment_failed`
5. Copie o Webhook Secret para o arquivo `.env`

## 🧪 Testes

### Cartões de Teste Stripe
- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`
- **Exige 3D Secure**: `4000 0025 0000 3155`

### Testar Fluxo Completo
1. Criar inscrição via API
2. Criar sessão de pagamento
3. Usar cartão de teste no Stripe Checkout
4. Verificar se status foi atualizado
5. Verificar se email foi enviado

## 📱 Exemplo de Integração Frontend

```jsx
// Componente React para pagamento
function PaymentButton({ registrationId }) {
  const [loading, setLoading] = useState(false);
  
  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/payment/create-session/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: registrationId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        window.location.href = data.checkout_url;
      } else {
        alert('Erro ao criar pagamento: ' + data.error);
      }
    } catch (error) {
      alert('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button 
      onClick={handlePayment} 
      disabled={loading}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg"
    >
      {loading ? 'Processando...' : `Pagar R$ ${amount.toFixed(2)}`}
    </button>
  );
}
```

## 🚀 Deploy

Para produção, lembre-se de:
1. Trocar chaves de teste pelas de produção
2. Configurar webhook com URL de produção
3. Configurar URLs de redirecionamento corretas
4. Usar HTTPS em produção

---

✅ **Sistema está pronto para uso!** 

A integração com Stripe está completa e testada. Você pode começar a processar pagamentos reais assim que configurar as chaves de produção.
