# Gerdau Mais Automation

Automação E2E da plataforma Gerdau Mais com **Cypress**.

Este guia serve para qualquer pessoa **clonar, configurar credenciais e executar os testes** sem conhecer o histórico do projeto.

---

## Guia rápido (primeira execução)

1. Instale **[Node.js 18 ou superior](https://nodejs.org/)** (no Windows, pode marcar a opção de instalar as ferramentas necessárias). Confirme no terminal:

   ```bash
   node -v
   npm -v
   ```

2. Abra o terminal **na pasta do projeto** onde está este `README.md` (`gerdau_mais_automation/`).

   **PowerShell no Windows:** se o caminho tiver espaços ou parênteses, use aspas ao mudar de pasta:

   ```powershell
   Set-Location "C:\caminho\para\gerdau_mais_automation"
   ```

3. Instale as dependências **nesta pasta** (é aqui que o Cypress e os pacotes ficam instalados):

   ```bash
   npm install
   ```

   Na **raiz de um monorepo** onde existe um `package.json` “atalho”: esse ficheiro **não** traz dependências do Cypress por si; quem conta é sempre **`npm install` dentro de `gerdau_mais_automation/`**.

4. Copie as variáveis de ambiente de exemplo para o ficheiro real **(obrigatório para login)**

   **Git Bash / macOS / Linux**

   ```bash
   cp cypress.env.example.json cypress.env.json
   ```

   **PowerShell (Windows)**

   ```powershell
   Copy-Item cypress.env.example.json cypress.env.json
   ```

5. Abra **`cypress.env.json`** num editor de texto e preencha pelo menos **`username`** e **`password`** com uma conta válida no **QA**. Ajuste também **`emissor`** e **`produto`** conforme dados que o QA/equipa lhe indicar (`cypress.config.js` define valores por omissão, mas uma conta específica pode exigir outro emissor na lista).

6. Valide que o Cypress está bem instalado (opcional, mas recomendado na primeira vez):

   ```bash
   npx cypress verify
   ```

7. Execute **um conjunto pequeno** para ver se a configuração funciona:

   ```bash
   npm run cy:run:login
   ```

   Se aparecer resultado “passing” para os testes de login, está pronto para correr outros scripts (ver secção seguinte).

**Ambiente alvo**

- **`baseUrl`** (QA): **`https://qa.gab.egerdau.com.br`** (`cypress.config.js`).
- Ligação estável ao QA e conta com permissões de uso no portal são necessárias para a suíte completa passar.

---

## 1) O que este projeto faz

- Executa testes de ponta a ponta (E2E) no ambiente **QA**.
- Valida fluxos críticos: login, compras, pedidos, menu, finanças e documentos.
- **Inventário:** **40** ficheiros `*.cy.js`, **55** casos `it` (detalhes em [`docs/RELATORIO-AUTOMACAO-E2E-TEXTO-COMPLETO.md`](docs/RELATORIO-AUTOMACAO-E2E-TEXTO-COMPLETO.md)).
- Gera vídeo (opcional), **screenshots** em falhas e integração opcional com **Allure**.

---

## 2) Duas formas de correr comandos npm

### Forma recomendada (mais simples)

Sempre estar **dentro** de `gerdau_mais_automation/`:

```bash
npm run cy:open
npm run cy:run:login
npm run cy:run:fast
```

### Raiz do monorepo

Se existir um `package.json` na pasta **acima**, alguns comandos apenas fazem `cd gerdau_mais_automation && …`. Também funcionam desde que já tenha corrido **`npm install` dentro de `gerdau_mais_automation`**.

Na raiz:

```bash
npm run cy:run:login
```

---

## 3) Pré-requisitos

| Item | Obrigatório? | Nota |
|------|---------------|------|
| **Node.js 18+** (recomendado 20+ ou 22) | Sim | LTS suficiente. |
| **npm** | Sim | Vem com o Node. |
| **Credenciais QA** válidas (`cypress.env.json`) | Sim | Sem isto falha logo no login. |
| **Rede até o QA** | Sim | Testes navegam contra `baseUrl`. |
| **Java (JRE 8+)** | Só para Allure HTML | Opcional só para relatório completo (`npm run allure:generate`). |
| **Google Chrome instalado** | Recomendado | Para `npm run cy:run:headed` ou `*:headed:fast`. Por omissão a suíte usa **Electron (headless)**. |

Variáveis de ambiente são lidas assim:

1. **`cypress.env.json`** (não vai para o Git por ser segredo).
2. Prefijo **`CYPRESS_`** nas variáveis de ambiente (ex.: CI com `CYPRESS_username`).
3. Fallbacks declarados em `cypress.config.js` → secção **`env`** (ex.: URLs de login/token).

Opcional útil nos testes de planilha (2 linhas): em `cypress.env.json`, **`planilha_2_linhas_strict`** — `false` mantém comportamento permissivo/`skip`; `true` exige evidência forte na grade (ver exemplo em [`cypress.env.example.json`](cypress.env.example.json)).

---

## 4) Estrutura (resumo)

```txt
gerdau_mais_automation/
  cypress.config.js           # baseUrl QA, timeouts, env default
  cypress.env.example.json    # modelo — copiar → cypress.env.json
  cypress.env.json           # ⚠ você cria este ficheiro (local, não commitar)
  cypress/e2e/               # specs .cy.js
  cypress/pages/             # Page objects
  cypress/support/           # comandos globais + helpers + e2e.js (Allure)
  package.json               # todos os npm run cy:* e allure:*
docs/                        # guias de cobertura, Allure, BDD…
```

---

## 5) Comandos mais usados

Correr **dentro de `gerdau_mais_automation/`**:

| Para quê… | Comando |
|-----------|---------|
| **Primeira validação (só login)** | `npm run cy:run:login` |
| Abrir modo interativo (escolher spec no browser Cypress) | `npm run cy:open` |
| Rodar **toda** a suíte (com vídeo) | `npm run cy:run` |
| Mesma coisa mas **sem vídeo** (mais rápido) | `npm run cy:run:fast` |
| Smoke (login + vitrine + histórico) | `npm run cy:run:smoke` (alias de `cy:run:smoke-pr`) |
| Lista completa de scripts | Abrir [`package.json`](package.json) → `"scripts"` |

Gerar **painel HTML Allure** (precisa Java):

```bash
npm run cy:run
npm run allure:generate
npm run allure:open
```

Atalhos: `npm run allure:report`, `npm run allure:serve`. Documentação Pages/CI em [`docs/ALLURE.md`](docs/ALLURE.md).

Gerar fixtures XLSX de planilhas (opcional):

```bash
npm run fixtures:planilhas
```

---

## 6) Troubleshooting rápido

| Sintoma | O que fazer |
|---------|--------------|
| `Defina … username/password` ou login falha | Confirme `cypress.env.json` nesta pasta ou variáveis `CYPRESS_username` / `CYPRESS_password`. |
| Erro campo **emissor** indisponível | QA instável ou emissor não listado para a conta; alinhar `emissor` com texto exato pedido pela equipa ou voltar a correr quando o QA responder. Ver também `npm run cy:run:headed:fast -- --browser chrome` para debug visual. |
| Aviso no Windows sobre **“failed to trash”** screenshots/auth | Mensagem benigna para o resultado dos testes; pode ignorar ou limpar pasta `cypress/screenshots` manualmente. |
| Pasta do projeto dentro de **`Downloads\User (1)`** | Evite problema de caminhos: mova para um caminho mais curto ou use sempre `Set-Location "..."` com aspas. |
| Cypress / políticas Chrome corporativas | Em alguns PCs o Chrome é bloqueado por políticas; use `cy:run` (Electron headless) ou rode em máquina/VM menos restrita. |

Mais detalhe para **CI** (variáveis do pipeline) e alinhamento com o ambiente: ver histórico de alterações em [`docs/ALTERACOES.md`](docs/ALTERACOES.md) e o guia de cobertura.

---

## 7) Arquitetura e convenções (resumo)

- **Page Objects** em `cypress/pages/`, especialmente `comprarPageMetods.js` e divisões helper.
- **Helpers** transversais: `cypress/support/helpers/auth.js`, `fluxoCompra.js`, etc.
- Specs só em **`cypress/e2e/*/…cy.js`**.
- Mais detalhe: [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md), [`GUIA-COBERTURA-AUTOMACAO-E2E.md`](GUIA-COBERTURA-AUTOMACAO-E2E.md).

---

## 8) Matriz / roadmap negócio

[`docs/matriz-cenarios-automacao.md`](docs/matriz-cenarios-automacao.md).

---

## 9) GitHub e painel público Allure

- **`docs/GITHUB.md`** — primeiro `push`, token, Actions.
- **`docs/ALLURE.md`** — relatório online (GitHub Pages).
