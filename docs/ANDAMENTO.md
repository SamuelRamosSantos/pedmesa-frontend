# Andamento — pedmesa-frontend

> **Fonte:** Jira (projeto PED, `samuelramos.atlassian.net`) e branches do Git.
> **Posição em:** 21/11/2026.
> **Regra de atualização:** toda tarefa que muda o que está pronto, em andamento ou planejado atualiza este arquivo na mesma entrega.

## 1. Resumo por épico

| Épico  | Título                                          | Jira                                 | Código no frontend                                                             |
| ------ | ----------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------ |
| PED-3  | Frontend & Mobile                               | Feito                                | na `main`                                                                      |
| PED-23 | Refinamentos de Usabilidade e Regras de Negócio | Feito                                | na `main`                                                                      |
| PED-24 | Super-Admin, Dashboard e Branding               | A fazer (PED-46 e PED-47 em análise) | painel de super-admin e dashboard na `main`; upload de imagem na branch PED-53 |
| PED-53 | Validação e Hardening de Segurança              | A fazer                              | branch `PED-53-validacao-e-hardening-de-seguranca` (4 commits fora da `main`)  |
| PED-82 | Delivery · Frontend                             | A fazer                              | branch `PED-82-delivery-frontend` (10 commits fora da `main`)                  |

## 2. Implementado (na `main`)

- Login, escolha de visão e rotas por papel.
- Telas de garçom, cozinha (KDS), caixa, admin e super-admin.
- PWA e tema claro/escuro.
- Organização do repositório: Biome no lugar do oxlint, `strict` no TypeScript, Husky + Commitlint, guardrails de IA (`.agents/`), documentação em `docs/`, CI e Dependabot.

## 3. Em andamento (fora da `main`)

- **Delivery (PED-82):** novo pedido delivery com carrinho compartilhado (PED-109), painel Kanban de expedição (PED-110), configuração do delivery e taxas (PED-111), além de tipos, services, ViaCEP e identificação do cliente (PED-105 a PED-108).
- **Hardening (PED-53):** sessão por cookie HttpOnly (PED-76), revalidação da sessão expirada (PED-77) e componente de upload de imagem (PED-46).

## 4. Planejado

- PED-104: Vitest no frontend e utilitários de máscara.
- PED-112: navegação, permissões e badges do delivery.
- PED-118 e PED-119: Dockerfile padronizado (nginx versionado, não-root) e pipeline de deploy.
- PED-59, PED-64 e PED-69: cabeçalhos de segurança, `Cache-Control` e compressão no nginx da imagem.

## 5. Pendências conhecidas

- Antes de mesclar as branches PED-53 e PED-82, elas precisam passar pelo `npm run format`, porque a `main` foi reformatada pelo Biome.
- Sem testes automatizados até a PED-104.

## 6. Impacto previsto na arquitetura

- O PED-76 remove o token do `localStorage`: a instância `api` passa a usar `withCredentials` e o interceptor de 401.
- O delivery traz hooks compartilhados (`useCarrinho`, `usePolling`) e o `KanbanColumn` genérico, além de integração externa com o ViaCEP por service próprio.

## 7. Documentos relacionados

`docs/ARQUITETURA.md`, `docs/REQUISITOS.md`, `docs/GITFLOW.md`, `docs/CICD.md` e a documentação do `pedmesa-backend`.
