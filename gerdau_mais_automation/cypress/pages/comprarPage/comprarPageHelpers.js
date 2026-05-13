export const OVERLAY_SELECTORS = '.hefesto-modal__overlay, .hefesto-modal__container, .modal, .loading';

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

/** Overlays podem existir no DOM ocultos; `not.exist` falha indevidamente. Só exige que nenhum esteja visível. */
export const aguardarOverlaysInvisiveis = (timeout = 60000) => {
  cy.get('body', { timeout }).should(($body) => {
    const visiveis = [...$body.find(OVERLAY_SELECTORS)].filter((el) => Cypress.dom.isVisible(el));
    expect(visiveis.length, 'sem overlay/modal/loading visível').to.eq(0);
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
