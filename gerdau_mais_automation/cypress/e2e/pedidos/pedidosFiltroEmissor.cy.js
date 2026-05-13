import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  acessarPedidos,
  selecionarEmissorPedidos,
  buscarPedidos,
  validarListaResponde,
} from '../../support/helpers/pedidosFiltros';

const EMISSOR = Cypress.env('emissor');

/**
 * Isola o combo de emissor + busca. Não coberto por pedidosFiltroTipoPedido (toggle Aberto/Faturado).
 */
describe('Pedidos — filtro por emissor', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@regression @p2 @pedidos Filtra por emissor configurado no env e busca', { retries: 0 }, () => {
    expect(EMISSOR, 'defina emissor em cypress.env.json ou CYPRESS_emissor').to.exist;

    allure.step('Abre carteira de pedidos', () => {
      acessarPedidos();
    });

    allure.step(`Seleciona emissor "${EMISSOR}"`, () => {
      selecionarEmissorPedidos(EMISSOR);
      cy.screenshot('pedidos-filtro-emissor-selecionado');
    });

    allure.step('Busca pedidos', () => {
      buscarPedidos();
    });

    allure.step('Valida resposta da lista', () => {
      validarListaResponde();
      cy.screenshot('pedidos-filtro-emissor-resultado', { capture: 'fullPage' });
    });
  });
});
