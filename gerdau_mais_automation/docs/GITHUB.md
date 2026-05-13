# Integração com GitHub (repositório + Actions + Pages)

Este projeto já inclui o workflow [`.github/workflows/allure-pages.yml`](../../.github/workflows/allure-pages.yml) na **raiz do monorepo**. O GitHub precisa enxergar esta estrutura:

```txt
(repositório)
  .github/workflows/allure-pages.yml
  gerdau_mais_automation/
    package.json
    package-lock.json
    cypress/
  LICENSE
  .gitignore
  package.json        (atalhos na raiz; opcional)
  README.md
```

Se o repositório no GitHub tiver **apenas** o conteúdo de `gerdau_mais_automation/` (sem pasta pai), o workflow precisa ser ajustado — mantenha o layout acima para não quebrar o CI.

---

## 1) Instalar o Git no Windows

1. Baixe e instale o [Git for Windows](https://git-scm.com/download/win).
2. Nas opções do instalador, marque **“Git from the command line and also from 3rd-party software”** (PATH).
3. Feche e abra de novo o PowerShell ou o Cursor.

Confirme no terminal:

```powershell
git --version
```

Se ainda aparecer “não reconhecido”, reinicie o PC ou adicione manualmente `C:\Program Files\Git\cmd` ao PATH.

**Alternativa sem linha de comando:** [GitHub Desktop](https://desktop.github.com/) — permite clonar, commitar e publicar com interface gráfica (use a mesma pasta raiz do projeto).

---

## 2) Criar o repositório vazio no GitHub

1. Em https://github.com/new crie um repositório **vazio** (sem README, sem .gitignore, sem licença, se você já tem isso localmente).
2. Anote a URL HTTPS, por exemplo: `https://github.com/SEU_USUARIO/SEU_REPO.git`.

---

## 3) Abrir a pasta certa no terminal

O Git só funciona **dentro da pasta do projeto** (a que contém `.gitignore` e `gerdau_mais_automation/`).

Se a pasta do Windows tiver espaços ou parênteses, use aspas:

```powershell
Set-Location -LiteralPath "C:\caminho\completo\para\gerdau_mais_automation (1) (1)"
```

Não rode `git init` a partir de `C:\` nem de uma subpasta errada.

---

## 4) Primeiro commit e envio (HTTPS + token)

No PowerShell, **na raiz do monorepo**:

```powershell
git init
git branch -M main
git add .
git status
git commit -m "feat: automação E2E Gerdau Mais, Allure e workflow GitHub Pages"
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

Na primeira vez, o Git pedirá login. **Senha da conta GitHub não funciona** em HTTPS: use um **Personal Access Token (PAT)** com permissão `repo`.

- Criar token: GitHub → **Settings** → **Developer settings** → **Personal access tokens**.

Se o remoto já existir e estiver errado:

```powershell
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
```

---

## 5) Segredos para o Cypress rodar no Actions

No repositório: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Crie estes segredos (nomes **exatamente** assim — o workflow lê estes nomes):

| Secret | Descrição |
|--------|-----------|
| `CYPRESS_USERNAME` | Usuário QA |
| `CYPRESS_PASSWORD` | Senha QA |
| `CYPRESS_EMISSOR` | Emissor válido no QA |
| `CYPRESS_PRODUTO` | Código de produto usado nos testes |
| `CYPRESS_AUTH_CLIENT_ID` | Client ID OAuth |
| `CYPRESS_AUTH_CLIENT_SECRET` | Client secret OAuth |

Os valores devem ser os mesmos que você usa localmente em `cypress.env.json` (que **não** sobe para o Git — está no `.gitignore`).

---

## 6) GitHub Pages (relatório Allure online)

1. **Settings** → **Pages** → **Build and deployment** → **Source:** **GitHub Actions** (não “Deploy from a branch” clássico com branch `gh-pages`, a menos que você mude a estratégia).
2. Rode o workflow manualmente: **Actions** → **Allure — publicar painel (GitHub Pages)** → **Run workflow**.
3. A URL pública fica no formato: `https://SEU_USUARIO.github.io/SEU_REPO/`

Detalhes e troubleshooting do Allure: [`docs/ALLURE.md`](ALLURE.md).

---

## 7) Problemas frequentes

| Sintoma | O que fazer |
|---------|-------------|
| `git` não é reconhecido | Instalar Git for Windows e reiniciar o terminal; conferir PATH. |
| `not a git repository` | Dar `cd` na raiz correta (onde está `.gitignore`). |
| `failed to push` / autenticação | Usar PAT no lugar da senha; conferir URL do `origin`. |
| Workflow falha ao ajustar cache npm | Garantir que `gerdau_mais_automation/package-lock.json` está commitado. |
| Testes falham só no CI | Conferir segredos `CYPRESS_*` e dados de emissor/produto no QA. |
| Pages em branco | Pages com **source** = GitHub Actions; aguardar o job **deploy** após o **build**. |

---

## 8) SSH (opcional)

Se preferir SSH em vez de HTTPS:

```powershell
git remote set-url origin git@github.com:SEU_USUARIO/SEU_REPO.git
```

É necessário chave SSH cadastrada em GitHub (**Settings** → **SSH and GPG keys**).
