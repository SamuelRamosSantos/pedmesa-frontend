# Requisitos — pedmesa-frontend

> Os requisitos do produto (RF, RNF e RN) estão em `pedmesa-backend/docs/REQUISITOS.md`. Este documento mapeia as telas que os atendem e os requisitos próprios da interface.

## 1. Perfis e telas

| Perfil      | Telas                                                                                          | Requisitos do produto atendidos           |
| ----------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Garçom      | Mesas, Comanda (carrinho, integrantes, pedidos enviados)                                       | RF-12, RF-13, RF-15                       |
| Cozinha     | KDS                                                                                            | RF-11, RF-14                              |
| Caixa       | Mapa de mesas, Fechamento (extrato, desconto, pagamentos, junção), Pré-conta                   | RF-16 a RF-20                             |
| Admin       | Dashboard, Produtos, Usuários, Configurações da empresa (inclui impressoras e token do agente) | RF-03, RF-04, RF-08 a RF-10, RF-21, RF-24 |
| Super-admin | Tenants, Leads                                                                                 | RF-05 a RF-07                             |
| Todos       | Login e escolha de visão                                                                       | RF-01, RF-02                              |

## 2. Requisitos funcionais da interface

- **RFI-01** Depois do login, levar o usuário para a tela inicial do papel de maior prioridade; com mais de um papel, oferecer a escolha de visão.
- **RFI-02** Bloquear rotas para quem não tem o papel e mostrar a tela de acesso negado.
- **RFI-03** Mostrar um aviso permanente durante a impersonação do super-admin.
- **RFI-04** Exibir os erros da API como mensagens amigáveis (toasts).
- **RFI-05** Permitir instalar a aplicação como PWA.
- **RFI-06** Oferecer tema claro, escuro ou do sistema, lembrando a escolha.
- **RFI-07** Imprimir a pré-conta a partir da tela própria do caixa.

## 3. Requisitos não funcionais da interface

- **RNFI-01** Uso em celular (garçom) e em tela grande (caixa, KDS), com layout responsivo.
- **RNFI-02** Acessibilidade verificada pelas regras de a11y do Biome; exceções justificadas no código.
- **RNFI-03** Nenhum segredo no bundle: só `VITE_API_BASE_URL` é configurável.
- **RNFI-04** Valores monetários sempre vindos da API; a interface só formata.
- **RNFI-05** `strict` no TypeScript e Biome sem avisos (`npm run check`).

## 4. Restrições e premissas

- SPA servida por nginx, separada da landing page (`pedmesa-site`).
- Depende do `pedmesa-backend` para toda regra de negócio.
