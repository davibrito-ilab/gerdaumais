import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  ROTA_PEDIDOS,
  aguardarTelaPedidos,
  acessarPedidos,
  validarHubPedidos,
  validarEstruturaPedidos,
  validarListaResponde,
} from '../../support/helpers/pedidosFiltros';

describe('Pedidos — listagem', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@smoke @pedidos Hub /orders — dois fluxos (longos/planos e corte/dobra)', () => {
    allure.step('Abre hub de Pedidos', () => {
      cy.visit(ROTA_PEDIDOS);
      cy.url({ timeout: 45000 }).should('include', '/orders');
      aguardarTelaPedidos('hub de pedidos carregado');
      cy.screenshot('pedidos-hub-tipos-material', { capture: 'fullPage' });
    });

    allure.step('Valida cartões e CTAs de exploração', () => {
      validarHubPedidos();
    });
  });

  it('@regression @p1 Carteira de aços longos — filtros e lista', () => {
    allure.step('Hub → Explorar pedidos de aços longos e planos', () => {
      acessarPedidos();
      cy.screenshot('pedidos-listagem-apos-load', { capture: 'fullPage' });
    });

    allure.step('Valida que filtros (Estado, Emissor, Data) e botões estão presentes', () => {
      validarEstruturaPedidos();
    });

    allure.step('Valida que a lista responde (com pedidos ou estado vazio)', () => {
      validarListaResponde();
    });
  });
});
