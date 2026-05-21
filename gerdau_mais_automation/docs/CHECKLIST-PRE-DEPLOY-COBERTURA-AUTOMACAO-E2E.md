# Checklist de Testes Pré-Deploy & Cobertura da Automação E2E — Plataforma Gerdau Mais

## Descrição

Checklist no formato do documento de referência, com **dados atualizados para tudo o que a automação Cypress cobre** no repositório `gerdau_mais_automation`: **autenticação**, **compras** (vitrine, planilha, histórico, selecionando itens, **corte e dobra/fabricação (`/purchase/fabrication`)**, carrinho, checkout, pós-pedido), **módulo Pedidos** do portal (`/orders` — hub, carteira longos/planos, busca, filtros, export, corte e dobra), **menu superior**, **finanças** e **buscar documentos**. Itens **fora** do escopo E2E (admin, ERP, validação binária de PDF, matriz multi-browser/responsiva) aparecem como **NÃO AUTOMATIZADO** ou **PARCIAL** conforme o caso.

Inventário técnico arquivo a arquivo: [`RELATORIO-AUTOMACAO-E2E-TEXTO-COMPLETO.md`](./RELATORIO-AUTOMACAO-E2E-TEXTO-COMPLETO.md).

## Objetivo

Dar **visão gerencial completa** da automação E2E antes de deploy, alinhando negócio e QA ao que está implementado em `cypress/e2e`, **sem omitir** módulos (incluindo **Pedidos** do menu).

## Versão / referência

| Campo | Valor |
|--------|--------|
| Repositório | `gerdau_mais_automation` |
| Cypress | **14.x** (`package.json`) |
| Data de referência do texto | **21/05/2026** |
| Responsável | _a preencher_ |

## Legenda (automação)

| Status | Significado |
|--------|-------------|
| **AUTOMATIZADO — OK** | Existe spec dedicado; na regressão completa documentada costuma **passar** de forma estável. |
| **PARCIAL** | Coberto com **condição**: `skip` intencional, CTA opcional no QA, fallback de fluxo (ex.: planilha → catálogo), ou validação superficial (ex.: presença do CTA de PDF sem validar bytes do arquivo). |
| **NÃO AUTOMATIZADO** | Não há spec equivalente, depende de **manual**, **admin/ERP** ou está fora do portal. |

## Evidência geral (suite completa)

| Métrica | Valor |
|--------|--------|
| Specs (`cypress/e2e/**/*.cy.js`) | **40** |
| Casos de teste (`it`) | **55** |
| Última evidência QA (`npm run cy:run:fast`, Electron) — **2026-05-21** | **27** passing / **24** failing / **4** pending (**55** `it`; **~54m31s**; `exit_code` **24**); **21** specs com pelo menos uma falha |
| Comando suite completa | `npm run cy:run` ou `npx cypress run` (na pasta `gerdau_mais_automation`) |

**Helpers principais:** `cypress/support/helpers/auth.js`, `fluxoCompra.js`, `historicoRepeatCompra.js`, `pedido.js`, `pedidosFiltros.js`, `uiReady.js`.  
**Fixture:** `cypress/fixtures/planilha-invalida.txt` (upload inválido). **Planilhas XLSX geradas:** `planilha-qa-*.xlsx` — regenere com `npm run fixtures:planilhas` (variáveis opcionais `PLANILHA_SKU`, `PLANILHA_SKU_2`).

---

## 1. Autenticação e Gestão de Acesso

Garante acesso legítimo e fluxos negativos de login/sessão.

| Cenário de teste | Status (automação) | Observações |
|------------------|-------------------|-------------|
| Validar login federado (Gerdau) | AUTOMATIZADO — OK | `cypress/e2e/auth/login.cy.js` — login com credenciais válidas (`@smoke @positive`) |
| Login com senha incorreta | AUTOMATIZADO — OK | `login.cy.js` (`@negative @security`) |
| Login com usuário / email inválido | AUTOMATIZADO — OK | `login.cy.js` (`@negative @security`) |
| Validação de campos (vazios, só email) | AUTOMATIZADO — OK | `login.cy.js` — dois casos (`@validation @negative`) |
| Logout e acesso a rota protegida | AUTOMATIZADO — OK | `cypress/e2e/auth/logoutProtegida.cy.js` (`@regression @security`) — redireciona para login |

---

## 2. Jornada de Compra — Vitrine

### 2.1 Busca e descoberta

| Cenário de teste | Status (automação) | Observações |
|------------------|-------------------|-------------|
| Buscar por nome/descrição ou SKU no catálogo (vitrine) | AUTOMATIZADO — OK | `vitrineBuscaCatalogo.cy.js` (`@regression @p2`) |
| Busca sem resultados (estado vazio na busca) | AUTOMATIZADO — OK | `buscaSemResultados.cy.js` — 1º `it` (`@smoke @p1`) |
| Após cenário sem resultados → envio rápido via vitrine | PARCIAL / E2E | `buscaSemResultados.cy.js` — 2º `it` (`@regression @p2`) até checkout |
| Filtro por categoria ou família no catálogo (vitrine) | PARCIAL | `vitrineFiltroCatalogoFamilia.cy.js` — **AUT-015** (`@regression @p2 @compras`); `this.skip()` quando não houver laterais/facetas clicáveis pela heurística; atalho `npm run cy:run:vitrine-filtro-catalogo` |
| “Mais detalhes” do produto | PARCIAL | `vitrineMaisDetalhes.cy.js` — primeiro `this.skip()` sem CTA na listagem (atalho QA: `npm run cy:run:vitrine-mais-detalhes`) |

### 2.2 Carrinho / happy path vitrine

| Cenário de teste | Status (automação) | Observações |
|------------------|-------------------|-------------|
| Adicionar via vitrine e finalizar pedido | AUTOMATIZADO — OK | `compraPorVitrine.cy.js` (`@smoke @critical`) — até pedido enviado |
| Carrinho vitrine **com duas inclusões** (segundo SKU por `produto2` opcional ou **mesmo** SKU duplo) até pedido enviado | AUTOMATIZADO — OK | `compraVitrineDoisItens.cy.js` (`@regression @p1 @compras`) |
| Múltiplos itens só vitrine (**três** inclusões) | AUTOMATIZADO — OK | `compraVitrineTresItens.cy.js` — opcionalmente `produto2`/`produto3` no Cypress env |
| Detalhe do produto + adicionar pela página | PARCIAL | `vitrineMaisDetalhes.cy.js` — segundo `it` usa `ADD_TO_CART_SELECTORS` / texto “Adicionar” e `assertTextoConfirmacaoCarrinho`; `this.skip()` se não houver CTA de detalhes ou inclusão típica na página/modal de detalhe |
| Validar carrinho no painel admin | NÃO AUTOMATIZADO | Fora do E2E do portal |

### 2.3 Compra selecionando itens (fluxo completo E2E)

| Cenário de teste | Status (automação) | Observações |
|------------------|-------------------|-------------|
| Fluxo completo: landing Comprar → emissor → **Comprar selecionando itens** → rota `/search-items` → busca por código (`Cypress.env('produto')`) → adicionar ao carrinho → avançar carrinho → checkout → **pedido enviado** | AUTOMATIZADO — OK | `compraSelecionandoItens.cy.js` — `it` “Comprar selecionando itens” (`@smoke @critical`); helpers `fluxoCompra.js`, `pedido.js` |

### 2.4 Compra por histórico — repetir pedido (fluxo completo E2E)

| Cenário de teste | Status (automação) | Observações |
|------------------|-------------------|-------------|
| Fluxo completo: landing Comprar → emissor → **Comprar por histórico** → smoke `/repeat-order` → (se necessário) **fallback pelo catálogo** → carrinho → checkout → **pedido enviado** | AUTOMATIZADO — OK | `compraPorHistorico.cy.js` — `it` “Comprar Por Histórico” (`@smoke @critical @regression`); modais ex. “compra em andamento” via `tratarModaisTransientes` em `fluxoCompra.js` |
| **Revisar pedido** a partir do fluxo Comprar por histórico (etapa 3 do checkout, **sem** enviar pedido) | AUTOMATIZADO — OK | `compraHistoricoRevisarPedido.cy.js` (`@regression @p1 @compras`) — `historicoRepeatCompra.js` + `avancarCarrinhoAteEtapaRevisarPedido()` em `fluxoCompra.js` |
| Fluxo até **pedido enviado** **sem fallback catálogo** (somente repetir pelo histórico + checkout) | AUTOMATIZADO — OK | `compraHistoricoFinalizePedido.cy.js` — dependente de histórico **repetível** para o `emissor` no QA (`fluxoCompra.js`/`historicoRepeatCompra.js`). Distinto do smoke (`compraPorHistorico.cy.js`) que usa fallback |

> **Nota:** “Comprar por histórico” **não** é o módulo **Pedidos** do menu (`/orders`); é fluxo dentro de **Comprar**.

### Corte e dobra / fabricação na jornada Comprar (`/purchase/fabrication`)

| Cenário de teste | Status (automação) | Observações |
|------------------|-------------------|-------------|
| Após landing Comprar + emissor, entrar no fluxo **Corte e dobra** até rota `/purchase/fabrication/` (identificação de obra ou equivalente no QA) | AUTOMATIZADO — OK | `compraCorteEDobra.cy.js` — 1º `it`; CTAs aceitas via `fluxoCompra.js`/`comprarPageTipoCompraActions.js`; fallback **`/purchase/fabrication/construction-identification`** |
| Histórico de pedidos **dentro da fabricação** (`/purchase/fabrication/last-orders`) | AUTOMATIZADO — OK | `compraCorteEDobra.cy.js` — 2º `it` |
| Avanço por CTAs na fabricação até **carrinho longos** ou **Revisar pedido** (quando o QA permitir) | AUTOMATIZADO — OK | `compraCorteEDobra.cy.js` — 3º `it` (`@p2`); se permanecer em tela intermediária, valida apenas texto coerente com fabricação |

> Distinto da **carteira** de pedidos corte/dobra em **Pedidos** (`pedidosCorteEDobra.cy.js`), que parte do hub `/orders`.

---

## 3. Jornada de Compra — Planilha

### 3.1 Modelo e upload

| Cenário de teste | Status (automação) | Observações |
|------------------|-------------------|-------------|
| Fluxo comprar por planilha + pedido concluído | AUTOMATIZADO — OK | `compraPorPlanilha.cy.js` — smoke da rota de planilha + **fallback** pelo catálogo quando preciso (`@smoke @critical`) |
| Download do modelo | PARCIAL | `planilhaDownloadModelo.cy.js` — clique/download **se** CTA existir no QA (`@regression @p2`) |
| Upload com 1 item validando carrinho | PARCIAL — fixture XLSX | `planilhaUploadComplementares.cy.js` + `planilha-qa-1-item-codigo-qty.xlsx` (**skip** se o portal só aceitar o modelo oficial) |
| Upload com múltiplas linhas (evidência na grade) | PARCIAL — autom. | `planilhaUploadComplementares.cy.js` (`planilha-qa-2-itens-*`); SKU repetido 2× no corpo quando `sku2`= `sku` na fixture gerada |

### 3.2 Erros de upload

| Cenário de teste | Status (automação) | Observações |
|------------------|-------------------|-------------|
| SKU/código inexistente | AUTOMATIZADO — OK | `planilhaUploadComplementares.cy.js` — fixture `planilha-qa-sku-inexistente.xlsx` |
| Colunas faltando / ordem incorreta | PARCIAL | `planilhaUploadComplementares.cy.js` — grid “foo/bar/baz”; ajustar se o modelo QA exige colunas exatas baixadas do portal |
| Formato inválido (.txt etc.) | AUTOMATIZADO — OK | `planilhaUploadArquivoInvalido.cy.js` + `cypress/fixtures/planilha-invalida.txt` (`@negative @p2`) |

---

## 4. Carrinho e Finalização

### 4.1 Edição no carrinho

| Cenário de teste | Status (automação) | Observações |
|------------------|-------------------|-------------|
| Alterar quantidade | AUTOMATIZADO — OK | `carrinhoQuantidade.cy.js` — AUT-009 (`@regression @p1`) |
| Unidade / data desejada / destinação / forma de pagamento | PARCIAL | `carrinhoChecklistCampos.cy.js` — smoke **não bloqueante** (`@regression @p3`); datas D+7 no `fluxoCompra.js` nos fluxos de finalização |
| Remover item | AUTOMATIZADO — OK | `carrinhoRemocao.cy.js` — AUT-010 (`@regression @p1`) |
| Persistência após refresh | AUTOMATIZADO — OK | `carrinhoPersistencia.cy.js` (`@regression @p1`) |
| Persistência após relogin | PARCIAL | `carrinhoPersistenciaRelogin.cy.js` — AUT-012; evidência QA **2026-05-21** (`npm run cy:run:fast`) mantém grupo de falhas em carrinho/checkout; mesmo racional de datas/`fluxoCompra.js` — **reexecutar** no QA após fixes |

### 4.2 Checkout

| Cenário de teste | Status (automação) | Observações |
|------------------|-------------------|-------------|
| Bloqueio sem emissor | AUTOMATIZADO — OK | `compraSemEmissor.cy.js` — 1º `it` (`@smoke @critical`) |
| Compra efetiva após selecionar emissor | AUTOMATIZADO — OK / E2E | `compraSemEmissor.cy.js` — 2º `it` (`@regression @p2`) checkout completo |
| Revisão + finalizar com sucesso (passos 1–4) | AUTOMATIZADO — OK | `compraFinalizacaoCompleta.cy.js` (`@smoke @critical`) + `pedido.js` / `fluxoCompra.js` |
| Tela de pedido enviado | AUTOMATIZADO — OK | Critério comum aos fluxos de compra até confirmação (`assertPedidoEfetivado` / mensagens de sucesso) |
| Voltar usando histórico do browser a partir da tela configurável do carrinho | AUTOMATIZADO — OK | `carrinhoNavegacaoVoltar.cy.js` (`@regression @p2`) — `cy.go('back')` + pathname em `/purchase/**` |
| Validação no admin / ERP | NÃO AUTOMATIZADO | Fora do escopo E2E do portal |

---

### 4.3 Pós-pedido (portal comprador)

| Cenário de teste | Status (automação) | Observações |
|------------------|-------------------|-------------|
| Presença do CTA “Baixar PDF” após envio | PARCIAL | `posPedidoMeusPedidosEPdf.cy.js` — valida CTA na UI; **não** valida conteúdo binário do PDF (`@regression @p1`) |
| Navegação para “Meus pedidos” após envio | AUTOMATIZADO — OK | `posPedidoMeusPedidosEPdf.cy.js` — clique e URL coerente (`/orders` ou rota de pedidos) (`@regression @p1`) |
| Validar dados dentro do arquivo PDF | NÃO AUTOMATIZADO | Leitura de PDF não automatizada |
| Validar no admin status “Cart Closed” / criação no ERP | NÃO AUTOMATIZADO | Admin / ERP |

---

## 5. Módulo Pedidos do portal (`/orders`)

Hub com **dois** fluxos (aços longos/planos e corte/dobra); carteira longos com busca e filtros após “Explorar pedidos…”. Helper: `pedidosFiltros.js`.

| Cenário de teste | Status (automação) | Observações |
|------------------|-------------------|-------------|
| Hub `/orders` — acesso aos dois fluxos (longos/planos e corte/dobra) | AUTOMATIZADO — OK | `pedidosListagem.cy.js` — 1º `it` (`@smoke @pedidos`) |
| Carteira aços longos/planos — filtros e lista | AUTOMATIZADO — OK | `pedidosListagem.cy.js` — 2º `it` (`@regression @p1 @pedidos`) |
| Disparar “Buscar pedidos” com filtros padrão da tela | AUTOMATIZADO — OK | `pedidosBuscar.cy.js` (`@smoke @pedidos`) |
| Filtrar por emissor (env) e buscar | AUTOMATIZADO — OK | `pedidosFiltroEmissor.cy.js` (`@regression @p2 @pedidos`) |
| Alternar tipo (ex.: Faturado) e buscar | AUTOMATIZADO — OK | `pedidosFiltroTipoPedido.cy.js` (`@regression @p1 @pedidos`) |
| Abrir **detalhe** de linha na grade (AUT-017) | PARCIAL | `pedidosDetalhePedido.cy.js` — **`this.skip()`** se não houver linhas clicáveis após **Buscar pedidos** |
| Exportar carteira | PARCIAL | `pedidosExportarCarteira.cy.js` — **opcional** se CTA/texto não existir no QA (`@regression @p2 @pedidos`) |
| Acessar carteira corte e dobra a partir do hub | AUTOMATIZADO — OK | `pedidosCorteEDobra.cy.js` (`@regression @p2 @pedidos`) — 1º `it` |
| Corte/dobra: período opcional + busca na carteira | AUTOMATIZADO — OK | `pedidosCorteEDobra.cy.js` — 2º `it` (`buscarPedidosCarteiraFlex`; rótulos variam vs. longos) |
| Hub `/orders` após recarregar página (`reload`) | AUTOMATIZADO — OK | `pedidosHubRecarregar.cy.js` (`@regression @p2 @pedidos`) |
| Período (Data de criação) + “Buscar pedidos” | PARCIAL | `pedidosPeriodoBusca.cy.js` — preenche últimos dias **se** 2 inputs existirem; senão só busca com default (`@regression @p1 @pedidos`) |

---

## 6. Menu superior, Finanças e Documentos

| Cenário de teste | Status (automação) | Observações |
|------------------|-------------------|-------------|
| Navegação pelos itens do menu superior | AUTOMATIZADO — OK | `menuSuperiorCobertura.cy.js` (`@regression @menu`) — superficial até URLs; não substitui specs profundos de cada módulo |
| Navegação **Pedidos (hub)** → **Comprar** pelo menu (**AUT-052**) | AUTOMATIZADO — OK | `navegacaoCruzadaComprasPedidos.cy.js` (`@regression @p2`); usa fallback por **rota** se o texto do menu não aparecer |
| Finanças — busca com filtros | AUTOMATIZADO — OK | `financasBusca.cy.js` (`@regression @menu @financas`) |
| Buscar documentos — busca por período | AUTOMATIZADO — OK | `documentosBusca.cy.js` (`@regression @menu @documentos`) — 1º `it` |
| Documentos — indícios de download / artefactos (**AUT-018**) | PARCIAL | `documentosBusca.cy.js` — 2º `it` só valida textos/links/estado vazio; **sem** binário garantido |

---

## 7. Gerais e não funcionais

| Cenário de teste | Status (automação) | Observações |
|------------------|-------------------|-------------|
| Responsivo Desktop / Mobile | NÃO AUTOMATIZADO | Manual / ferramentas; sem suite Cypress responsiva versionada |
| Vários navegadores (Chrome, Firefox, Safari, Edge) | PARCIAL | Execução típica em Chromium/Chrome; existe `npm run cy:run:compras:chrome` para compras |
| Integração pedido no ERP Gerdau | NÃO AUTOMATIZADO | Fora do escopo E2E portal |

---

## 8. Resumo — todos os arquivos de spec (nada de fora)

| # | Caminho |
|---|--------|
| 1 | `cypress/e2e/auth/login.cy.js` |
| 2 | `cypress/e2e/auth/logoutProtegida.cy.js` |
| 3 | `cypress/e2e/compras/buscaSemResultados.cy.js` |
| 4 | `cypress/e2e/compras/carrinhoChecklistCampos.cy.js` |
| 5 | `cypress/e2e/compras/carrinhoPersistencia.cy.js` |
| 6 | `cypress/e2e/compras/carrinhoPersistenciaRelogin.cy.js` |
| 7 | `cypress/e2e/compras/carrinhoQuantidade.cy.js` |
| 8 | `cypress/e2e/compras/carrinhoRemocao.cy.js` |
| 9 | `cypress/e2e/compras/compraFinalizacaoCompleta.cy.js` |
| 10 | `cypress/e2e/compras/compraPorHistorico.cy.js` |
| 11 | `cypress/e2e/compras/compraPorPlanilha.cy.js` |
| 12 | `cypress/e2e/compras/compraPorVitrine.cy.js` |
| 13 | `cypress/e2e/compras/compraSelecionandoItens.cy.js` |
| 14 | `cypress/e2e/compras/compraSemEmissor.cy.js` |
| 15 | `cypress/e2e/compras/planilhaDownloadModelo.cy.js` |
| 16 | `cypress/e2e/compras/planilhaUploadArquivoInvalido.cy.js` |
| 17 | `cypress/e2e/compras/posPedidoMeusPedidosEPdf.cy.js` |
| 18 | `cypress/e2e/compras/vitrineBuscaCatalogo.cy.js` |
| 19 | `cypress/e2e/compras/vitrineMaisDetalhes.cy.js` |
| 20 | `cypress/e2e/documentos/documentosBusca.cy.js` |
| 21 | `cypress/e2e/financas/financasBusca.cy.js` |
| 22 | `cypress/e2e/menu/menuSuperiorCobertura.cy.js` |
| 23 | `cypress/e2e/pedidos/pedidosBuscar.cy.js` |
| 24 | `cypress/e2e/pedidos/pedidosCorteEDobra.cy.js` |
| 25 | `cypress/e2e/pedidos/pedidosExportarCarteira.cy.js` |
| 26 | `cypress/e2e/pedidos/pedidosFiltroEmissor.cy.js` |
| 27 | `cypress/e2e/pedidos/pedidosFiltroTipoPedido.cy.js` |
| 28 | `cypress/e2e/pedidos/pedidosListagem.cy.js` |
| 29 | `cypress/e2e/pedidos/pedidosHubRecarregar.cy.js` |
| 30 | `cypress/e2e/pedidos/pedidosPeriodoBusca.cy.js` |
| 31 | `cypress/e2e/compras/compraCorteEDobra.cy.js` |
| 32 | `cypress/e2e/compras/compraHistoricoRevisarPedido.cy.js` |
| 33 | `cypress/e2e/compras/compraHistoricoFinalizePedido.cy.js` |
| 34 | `cypress/e2e/compras/compraVitrineDoisItens.cy.js` |
| 35 | `cypress/e2e/compras/planilhaUploadComplementares.cy.js` |
| 36 | `cypress/e2e/compras/compraVitrineTresItens.cy.js` |
| 37 | `cypress/e2e/compras/carrinhoNavegacaoVoltar.cy.js` |
| 38 | `cypress/e2e/compras/vitrineFiltroCatalogoFamilia.cy.js` |
| 39 | `cypress/e2e/pedidos/pedidosDetalhePedido.cy.js` |
| 40 | `cypress/e2e/menu/navegacaoCruzadaComprasPedidos.cy.js` |

---

## 9. Scripts NPM úteis (escopos parciais)

| Script | Escopo resumido |
|--------|------------------|
| `npm run cy:run` | Suite **completa** (todos os **40** specs) |
| `npm run cy:run:pedidos` | `pedidos/*.cy.js` (Chrome) |
| `npm run cy:run:auth` | `auth/*.cy.js` |
| `npm run cy:run:compras` | `compras/*.cy.js` |
| `npm run cy:run:smoke-pr` | Login + vitrine + histórico |
| `npm run cy:run:regression-nightly` | Lista fixa (compras + **`pedidos/*.cy.js`** + **`menu/*.cy.js`** + finanças + documentos) |
| `npm run cy:run:operacional-modulos` | **`menu/*.cy.js`** + **`pedidos/*.cy.js`** + finanças + documentos |
| `npm run cy:run:menu` / `cy:run:financas` / `cy:run:documentos` | Um módulo |
| `npm run cy:run:p0` / `p0-p1` / `p1` / `p1-compras-opcional` | Atalhos definidos no `package.json` |

Detalhe completo dos comandos: [`RELATORIO-AUTOMACAO-E2E-TEXTO-COMPLETO.md`](./RELATORIO-AUTOMACAO-E2E-TEXTO-COMPLETO.md) (secção 6).

---

*Documento mantido em `docs/CHECKLIST-PRE-DEPLOY-COBERTURA-AUTOMACAO-E2E.md`. Atualize-o sempre que criar, remover ou alterar o critério principal de um spec, e registre em `docs/ALTERACOES.md`.*
