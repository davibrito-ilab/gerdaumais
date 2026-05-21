# Estrutura BDD (Gherkin)

Este diretório organiza os cenários de negócio em Gherkin, com foco em:

- linguagem compreensível por time técnico e não técnico
- rastreabilidade com a matriz (`AUT-001` … `AUT-052` onde aplicável nos `.feature`)
- priorização por risco (`@p0`, `@p1`, `@p2`, `@p3`)
- **paridade declarada** entre cada spec em `cypress/e2e/**/*.cy.js` e ao menos um cenário (com comentário `# Spec: ...` onde aplicável)

## Arquivos `.feature`

| Arquivo | Âmbito |
|---------|--------|
| `01-auth.feature` | Login (positivo e negativos) e logout com rota protegida |
| `02-compras-p0.feature` | Compras E2E até envio (vitrine, histórico, itens, planilha, checkout, sem emissor) |
| `03-compras-p1.feature` | Carrinho, busca no catálogo, planilhas auxiliares, pós-pedido |
| `04-pedidos.feature` | Hub, carteira, filtros, export, corte/dobra e detalhe (automático onde possível); backlog manual pontual |
| `05-menu-financas-documentos.feature` | Menu superior, navegação cruzada, finanças e documentos |

## Convenções adotadas

- Um cenário por regra principal de negócio alinhada ao spec Cypress correspondente.
- Tags por cenário quando fizer sentido:
  - `@AUT-xxx` (ID da matriz)
  - prioridade (`@p0`, `@p1`, `@p2`, `@p3`)
  - tipo (`@smoke`, `@regression`, `@security`, `@negative`, `@manual`)
  - `@backlog-automacao` — comportamento descrito em Gherkin **sem** spec E2E dedicado hoje
- `Contexto` / `Contexto` Gherkin substitui `Background` onde já estava no projeto.
- `Esquema do Cenário` com `Exemplos` para variações de dados.

## Mapeamento Cypress ↔ Gherkin (**40 specs** / **55** casos `it` — auditoria no código **2026-05-21**)

Todos os caminhos abaixo são ficheiros reais sob `cypress/e2e/**` e aparecem com comentários `# Spec: ...` nos `.feature`.

| Spec `.cy.js` | IDs `AUT-*` / notas principais |
|---------------|-------------------------|
| `auth/login.cy.js` | AUT-001, AUT-002, AUT-019–AUT-021 |
| `auth/logoutProtegida.cy.js` | AUT-022 |
| `compras/buscaSemResultados.cy.js` | AUT-014 (+ 2º `it` @p2 quando aplicável) |
| `compras/carrinhoChecklistCampos.cy.js` | AUT-028 |
| `compras/carrinhoNavegacaoVoltar.cy.js` | AUT-049 |
| `compras/carrinhoPersistencia.cy.js` | AUT-011 |
| `compras/carrinhoPersistenciaRelogin.cy.js` | AUT-012 |
| `compras/carrinhoQuantidade.cy.js` | AUT-009 |
| `compras/carrinhoRemocao.cy.js` | AUT-010 |
| `compras/compraCorteEDobra.cy.js` | AUT-039, AUT-040, AUT-050 |
| `compras/compraFinalizacaoCompleta.cy.js` | AUT-007 |
| `compras/compraHistoricoFinalizePedido.cy.js` | AUT-042 |
| `compras/compraHistoricoRevisarPedido.cy.js` | AUT-041 |
| `compras/compraPorHistorico.cy.js` | AUT-004 |
| `compras/compraPorPlanilha.cy.js` | AUT-006 |
| `compras/compraPorVitrine.cy.js` | AUT-003 |
| `compras/compraSemEmissor.cy.js` | AUT-008 |
| `compras/compraSelecionandoItens.cy.js` | AUT-005 |
| `compras/compraVitrineDoisItens.cy.js` | AUT-043 |
| `compras/compraVitrineTresItens.cy.js` | AUT-048 |
| `compras/planilhaDownloadModelo.cy.js` | AUT-025 |
| `compras/planilhaUploadArquivoInvalido.cy.js` | AUT-026 |
| `compras/planilhaUploadComplementares.cy.js` | AUT-044, AUT-045, AUT-046, AUT-047 |
| `compras/posPedidoMeusPedidosEPdf.cy.js` | AUT-027 |
| `compras/vitrineBuscaCatalogo.cy.js` | AUT-013 + AUT-023 |
| `compras/vitrineFiltroCatalogoFamilia.cy.js` | AUT-015 |
| `compras/vitrineMaisDetalhes.cy.js` | AUT-024, AUT-051 |
| `documentos/documentosBusca.cy.js` | AUT-038 + AUT-018 |
| `financas/financasBusca.cy.js` | AUT-037 |
| `menu/menuSuperiorCobertura.cy.js` | AUT-036 |
| `menu/navegacaoCruzadaComprasPedidos.cy.js` | AUT-052 |
| `pedidos/pedidosBuscar.cy.js` | AUT-031 |
| `pedidos/pedidosCorteEDobra.cy.js` | AUT-035 (2× `it`) |
| `pedidos/pedidosDetalhePedido.cy.js` | AUT-017 |
| `pedidos/pedidosExportarCarteira.cy.js` | AUT-034 |
| `pedidos/pedidosFiltroEmissor.cy.js` | AUT-033 |
| `pedidos/pedidosFiltroTipoPedido.cy.js` | AUT-032 |
| `pedidos/pedidosHubRecarregar.cy.js` | `04-pedidos.feature` (hub após reload) |
| `pedidos/pedidosListagem.cy.js` | AUT-029, AUT-030 |
| `pedidos/pedidosPeriodoBusca.cy.js` | `04-pedidos.feature`; AUT-016 = cenário backlog/manual paralelo |

## Mapeamento para automação

- Os `.feature` são **contrato legível**; a execução continua sendo **Cypress** (`npm run cy:run`, etc.), não Cucumber wired neste repo.
- IDs `AUT-xxx` devem ser preservados ao evoluir cenários para não quebrar rastreio com QA/documentação externa.

