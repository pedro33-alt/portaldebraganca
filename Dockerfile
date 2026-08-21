FROM node:22-alpine

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências necessárias para build (incluindo git se necessário)
RUN apk add --no-cache git

# Copiar arquivos de dependências
COPY package.json package-lock.json ./
COPY api/package.json ./api/
COPY admin-web/package.json ./admin-web/
COPY mobile/package.json ./mobile/

# Instalar TODAS as dependências
RUN npm install

# Copiar o resto do código
COPY . .

# Executar o build-all.js para compilar e espelhar tudo para /app/dist
RUN npm run build

# Expor a porta 3000 (Railway injeta PORT dinamicamente, mas 3000 é fallback)
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]
