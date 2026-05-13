import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  STEP_TIMEOUT,
  acessarPedidos,
  exportarCarteira,
  aguardarTelaPedidos,
  validarListaResponde,
} from '../../support/helpers/pedidosFiltros';

/**
 * Smoke da ação "Exportar Carteira" na carteira de pedidos (sub-rota sob `/orders/...`).
 * Valida que a página não quebra após o disparo.
 */
describe('Pedidos — exportar carteira', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@regression @p2 @pedidos Dispara exportação da carteira', { retries: 0 }, () => {
    allure.step('Abre carteira de pedidos', () => {
      acessarPedidos();
    });

    allure.step('Exportar Carteira (se exibido nesta versão da carteira)', () => {
      cy.get('body', { timeout: STEP_TIMEOUT }).should('be.visible');
      cy.get('body').then(($body) => {
        const texto = $body.text() || '';
        if (!/exportar\s+carteira/i.test(texto)) {
          cy.log(
            'ℹ️ Ação "Exportar Carteira" não está disponível nesta carteira — validação limitada à estabilidade da tela.'
          );
          return;
        }
        exportarCarteira();
        aguardarTelaPedidos('pós clique em Exportar Carteira');
      });
      cy.screenshot('pedidos-exportar-carteira-disparado', { capture: 'fullPage' });
    });

    allure.step('Valida que a listagem segue coerente', () => {
      validarListaResponde();
    });
  });
});
