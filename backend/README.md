## Autenticação

No momento, a API não exige token para acessar as rotas públicas sob `/api/`.

Boas práticas:

- Use HTTPS em produção.
- Restrinja `ALLOWED_HOSTS` e CORS conforme o ambiente.
# Backend Django - Ad-mooving

Backend da aplicação Ad-mooving desenvolvido com Django e Django REST Framework, incluindo documentação automática com Swagger.

## 🚀 Tecnologias

- **Django 5.2.5** - Framework web Python
- **Django REST Framework** - Framework para APIs REST
- **Django CORS Headers** - Middleware para CORS
- **DRF Spectacular** - Geração automática de documentação OpenAPI/Swagger
- **Python 3.x** - Linguagem de programação

## 📋 Pré-requisitos

- Python 3.8+
- pip (gerenciador de pacotes Python)

## 🛠️ Instalação

1. **Clone o repositório e navegue até a pasta backend:**
   ```bash
   cd backend
   ```

2. **Crie um ambiente virtual:**
   ```bash
   python3 -m venv venv
   ```

3. **Ative o ambiente virtual:**
   ```bash
   # Linux/Mac
   source venv/bin/activate
   
   # Windows
   venv\Scripts\activate
   ```

4. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Execute as migrações:**
   ```bash
   python manage.py migrate
   ```

6. **Crie um superusuário (opcional):**
   ```bash
   python manage.py createsuperuser
   ```

## 🚀 Executando o projeto

1. **Ative o ambiente virtual:**
   ```bash
   source venv/bin/activate
   ```

2. **Execute o servidor de desenvolvimento:**
   ```bash
   python manage.py runserver
   ```

3. **Acesse a aplicação:**
   - **Swagger UI**: http://localhost:8000/api/docs/ (Documentação interativa)
   - **ReDoc**: http://localhost:8000/api/redoc/ (Documentação alternativa)
   - **Schema OpenAPI**: http://localhost:8000/api/schema/
   - **API**: http://localhost:8000/api/
   - **Admin**: http://localhost:8000/admin/
   - **Health Check**: http://localhost:8000/api/health/

## 📚 Endpoints da API

### 🔍 **Endpoints Principais**
- **GET `/api/`** - Endpoint raiz da API
- **GET `/api/health/`** - Verificação de saúde da API

### 📝 **Modelos de Exemplo (CRUD completo)**
- **GET `/api/examples/`** - Listar todos os modelos
- **POST `/api/examples/`** - Criar novo modelo
- **GET `/api/examples/{id}/`** - Recuperar modelo específico
- **PUT `/api/examples/{id}/`** - Atualizar modelo
- **DELETE `/api/examples/{id}/`** - Deletar modelo

### 📖 **Documentação**
- **GET `/api/docs/`** - Interface Swagger UI
- **GET `/api/redoc/`** - Interface ReDoc
- **GET `/api/schema/`** - Schema OpenAPI em JSON

## 🔧 Configurações

- **DEBUG:** True (desenvolvimento)
- **LANGUAGE_CODE:** pt-br
- **TIME_ZONE:** America/Sao_Paulo
- **CORS:** Configurado para frontend (localhost:3000, localhost:5173)
- **Swagger:** Configurado com DRF Spectacular

## 📁 Estrutura do Projeto

```
backend/
├── api/                 # App principal da API
│   ├── models.py       # Modelos de dados
│   ├── serializers.py  # Serializers para a API
│   ├── views.py        # Views da API
│   ├── urls.py         # URLs do app
│   └── admin.py        # Configuração do admin
├── backend/            # Configurações do projeto
│   ├── settings.py     # Configurações Django
│   └── urls.py         # URLs principais
├── manage.py           # Script de gerenciamento Django
├── requirements.txt    # Dependências do projeto
├── start_dev.sh        # Script para iniciar o ambiente
└── README.md          # Este arquivo
```

## 🌟 **Recursos do Swagger**

### **Interface Interativa**
- Documentação automática baseada no código
- Teste de endpoints diretamente na interface
- Exemplos de requisições e respostas
- Validação de parâmetros em tempo real

### **Funcionalidades**
- **Tags organizadas** por categoria de endpoints
- **Filtros e busca** nos modelos de exemplo
- **Validação automática** de dados
- **Paginação** automática das listas
- **Autenticação** configurável

### **Exemplo de Uso**
1. Acesse http://localhost:8000/api/docs/
2. Explore os endpoints disponíveis
3. Teste as operações CRUD nos modelos de exemplo
4. Use os filtros e parâmetros de busca

## 🧪 Testes

Para executar os testes:
```bash
python manage.py test
```

## 📝 Licença

Este projeto faz parte do Ad-mooving. 