# 🐳 Docker Setup - Ad-mooving

Este projeto foi dockerizado com containers separados para **backend (Django)** e **frontend (Vite + React)**.

## 📁 Estrutura Docker

```
Ad-mooving/
├── backend/
│   └── Dockerfile              # Django + Gunicorn
├── frontend/
│   └── Dockerfile              # Vite build + serve
├── docker-compose.yml          # Produção
├── docker-compose.dev.yml      # Desenvolvimento
├── nginx-external.conf         # Nginx externo (reverse proxy)
└── env.example                 # Variáveis de ambiente
```

## 🚀 Como usar

### 1. **Desenvolvimento (Hot Reload)**

```bash
# Copiar arquivo de exemplo das variáveis de ambiente
cp env.example .env

# Subir containers de desenvolvimento
docker compose -f docker-compose.dev.yml up --build

# Acessar aplicação
# Frontend: http://localhost:8080
# Backend API: http://localhost:8000/api/
# Admin Django: http://localhost:8000/admin/
# Docs API: http://localhost:8000/api/docs/
```

### 2. **Produção**

```bash
# Copiar e configurar variáveis de ambiente
cp env.example .env
# Editar .env com configurações de produção

# Subir containers de produção
docker compose up --build -d

# Configurar Nginx externo (ver seção "Nginx Externo")
sudo cp nginx-external.conf /etc/nginx/sites-available/admooving
sudo ln -s /etc/nginx/sites-available/admooving /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Acessar aplicação
# Frontend: http://localhost:3000 (direto) ou http://localhost (via Nginx)
# Backend: http://localhost:8000/api/ (direto) ou http://localhost/api/ (via Nginx)
```

## ⚙️ Configurações

### Variáveis de Ambiente

Edite o arquivo `.env` com suas configurações:

```env
# Django
DEBUG=False                    # True para dev, False para prod
SECRET_KEY=sua-chave-secreta
ALLOWED_HOSTS=*               # Configure domínios em produção

# CORS
CORS_ALLOW_ALL_ORIGINS=False  # True apenas em desenvolvimento
CORS_ALLOWED_ORIGINS=http://seudominio.com

# Email (configure para produção)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha-de-app
```

### Frontend (.env para desenvolvimento local)

Crie `frontend/.env` se necessário:
```env
VITE_API_BASE_URL=http://localhost:8000
```

## 🔧 Comandos Úteis

```bash
# Ver logs
docker compose logs -f

# Executar comandos no backend
docker compose exec api python manage.py migrate
docker compose exec api python manage.py createsuperuser
docker compose exec api python manage.py collectstatic

# Parar containers
docker compose down

# Limpar volumes (cuidado: apaga dados!)
docker compose down -v
```

## 📊 Monitoramento

### Health Check
- **API**: `http://localhost:8000/api/health/` (dev) ou `http://localhost/api/health/` (prod)

### Logs
```bash
# Logs de todos os serviços
docker compose logs -f

# Logs específicos
docker compose logs -f api
docker compose logs -f web
```

## 🔄 Atualizações

```bash
# Rebuild após mudanças no código
docker compose up --build

# Forçar rebuild completo
docker compose build --no-cache
docker compose up
```

## 🗄️ Banco de Dados

### SQLite (atual)
- Dados persistidos em volume Docker: `api_db`
- Backup: `docker compose exec api cp db.sqlite3 /tmp/backup.db`

### Migração para PostgreSQL (recomendado para produção)
Adicione ao `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: admooving
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: senha_segura
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

E atualize as variáveis de ambiente:
```env
DATABASE_URL=postgresql://postgres:senha_segura@db:5432/admooving
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **CORS Error**: Verifique `CORS_ALLOWED_ORIGINS` no `.env`
2. **API não conecta**: Confirme que o serviço `api` está rodando
3. **Frontend não carrega**: Verifique se o build foi bem-sucedido
4. **Permissões**: No Linux, pode precisar de `sudo` para Docker

### Reset Completo
```bash
docker compose down -v
docker system prune -a
docker compose up --build
```

## 🌐 Nginx Externo

### Configuração do Reverse Proxy

O Nginx externo atua como reverse proxy, direcionando:
- `/api/` → Backend Django (localhost:8000)
- `/admin/` → Admin Django (localhost:8000)  
- `/` → Frontend React (localhost:3000)

### Setup do Nginx

```bash
# Instalar Nginx (Ubuntu/Debian)
sudo apt update && sudo apt install nginx

# Copiar configuração
sudo cp nginx-external.conf /etc/nginx/sites-available/admooving

# Ativar site
sudo ln -s /etc/nginx/sites-available/admooving /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx

# Verificar status
sudo systemctl status nginx
```

### Vantagens desta arquitetura:

✅ **Performance**: Nginx otimizado para servir arquivos estáticos  
✅ **SSL/HTTPS**: Fácil configuração de certificados  
✅ **Load Balance**: Pode distribuir carga entre múltiplas instâncias  
✅ **Caching**: Cache de responses da API  
✅ **Compressão**: Gzip automático  
✅ **Logs centralizados**: Todos os acessos em um local  

## 📈 Produção

### Recomendações para Deploy

1. **Usar PostgreSQL** em vez de SQLite
2. **Configurar HTTPS** com reverse proxy (Nginx/Caddy)
3. **Configurar email real** (Gmail, SendGrid, etc.)
4. **Backup automático** do banco
5. **Monitoring** (logs, métricas)
6. **Environment específicos** (staging, production)

### Exemplo com reverse proxy
```yaml
# docker-compose.prod.yml
services:
  nginx-proxy:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-proxy.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/ssl/certs
```

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs: `docker compose logs -f`
2. Consulte a documentação da API: `http://localhost/api/docs/`
3. Teste o health check: `http://localhost/api/health/`
