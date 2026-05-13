import GerdauHeader from "../gerdauHeader/gerdauHeader";
import { SEARCH_PRODUCT_INPUT_SELECTORS } from "./comprarPageHelpers";

class ComprarPage extends GerdauHeader{

  get acessarComprarButton() { return cy.get('nav ul li').contains('Comprar').parent(); }
  get headerComprar() { return cy.get('section header'); }
  get comprarVitrineButton() {
    return cy.contains('button, a, [role="tab"], [role="button"], li, span', /vitrine/i).first();
  }
  get comprarSelecionandoButton() {
    return cy.contains('button, a, [role="tab"], [role="button"], li, span', /selecionando(\s+itens)?/i).first();
  }
  get comprarPlanilhaButton() { return cy.contains('Planilha'); }
  get comprarHistoricoButton() { return cy.contains('Histórico'); }
  get emissorInput() {
    return cy.get(
      '#select-emissor-pedido, [data-testid="hefesto-select-input"], input[placeholder*="Emissor"], input[id*="emissor"]'
    ).first();
  }
  get emissor() { return cy.contains('[role="option"], li, .dropdown-item', Cypress.env('emissor')).first(); }
  get listaEmissores() { return cy.get('.hefesto-select__options, [role="listbox"], .dropdown-menu, ul').first(); }
  get recebedorInput() { return cy.get('input[placeholder*="Recebedor"], [data-cy*="recebedor"]').first(); }
  get recebedor() { return cy.get('.dropdown-item, li').first(); }
  get listaRecebedores() { return cy.get('.dropdown-menu, ul').eq(1); }
  get modalCarregamento() { return cy.get('.modal, .loading, [data-cy*="loading"], .hefesto-modal__container').first(); }
  get listaProdutos() { return cy.get('.products-list, [data-cy*="products"], .product-grid').first(); }
  get buscaProdutoInput () {
    return cy.get(SEARCH_PRODUCT_INPUT_SELECTORS, { timeout: 90000 }).filter(':visible').first();
  }
  get buscaProdutoButton () {
    return cy.get(
      'button[type="submit"], [data-cy*="search-btn"], button[aria-label*="buscar"], button[aria-label*="Buscar"], .hefesto-search__button'
    ).first();
  }
  get adicionarAoCarrinhoButton() { return cy.get('[data-cy*="add-cart"], button:contains("Adicionar"), .add-to-cart').first(); }

}

export default ComprarPage;