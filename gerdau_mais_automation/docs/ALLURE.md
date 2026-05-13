# Relatório Allure (painel de execuções)

O projeto grava resultados brutos em `allure-results/` após cada `cypress run` e gera o **painel HTML** em `allure-report/` com o **Allure Commandline**.

## Pré-requisitos

- **Java (JRE 8+)** instalado e no `PATH` — o gerador de relatório Allure roda sobre a JVM.
- Dependências Node instaladas na pasta `gerdau_mais_automation` (`npm install`), incluindo `allure-commandline`.

## Fluxo típico

1. **Rodar os testes** (preenche `allure-results/`):

   ```bash
   npm run cy:run
   ```

   Ou, para executar e já gerar o HTML do relatório:

   ```bash
   npm run cy:run:allure
   ```

2. **Gerar o painel** (lê `allure-results`, escreve `allure-report/`):

   ```bash
   npm run allure:generate
   ```

3. **Abrir no navegador** (servidor local apontando para `allure-report/`):

   ```bash
   npm run allure:open
   ```

4. **Atalho** — gerar e abrir em sequência:

   ```bash
   npm run allure:report
   ```

## Modo rápido (sem pasta `allure-report` fixa)

Sobe um servidor temporário a partir dos resultados atuais (útil logo após uma rodada):

```bash
npm run allure:serve
```

Interrompa com `Ctrl+C` quando terminar.

## Windows e caminhos com parênteses

Se a pasta do projeto estiver em um caminho como `Downloads\projeto (1)`, o shim padrão do npm para o comando `allure` pode falhar. Por isso os scripts usam `scripts/allure-cli.js`, que chama o `allure.bat` do pacote de forma estável.

## Painel online (GitHub Pages)

Este repositório inclui o workflow **`.github/workflows/allure-pages.yml`**, que:

1. Roda uma suíte Cypress (por padrão escolhida ao disparar o workflow).
2. Gera `allure-report/` com `npm run allure:generate`.
3. Publica a pasta como site estático no **GitHub Pages**.

Se o projeto ainda não estiver publicado no GitHub (instalar Git, primeiro `push`, token, pasta raiz correta), siga **[GITHUB.md](GITHUB.md)**.

### Configuração única no GitHub

1. **Settings → Pages → Build and deployment**  
   - Em **Source**, escolha **GitHub Actions**.  
   - Se ainda estiver em “Deploy from a branch”, altere para **GitHub Actions** e salve. Sem isso, o job de deploy não publica o site do repositório.

2. **Settings → Secrets and variables → Actions** — cadastre (valores alinhados ao seu `cypress.env.json` local e ao ambiente QA):

   | Segredo | Uso |
   |--------|-----|
   | `CYPRESS_USERNAME` | E-mail ou usuário do login QA |
   | `CYPRESS_PASSWORD` | Senha (em segredos nunca aparece em log bruto; ainda assim use conta dedicada a testes) |
   | `CYPRESS_EMISSOR` | Texto exato do emissor na lista (ex.: razão social) |
   | `CYPRESS_PRODUTO` | Código numérico/SKU usado nos fluxos de busca |
   | `CYPRESS_AUTH_CLIENT_ID` | Opcional, se o login depender de client id na API |
   | `CYPRESS_AUTH_CLIENT_SECRET` | Opcional |

   Use **New repository secret** para cada nome acima. O workflow lê `secrets.CYPRESS_USERNAME` e expõe como variável de ambiente `CYPRESS_username` para o Cypress (padrão oficial do prefixo `CYPRESS_`).

3. **Permissões do Actions** (se o repositório for novo ou restrito): em **Settings → Actions → General**, confira que workflows podem rodar e que **Read and write** (ou o padrão recomendado pelo GitHub para Pages) está permitido conforme a política da org.

---

### Opção A — Deploy manual só pelo navegador (sem `git push`)

Indicado quando você já tem o workflow no GitHub e quer **gerar o painel agora**, sem abrir terminal local.

1. Entre no repositório no GitHub (ex.: `https://github.com/<dono>/<repo>`).
2. Aba **Actions**.
3. À esquerda, clique no workflow **“Allure — publicar painel (GitHub Pages)”**.  
   - Atalho direto: `https://github.com/<dono>/<repo>/actions/workflows/allure-pages.yml`
4. Botão **Run workflow** (canto superior direito).
5. Escolha o **branch** (normalmente `main` ou `master`).
6. No campo **Suíte npm**, escolha por exemplo:
   - **`cy:run:smoke-pr`** — mais rápido (login + vitrine + histórico);
   - **`cy:run:regression-nightly`** — lista maior de specs;
   - **`cy:run`** — suíte completa do `package.json`;
   - **`cy:run:p0`** — smoke crítica de compras + login.
7. Confirme **Run workflow**.
8. Abra a execução que acabou de aparecer na lista:
   - Job **build**: instala dependências, roda Cypress, gera Allure.
   - Job **deploy**: publica no Pages (depende do build ter subido o artefato).
9. Ao terminar com sucesso, a **URL do site** costuma aparecer:
   - No job **deploy**, na seção do ambiente **github-pages**, ou
   - Em **Settings → Pages** (endereço do site publicado).
10. Padrão de URL: `https://<dono>.github.io/<repo>/` — ex.: organização/usuário `davibrito-ilab` e repo `gerdau` → `https://davibrito-ilab.github.io/gerdau/`.

**Observações**

- Na **primeira** vez, o GitHub pode pedir **aprovação** do ambiente “github-pages” (e-mail ou botão de confirmação), conforme política do repositório/org.
- Se o job **build** falhar antes do Cypress (ex.: `npm ci`), corrija `package-lock.json` ou caminhos do workflow.
- Se o Cypress falhar por credencial, revise os segredos; o workflow ainda tenta **gerar o Allure** depois (`continue-on-error` no passo de testes), então o painel pode mostrar **falhas** — o que é esperado para diagnóstico.

---

### Opção B — Deploy automático com `git push` (na sua máquina)

Indicado quando você **alterou testes ou o workflow** e quer que o GitHub **rode sozinho** após enviar o commit.

1. **Pré-requisitos locais:** Git instalado, clone do repositório, permissão de push no branch padrão (`main` ou `master`).
2. Copie as alterações do projeto para o clone (ou trabalhe direto no clone).
3. Confirme que a estrutura no remoto bate com o esperado pelo workflow: pasta **`gerdau_mais_automation/`** na **raiz do repositório** (com `package.json` e `cypress/` dentro dela), e **`.github/workflows/allure-pages.yml`** na raiz. Se o seu GitHub for só o conteúdo interno (sem essa pasta-pai), será preciso ajustar `working-directory` e `path` no YAML.
4. Escolha arquivos que, ao mudarem, **disparam** o workflow (gatilhos configurados):
   - qualquer coisa sob `gerdau_mais_automation/**`, ou
   - o próprio `.github/workflows/allure-pages.yml`.
5. No terminal, na raiz do repositório:

   ```bash
   git status
   git add gerdau_mais_automation .github
   git commit -m "chore: atualiza automação e/ou workflow Allure Pages"
   git push origin main
   ```

   Substitua `main` por `master` se for o branch padrão do repo.

6. No GitHub, abra **Actions** e verifique a execução disparada pelo **push**. Não é necessário clicar em **Run workflow** nesse caso.
7. **Suíte utilizada no push:** o workflow usa **`cy:run:smoke-pr`** por padrão (não há como escolher outra suíte pelo commit sem mudar o YAML ou usar a Opção A). Para regressão completa sem alterar código, use a Opção A e selecione `cy:run` ou `cy:run:regression-nightly`.

**Observações**

- **Conflitos de concorrência:** o workflow usa `concurrency: allure-github-pages` para evitar dois deploys publicando ao mesmo tempo; execuções antigas podem ser enfileiradas ou canceladas conforme a regra do grupo.
- **Branch:** só `main` e `master` estão no gatilho `push`; outro branch não publica o Pages automaticamente até você acrescentá-lo no `on.push.branches` do workflow ou abrir PR para `main`.

---

### URL do painel

Após o primeiro deploy bem-sucedido, a URL aparece no job **deploy** e segue o padrão:

`https://<dono>.github.io/<repositorio>/`

(O relatório Allure usa caminhos relativos; em subcaminho `/repo/` o painel costuma abrir corretamente. Se algo quebrar, use um domínio customizado ou hospede `allure-report/` na raiz de um site.)

### Falhas nos testes

O passo do Cypress usa `continue-on-error: true` e o relatório é gerado com `if: always()`, para o painel online refletir **suites com falhas** (útil para diagnóstico).

### Outras opções

Qualquer hospedagem de arquivos estáticos serve: faça upload da pasta `allure-report/` após `npm run allure:generate` (Azure Static Web Apps, S3+CloudFront, Netlify “deploy directory”, etc.).

## Publicar o relatório em CI (genérico)

- Artefatos: `allure-results/` (após o Cypress) e/ou `allure-report/` (após `allure:generate`).
- Em outros pipelines, execute `npm run allure:generate` e publique `allure-report/` como site estático ou anexe o zip como artefato.

## Referência

- [Allure Report](https://docs.qameta.io/allure/)
- Configuração Cypress: `cypress.config.js` (`allureCypress`, `resultsDir: "allure-results"`).
- Import no support: `cypress/support/e2e.js` (`import "allure-cypress"`).
