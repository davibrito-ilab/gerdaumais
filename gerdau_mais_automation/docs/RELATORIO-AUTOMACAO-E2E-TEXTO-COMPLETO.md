# Relatório em texto — automação E2E completa (Gerdau Mais)

**Checklist pré-deploy (tabelas por jornada, incl. Pedidos):** [`CHECKLIST-PRE-DEPLOY-COBERTURA-AUTOMACAO-E2E.md`](./CHECKLIST-PRE-DEPLOY-COBERTURA-AUTOMACAO-E2E.md)

**Escopo:** tudo o que existe hoje em `cypress/e2e/**/*.cy.js`, com títulos de `describe` / `it`, tags, caminhos de arquivo e notas de comportamento.  
**Ferramenta:** Cypress 14.x.  
**Última revisão deste inventário:** 2026-05-21 *(totais na secção 1; secção **5** refere o índice do Checklist).*  

## 1. Resumo numérico

| Métrica | Valor |
|--------|--------|
| Pastas de spec | `auth/`, `compras/`, `pedidos/`, `menu/`, `financas/`, `documentos/` |
| Arquivos `*.cy.js` | **40** |
| Casos `it` (total) | **55** *(auditoria no código em 2026-05-21: `^\s*it\s*\(` em `cypress/e2e/**/*.cy.js`)* |
| Observação de execução | Inventário: **40** / **55**. **Rodada QA** `npm run cy:run:fast` (2026-05-21, Electron): **27** passing / **24** failing / **4** pending em **55** `it`, **~54m31s**, `exit_code` **24** (**21** specs com ≥1 falha). Padrões analisados em `compraPorVitrine` (**`irParaCarrinhoViaHeader`**), carrinhos/checkout, `compraCorteEDobra`, histórico/planilha. `vitrineMaisDetalhes` / `vitrineFiltroCatalogoFamilia` / `pedidosDetalhePedido` podem **pending**/skip; planilha **2 linhas**: `planilha_2_linhas_strict` opcional em env (ver README / `cypress.env.example.json`). |

---

## 2. Helpers de suporte (transversais aos specs)

Arquivos em `cypress/support/helpers/` usados pelos fluxos:

| Arquivo | Função resumida |
|---------|-----------------|
| `auth.js` | Login com retry, limpeza de sessão, pós-login, `fazerLogoutResiliente()` |
| `fluxoCompra.js` | Landing Comprar, emissor, **longos / vitrine**, **fabricação (`/purchase/fabrication`)**, carrinho, **spreadsheet (`navegarTelaSpreadsheetComEmissor` / `anexarArquivoFluxoSpreadsheet`)**, **avanço até revisar pedido** (`avancarCarrinhoAteEtapaRevisarPedido`), modais, datas D+7, finalização (`finalizarPedidoNoCarrinho`), … |
| `pedido.js` | Checkout E2E, `finalizarPedidoE2E`, `assertPedidoEfetivado` |
| `historicoRepeatCompra.js` | Repeat-order/lista histórico (Comprar) até rota carrinho ou texto “Revisar pedido”; integra `avancarCarrinhoAteEtapaRevisarPedido` |
| `pedidosFiltros.js` | Carteira **`/orders`**: filtros, busca; **AUT-017**: `pularSeGradePedidosVaziaAposBusca`, `clicarPrimeiroPossivelLinkDetalhesPedido` |
| `uiReady.js` | `aguardarBodyVisivel`, `recarregarPaginaEAguardar` |

---

## 3. Fixtures citadas pela automação

| Caminho | Uso |
|---------|-----|
| `cypress/fixtures/planilha-invalida.txt` | Upload de formato inválido em `planilhaUploadArquivoInvalido.cy.js` |
| `cypress/fixtures/planilha-qa-*.xlsx` | Planilhas mínimas para `planilhaUploadComplementares.cy.js` — recriadas com `npm run fixtures:planilhas` |

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
- **it:** `Busca sem resultados exibe estado adequado` — tags: `@smoke @p1 @regression`  
- **it:** `Após cenário sem resultados — compra rápida via vitrine fecha pedido` — tags: `@regression @p2`  

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

**`compraCorteEDobra.cy.js`**  
- **describe:** `Compra — tipo Corte e dobra (fabricação)`  
- **it:** `Fluxo inicial: landing, emissor e entrada em fabricação (corte/dobra)` — tags: `@regression @p1 @compras`  
- **it:** `Histórico de pedidos na jornada de fabricação (last-orders)` — tags: `@regression @p1 @compras`  
- **it:** `Fabricação: avançar por CTAs até carrinho ou revisar (quando o QA permitir)` — tags: `@regression @p2 @compras`  
- **Nota:** rotas portal `/purchase/fabrication/*`; distinto da carteira Pedidos `/orders`. Helpers em `fluxoCompra.js` e `comprarPageTipoCompraActions.js`.  

**`compraPorHistorico.cy.js`**  
- **describe:** `Compra por Histórico`  
- **it:** `Comprar Por Histórico` — tags: `@smoke @critical @regression`  
- **Nota:** fluxo **Comprar → repetir pedido** (rota `/repeat-order`); **não** é o módulo **Pedidos** do menu (`/orders`).  

**`compraHistoricoRevisarPedido.cy.js`**  
- **describe:** `Compra por histórico — revisar pedido`  
- **it:** `Comprar por histórico até etapa Revisar pedido (sem enviar pedido)` — tags: `@regression @p1 @compras`  
- **Nota:** permanece no repeat-order até carrinho, depois **`avancarCarrinhoAteEtapaRevisarPedido()`** (`fluxoCompra.js`). Supõe histórico repetível para o **emissor** do env. Distinto do smoke até envio (`compraPorHistorico.cy.js`).  

**`compraHistoricoFinalizePedido.cy.js`**  
- **describe:** `Compra por histórico — finalização sem catálogo`  
- **it:** `Histórico → revisar pedido → enviar (sem fallback vitrine)` — tags: `@regression @p1 @compras`  
- **Nota:** mesmo trajeto que **`compraHistoricoRevisarPedido.cy.js`** + **`clicarFinalizarPedido()`** + **`validarPedidoEnviado()`** (`fluxoCompra.js`). **Sem** `acessarCatalogoVitrineComEmissor`. Dependente do **histórico repetível** para o **emissor** no QA.

**`compraPorPlanilha.cy.js`**  
- **describe:** `Compra por Planilha`  
- **it:** `Comprar Por Planilha` — tags: `@smoke @critical`  

**`compraPorVitrine.cy.js`**  
- **describe:** `Compra por Vitrine`  
- **it:** `Comprar Por Vitrine` — tags: `@smoke @critical`  

**`compraVitrineDoisItens.cy.js`**  
- **describe:** `Compra vitrine — dois itens`  
- **it:** `Vitrine: dois produtos no carrinho e finalização` — tags: `@regression @p1 @compras`  
- **Nota:** duas inclusões (**`produto`** + segundo **`produto2`** opcional ou **mesmo SKU** duplicado).

**`compraVitrineTresItens.cy.js`**  
- **describe:** `Compra vitrine — três itens`  
- **it:** `Vitrine: três inclusões ao carrinho e finalização` — tags: `@regression @p1 @compras`

**`carrinhoNavegacaoVoltar.cy.js`**  
- **describe:** `Carrinho — navegação voltar`  
- **it:** `Voltar pelo histórico do browser após entrar no carrinho` — tags: `@regression @p2`

**`compraSelecionandoItens.cy.js`**  
- **describe:** `Compra selecionando itens`  
- **it:** `Comprar selecionando itens` — tags: `@smoke @critical`  

**`compraSemEmissor.cy.js`**  
- **describe:** `Compra sem emissor`  
- **it:** `Bloqueia avanço da compra sem emissor` — tags: `@smoke @critical`  
- **it:** `Compra efetiva após selecionar emissor na landing` — tags: `@regression @p2`  

**`planilhaDownloadModelo.cy.js`**  
- **describe:** `Planilha — download do modelo`  
- **it:** `Dispara download ou abertura do modelo quando disponível` — tags: `@regression @p2`  
- **Nota:** ação **condicional** à presença do CTA no QA.  

**`planilhaUploadArquivoInvalido.cy.js`**  
- **describe:** `Planilha — upload arquivo inválido`  
- **it:** `Rejeita arquivo que não é planilha (ex.: .txt)` — tags: `@negative @p2`

**`planilhaUploadComplementares.cy.js`**  
- **describe:** `Planilha — cenários complementares` — quatro cenários `@negative/@regression`; fixtures **`planilha-qa-*.xlsx`** + `fluxoCompra.anexarArquivoFluxoSpreadsheet`

**`posPedidoMeusPedidosEPdf.cy.js`**  
- **describe:** `Pós-pedido — Meus pedidos e PDF`  
- **it:** `Após envio, exibe CTAs de PDF e Meus pedidos` — tags: `@regression @p1`  

**`vitrineBuscaCatalogo.cy.js`**  
- **describe:** `Vitrine — busca no catálogo`  
- **it:** `Busca produto por texto ou SKU no catálogo` — tags: `@regression @p2`  

**`vitrineFiltroCatalogoFamilia.cy.js`**  
- **describe:** `Vitrine — filtro categoria ou família (AUT-015)`  
- **it:** `Usa facetas laterais quando a UI expõe filtros visíveis (senão skip)` — tags: `@regression @p2 @compras`  
- **Nota:** **`this.skip()`** quando o catálogo não expõe controles compatíveis com a heurística (laterais facetas `/filter`/`Filtros`).  

**`vitrineMaisDetalhes.cy.js`**  
- **describe:** `Vitrine — mais detalhes do produto`  
- **it:** `Abre detalhes quando o CTA existir (senão skip)` — tags: `@regression @p2`  
- **it:** `Detalhes + adicionar ao carrinho quando disponível (senão skip)` — tags: `@regression @p2` — `ADD_TO_CART_SELECTORS` / texto “Adicionar” + `assertTextoConfirmacaoCarrinho`  
- **Nota:** até **dois skips** quando o CTA não existir ou quando não houver CTA típico de inclusão ao carrinho na vista de detalhe → até **pending** correspondente na suite.  

---

### 4.3 Pedidos (portal) — `cypress/e2e/pedidos/`

Fluxo real: **`/orders`** como **hub** (dois caminhos: aços longos/planos e corte/dobra). Carteira com **Buscar pedidos** após entrar em **Explorar pedidos de aços longos e planos** (conforme implementação e changelog).

**`pedidosBuscar.cy.js`**  
- **describe:** `Pedidos — buscar com filtros padrão`  
- **it:** `Dispara "Buscar Pedidos" mantendo filtros default da tela` — tags: `@smoke @pedidos`  

**`pedidosHubRecarregar.cy.js`**  
- **describe:** `Pedidos — hub após recarregar`  
- **it:** `Hub /orders mantém cartões após reload` — tags: `@regression @p2 @pedidos`  

**`pedidosPeriodoBusca.cy.js`**  
- **describe:** `Pedidos — período e busca`  
- **it:** `Ajusta período quando disponível e dispara busca` — tags: `@regression @p1 @pedidos`  

**`pedidosCorteEDobra.cy.js`**  
- **describe:** `Pedidos — corte e dobra`  
- **it:** `Acessa carteira de corte e dobra a partir do hub` — tags: `@regression @p2 @pedidos`  
- **it:** `Carteira corte/dobra — período (se houver) e busca` — tags: `@regression @p2 @pedidos`  
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

**`pedidosDetalhePedido.cy.js`**  
- **describe:** `Pedidos — detalhe do pedido`  
- **it:** `Lista após Buscar Pedidos permite abrir detalhe` — tags: `@regression @p2 @pedidos` (**AUT-017** — `skip` se grade vazia)  

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

**`navegacaoCruzadaComprasPedidos.cy.js`**  
- **describe:** `Fluxo cruzado — Pedidos hub ↔ Comprar`  
- **it:** `Menu: Pedidos (hub) e depois Comprar` — tags: `@regression @p2 @menu @pedidos @compras` (**AUT-052**; fallback por rota quando o ícone não renderiza)

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
- **it:** `Após busca: indícios de download ou artefatos (AUT-018)` — tags: `@regression @p2 @documentos`  

---

## 5. Lista ordenada dos arquivos spec

Índice canônico com **40** arquivos `*.cy.js`: [`CHECKLIST-PRE-DEPLOY-COBERTURA-AUTOMACAO-E2E.md`](./CHECKLIST-PRE-DEPLOY-COBERTURA-AUTOMACAO-E2E.md), secção **8. Resumo — todos os arquivos de spec**.

---

## 6. Scripts NPM (`package.json`)

**Evidência QA (2026-05-21, `npm run cy:run:fast`, Electron headless):** **55** `it` em **~54m31s**: **27** passing, **24** failing, **4** pending; `exit_code` **24**.

| Script | Escopo |
|--------|--------|
| `npm run cy:open` | Cypress interativo |
| `npm run cy:run` | Todos os specs em `cypress/e2e` (com vídeo por spec) |
| `npm run cy:run:fast` | Igual **`cy:run`**, **`video=false`** — recomendável para regressão local longa ou CI quando vídeo não for necessário |
| `npm run cy:run:headed:fast` | Chrome headed + **`video=false`** |
| `npm run cy:run:smoke` | Alias de `cy:run:smoke-pr` |
| `npm run cy:run:regression` | Alias de `cy:run:regression-nightly` |
| `npm run cy:run:login` | `cypress/e2e/auth/login.cy.js` |
| `npm run cy:run:compras` | `cypress/e2e/compras/*.cy.js` |
| `npm run cy:run:compras:chrome` | Idem, browser Chrome |
| `npm run cy:run:compra-vitrine` | `compraPorVitrine.cy.js` |
| `npm run cy:run:compra-selecionando` | `compraSelecionandoItens.cy.js` |
| `npm run cy:run:compra-historico` | `compraPorHistorico.cy.js` |
| `npm run cy:run:compra-historico-revisar` | `compraHistoricoRevisarPedido.cy.js` |
| `npm run cy:run:compra-historico-finalize` | `compraHistoricoFinalizePedido.cy.js` |
| `npm run cy:run:compra-vitrine-dois-itens` | `compraVitrineDoisItens.cy.js` |
| `npm run cy:run:planilha-complementares` | `planilhaUploadComplementares.cy.js` |
| `npm run cy:run:compra-vitrine-tres-itens` | `compraVitrineTresItens.cy.js` |
| `npm run cy:run:vitrine-mais-detalhes` | `vitrineMaisDetalhes.cy.js` (detalhes + inclusão opcional, `skip` conforme QA) |
| `npm run cy:run:vitrine-filtro-catalogo` | `vitrineFiltroCatalogoFamilia.cy.js` (**AUT-015**) |
| `npm run cy:run:carrinho-voltar` | `carrinhoNavegacaoVoltar.cy.js` |
| `npm run fixtures:planilhas` | Gera `cypress/fixtures/planilha-qa-*.xlsx` (devDependency `xlsx`) |
| `npm run cy:run:compra-corte-dobra` | `compraCorteEDobra.cy.js` |
| `npm run cy:run:compra-finalizacao` | `compraFinalizacaoCompleta.cy.js` |
| `npm run cy:run:compra-sem-emissor` | `compraSemEmissor.cy.js` |
| `npm run cy:run:p0` | Login + 7 specs críticos de compra (lista fixa no `package.json`) |
| `npm run cy:run:p1` | **Todos os** specs em **`pedidos/*.cy.js`** (Chrome) |
| `npm run cy:run:p1-compras-opcional` | `carrinhoPersistencia` + `buscaSemResultados` |
| `npm run cy:run:p0-p1` | P0 + `pedidosListagem` |
| `npm run cy:run:menu` | `cypress/e2e/menu/*.cy.js` |
| `npm run cy:run:navegacao-cross` | `navegacaoCruzadaComprasPedidos.cy.js` |
| `npm run cy:run:financas` | `financasBusca.cy.js` |
| `npm run cy:run:documentos` | `documentosBusca.cy.js` |
| `npm run cy:run:operacional-modulos` | `menu/*.cy.js` + `pedidos/*.cy.js` + finanças + documentos |
| `npm run cy:run:smoke-pr` | Login + vitrine + histórico |
| `npm run cy:run:regression-nightly` | Lista fixa: login, compras principais, `pedidos/*.cy.js`, `menu/*.cy.js`, finanças, documentos |
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
