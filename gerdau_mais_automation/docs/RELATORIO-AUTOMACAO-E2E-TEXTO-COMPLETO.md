# Relatório em texto — automação E2E completa (Gerdau Mais)

**Checklist pré-deploy (tabelas por jornada, incl. Pedidos):** [`CHECKLIST-PRE-DEPLOY-COBERTURA-AUTOMACAO-E2E.md`](./CHECKLIST-PRE-DEPLOY-COBERTURA-AUTOMACAO-E2E.md)

**Escopo:** tudo o que existe hoje em `cypress/e2e/**/*.cy.js`, com títulos de `describe` / `it`, tags, caminhos de arquivo e notas de comportamento.  
**Ferramenta:** Cypress 14.x.  
**Última revisão deste inventário:** 2026-05-12.

---

## 1. Resumo numérico

| Métrica | Valor |
|--------|--------|
| Pastas de spec | `auth/`, `compras/`, `pedidos/`, `menu/`, `financas/`, `documentos/` |
| Arquivos `*.cy.js` | **28** |
| Casos `it` (total) | **33** |
| Observação de execução | Em suite completa documentada: **32** passando, **1** pendente (`vitrineMaisDetalhes` pode dar **skip** se não houver CTA “mais detalhes” no catálogo). |

---

## 2. Helpers de suporte (transversais aos specs)

Arquivos em `cypress/support/helpers/` usados pelos fluxos:

| Arquivo | Função resumida |
|---------|-----------------|
| `auth.js` | Login com retry, limpeza de sessão, pós-login, `fazerLogoutResiliente()` |
| `fluxoCompra.js` | Landing comprar, emissor, CTAs por tipo de compra, carrinho, modais, datas D+7, finalização via `finalizarPedidoNoCarrinho`, etc. |
| `pedido.js` | Checkout E2E, `finalizarPedidoE2E`, `assertPedidoEfetivado` |
| `pedidosFiltros.js` | Ações de filtro/busca na carteira de pedidos (`/orders`) |
| `uiReady.js` | `aguardarBodyVisivel`, `recarregarPaginaEAguardar` |

---

## 3. Fixtures citadas pela automação

| Caminho | Uso |
|---------|-----|
| `cypress/fixtures/planilha-invalida.txt` | Upload de formato inválido em `planilhaUploadArquivoInvalido.cy.js` |

---

## 4. Inventário completo por arquivo

Cada bloco: **caminho** → **describe** → linhas de **it** (título e tags).

### 4.1 Autenticação — `cypress/e2e/auth/`

**`login.cy.js`**  
- **describe:** `Cenários de Login`  
- **it:** `Login com credenciais válidas` — tags: `@smoke @positive`  
- **it:** `Login com email inválido` — tags: `@negative @security`  
- **it:** `Login com senha inválida` — tags: `@negative @security`  
- **it:** `Login com campos vazios` — tags: `@validation @negative`  
- **it:** `Login com apenas email preenchido` — tags: `@validation @negative`  

**`logoutProtegida.cy.js`**  
- **describe:** `Autenticação — logout e página protegida`  
- **it:** `Após logout, acesso a rota protegida redireciona para login` — tags: `@regression @security`  

---

### 4.2 Compras — `cypress/e2e/compras/`

**`buscaSemResultados.cy.js`**  
- **describe:** `Busca de produtos`  
- **it:** `Busca sem resultados exibe estado adequado` — tags: `@regression @p1`  

**`carrinhoChecklistCampos.cy.js`**  
- **describe:** `Carrinho — campos checklist (unidade / destinação / pagamento)`  
- **it:** `Detecta campos opcionais de edição no carrinho` — tags: `@regression @p3`  

**`carrinhoPersistencia.cy.js`**  
- **describe:** `Carrinho — persistência após refresh`  
- **it:** `Mantém evidência de carrinho após recarregar a página` — tags: `@regression @p1`  

**`carrinhoPersistenciaRelogin.cy.js`**  
- **describe:** `Carrinho — persistência após relogin`  
- **it:** `Mantém evidência de carrinho após novo login` — tags: `@regression @p1 @AUT-012`  

**`carrinhoQuantidade.cy.js`**  
- **describe:** `Carrinho — alteração de quantidade`  
- **it:** `Incrementa quantidade do primeiro item no carrinho` — tags: `@regression @p1 @AUT-009`  

**`carrinhoRemocao.cy.js`**  
- **describe:** `Carrinho — remoção de item`  
- **it:** `Remove item do carrinho` — tags: `@regression @p1 @AUT-010`  

**`compraFinalizacaoCompleta.cy.js`**  
- **describe:** `Compra com finalização completa`  
- **it:** `Finalizar pedido completo (passos 1-4)` — tags: `@smoke @critical`  

**`compraPorHistorico.cy.js`**  
- **describe:** `Compra por Histórico`  
- **it:** `Comprar Por Histórico` — tags: `@smoke @critical @regression`  
- **Nota:** fluxo **Comprar → repetir pedido** (rota `/repeat-order`); **não** é o módulo **Pedidos** do menu (`/orders`).  

**`compraPorPlanilha.cy.js`**  
- **describe:** `Compra por Planilha`  
- **it:** `Comprar Por Planilha` — tags: `@smoke @critical`  

**`compraPorVitrine.cy.js`**  
- **describe:** `Compra por Vitrine`  
- **it:** `Comprar Por Vitrine` — tags: `@smoke @critical`  

**`compraSelecionandoItens.cy.js`**  
- **describe:** `Compra selecionando itens`  
- **it:** `Comprar selecionando itens` — tags: `@smoke @critical`  

**`compraSemEmissor.cy.js`**  
- **describe:** `Compra sem emissor`  
- **it:** `Bloqueia avanço da compra sem emissor` — tags: `@smoke @critical`  

**`planilhaDownloadModelo.cy.js`**  
- **describe:** `Planilha — download do modelo`  
- **it:** `Dispara download ou abertura do modelo quando disponível` — tags: `@regression @p2`  
- **Nota:** ação **condicional** à presença do CTA no QA.  

**`planilhaUploadArquivoInvalido.cy.js`**  
- **describe:** `Planilha — upload arquivo inválido`  
- **it:** `Rejeita arquivo que não é planilha (ex.: .txt)` — tags: `@negative @p2`  

**`posPedidoMeusPedidosEPdf.cy.js`**  
- **describe:** `Pós-pedido — Meus pedidos e PDF`  
- **it:** `Após envio, exibe CTAs de PDF e Meus pedidos` — tags: `@regression @p1`  

**`vitrineBuscaCatalogo.cy.js`**  
- **describe:** `Vitrine — busca no catálogo`  
- **it:** `Busca produto por texto ou SKU no catálogo` — tags: `@regression @p2`  

**`vitrineMaisDetalhes.cy.js`**  
- **describe:** `Vitrine — mais detalhes do produto`  
- **it:** `Abre detalhes quando o CTA existir (senão skip)` — tags: `@regression @p2`  
- **Nota:** `this.skip()` se o texto do CTA não existir na listagem → pode aparecer como **pending** na suite.  

---

### 4.3 Pedidos (portal) — `cypress/e2e/pedidos/`

Fluxo real: **`/orders`** como **hub** (dois caminhos: aços longos/planos e corte/dobra). Carteira com **Buscar pedidos** após entrar em **Explorar pedidos de aços longos e planos** (conforme implementação e changelog).

**`pedidosBuscar.cy.js`**  
- **describe:** `Pedidos — buscar com filtros padrão`  
- **it:** `Dispara "Buscar Pedidos" mantendo filtros default da tela` — tags: `@smoke @pedidos`  

**`pedidosCorteEDobra.cy.js`**  
- **describe:** `Pedidos — corte e dobra`  
- **it:** `Acessa carteira de corte e dobra a partir do hub` — tags: `@regression @p2 @pedidos`  

**`pedidosExportarCarteira.cy.js`**  
- **describe:** `Pedidos — exportar carteira`  
- **it:** `Dispara exportação da carteira` — tags: `@regression @p2 @pedidos`  
- **Nota:** exportação **opcional** se o texto/CTA não existir no ambiente.  

**`pedidosFiltroEmissor.cy.js`**  
- **describe:** `Pedidos — filtro por emissor`  
- **it:** `Filtra por emissor configurado no env e busca` — tags: `@regression @p2 @pedidos`  

**`pedidosFiltroTipoPedido.cy.js`**  
- **describe:** `Pedidos — filtro tipo de pedido`  
- **it:** `Alterna para Faturado e dispara busca` — tags: `@regression @p1 @pedidos`  

**`pedidosListagem.cy.js`**  
- **describe:** `Pedidos — listagem`  
- **it:** `Hub /orders — dois fluxos (longos/planos e corte/dobra)` — tags: `@smoke @pedidos`  
- **it:** `Carteira de aços longos — filtros e lista` — tags: `@regression @p1 @pedidos`  

---

### 4.4 Menu — `cypress/e2e/menu/`

**`menuSuperiorCobertura.cy.js`**  
- **describe:** `Menu superior — cobertura de módulos operacionais`  
- **it:** `Cobre navegação dos itens do menu superior` — tags: `@regression @menu`  
- **Nota:** navegação superficial até URLs dos itens; **não** substitui os specs profundos de Pedidos / Finanças / Documentos.  

---

### 4.5 Finanças — `cypress/e2e/financas/`

**`financasBusca.cy.js`**  
- **describe:** `Finanças`  
- **it:** `Acessa finanças e executa busca com filtros` — tags: `@regression @menu @financas`  

---

### 4.6 Documentos — `cypress/e2e/documentos/`

**`documentosBusca.cy.js`**  
- **describe:** `Buscar documentos`  
- **it:** `Acessa documentos e executa busca por período` — tags: `@regression @menu @documentos`  

---

## 5. Lista alfabética de arquivos spec (28)

1. `cypress/e2e/auth/login.cy.js`  
2. `cypress/e2e/auth/logoutProtegida.cy.js`  
3. `cypress/e2e/compras/buscaSemResultados.cy.js`  
4. `cypress/e2e/compras/carrinhoChecklistCampos.cy.js`  
5. `cypress/e2e/compras/carrinhoPersistencia.cy.js`  
6. `cypress/e2e/compras/carrinhoPersistenciaRelogin.cy.js`  
7. `cypress/e2e/compras/carrinhoQuantidade.cy.js`  
8. `cypress/e2e/compras/carrinhoRemocao.cy.js`  
9. `cypress/e2e/compras/compraFinalizacaoCompleta.cy.js`  
10. `cypress/e2e/compras/compraPorHistorico.cy.js`  
11. `cypress/e2e/compras/compraPorPlanilha.cy.js`  
12. `cypress/e2e/compras/compraPorVitrine.cy.js`  
13. `cypress/e2e/compras/compraSelecionandoItens.cy.js`  
14. `cypress/e2e/compras/compraSemEmissor.cy.js`  
15. `cypress/e2e/compras/planilhaDownloadModelo.cy.js`  
16. `cypress/e2e/compras/planilhaUploadArquivoInvalido.cy.js`  
17. `cypress/e2e/compras/posPedidoMeusPedidosEPdf.cy.js`  
18. `cypress/e2e/compras/vitrineBuscaCatalogo.cy.js`  
19. `cypress/e2e/compras/vitrineMaisDetalhes.cy.js`  
20. `cypress/e2e/documentos/documentosBusca.cy.js`  
21. `cypress/e2e/financas/financasBusca.cy.js`  
22. `cypress/e2e/menu/menuSuperiorCobertura.cy.js`  
23. `cypress/e2e/pedidos/pedidosBuscar.cy.js`  
24. `cypress/e2e/pedidos/pedidosCorteEDobra.cy.js`  
25. `cypress/e2e/pedidos/pedidosExportarCarteira.cy.js`  
26. `cypress/e2e/pedidos/pedidosFiltroEmissor.cy.js`  
27. `cypress/e2e/pedidos/pedidosFiltroTipoPedido.cy.js`  
28. `cypress/e2e/pedidos/pedidosListagem.cy.js`  

---

## 6. Scripts NPM (`package.json`)

| Script | Escopo |
|--------|--------|
| `npm run cy:open` | Cypress interativo |
| `npm run cy:run` | Todos os specs em `cypress/e2e` |
| `npm run cy:run:smoke` | Alias de `cy:run:smoke-pr` |
| `npm run cy:run:regression` | Alias de `cy:run:regression-nightly` |
| `npm run cy:run:login` | `cypress/e2e/auth/login.cy.js` |
| `npm run cy:run:compras` | `cypress/e2e/compras/*.cy.js` |
| `npm run cy:run:compras:chrome` | Idem, browser Chrome |
| `npm run cy:run:compra-vitrine` | `compraPorVitrine.cy.js` |
| `npm run cy:run:compra-selecionando` | `compraSelecionandoItens.cy.js` |
| `npm run cy:run:compra-historico` | `compraPorHistorico.cy.js` |
| `npm run cy:run:compra-planilha` | `compraPorPlanilha.cy.js` |
| `npm run cy:run:compra-finalizacao` | `compraFinalizacaoCompleta.cy.js` |
| `npm run cy:run:compra-sem-emissor` | `compraSemEmissor.cy.js` |
| `npm run cy:run:p0` | Login + 7 specs críticos de compra (lista fixa no `package.json`) |
| `npm run cy:run:p1` | `pedidosListagem.cy.js` (Chrome) |
| `npm run cy:run:p1-compras-opcional` | `carrinhoPersistencia` + `buscaSemResultados` |
| `npm run cy:run:p0-p1` | P0 + `pedidosListagem` |
| `npm run cy:run:menu` | `menuSuperiorCobertura.cy.js` |
| `npm run cy:run:financas` | `financasBusca.cy.js` |
| `npm run cy:run:documentos` | `documentosBusca.cy.js` |
| `npm run cy:run:operacional-modulos` | Menu + pedidos listagem + finanças + documentos |
| `npm run cy:run:smoke-pr` | Login + vitrine + histórico |
| `npm run cy:run:regression-nightly` | Lista fixa: login, compras principais, pedidos listagem, menu, finanças, documentos |
| `npm run cy:run:auth` | `cypress/e2e/auth/*.cy.js` |
| `npm run test` | `cy:run` + geração Allure |
| `npm run allure:generate` / `allure:open` / `allure:report` / `allure:serve` | Painel Allure (ver [`ALLURE.md`](./ALLURE.md)) |
| `npm run cy:run:allure` | `cy:run` + `allure:generate` |

---

## 7. Evidências e documentação relacionada

- **Allure:** `allure-results/`, `allure-report/` após `npm run allure:generate`; comandos em [`ALLURE.md`](./ALLURE.md) (`allure:open`, `allure:serve`, `allure:report`, `cy:run:allure`). Requer Java + `allure-commandline`.  
- **Config:** `cypress.config.js` (baseUrl, timeouts, `env`, plugin Allure).  
- **Guia técnico de cobertura:** `docs/GUIA-COBERTURA-AUTOMACAO-E2E.md`  
- **Matriz estratégica (30 itens):** `docs/matriz-cenarios-automacao.md`  
- **Changelog:** `docs/ALTERACOES.md`  
- **Relatório HTML/PDF gerencial (modelo checklist):** `docs/relatorio-gerencial-automacao-e2e.html` e PDF homônimo com data, se gerado localmente (escopo secção 5.1: mobile despriorizado; Chrome como navegador de referência).  

---

## 8. Manutenção deste relatório

Ao criar, renomear ou remover qualquer `*.cy.js` em `cypress/e2e/`:

1. Atualizar este arquivo (`RELATORIO-AUTOMACAO-E2E-TEXTO-COMPLETO.md`).  
2. Atualizar `GUIA-COBERTURA-AUTOMACAO-E2E.md` e registrar em `ALTERACOES.md`.
