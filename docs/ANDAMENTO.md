# Andamento — pedmesa-frontend

> **Fonte:** Jira (projeto PED, `samuelramos.atlassian.net`) e branches do Git.
> **Posição em:** 22/11/2026.
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

- **Delivery (PED-82):** Vitest e máscaras (PED-104), tipos e services (PED-105), ViaCEP (PED-106), identificação do cliente (PED-107), endereço e frete (PED-108), novo pedido delivery (PED-109), Kanban de expedição (PED-110), taxas e configuração (PED-111), menu do delivery e badge no KDS (PED-112), novo pedido em etapas com busca única de cliente por nome ou telefone (PED-123), tela de clientes cadastrados (PED-124), cadastro de bairro direto pelo novo pedido (PED-125), desconto e isenção da taxa na etapa de pagamento (PED-126) e desfazer entrega marcada por engano (PED-127). Bug PED-129: o selo da cozinha no card da expedição segue o KDS (só itens com preparo) e avisa "Sem itens para a cozinha". PED-130: o card da expedição lista os produtos e abre um modal com o pedido completo e as mesmas ações de status (componente `AcoesEntrega`, compartilhado com o card). A busca usa a listagem de clientes do backend (PED-122, branch de mesmo nome no `pedmesa-backend`).

## 4. Planejado

- PED-128: sugerir o bairro atendido mais parecido quando o digitado não é atendido ("Você quis dizer...?").
- PED-59, PED-64 e PED-69: cabeçalhos de segurança, `Cache-Control` e compressão no nginx da imagem.

## 5. Pendências conhecidas

- Sem testes automatizados na `main` até a branch PED-82 ser mesclada.
- O CI ainda não roda `npm test` (o job **Testes** previsto na PED-104 não entrou).

## 6. Impacto previsto na arquitetura

- O delivery traz hooks compartilhados (`useCarrinho`, `usePolling`, `useEnderecoForm`), componentes genéricos (`KanbanColumn`, `BarraEtapas`, `OpcaoSelecionavel`, `SeletorFormaPagamento`, `DescontoCard`, `EnderecoForm`, `TaxaEntregaModal`) e a integração externa com o ViaCEP por service próprio.
- O fechamento do caixa passa a usar o `SeletorFormaPagamento` compartilhado (mesmo visual, rótulos de cartão iguais aos do restante do caixa).

## 7. Documentos relacionados

`docs/ARQUITETURA.md`, `docs/REQUISITOS.md`, `docs/GITFLOW.md`, `docs/CICD.md` e a documentação do `pedmesa-backend`.
