import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  ROTA_PEDIDOS,
  aguardarTelaPedidos,
  validarHubPedidos,
} from '../../support/helpers/pedidosFiltros';

/**
 * Garante que o hub de seleção de material não quebra após F5 (regressão de hidratação).
 */
describe('Pedidos — hub após recarregar', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@regression @p2 @pedidos Hub /orders mantém cartões após reload', { retries: 0 }, () => {
    allure.step('Abre hub e valida', () => {
      cy.visit(ROTA_PEDIDOS);
      cy.url({ timeout: 45000 }).should('include', '/orders');
      aguardarTelaPedidos('hub de pedidos (antes do reload)');
      validarHubPedidos();
    });

    allure.step('Recarrega e valida de novo', () => {
      cy.reload();
      aguardarTelaPedidos('hub de pedidos (após reload)');
      validarHubPedidos();
      cy.screenshot('pedidos-hub-apos-reload', { capture: 'fullPage' });
    });
  });
});
