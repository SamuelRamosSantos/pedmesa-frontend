# Etapa 1: Build da aplicação React
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servidor Web Nginx leve para produção
FROM nginx:alpine

# Copia os arquivos compilados para o diretório do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração de SPA para evitar 404 em rotas do React Router. O bloco do
# .webmanifest existe porque o mime.types padrão do nginx:alpine não conhece
# essa extensão — sem isso, o Chrome recebe Content-Type: application/octet-stream
# e recusa silenciosamente o manifest, e a opção de instalar o PWA nunca aparece.
RUN echo 'server { \
    listen 80; \
    location ~* \.webmanifest$ { \
    root /usr/share/nginx/html; \
    default_type application/manifest+json; \
    } \
    location / { \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]