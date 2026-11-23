# PedMesa — Aplicação web (pedmesa-frontend)

Interface do **PedMesa** para os estabelecimentos: garçom, cozinha (KDS), caixa, administrador e o painel de super-admin. Consome a API do `pedmesa-backend` e funciona como PWA instalável.

## Funcionalidades

- Login com sessão em cookie HttpOnly e escolha de visão para quem tem mais de um papel.
- **Garçom:** mesas, comanda, integrantes e lançamento de pedidos pelo carrinho.
- **Cozinha:** KDS em colunas com o avanço do preparo e a disponibilidade dos produtos.
- **Caixa:** mapa de mesas, fechamento com divisão de conta, desconto, pagamentos, junção de comandas e pré-conta para impressão.
- **Delivery (admin e expedição):** novo pedido por telefone em três etapas (cliente e endereço com busca única por nome ou telefone, produtos, pagamento e revisão), painel Kanban de expedição e cadastro de clientes com seus endereços.
- **Admin:** dashboard, produtos e categorias (com imagem), usuários, impressoras e configurações da empresa.
- **Super-admin:** tenants (cadastro, edição, status e impersonação) e leads da landing page.
- Tema claro, escuro ou do sistema.

## Stack

React 19, TypeScript (`strict`), Vite 8, Tailwind CSS 4, React Router 7, Axios, Recharts e lucide-react. Lint e formatação com Biome; Husky e Commitlint nos commits.

## Pré-requisitos

- Node.js 26 (o CI usa Node 26) e npm.
- `pedmesa-backend` rodando (local ou homologação).

## Ambientes

| Ambiente              | Branch   | API usada                               |
| --------------------- | -------- | --------------------------------------- |
| Desenvolvimento local | qualquer | `http://localhost:3000/api/v1`          |
| Homologação           | `main`   | `https://api-dev.pedmesa.com.br/api/v1` |
| Produção              | `prod`   | `https://api.pedmesa.com.br/api/v1`     |

## Como executar

1. Copie `.env.example` para `.env`:

   | Variável            | Uso                            |
   | ------------------- | ------------------------------ |
   | `VITE_API_BASE_URL` | URL base da API, com `/api/v1` |

   > Variáveis `VITE_*` são embutidas no bundle **no build** e ficam públicas. Nunca coloque segredo nelas.

2. `npm install` (instala também os hooks do Husky).
3. `npm run dev` e acesse `http://localhost:5173`.

## Scripts

| Script            | O que faz                                                          |
| ----------------- | ------------------------------------------------------------------ |
| `npm run dev`     | servidor de desenvolvimento do Vite                                |
| `npm run build`   | `tsc -b` e build de produção em `dist/`                            |
| `npm run preview` | serve o build localmente                                           |
| `npm run check`   | `tsc` do app e da config do Vite + Biome com `--error-on-warnings` |
| `npm run format`  | formata e aplica as correções seguras do Biome                     |
| `npm run lint`    | só o lint do Biome                                                 |
| `npm test`        | testes do Vitest (lógica pura em `src/lib`)                        |

> `npx tsc --noEmit` não checa nada aqui (o `tsconfig.json` é _solution-style_). Use `npm run check` ou `npm run build`.

## Testes

A lógica pura (`src/lib/*.test.ts`) é testada com Vitest: `npm test`. As telas são verificadas com `npm run check`, `npm run build` e testes de navegador (Playwright, fora do repositório; ver a skill `dev-workflow`).

## Docker

O `Dockerfile` faz o build com Node 26 (recebendo `VITE_API_BASE_URL` como argumento de build) e serve o `dist/` com `nginx-unprivileged` na porta **8080**, sem root. A configuração do nginx fica versionada em `nginx.conf` (fallback de SPA e `Content-Type` do `.webmanifest`), e os cabeçalhos de segurança em `security-headers.conf` (PED-59).

```bash
docker build -t pedmesa-frontend:local --build-arg VITE_API_BASE_URL=http://localhost:3000/api/v1 .
docker run --rm -p 8080:8080 pedmesa-frontend:local
```

## CI/CD

- `ci.yml`: em todo Pull Request para `main` e `prod`, jobs **Qualidade** (`npm run check`, `npm run build` e busca de IP privado no bundle) e **Commits** (Commitlint).
- `deploy.yml`: no push em `main` (homologação) ou `prod` (produção), constrói a imagem com as `VITE_*` do ambiente, publica no GHCR, pede o deploy ao Coolify, confere `GET /` e roda a verificação de segurança.
- Dependabot: npm, GitHub Actions e imagens Docker.

Configuração do Coolify e dos GitHub Environments em `docs/CICD.md`.

## Estrutura do projeto

```text
src/
  pages/<papel>/       # telas por papel (admin, caixa, cozinha, garcom, superadmin)
  components/ui/       # componentes genéricos (Modal, Button, CurrencyInput...)
  components/layout/   # AppShell e Sidebar
  services/            # chamadas HTTP (api.ts e um service por recurso)
  contexts/            # Auth, Tenant, Theme, Toast e SuperAdminAuth
  lib/                 # funções puras (dinheiro, formatação, rotas por papel...)
  types/               # tipos do contrato da API
public/                # ícones, manifest e service worker do PWA
docs/                  # arquitetura, requisitos, andamento, gitflow e CI/CD
.agents/               # guardrails e modelo de plano para agentes de IA
```

## Fluxo de contribuição

GitLab Flow com uma branch por épico (`PED-<ID>-<titulo-do-epico>`), um commit por tarefa no formato `tipo(escopo): [PED-<ID>] descrição` e Pull Request com o CI verde. Detalhes em `docs/GITFLOW.md`; regras para agentes de IA em `.agents/AGENTS.md`.

## Documentação adicional

- `docs/ARQUITETURA.md`: organização, rotas, autenticação e diretrizes.
- `docs/REQUISITOS.md`: telas e requisitos por perfil.
- `docs/ANDAMENTO.md`: o que está pronto, em andamento e planejado.
- `docs/GITFLOW.md` e `docs/CICD.md`: fluxo de branches e pipelines.
- Regras de negócio e contrato da API: `docs/` do `pedmesa-backend`.
