# Guia de cobertura da automação E2E — Gerdau Mais

**Inventário em texto corrido (todos os `describe`/`it`, 28 specs):** [`RELATORIO-AUTOMACAO-E2E-TEXTO-COMPLETO.md`](./RELATORIO-AUTOMACAO-E2E-TEXTO-COMPLETO.md)  
**Checklist pré-deploy (visão gerencial, tabelas por jornada):** [`CHECKLIST-PRE-DEPLOY-COBERTURA-AUTOMACAO-E2E.md`](./CHECKLIST-PRE-DEPLOY-COBERTURA-AUTOMACAO-E2E.md)

**Versão do documento:** alinhada ao repositório em **2026-05-13**  
**Ferramenta:** Cypress 14.x (`cypress/e2e`)

> **Sobre o PDF de referência:** não há cópia do PDF anexado versionada neste repositório. Este guia replica a **estrutura típica** de checklist / matriz pré-deploy (objetivo, prioridades, cenários, critérios e comandos) e reflete **exclusivamente** o que está implementado hoje nos specs e scripts.

---

## 1. Objetivo

- Servir de **mapa único** entre negócio/QA e o que está automatizado.
- Facilitar **regressão** (smoke vs nightly vs suite completa).
- Registrar **comportamentos condicionais** (skip, smoke sem fixture, export opcional).

---

## 2. Ambiente e configuração

| Item | Valor (padrão no código) |
|------|---------------------------|
| Base URL | Definida em `cypress.config.js` → `e2e.baseUrl` |
| Credenciais / emissor / produto | `Cypress.env` / `cypress.env.json` (ex.: `username`, `password`, `emissor`, `produto`) |
| URLs de auth | `auth_login_url`, `auth_token_url`, etc. em `cypress.config.js` → `env` |

Execução típica (na pasta `gerdau_mais_automation`):

```bash
npm install
npx cypress run
```

**Escopo de plataforma e navegador (alinhamento de produto):**

- **Viewport desktop:** `viewportWidth` / `viewportHeight` em `cypress.config.js` refletem uso típico em **desktop**. Mobile / responsividade **não é prioridade** para o produto nem para a automação (sem suíte responsiva versionada).
- **Chrome:** **navegador de referência** da aplicação e da suíte (stack Chromium do Cypress; scripts opcionais com `--browser chrome` onde existirem). Outros navegadores **não são alvo formal**; o portal pode recomendar Chrome ao usuário.

---

## 3. Legenda de prioridade (negócio)

Alinhada à matriz estratégica em `docs/matriz-cenarios-automacao.md`:

| Nível | Uso sugerido |
|-------|----------------|
| **P0** | Crítico — receita / bloqueio forte — smoke diária |
| **P1** | Alto impacto — regressão frequente |
| **P2** | Médio — regressão completa |
| **P3** | Baixo ou não funcional — janela dedicada |

Nos specs, as tags `@smoke`, `@critical`, `@p1`, `@p2`, `@negative`, etc. complementam essa visão.

---

## 4. Resumo quantitativo

| Métrica | Valor (referência última suite completa documentada) |
|---------|--------------------------------------------------------|
| Arquivos spec (`*.cy.js`) | **28** |
| Casos de teste (`it`) | **33** (inclui **1** teste que pode ficar **pending** por `skip` intencional) |
| Pastas | `auth/`, `compras/`, `pedidos/`, `menu/`, `financas/`, `documentos/` |

---

## 5. Inventário por módulo

### 5.1 Autenticação (`cypress/e2e/auth/`)

| Arquivo | Cenário (título do `it`) | Tags / observação |
|---------|-------------------------|-------------------|
| `login.cy.js` | Login com credenciais válidas | `@smoke @positive` |
| `login.cy.js` | Login com email inválido | `@negative @security` |
| `login.cy.js` | Login com senha inválida | `@negative @security` |
| `login.cy.js` | Login com campos vazios | `@validation @negative` |
| `login.cy.js` | Login com apenas email preenchido | `@validation @negative` |
| `logoutProtegida.cy.js` | Após logout, acesso a rota protegida redireciona para login | `@regression @security` — usa `fazerLogoutResiliente()` em `support/helpers/auth.js` |

**Correspondência aproximada com IDs legados da matriz:** AUT-001, AUT-002 (+ variações de validação); logout como extensão de segurança de sessão.

---

### 5.2 Compras (`cypress/e2e/compras/`)

Os fluxos principais de compra usam o helper **`cypress/support/helpers/fluxoCompra.js`** (landing, emissor, tipo de compra, carrinho, modais, finalização) e **`cypress/support/helpers/pedido.js`** para checkout e confirmação de pedido efetivado, salvo onde o próprio spec declara outro critério.

| Arquivo | Cenário (título do `it`) | Tags / observação |
|---------|-------------------------|-------------------|
| `compraPorVitrine.cy.js` | Comprar Por Vitrine | `@smoke @critical` — happy path vitrine até pedido enviado |
| `compraPorHistorico.cy.js` | Comprar Por Histórico | `@smoke @critical @regression` — inclui smoke de `/repeat-order` + fallback catálogo quando necessário |
| `compraSelecionandoItens.cy.js` | Comprar selecionando itens | `@smoke @critical` |
| `compraPorPlanilha.cy.js` | Comprar Por Planilha | `@smoke @critical` — smoke planilha + fallback catálogo se aplicável |
| `compraFinalizacaoCompleta.cy.js` | Finalizar pedido completo (passos 1-4) | `@smoke @critical` |
| `compraSemEmissor.cy.js` | Bloqueia avanço da compra sem emissor | `@smoke @critical` |
| `carrinhoQuantidade.cy.js` | Incrementa quantidade do primeiro item no carrinho | `@regression @p1` — **AUT-009** |
| `carrinhoRemocao.cy.js` | Remove item do carrinho | `@regression @p1` — **AUT-010** |
| `carrinhoPersistencia.cy.js` | Mantém evidência de carrinho após recarregar a página | `@regression @p1` — **AUT-011** |
| `carrinhoPersistenciaRelogin.cy.js` | Mantém evidência de carrinho após novo login | `@regression @p1` — **AUT-012** |
| `buscaSemResultados.cy.js` | Busca sem resultados exibe estado adequado | `@regression @p1` — **AUT-014** |
| `vitrineBuscaCatalogo.cy.js` | Busca produto por texto ou SKU no catálogo | `@regression @p2` |
| `vitrineMaisDetalhes.cy.js` | Abre detalhes quando o CTA existir (senão skip) | `@regression @p2` — **`this.skip()`** se não houver texto de CTA na listagem |
| `planilhaDownloadModelo.cy.js` | Dispara download ou abertura do modelo quando disponível | `@regression @p2` — interação **condicional** à UI |
| `planilhaUploadArquivoInvalido.cy.js` | Rejeita arquivo que não é planilha (ex.: .txt) | `@negative @p2` — fixture `cypress/fixtures/planilha-invalida.txt` |
| `posPedidoMeusPedidosEPdf.cy.js` | Após envio, exibe CTAs de PDF e Meus pedidos | `@regression @p1` — pós-finalização + navegação para pedidos |
| `carrinhoChecklistCampos.cy.js` | Detecta campos opcionais de edição no carrinho | `@regression @p3` — smoke **não bloqueante** para checklist (unidade/destinação/pagamento) |

**Correspondência aproximada:** AUT-003 a AUT-008 (fluxos de compra e finalização), AUT-009–012, AUT-014; vitrine busca/detalhes/planilha negativa/pós-pedido como extensões além da matriz original de 30 itens.

---

### 5.3 Pedidos (`cypress/e2e/pedidos/`)

Fluxo real documentado no changelog: `/orders` como **hub** (aços longos/planos vs corte/dobra). Ações de filtro reutilizam **`cypress/support/helpers/pedidosFiltros.js`** onde aplicável.

| Arquivo | Cenário (título do `it`) | Tags / observação |
|---------|-------------------------|-------------------|
| `pedidosListagem.cy.js` | Hub `/orders` — dois fluxos (longos/planos e corte/dobra) | `@smoke @pedidos` |
| `pedidosListagem.cy.js` | Carteira de aços longos — filtros e lista | `@regression @p1 @pedidos` |
| `pedidosBuscar.cy.js` | Dispara "Buscar Pedidos" mantendo filtros default da tela | `@smoke @pedidos` |
| `pedidosFiltroEmissor.cy.js` | Filtra por emissor configurado no env e busca | `@regression @p2 @pedidos` |
| `pedidosFiltroTipoPedido.cy.js` | Alterna para Faturado e dispara busca | `@regression @p1 @pedidos` |
| `pedidosExportarCarteira.cy.js` | Dispara exportação da carteira | `@regression @p2 @pedidos` — **opcional** se o texto/CTA não existir no QA |
| `pedidosCorteEDobra.cy.js` | Acessa carteira de corte e dobra a partir do hub | `@regression @p2 @pedidos` |

**Nota:** o módulo **Pedidos** do menu **não** é o mesmo fluxo que **Comprar → repetir pedido** (`compraPorHistorico.cy.js` → `/repeat-order`).

---

### 5.4 Menu, Finanças e Documentos

| Pasta | Arquivo | Cenário (título do `it`) | Tags |
|-------|---------|-------------------------|------|
| `menu/` | `menuSuperiorCobertura.cy.js` | Cobre navegação dos itens do menu superior | `@regression @menu` |
| `financas/` | `financasBusca.cy.js` | Acessa finanças e executa busca com filtros | `@regression @menu @financas` |
| `documentos/` | `documentosBusca.cy.js` | Acessa documentos e executa busca por período | `@regression @menu @documentos` |

---

## 6. Scripts NPM (escopos prontos)

Todos executados a partir de `gerdau_mais_automation` (ver `package.json`).

| Script | Escopo |
|--------|--------|
| `npm run cy:run` | **Suite completa** — todos os `cypress/e2e/**/*.cy.js` |
| `npm run cy:run:smoke-pr` | Login + vitrine + histórico |
| `npm run cy:run:regression-nightly` | Smoke compras ampliada + pedidos listagem + menu + finanças + documentos |
| `npm run cy:run:p0` | Login + principais fluxos de compra P0 |
| `npm run cy:run:p0-p1` | P0 + `pedidosListagem` |
| `npm run cy:run:p1` | Apenas `pedidosListagem` (Chrome) |
| `npm run cy:run:p1-compras-opcional` | Carrinho persistência (refresh) + busca sem resultados |
| `npm run cy:run:auth` | Todos os specs em `auth/*.cy.js` |
| `npm run cy:run:compras` | Todos os specs em `compras/*.cy.js` |
| `npm run cy:run:compras:chrome` | Idem, browser Chrome |
| `npm run cy:run:menu` / `cy:run:financas` / `cy:run:documentos` | Módulo isolado |
| `npm run cy:run:operacional-modulos` | Menu + pedidos + finanças + documentos |
| `npm run cy:open` | Modo interativo |

---

## 7. Evidências e relatórios

- **Allure:** plugin em `cypress.config.js` (`allureCypress`, pasta `allure-results/`); geração do painel HTML com `npm run allure:generate`, abertura com `npm run allure:open`; atalhos `allure:report`, `allure:serve`, `cy:run:allure`. Requer **Java** e o pacote `allure-commandline`. **Painel online:** workflow na raiz do repositório `.github/workflows/allure-pages.yml` (GitHub Pages). Guia: [`docs/ALLURE.md`](./ALLURE.md).
- **Vídeos / screenshots:** conforme `cypress.config.js` (ex.: vídeo em falhas ou conforme política atual do projeto).
- **Histórico de mudanças:** `docs/ALTERACOES.md`.

---

## 8. Lacunas conscientes (ainda não cobertos como na matriz estratégica de 30 itens)

A matriz em `matriz-cenarios-automacao.md` lista cenários **P2/P3** (ex.: timeout simulado, sessão expirada no meio da compra, performance formal, controle de perfil granular) que **não** possuem spec dedicado com esse nome — podem estar parcialmente tocados por fluxos reais ou permanecer manuais.

Itens explicitamente **condicionais** na automação atual:

- **AUT-016** (filtro por período em Pedidos): substituído na prática por **filtro tipo pedido** e outros filtros compatíveis com a UI do QA.
- **Exportar carteira** e **download de modelo de planilha:** dependem do CTA existir no ambiente.
- **Vitrine — mais detalhes:** pode **pular** o teste se a listagem não expuser o CTA.

---

## 9. Documentos relacionados

| Documento | Conteúdo |
|-----------|----------|
| `docs/matriz-cenarios-automacao.md` | Priorização estratégica original (30 cenários) e legenda |
| `docs/ARQUITETURA.md` | Camadas Page Object, helpers, config |
| `docs/bdd/features/*.feature` | BDD Gherkin (`01`–`03` compras/auth, `04` pedidos, `05` menu/finanças/documentos) · ver `docs/bdd/README.md` |
| `docs/ALTERACOES.md` | Registro cronológico de alterações |

---

## 10. Como manter este guia

Sempre que **adicionar, remover ou renomear** um spec ou alterar o critério principal de um cenário:

1. Atualizar as tabelas deste arquivo (`GUIA-COBERTURA-AUTOMACAO-E2E.md`).
2. Registrar em `docs/ALTERACOES.md` (convenção do projeto).
