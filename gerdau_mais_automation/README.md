# Gerdau Mais Automation

Automação E2E da plataforma Gerdau Mais com Cypress.

Este guia foi escrito para qualquer pessoa conseguir rodar os testes, mesmo sem experiência prévia no projeto.

## 1) O que este projeto faz

- Executa testes de ponta a ponta (E2E) no ambiente QA.
- Valida fluxos críticos como login, compras e pedidos.
- Gera evidências de execução (screenshots e relatório Allure).

## 2) Estrutura do repositório

Este projeto usa uma estrutura em dois níveis:

- pasta raiz: scripts de atalho para quem executa o projeto
- pasta `gerdau_mais_automation`: código principal dos testes

### Estrutura principal

```txt
gerdau_mais_automation/
  scripts/
    allure-cli.js
  cypress/
    e2e/
      auth/
      compras/
      pedidos/
    pages/
    support/
      helpers/
  cypress.config.js
  cypress.env.example.json
  package.json
docs/
  matriz-cenarios-automacao.md
  ALLURE.md
```

## 3) Pré-requisitos

- Node.js 18+ (recomendado 20+)
- npm
- Java (JRE 8+) para gerar o relatório Allure (`npm run allure:generate`)
- Acesso ao ambiente QA

## 4) Setup inicial (passo a passo)

### Passo 1 - Instalar dependências

Na pasta raiz do workspace:

```bash
npm install
cd gerdau_mais_automation
npm install
```

### Passo 2 - Configurar variáveis locais

Na pasta `gerdau_mais_automation`, crie o arquivo `cypress.env.json` usando o exemplo:

```json
{
  "username": "seu.usuario@empresa.com",
  "password": "sua-senha",
  "invalidUsername": "usuario.invalido@empresa.com",
  "invalidPassword": "senha-invalida",
  "emissor": "ACOS FAVORIT DISTRIBUIDORA LTDA.",
  "produto": "106040273",
  "auth_client_id": "seu-client-id",
  "auth_client_secret": "seu-client-secret",
  "auth_token_url": "https://gerdau-authentications.us-e1.cloudhub.io/api/token",
  "auth_login_url": "https://qa-experience-gerdau-gmais-login.us-e1.cloudhub.io/api/v1/login"
}
```

> Importante: não versionar `cypress.env.json` (arquivo local com segredos).

## 5) Comandos mais usados

> Você pode rodar pela raiz ou pela pasta interna.  
> Abaixo estão os comandos da pasta raiz.

- Abrir Cypress (modo visual): `npm run cy:open`
- Rodar tudo: `npm run cy:run`
- Rodar login: `npm run cy:run:login`
- Rodar compras: `npm run cy:run:compras`
- Rodar suíte crítica P0: `npm run cy:run:p0`
- Rodar suíte P1 estável (Pedidos): `npm run cy:run:p1`
- Rodar P1 opcional (instável por ambiente): `npm run cy:run:p1-compras-opcional`
- Rodar P0 + P1 estável: `npm run cy:run:p0-p1`

## 6) Arquitetura de testes (boas práticas aplicadas)

- **Page Object Model** para reduzir duplicação em seletores e ações.
- **Helper de autenticação central** em `cypress/support/helpers/auth.js`.
- **Configuração por ambiente** via `cypress.env.json` e `CYPRESS_*`.
- **Tags por criticidade** (`@smoke`, `@critical`, `@regression`, `@p1`).
- **Fallbacks de resiliência** para lidar com loading/instabilidade do QA.
- **Relatórios e evidências** com Allure + screenshots em falha.

## 7) Convenções do projeto

- Specs terminam com `.cy.js`.
- Organização por domínio em `cypress/e2e`:
  - `auth` (autenticação)
  - `compras` (fluxos de compra)
  - `pedidos` (módulo de pedidos)
- Métodos de interação ficam em `cypress/pages/*Metods.js`.
- O domínio de compra já possui módulos auxiliares internos:
  - `cypress/pages/comprarPage/comprarPageHelpers.js`
  - `cypress/pages/comprarPage/comprarPageTipoCompraActions.js`
  - `cypress/pages/comprarPage/comprarPageCarrinhoBuscaActions.js`
- Evite colocar regras de negócio direto no spec; prefira abstrair nos pages/helpers.

## 8) Relatório Allure (painel de execuções)

1. Rodar os testes (gera `allure-results/`):

   ```bash
   npm run cy:run
   ```

2. Gerar o HTML do painel (gera `allure-report/`):

   ```bash
   npm run allure:generate
   ```

3. Abrir no navegador:

   ```bash
   npm run allure:open
   ```

**Atalhos**

- `npm run cy:run:allure` — roda a suíte e gera o relatório em seguida.
- `npm run allure:report` — `allure:generate` + `allure:open`.
- `npm run allure:serve` — sobe o painel direto de `allure-results` (temporário; bom para olhar logo após a execução).

É necessário **Java (JRE)** instalado para o comando Allure. **Painel publicado na internet:** veja GitHub Actions + Pages em [`docs/ALLURE.md`](docs/ALLURE.md#painel-online-github-pages).

**Primeiro envio para o GitHub (instalar Git, `remote`, token, segredos do Actions):** [`docs/GITHUB.md`](docs/GITHUB.md).

## 9) Troubleshooting (problemas comuns)

### Erro: `Defina CYPRESS_username e CYPRESS_password`
- Falta configuração no `cypress.env.json` ou variáveis de ambiente.

### Erro: campo de emissor não disponível
- Instabilidade do QA.
- Reexecutar a suíte (há retries e fallback já implementados).
- Priorizar execução no Chrome (`--browser chrome`), que está mais estável no projeto.

### Teste passa local e falha no CI
- Verificar variáveis de ambiente do pipeline.
- Confirmar acesso de rede ao ambiente QA.
- Validar dados de emissor/produto no ambiente de execução.

## 10) Roadmap de automação

A matriz de cenários está em:

- `docs/matriz-cenarios-automacao.md`

Ela define prioridade P0/P1/P2/P3 e orienta a evolução da suíte por risco de negócio.