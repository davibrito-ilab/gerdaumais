/** Foco em bloqueadores reais. `[aria-modal="true"]` sozinho pega wrappers do layout sempre presentes → mantém só overlays/backdrops/loaders típicos. */
export const OVERLAY_SELECTORS =
  '.modal-backdrop.show, .modal-backdrop.fade.show, div.modal-backdrop:not(:empty), ' +
  '.hefesto-fullscreen-loading, [data-testid*="loading-overlay"], [class*="fullscreen"][class*="load"]';
/** Campo de busca de produto (várias skins Hefesto / QA). Uma única fonte para page + actions. */
export const SEARCH_PRODUCT_INPUT_SELECTORS =
  '#search-product-input, [data-testid="hefesto-search-field"], [data-testid*="search-field"], [data-testid*="Search"], [data-testid*="search"], ' +
  'input[placeholder*="Buscar"], input[placeholder*="buscar"], input[placeholder*="Pesquisar"], input[placeholder*="pesquisar"], ' +
  'input[placeholder*="produto"], input[placeholder*="Produto"], input[placeholder*="código"], input[placeholder*="codigo"], ' +
  'input[placeholder*="Código"], input[placeholder*="item"], input[placeholder*="Item"], input[type="search"], ' +
  '[data-cy*="search"], input[name*="search"], input[id*="search"], input[id*="Search"], input[aria-label*="Buscar"], input[aria-label*="buscar"], ' +
  'input[aria-label*="Pesquisar"], [role="searchbox"], .hefesto-search input, [class*="hefesto-search"] input, ' +
  '[class*="SearchBar"] input, [class*="search-bar"] input, input[class*="search-input"], textarea[placeholder*="Buscar"], ' +
  'header input[type="text"]';

export const ADD_TO_CART_SELECTORS = '[data-cy*="add-cart"], .add-to-cart, button[aria-label*="carrinho"]';

/** CTA de detalhe na listagem de vitrine/catálogo (alinhado a `vitrineMaisDetalhes.cy.js` e `ComprarPage`). */
export const REGEX_CTA_DETALHES_LISTAGEM =
  /mais\s+detalhes|ver\s+detalhes|detalhes\s+do\s+produto|^\s*detalhes\s*$/im;

/** Overlays podem existir no DOM ocultos; só contamos os que são visível “real” (evita overlays com opacity 0 / pointer-events: none persistentes na planilha). */
export const aguardarOverlaysInvisiveis = (timeout = 60000) => {
  cy.get('body', { timeout }).should(($body) => {
    const bloqueante = [...$body.find(OVERLAY_SELECTORS)].filter((el) => {
      if (!Cypress.dom.isVisible(el)) return false;
      if (el.getAttribute && el.getAttribute('aria-hidden') === 'true') return false;
      if (el.hasAttribute && el.hasAttribute('hidden')) return false;
      try {
        const win = el.ownerDocument && el.ownerDocument.defaultView;
        if (!win || !win.getComputedStyle) return true;
        const st = win.getComputedStyle(el);
        const op = parseFloat(st.opacity);
        if (!Number.isNaN(op) && op < 0.03) return false;
        if (st.pointerEvents === 'none') return false;
        if (st.visibility === 'hidden') return false;
      } catch (e) {
        /* ignora DOM cross-origin / edge cases */
      }
      return true;
    });
    expect(bloqueante.length, 'sem overlay/modal/loading visível').to.eq(0);
  });
};

export const assertTextoConfirmacaoCarrinho = (mensagem = 'item adicionado ao carrinho') => {
  cy.get('body', { timeout: 20000 }).should(($body) => {
    const texto = ($body.text() || '').toLowerCase();
    const possuiConfirmacao =
      texto.includes('adicionado') ||
      texto.includes('carrinho') ||
      texto.includes('item(s)') ||
      texto.includes('itens');
    expect(possuiConfirmacao, mensagem).to.eq(true);
  });
};

export const assertTelaSemResultados = () => {
  cy.get('body', { timeout: 20000 }).should(($body) => {
    const texto = ($body.text() || '').toLowerCase();
    const semResultado =
      (texto.includes('nenhum') && (texto.includes('resultado') || texto.includes('encontrado'))) ||
      texto.includes('sem resultado') ||
      texto.includes('não encontramos') ||
      texto.includes('nao encontramos') ||
      texto.includes('nada encontrado') ||
      texto.includes('nenhum produto');

    expect(semResultado, 'mensagem ou estado de busca sem resultados').to.eq(true);
  });
};
