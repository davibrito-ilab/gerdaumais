import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  entrarCarteiraCorteEDobra,
  ROTA_PEDIDOS,
  buscarPedidosCarteiraFlex,
  preencherPeriodoUltimosDiasSeDisponivel,
  validarListaResponde,
} from '../../support/helpers/pedidosFiltros';

/**
 * Caminho alternativo no hub de Pedidos (não redundante com carteira de longos).
 */
describe('Pedidos — corte e dobra', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@regression @p2 @pedidos Acessa carteira de corte e dobra a partir do hub', { retries: 0 }, () => {
    allure.step('Hub → Explorar pedidos de corte e dobra', () => {
      entrarCarteiraCorteEDobra();
      cy.screenshot('pedidos-corte-dobra-carteira', { capture: 'fullPage' });
    });

    allure.step('Valida que permanece no contexto de pedidos', () => {
      cy.url({ timeout: 45000 }).should('include', '/orders');
      cy.get('body').should(($body) => {
        const texto = ($body.text() || '').toLowerCase();
        const coerente =
          texto.includes('pedido') ||
          texto.includes('order') ||
          texto.includes('corte') ||
          texto.includes('dobra') ||
          texto.includes('filtro') ||
          texto.includes('buscar');
        expect(coerente, `conteúdo esperado na carteira corte/dobra (${ROTA_PEDIDOS}→…)`).to.eq(
          true
        );
      });
    });
  });

  it('@regression @p2 @pedidos Carteira corte/dobra — período (se houver) e busca', { retries: 0 }, () => {
    allure.step('Abre carteira corte e dobra', () => {
      entrarCarteiraCorteEDobra();
    });

    allure.step('Ajusta período quando a UI expõe duas datas', () => {
      preencherPeriodoUltimosDiasSeDisponivel(45);
      cy.screenshot('pedidos-corte-dobra-periodo', { capture: 'fullPage' });
    });

    allure.step('Dispara busca na carteira (rótulos flexíveis)', () => {
      buscarPedidosCarteiraFlex();
    });

    allure.step('Valida resposta da listagem', () => {
      validarListaResponde();
      cy.screenshot('pedidos-corte-dobra-pos-busca', { capture: 'fullPage' });
    });
  });
});
