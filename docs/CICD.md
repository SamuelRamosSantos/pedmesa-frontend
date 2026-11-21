# CI/CD — pedmesa-frontend

## 1. Visão geral dos workflows

| Arquivo                    | Quando roda                                                  | O que faz                                                                                                            |
| -------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml` | Pull Request para `main` ou `prod`, `workflow_call` e manual | Jobs **Qualidade** e **Commits**                                                                                     |
| `.github/dependabot.yml`   | Agenda do Dependabot                                         | PRs de npm (semanal, minor e patch agrupados), GitHub Actions (mensal) e imagens Docker (semanal, sem major do Node) |

| Job           | Passos                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| **Qualidade** | `npm ci`, `npm run check` (tsc do app e da config do Vite, Biome com `--error-on-warnings`) e `npm run build` |
| **Commits**   | Commitlint em todos os commits do PR (pulado nos PRs do Dependabot)                                           |

O job **Testes** entra quando o frontend tiver testes automatizados (PED-104).

## 2. Ambientes e publicação

| Ambiente    | Branch | Publicação |
| ----------- | ------ | ---------- |
| Homologação | `main` | Coolify    |
| Produção    | `prod` | Coolify    |

O `VITE_API_BASE_URL` é embutido no bundle **no build**: no Coolify ele precisa ser uma _Build Variable_. O deploy automatizado e a imagem padronizada estão planejados nas **PED-118** e **PED-119**.

## 3. Configuração manual no GitHub

1. **Branch protection** em `main` e `prod`: Pull Request obrigatório, status checks **Qualidade** e **Commits** e revisão dos code owners (`* @SamuelRamosSantos`).
2. **Code security:** ativar _Dependabot alerts_ e _Dependabot security updates_.

## 4. Problemas comuns

- **`tsc` passa localmente e o build quebra:** `npx tsc --noEmit` não checa nada neste repositório (o `tsconfig.json` é _solution-style_). Use `npm run check` ou `npm run build`.
- **Job Commits falha:** mensagem fora de `tipo(escopo): [PED-<ID>] descrição` ou acima de 100 caracteres.
- **PWA não instala depois do deploy:** o nginx precisa servir o `.webmanifest` como `application/manifest+json`.
