/** Uma única espera pelo documento — evita repetir `cy.get('body').should('be.visible')` em todo fluxo. */
export const aguardarBodyVisivel = (timeout = 30000) => {
  cy.get('body', { timeout }).should('be.visible');
};

/**
 * `cy.reload()` seguido de body visível e, opcionalmente, asserção de URL.
 * Centraliza o padrão “recarregou → get body” usado em compras/emissor.
 */
export const recarregarPaginaEAguardar = (timeout = 30000, opts = {}) => {
  cy.reload();
  aguardarBodyVisivel(timeout);
  if (opts.urlIncludes) {
    cy.url({ timeout }).should('include', opts.urlIncludes);
  }
};
