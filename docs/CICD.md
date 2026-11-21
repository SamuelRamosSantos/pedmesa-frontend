# CI/CD — pedmesa-frontend

## 1. Visão geral

| Arquivo                                             | Quando roda                                                                        | O que faz                                                                                                     |
| --------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`                          | Pull Request para `main` ou `prod`, chamado pelo deploy (`workflow_call`) e manual | Jobs **Qualidade** e **Commits**                                                                              |
| `.github/workflows/deploy.yml`                      | push em `main` (homologação) ou `prod` (produção), e manual                        | CI → imagem no GHCR → deploy no Coolify → **verificação no ar** → verificação de segurança                    |
| `.github/dependabot.yml`                            | agenda do Dependabot                                                               | npm (semanal, minor e patch agrupados), GitHub Actions (mensal) e imagens Docker (semanal, sem major do Node) |
| `Dockerfile`, `nginx.conf`, `security-headers.conf` | build da imagem                                                                    | build com Node 26; nginx sem root na porta **8080**; fallback de SPA; `.webmanifest` com o tipo certo         |
| `scripts/check-security-headers.sh`                 | job **Segurança** do deploy, ou manual                                             | confere cabeçalhos de segurança, compressão e IP privado (PED-120)                                            |

| Job do CI     | Passos                                                                                                                                       |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Qualidade** | `npm ci`, `npm run check`, `npm run build` e busca de IP privado no bundle (o exemplo `192.168.0.100` do cadastro de impressora é permitido) |
| **Commits**   | Commitlint em todos os commits do PR (pulado nos PRs do Dependabot)                                                                          |

O job **Testes** entra quando o frontend tiver testes automatizados (PED-104).

O `deploy.yml` tem o mesmo desenho do backend (ver `pedmesa-backend/docs/CICD.md`):

- **Entregar:** build com as `VITE_*` do ambiente e o commit (`GIT_SHA`), push em `ghcr.io/samuelramossantos/pedmesa-frontend` com as tags `<ambiente>`, `sha-<commit>` e `latest` em produção, e deploy no Coolify por `scripts/coolify-deploy.sh` (que explica cada erro e mostra o log do Coolify quando o deploy falha).
- **Verificar no ar** (última etapa, roda mesmo se a entrega falhar): `GET /` precisa responder 200 e `GET /versao.txt` precisa trazer o commit publicado; se for outro, o container antigo continua rodando.
- **Segurança:** `scripts/check-security-headers.sh` em modo `report` até a PED-59/64/69.

## 2. Ambientes

| Ambiente      | Branch | Endereço                         | API                                     |
| ------------- | ------ | -------------------------------- | --------------------------------------- |
| `homologacao` | `main` | `https://app-dev.pedmesa.com.br` | `https://api-dev.pedmesa.com.br/api/v1` |
| `producao`    | `prod` | `https://app.pedmesa.com.br`     | `https://api.pedmesa.com.br/api/v1`     |

O `VITE_API_BASE_URL` é embutido no bundle **no build**, por isso cada ambiente tem a sua imagem.

## 3. Configuração manual (uma vez)

### Coolify — para cada aplicação (app de homologação e de produção)

1. _Build Pack_ = **Docker Image**, imagem `ghcr.io/samuelramossantos/pedmesa-frontend`, tag `homologacao` (ou `producao`).
2. **Porta exposta: 8080** (antes era 80; a imagem agora roda sem root).
3. Credencial do GHCR no servidor (`docker login ghcr.io` com um token `read:packages`), a mesma do backend.
4. Desligar o deploy automático por push no Coolify e anotar o **UUID** da aplicação.
5. As variáveis `VITE_*` **não** ficam mais no Coolify: vêm do GitHub Environment no build.

### GitHub — environments `homologacao` e `producao`

| Tipo     | Nome                | Exemplo (homologação)                   |
| -------- | ------------------- | --------------------------------------- |
| Variable | `COOLIFY_URL`       | `https://coolify.seudominio.com.br`     |
| Variable | `COOLIFY_APP_UUID`  | UUID da aplicação no Coolify            |
| Variable | `APP_URL`           | `https://app-dev.pedmesa.com.br`        |
| Variable | `VITE_API_BASE_URL` | `https://api-dev.pedmesa.com.br/api/v1` |
| Secret   | `COOLIFY_TOKEN`     | token de API do Coolify                 |

Também: **branch protection** em `main` e `prod` (checks **Qualidade** e **Commits** e revisão dos code owners), **Dependabot alerts** e **security updates** ligados, e a variável de repositório `CHECK_MODE=enforce` quando a PED-59/64/69 estiverem concluídas.

## 4. Rodar a imagem localmente

```bash
docker build -t pedmesa-frontend:local --build-arg VITE_API_BASE_URL=http://localhost:3000/api/v1 .
docker run --rm -p 8080:8080 pedmesa-frontend:local
```

## 5. Rollback

Toda imagem fica com a tag `sha-<commit>`: no Coolify, troque a tag para a anterior e faça _Redeploy_.

## 6. Problemas comuns

- **`tsc` passa localmente e o build quebra:** `npx tsc --noEmit` não checa nada neste repositório (o `tsconfig.json` é _solution-style_). Use `npm run check` ou `npm run build`.
- **Job Commits falha:** mensagem fora de `tipo(escopo): [PED-<ID>] descrição` ou acima de 100 caracteres.
- **CI acusa IP privado no bundle:** algum IP de rede interna entrou no código ou numa `VITE_*`. Se for um exemplo legítimo de interface, acrescente em `IPS_PERMITIDOS` no `ci.yml`.
- **App fora do ar depois do deploy com 502:** a porta no Coolify ainda está em 80; a imagem escuta na **8080**.
- **`a versão no ar é X, esperada Y`:** o Coolify terminou, mas o container antigo continua rodando; confira se a aplicação está como _Docker Image_ com a tag do ambiente.
- **`Método não aceito (405)` ou `COOLIFY_URL deve ser só o endereço do painel`:** o `COOLIFY_URL` deve ser só `https://seu-coolify`, sem caminho.
- **PWA não instala:** o nginx precisa servir o `.webmanifest` como `application/manifest+json` (já configurado no `nginx.conf`).
