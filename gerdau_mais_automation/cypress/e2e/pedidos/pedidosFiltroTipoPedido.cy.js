import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  acessarPedidos,
  buscarPedidos,
  selecionarTipoPedidoFaturado,
  validarListaResponde,
} from '../../support/helpers/pedidosFiltros';

/**
 * A carteira atual não expõe sempre dois campos de **Data de criação** antes da busca
 * (mensagem: selecionar emissor e período). O filtro estável e visível é **Tipo de pedido**
 * (Aberto / Faturado).
 */
describe('Pedidos — filtro tipo de pedido', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@regression @p1 @pedidos Alterna para Faturado e dispara busca', { retries: 0 }, () => {
    allure.step('Abre carteira de aços longos', () => {
      acessarPedidos();
    });

    allure.step('Seleciona tipo "Faturado"', () => {
      selecionarTipoPedidoFaturado();
      cy.screenshot('pedidos-filtro-tipo-faturado');
    });

    allure.step('Clica em Buscar pedidos', () => {
      buscarPedidos();
    });

    allure.step('Valida resposta da lista ou estado orientativo', () => {
      validarListaResponde();
      cy.screenshot('pedidos-filtro-tipo-resultado', { capture: 'fullPage' });
    });
  });
});
