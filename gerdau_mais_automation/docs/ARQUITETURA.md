# Arquitetura Técnica de Testes

## Visão geral

O projeto adota arquitetura de automação E2E baseada em:

- `specs` para descrever cenários
- `page objects` para encapsular ações e seletores
- `helpers` para responsabilidades transversais (ex.: login)
- `config` por ambiente para segurança e portabilidade

## Camadas

### 1. Camada de Cenários (`cypress/e2e`)

Responsável por:
- declarar o fluxo do teste
- organizar steps (Allure)
- manter foco em comportamento e regra de negócio

Não deve conter:
- muitos seletores de DOM
- lógica utilitária duplicada

### 2. Camada de Page Objects (`cypress/pages`)

Responsável por:
- localizar elementos
- centralizar ações de tela
- aplicar fallback de UI quando necessário

Observação:
- a classe `comprarPageMetods.js` ainda é o ponto de entrada principal usado pelos specs.
- já foi iniciada modularização interna com:
  - `comprarPageHelpers.js` (constantes e asserts reutilizáveis)
  - `comprarPageTipoCompraActions.js` (ações de navegação por tipo de compra)
  - `comprarPageCarrinhoBuscaActions.js` (ações de carrinho e busca)
  - `comprarPageEmissorActions.js` (seleção de emissor e fallback de dropdown/lista)
- essa abordagem mantém compatibilidade com os testes existentes e reduz acoplamento gradualmente.

### 3. Camada de Suporte (`cypress/support`)

Responsável por:
- comandos customizados (`commands.js`)
- setup global (`e2e.js`)
- helpers reutilizáveis (`helpers/auth.js`)

### 4. Camada de Configuração (`cypress.config.js` + `cypress.env.json`)

Responsável por:
- baseUrl
- timeouts
- retries
- variáveis sensíveis via ambiente

## Decisões arquiteturais atuais

- Padrão escolhido: **POM + helpers** (boa legibilidade e manutenção).
- Reuso de login: centralizado em `support/helpers/auth.js`.
- Priorização por risco: scripts P0/P1 no `package.json`.
- Segurança: segredos fora do código-fonte.
- **Relatório de execuções:** Allure (`allure-results` → `allure-report`); ver [`docs/ALLURE.md`](./ALLURE.md).

## Recomendações de evolução (boas práticas de mercado)

1. Concluir modularização de `comprarPageMetods.js` (extrair também emissor e planilha para actions dedicadas).
2. Introduzir `data-testid` estáveis no frontend (reduz flakiness drasticamente).
3. Separar suíte estável vs experimental em scripts distintos (já iniciado).
4. Adotar política de retries por tipo de teste (não global para tudo).
5. Criar smoke mínima para PR e regressão completa noturna.
