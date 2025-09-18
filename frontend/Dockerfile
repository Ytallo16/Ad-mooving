# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY bun.lockb ./

# Instalar dependências (inclui devDependencies para rodar o build com Vite)
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação para produção
RUN npm run build

# Production stage - servir arquivos estáticos
FROM node:20-alpine

WORKDIR /app

# Instalar serve para servir arquivos estáticos
RUN npm install -g serve

# Copiar arquivos buildados
COPY --from=builder /app/dist ./dist

# Expor porta 3000 (padrão do serve)
EXPOSE 3000

# Comando para servir arquivos estáticos
CMD ["serve", "-s", "dist", "-l", "3000"]
