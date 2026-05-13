import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  acessarPedidos,
  buscarPedidos,
  validarListaResponde,
} from '../../support/helpers/pedidosFiltros';

/**
 * Não redundante com:
 *  - menuSuperiorCobertura: só garante URL operacional ao clicar "Pedidos".
 *  - pedidosListagem: valida estrutura inicial sem disparar "Buscar Pedidos".
 *  - pedidosFiltroTipoPedido: alterna Aberto/Faturado antes de buscar.
 */
describe('Pedidos — buscar com filtros padrão', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@smoke @pedidos Dispara "Buscar Pedidos" mantendo filtros default da tela', { retries: 0 }, () => {
    allure.step('Abre carteira de pedidos', () => {
      acessarPedidos();
    });

    allure.step('Clica em Buscar Pedidos', () => {
      buscarPedidos();
      cy.screenshot('pedidos-buscar-default-resultado', { capture: 'fullPage' });
    });

    allure.step('Valida resposta da lista', () => {
      validarListaResponde();
    });
  });
});
