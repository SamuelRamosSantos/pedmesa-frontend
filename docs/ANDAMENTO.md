# Andamento — pedmesa-frontend

> **Fonte:** Jira (projeto PED, `samuelramos.atlassian.net`) e branches do Git.
> **Posição em:** 22/11/2026.
> **Regra de atualização:** toda tarefa que muda o que está pronto, em andamento ou planejado atualiza este arquivo na mesma entrega.

## 1. Resumo por épico

| Épico   | Título                                          | Jira                                 | Código no frontend                                                           |
| ------- | ----------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| PED-3   | Frontend & Mobile                               | Feito                                | na `main`                                                                    |
| PED-23  | Refinamentos de Usabilidade e Regras de Negócio | Feito                                | na `main`                                                                    |
| PED-24  | Super-Admin, Dashboard e Branding               | A fazer (PED-46 e PED-47 em análise) | painel de super-admin, dashboard e upload de imagem na `main`                |
| PED-53  | Validação e Hardening de Segurança              | A fazer                              | sessão por cookie e revalidação na `main`; Dockerfile e cabeçalhos pendentes |
| PED-81  | Delivery · Regras de Negócio                    | Feito                                | visão de expedição e papel `expedicao` na `main`                             |
| PED-82  | Delivery · Frontend                             | Feito                                | na `main`                                                                    |
| PED-131 | Refinamento de UX e conformidade                | A fazer (épico contínuo)             | branch `PED-131-refinamento-de-ux-e-conformidade`                            |

## 2. Implementado (na `main`)

- Login, escolha de visão e rotas por papel, inclusive `expedicao`.
- Telas de garçom, cozinha (KDS), caixa, expedição, admin e super-admin.
- Sessão em cookie HttpOnly com revalidação da sessão expirada (PED-76, PED-77).
- Upload de imagem com arrastar e soltar (PED-46).
- PWA e tema claro/escuro.
- Organização do repositório: Biome no lugar do oxlint, `strict` no TypeScript, Husky + Commitlint, guardrails de IA (`.agents/`), documentação em `docs/`, CI e Dependabot.
- Imagem Docker padronizada (Node 26, nginx sem root na porta 8080, `nginx.conf` versionado) e deploy por GitHub Actions + GHCR + Coolify com verificação de segurança (PED-118 a PED-120).

- **Delivery (PED-82):** novo pedido em etapas com busca única de cliente (PED-109, PED-123), Kanban de expedição com itens e detalhe completo do pedido (PED-110, PED-130), clientes cadastrados (PED-124), taxas e configuração (PED-111, PED-125), desconto e isenção da taxa (PED-126), desfazer entrega (PED-127), menu do delivery e badge no KDS (PED-112), selo da cozinha alinhado ao KDS (PED-129). Vitest para a lógica de `src/lib` (PED-104).

## 3. Em andamento (fora da `main`)

- **Refinamento de UX e conformidade (PED-131):** guia visual (PED-132) com escala tipográfica e paleta semântica em tokens do Tailwind (`src/index.css`, `src/lib/tons.ts`), componentes base `Selo`, `TipoAtendimento`, `NumeroDestaque` e `TituloPagina`, componentes de `components/ui` nos tokens e status de item e entrega com um tom cada (pendente âmbar, em preparo/em rota azul, pronto verde). Página de referência `/dev/guia`, só em desenvolvimento. Regras em `docs/ARQUITETURA.md`, seção "Guia visual".

## 4. Planejado

- PED-133: KDS com o mesmo padrão visual para mesa e delivery.
- PED-134: auditoria e aplicação do guia visual nas demais telas.
- PED-135: padrão único de edição (clicar no item abre a edição, ações e excluir dentro dela).
- PED-114: padronizar os horários (fuso entre Node e Postgres).
- PED-128: sugerir o bairro atendido mais parecido quando o digitado não é atendido ("Você quis dizer...?").
- PED-59, PED-64 e PED-69: cabeçalhos de segurança, `Cache-Control` e compressão no nginx da imagem.

## 5. Pendências conhecidas

- Os testes automatizados cobrem só a lógica de `src/lib`; as telas não têm testes versionados.
- O CI ainda não roda `npm test` (o job **Testes** previsto na PED-104 não entrou).

## 6. Impacto previsto na arquitetura

- O delivery traz hooks compartilhados (`useCarrinho`, `usePolling`, `useEnderecoForm`), componentes genéricos (`KanbanColumn`, `BarraEtapas`, `OpcaoSelecionavel`, `SeletorFormaPagamento`, `DescontoCard`, `EnderecoForm`, `TaxaEntregaModal`) e a integração externa com o ViaCEP por service próprio.
- O fechamento do caixa passa a usar o `SeletorFormaPagamento` compartilhado (mesmo visual, rótulos de cartão iguais aos do restante do caixa).

## 7. Documentos relacionados

`docs/ARQUITETURA.md`, `docs/REQUISITOS.md`, `docs/GITFLOW.md`, `docs/CICD.md` e a documentação do `pedmesa-backend`.
