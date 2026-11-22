# Arquitetura — pedmesa-frontend

> Estado descrito: `main` mais o delivery do épico PED-82 (branch `PED-82-delivery-frontend`, ver `docs/ANDAMENTO.md`).

## 1. Stack

| Camada    | Tecnologia                                                   |
| --------- | ------------------------------------------------------------ |
| UI        | React 19, Tailwind CSS 4 (`@tailwindcss/vite`), lucide-react |
| Build     | Vite 8, TypeScript com `strict`                              |
| Rotas     | React Router 7                                               |
| HTTP      | Axios (instância única `api`, com `withCredentials`)         |
| Gráficos  | Recharts (dashboard)                                         |
| Qualidade | Biome, Husky e Commitlint                                    |

## 2. Visão de sistema

```mermaid
flowchart LR
    U["Usuário do estabelecimento<br/>ou super-admin"] --> SPA["pedmesa-frontend (SPA + PWA)"]
    SPA -- "cookie HttpOnly (withCredentials)" --> API["pedmesa-backend /api/v1"]
```

A regra de negócio e os valores definitivos (totais, descontos, taxa de entrega, troco) ficam no backend; a interface exibe e coleta dados.

## 3. Estrutura de pastas

```text
src/
  App.tsx              # rotas
  main.tsx             # providers e registro do service worker
  pages/
    Login, SelecionarVisao, NotFound, Unauthorized
    admin/             # DashboardProprietario, Produtos, Usuarios, ConfiguracoesEmpresa, TaxasEntrega
    caixa/             # MapaMesas, ComandaFechamento, PreContaImpressao
    caixa/delivery/    # NovoPedidoDelivery (etapas/ Cliente, Produtos, Pagamento) e seus hooks
    cozinha/           # Kds
    expedicao/         # Expedicao (Kanban), Clientes
    garcom/            # Mesas, ComandaDetalhe
    superadmin/        # PainelSuperAdmin, PainelLeads
    <papel>/components/  # componentes usados só pelas telas daquele papel
  components/ui/       # BarraEtapas, Button, Card, ConfirmDialog, CurrencyInput, ImageUpload, Input, Modal, OpcaoSelecionavel, Switch, ThemeToggle, Toast
  components/layout/   # AppShell, Sidebar
  components/<área>/   # compartilhados entre telas: carrinho, cardapio, endereco, kanban, pagamento
  components/          # ProtectedRoute, SuperAdminProtectedRoute, ImpersonationBanner
  hooks/               # useCarrinho, useEnderecoForm, useCepLookup, useConsultaPorChave, useComAtraso, usePolling
  services/            # api.ts, admin-api.ts, um service por recurso e cep.service (ViaCEP, sem credenciais)
  contexts/            # AuthContext, SuperAdminAuthContext, TenantContext, ThemeContext, ToastContext
  lib/                 # funções puras com testes: api-error, money, format, busca-cliente, novo-pedido-delivery, menu-delivery, role-routes...
  types/               # contrato da API em snake_case
```

## 4. Rotas e fluxo de navegação

| Rota                                                                                | Tela                  | Papel                            |
| ----------------------------------------------------------------------------------- | --------------------- | -------------------------------- |
| `/login`                                                                            | Login                 | público                          |
| `/selecionar-visao`                                                                 | Escolha de visão      | autenticado com mais de um papel |
| `/garcom/mesas`, `/garcom/comanda/:id`                                              | Mesas e comanda       | garcom                           |
| `/cozinha/kds`                                                                      | KDS                   | cozinha                          |
| `/caixa/mapa-mesas`, `/caixa/comanda/:id/fechamento`, `/caixa/comanda/:id/preconta` | Caixa                 | caixa                            |
| `/caixa/delivery/novo`                                                              | Novo pedido delivery  | expedicao, admin                 |
| `/expedicao`                                                                        | Kanban de expedição   | expedicao, admin                 |
| `/expedicao/clientes`                                                               | Clientes do delivery  | expedicao, admin                 |
| `/admin/dashboard`, `/admin/produtos`, `/admin/usuarios`, `/admin/configuracoes`    | Administração         | admin                            |
| `/admin/delivery/taxas`                                                             | Bairros e taxas       | admin                            |
| `/admin`, `/admin/leads`                                                            | Painel de super-admin | super-admin                      |
| `/nao-autorizado`, `*`                                                              | Erro de acesso e 404  | —                                |

Depois do login, `src/lib/role-routes.ts` decide a tela inicial pelo papel de maior prioridade; os nomes exibidos dos papéis ficam em `src/lib/role-labels.ts`.

O menu lateral (`Sidebar`) tem três seções: **Trocar visão** (as visões dos papéis do usuário), **Delivery** (Novo pedido, Expedição e Clientes, só para admin e expedição e só com `delivery_ativo`; regra em `src/lib/menu-delivery.ts`) e **Administração** (admin).

### Novo pedido delivery

Assistente em três etapas com a `BarraEtapas` no topo: **Cliente** (busca única por nome ou telefone, cadastro de cliente novo, endereço e frete), **Produtos** e **Pagamento** (forma, troco e revisão). As pendências de cada etapa e a liberação da seguinte ficam em `src/lib/novo-pedido-delivery.ts`; a classificação do termo da busca, em `src/lib/busca-cliente.ts`. Telefone completo cadastrado seleciona o cliente; não cadastrado abre o cadastro com o número. Tudo é operável pelo teclado (`Enter` avança o campo, `Ctrl+Enter` avança a etapa e envia na última).

## 5. Autenticação e acesso

- A sessão é um cookie HttpOnly gravado pela API no login (PED-76): o JavaScript não lê nem guarda o token. A instância `api` usa `withCredentials: true` para o navegador enviar o cookie.
- O `localStorage` guarda só os dados de exibição do usuário (`src/lib/auth-storage.ts` e `super-admin-auth-storage.ts`).
- Um interceptor de resposta trata o 401 (PED-77): limpa os dados do usuário, chama `POST /auth/logout` e redireciona para `/login`, ou para `/admin` quando um super-admin estava impersonando.
- `ProtectedRoute` exige login e papel; `SuperAdminProtectedRoute` protege o painel de super-admin, que tem sessão própria (`SuperAdminAuthContext`). Durante a impersonação, o `ImpersonationBanner` fica visível.
- Esconder um botão não é controle de acesso: o backend valida o papel de novo em toda rota.

## 6. Estado e dados

- Estado global por contexts (auth, tenant, tema e toasts); estado de tela com `useState`/`useEffect`.
- Erros de API viram mensagem amigável por `src/lib/api-error.ts` e são exibidos pelo `ToastContext`.
- Dinheiro em tela passa por `src/lib/money.ts` e `src/lib/format.ts`.
- Imagens (produtos e usuários) são enviadas pelo `ImageUpload` (arrastar e soltar, com prévia) para `POST /uploads`.

## 7. PWA

`public/manifest.webmanifest`, ícones e service worker (`public/sw.js`, registrado por `src/lib/register-service-worker.ts`). O nginx da imagem precisa servir o `.webmanifest` como `application/manifest+json`, senão a instalação não aparece.

## 8. Diretrizes arquiteturais

As regras completas (cliente HTTP único da API, integrações externas isoladas, generalizar em vez de duplicar, backend como fonte da verdade, acessibilidade) estão em `.agents/AGENTS.md`, seção 8.

## 9. Limitações conhecidas

- Os testes do Vitest cobrem só a lógica pura de `src/lib`; as telas não têm testes automatizados versionados, e o CI ainda não roda `npm test`.

## 10. Setup local e fluxo de trabalho

Setup e variáveis: `README.md`. Fluxo de branches: `docs/GITFLOW.md`. Pipelines: `docs/CICD.md`.
