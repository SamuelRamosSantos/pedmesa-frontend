# PedMesa — Aplicação web (pedmesa-frontend)

Interface do **PedMesa** para os estabelecimentos: garçom, cozinha (KDS), caixa, administrador e o painel de super-admin. Consome a API do `pedmesa-backend` e funciona como PWA instalável.

## Funcionalidades

- Login com escolha de visão para quem tem mais de um papel.
- **Garçom:** mesas, comanda, integrantes e lançamento de pedidos pelo carrinho.
- **Cozinha:** KDS em colunas com o avanço do preparo e a disponibilidade dos produtos.
- **Caixa:** mapa de mesas, fechamento com divisão de conta, desconto, pagamentos, junção de comandas e pré-conta para impressão.
- **Admin:** dashboard, produtos e categorias, usuários, impressoras e configurações da empresa.
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

> `npx tsc --noEmit` não checa nada aqui (o `tsconfig.json` é _solution-style_). Use `npm run check` ou `npm run build`.

## Testes

Ainda não há testes automatizados no frontend; a adoção do Vitest está planejada na PED-104. A verificação hoje é `npm run check`, `npm run build` e o teste manual das telas.

## Docker

O `Dockerfile` faz o build com Node e serve o `dist/` com nginx (fallback de SPA e `Content-Type` correto do `.webmanifest`). A padronização com `nginx.conf` versionado e imagem não-root está planejada na PED-118.

## CI/CD

O workflow `.github/workflows/ci.yml` roda em todo Pull Request para `main` e `prod` com os jobs **Qualidade** (`npm run check` e `npm run build`) e **Commits** (Commitlint). O Dependabot abre PRs de npm, GitHub Actions e Docker. Detalhes em `docs/CICD.md`.

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
