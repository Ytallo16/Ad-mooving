# 🧪 TESTES DO BACKEND AD-MOOVING

## 📋 Visão Geral

Suite completa de testes para o backend da aplicação Ad-mooving, incluindo testes unitários, de integração, API e rate limiting.

## 📁 Estrutura dos Testes

```
testes/
├── __init__.py              # Inicialização do pacote
├── conftest.py              # Configuração global
├── test_settings.py         # Configurações específicas para testes
├── run_tests.py             # Script executor de testes
├── README.md                # Este arquivo
├── test_models.py           # Testes unitários dos models
├── test_services.py         # Testes unitários dos services
├── test_api.py              # Testes de API endpoints
├── test_rate_limiting.py    # Testes de rate limiting
└── test_integration.py      # Testes de integração
```

## 🚀 Como Executar

### **1. Executar Todos os Testes**
```bash
cd backend
python testes/run_tests.py
```

### **2. Executar Testes Específicos**
```bash
# Apenas testes de models
python testes/run_tests.py --type specific --module test_models

# Apenas testes de API
python testes/run_tests.py --type specific --module test_api

# Apenas testes de rate limiting
python testes/run_tests.py --type specific --module test_rate_limiting
```

### **3. Executar com Cobertura**
```bash
python testes/run_tests.py --type coverage
```

### **4. Executar Testes de Performance**
```bash
# Primeiro inicie o servidor
python manage.py runserver

# Em outro terminal, execute os testes de performance
python testes/run_tests.py --type performance
```

### **5. Usando Django Test Runner**
```bash
# Todos os testes
python manage.py test testes

# Teste específico
python manage.py test testes.test_models

# Com verbosidade
python manage.py test testes --verbosity=2
```

## 📊 Tipos de Testes

### **1. Testes Unitários (test_models.py)**
- ✅ Criação de inscrições válidas
- ✅ Validação de campos obrigatórios
- ✅ Cálculo de idade
- ✅ Derivação de modalidade
- ✅ Escolhas de gênero e tamanho
- ✅ Campos de cupom e pagamento
- ✅ Representação string do modelo

### **2. Testes de Services (test_services.py)**
- ✅ Validação de cupons
- ✅ Envio de emails de confirmação
- ✅ Geração de números de inscrição
- ✅ Marcação de pagamento
- ✅ Integração com Stripe
- ✅ Tratamento de erros

### **3. Testes de API (test_api.py)**
- ✅ Health check
- ✅ Criação de inscrições
- ✅ Validação de dados
- ✅ Listagem de inscrições
- ✅ Estatísticas
- ✅ Endpoints de pagamento
- ✅ Validação de cupons
- ✅ Webhooks

### **4. Testes de Rate Limiting (test_rate_limiting.py)**
- ✅ Limite de inscrições (10/h)
- ✅ Limite de pagamentos (5/m)
- ✅ Limite de estatísticas (100/h)
- ✅ Limite de webhooks (100/h)
- ✅ Health check sem limite
- ✅ Reset após janela de tempo
- ✅ Diferentes IPs independentes
- ✅ Requisições concorrentes

### **5. Testes de Integração (test_integration.py)**
- ✅ Fluxo completo de pagamento
- ✅ Pagamento com cupom
- ✅ Pagamento PIX
- ✅ Notificações por email
- ✅ Tratamento de erros
- ✅ Inscrições concorrentes
- ✅ Consistência do banco
- ✅ Precisão das estatísticas
- ✅ Performance da API
- ✅ Headers CORS
- ✅ Tratamento de Unicode

## 🔧 Configuração

### **Configurações de Teste**
- **Banco**: SQLite em memória
- **Cache**: LocMemCache
- **Email**: Backend em memória
- **Stripe**: Chaves de teste
- **Rate Limiting**: Habilitado

### **Variáveis de Ambiente**
```bash
# Para testes de performance (opcional)
export API_BASE_URL=http://localhost:8000
```

## 📈 Cobertura de Código

### **Executar com Cobertura**
```bash
python testes/run_tests.py --type coverage
```

### **Ver Relatório**
```bash
# Abrir relatório HTML
open htmlcov/index.html

# Ver relatório no terminal
coverage report
```

## 🐛 Debugging

### **Executar Teste Específico com Debug**
```bash
python manage.py test testes.test_models.RaceRegistrationModelTest.test_create_valid_registration --verbosity=2
```

### **Executar com PDB (Python Debugger)**
```bash
python -m pdb manage.py test testes.test_models
```

### **Logs de Teste**
```bash
# Com logs detalhados
python manage.py test testes --verbosity=3 --debug-mode
```

## 📋 Checklist de Testes

### **Antes de Fazer Deploy**
- [ ] Todos os testes passam
- [ ] Cobertura > 80%
- [ ] Testes de performance OK
- [ ] Rate limiting funcionando
- [ ] Integração com Stripe OK
- [ ] Emails sendo enviados
- [ ] Banco de dados consistente

### **Testes Críticos**
- [ ] Criação de inscrição
- [ ] Processamento de pagamento
- [ ] Envio de email de confirmação
- [ ] Rate limiting ativo
- [ ] Validação de dados
- [ ] Tratamento de erros

## 🚨 Troubleshooting

### **Problema: Testes não executam**
```bash
# Verificar se Django está configurado
python manage.py check

# Verificar se dependências estão instaladas
pip install -r requirements.txt
```

### **Problema: Rate limiting não funciona nos testes**
```bash
# Limpar cache
python manage.py shell -c "from django.core.cache import cache; cache.clear()"
```

### **Problema: Testes de performance falham**
```bash
# Verificar se API está rodando
curl http://localhost:8000/api/health/

# Iniciar servidor se necessário
python manage.py runserver
```

### **Problema: Banco de dados não limpa**
```bash
# Forçar limpeza
python manage.py flush --noinput
```

## 📚 Referências

- [Django Testing](https://docs.djangoproject.com/en/stable/topics/testing/)
- [Django TestCase](https://docs.djangoproject.com/en/stable/topics/testing/tools/#django.test.TestCase)
- [Coverage.py](https://coverage.readthedocs.io/)
- [Mock Library](https://docs.python.org/3/library/unittest.mock.html)

## 🎯 Próximos Passos

1. **Testes E2E**: Implementar testes end-to-end com Selenium
2. **Testes de Carga**: Adicionar testes de carga com Locust
3. **Testes de Segurança**: Implementar testes de segurança
4. **CI/CD**: Integrar com GitHub Actions
5. **Monitoramento**: Adicionar métricas de teste
