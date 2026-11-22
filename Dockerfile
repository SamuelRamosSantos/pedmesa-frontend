# =============================================================
# PedMesa app (PED-118)
# Versões das imagens base fixas: o Dependabot abre PR quando sair uma nova
# (a troca de major do Node é manual).
# =============================================================

# ---- Estágio 1: build da SPA ----
FROM node:26.13.1-alpine3.24 AS build

WORKDIR /app

COPY package.json package-lock.json ./
# --ignore-scripts: o "prepare" (Husky) não tem utilidade dentro da imagem
RUN npm ci --ignore-scripts

COPY . .

# O Vite embute as VITE_* no bundle NO BUILD (não em runtime): por isso chegam
# como build args, uma imagem por ambiente. No pipeline vêm das variáveis do
# GitHub Environment (ver docs/CICD.md).
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Sem as VITE_* o bundle sairia apontando para o próprio app: recusa o build
RUN test -n "$VITE_API_BASE_URL" || { echo "Faltou --build-arg VITE_API_BASE_URL=..." >&2; exit 1; }

RUN npm run build

# Commit da imagem, informado pelo pipeline. Servido em /versao.txt: a verificação
# final do deploy compara este valor com o commit publicado.
ARG GIT_SHA=desenvolvimento
RUN printf "%s" "$GIT_SHA" > dist/versao.txt

# ---- Estágio 2: nginx sem root, porta 8080 ----
FROM nginxinc/nginx-unprivileged:1.31.7-alpine3.24 AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/ || exit 1
