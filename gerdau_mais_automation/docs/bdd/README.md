# Estrutura BDD (Gherkin)

Este diretório organiza os cenários de negócio em Gherkin, com foco em:

- linguagem compreensível por time técnico e não técnico
- rastreabilidade com a matriz (`AUT-001` … `AUT-038`)
- priorização por risco (`@p0`, `@p1`, `@p2`, `@p3`)
- **paridade declarada** entre cada spec em `cypress/e2e/**/*.cy.js` e ao menos um cenário (com comentário `# Spec: ...` onde aplicável)

## Arquivos `.feature`

| Arquivo | Âmbito |
|---------|--------|
| `01-auth.feature` | Login (positivo e negativos) e logout com rota protegida |
| `02-compras-p0.feature` | Compras E2E até envio (vitrine, histórico, itens, planilha, checkout, sem emissor) |
| `03-compras-p1.feature` | Carrinho, busca no catálogo, planilhas auxiliares, pós-pedido |
| `04-pedidos.feature` | Hub, carteira, filtros, export, corte/dobra (e cenários manuais backlog) |
| `05-menu-financas-documentos.feature` | Menu superior, finanças e documentos |

## Convenções adotadas

- Um cenário por regra principal de negócio alinhada ao spec Cypress correspondente.
- Tags por cenário quando fizer sentido:
  - `@AUT-xxx` (ID da matriz)
  - prioridade (`@p0`, `@p1`, `@p2`, `@p3`)
  - tipo (`@smoke`, `@regression`, `@security`, `@negative`, `@manual`)
  - `@backlog-automacao` — comportamento descrito em Gherkin **sem** spec E2E dedicado hoje
- `Contexto` / `Contexto` Gherkin substitui `Background` onde já estava no projeto.
- `Esquema do Cenário` com `Exemplos` para variações de dados.

## Mapeamento Cypress ↔ Gherkin (28 specs)

Cada entrada da coluna direita existe como cenário nos `.feature` acima.

| Spec `.cy.js` | IDs `AUT-*` principais |
|---------------|-------------------------|
| `auth/login.cy.js` | AUT-001, AUT-002, AUT-019, AUT-020, AUT-021 |
| `auth/logoutProtegida.cy.js` | AUT-022 |
| `compras/compraPorVitrine.cy.js` | AUT-003 |
| `compras/compraPorHistorico.cy.js` | AUT-004 |
| `compras/compraSelecionandoItens.cy.js` | AUT-005 |
| `compras/compraPorPlanilha.cy.js` | AUT-006 |
| `compras/compraFinalizacaoCompleta.cy.js` | AUT-007 |
| `compras/compraSemEmissor.cy.js` | AUT-008 |
| `compras/carrinhoQuantidade.cy.js` | AUT-009 |
| `compras/carrinhoRemocao.cy.js` | AUT-010 |
| `compras/carrinhoPersistencia.cy.js` | AUT-011 |
| `compras/carrinhoPersistenciaRelogin.cy.js` | AUT-012 |
| `compras/vitrineBuscaCatalogo.cy.js` | AUT-013 (exemplos), AUT-023 |
| `compras/buscaSemResultados.cy.js` | AUT-014 |
| — (sem spec; apenas BDD/backlog) | AUT-015 @backlog-automacao |
| `compras/vitrineMaisDetalhes.cy.js` | AUT-024 |
| `compras/planilhaDownloadModelo.cy.js` | AUT-025 |
| `compras/planilhaUploadArquivoInvalido.cy.js` | AUT-026 |
| `compras/posPedidoMeusPedidosEPdf.cy.js` | AUT-027 |
| `compras/carrinhoChecklistCampos.cy.js` | AUT-028 |
| `pedidos/pedidosListagem.cy.js` | AUT-029, AUT-030 |
| `pedidos/pedidosBuscar.cy.js` | AUT-031 |
| `pedidos/pedidosFiltroTipoPedido.cy.js` | AUT-032 |
| `pedidos/pedidosFiltroEmissor.cy.js` | AUT-033 |
| `pedidos/pedidosExportarCarteira.cy.js` | AUT-034 |
| `pedidos/pedidosCorteEDobra.cy.js` | AUT-035 |
| `menu/menuSuperiorCobertura.cy.js` | AUT-036 |
| `financas/financasBusca.cy.js` | AUT-037 |
| `documentos/documentosBusca.cy.js` | AUT-038 |
| — (manual; não é o mesmo que busca atual) | AUT-018 |
| — (manual backlog pedidos) | AUT-016, AUT-017 |

## Mapeamento para automação

- Os `.feature` são **contrato legível**; a execução continua sendo **Cypress** (`npm run cy:run`, etc.), não Cucumber wired neste repo.
- IDs `AUT-xxx` devem ser preservados ao evoluir cenários para não quebrar rastreio com QA/documentação externa.
