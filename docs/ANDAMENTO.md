# Andamento — pedmesa-frontend

> **Fonte:** Jira (projeto PED, `samuelramos.atlassian.net`) e branches do Git.
> **Posição em:** 21/11/2026.
> **Regra de atualização:** toda tarefa que muda o que está pronto, em andamento ou planejado atualiza este arquivo na mesma entrega.

## 1. Resumo por épico

| Épico  | Título                                          | Jira                                 | Código no frontend                                                           |
| ------ | ----------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| PED-3  | Frontend & Mobile                               | Feito                                | na `main`                                                                    |
| PED-23 | Refinamentos de Usabilidade e Regras de Negócio | Feito                                | na `main`                                                                    |
| PED-24 | Super-Admin, Dashboard e Branding               | A fazer (PED-46 e PED-47 em análise) | painel de super-admin, dashboard e upload de imagem na `main`                |
| PED-53 | Validação e Hardening de Segurança              | A fazer                              | sessão por cookie e revalidação na `main`; Dockerfile e cabeçalhos pendentes |
| PED-81 | Delivery · Regras de Negócio                    | Feito                                | visão de expedição e papel `expedicao` na `main`                             |
| PED-82 | Delivery · Frontend                             | A fazer                              | branch `PED-82-delivery-frontend`                                            |

## 2. Implementado (na `main`)

- Login, escolha de visão e rotas por papel, inclusive `expedicao`.
- Telas de garçom, cozinha (KDS), caixa, expedição, admin e super-admin.
- Sessão em cookie HttpOnly com revalidação da sessão expirada (PED-76, PED-77).
- Upload de imagem com arrastar e soltar (PED-46).
- PWA e tema claro/escuro.
- Organização do repositório: Biome no lugar do oxlint, `strict` no TypeScript, Husky + Commitlint, guardrails de IA (`.agents/`), documentação em `docs/`, CI e Dependabot.
- Imagem Docker padronizada (Node 26, nginx sem root na porta 8080, `nginx.conf` versionado) e deploy por GitHub Actions + GHCR + Coolify com verificação de segurança (PED-118 a PED-120).

## 3. Em andamento (fora da `main`)

- **Delivery (PED-82):** Vitest e máscaras (PED-104), tipos e services (PED-105), ViaCEP (PED-106), identificação do cliente (PED-107), endereço e frete (PED-108), novo pedido delivery (PED-109), Kanban de expedição (PED-110) e taxas e configuração (PED-111).

## 4. Planejado

- PED-112: navegação, permissões e badges do delivery.
- PED-59, PED-64 e PED-69: cabeçalhos de segurança, `Cache-Control` e compressão no nginx da imagem.

## 5. Pendências conhecidas

- A branch `PED-82-delivery-frontend` precisa passar pelo `npm run format` antes de ser mesclada, porque a `main` foi reformatada pelo Biome.
- Sem testes automatizados na `main` até a PED-104 entrar.

## 6. Impacto previsto na arquitetura

- O delivery traz hooks compartilhados (`useCarrinho`, `usePolling`) e o `KanbanColumn` genérico, além de integração externa com o ViaCEP por service próprio.
- A PED-104 adiciona o Vitest e o job **Testes** no CI.

## 7. Documentos relacionados

`docs/ARQUITETURA.md`, `docs/REQUISITOS.md`, `docs/GITFLOW.md`, `docs/CICD.md` e a documentação do `pedmesa-backend`.
