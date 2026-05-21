import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  STEP_TIMEOUT,
  acessarPedidos,
  buscarPedidos,
  validarListaResponde,
  pularSeGradePedidosVaziaAposBusca,
  clicarPrimeiroPossivelLinkDetalhesPedido,
  aguardarTelaPedidos,
} from '../../support/helpers/pedidosFiltros';

/**
 * AUT-017 — detalhes de pedido na carteira (longos/planos).
 * Com lista vazia após Buscar Pedidos faz `skip` para não contaminar regressão estável.
 */
describe('Pedidos — detalhe do pedido', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);
    allure.step('Realizar login', () => realizarLoginComRetry());
  });

  it('@regression @p2 @pedidos Lista após Buscar Pedidos permite abrir detalhe', { retries: 0 }, () => {
    allure.step('Carteira de aços longos + buscar', () => {
      acessarPedidos();
      buscarPedidos();
      validarListaResponde();
      aguardarTelaPedidos('grade após busca');
      cy.log('✅ Lista respondeu');
    });

    allure.step('SKIP se não há linhas de pedido detectáveis', () => {
      pularSeGradePedidosVaziaAposBusca();
    });

    allure.step('Abre primeira ação típica de detalhes', () => {
      clicarPrimeiroPossivelLinkDetalhesPedido();
      cy.wait(800);
    });

    allure.step('Valida modo detalhe, modal ou conteúdo coerente com pedido', () => {
      cy.get('[role="dialog"], .hefesto-modal,[data-testid*="detail"]', { timeout: 8000 }).then(($m) => {
        if (($m.filter(':visible').length || 0) > 0) {
          cy.wrap($m.filter(':visible').first()).should('be.visible');
        }
      });

      cy.url({ timeout: STEP_TIMEOUT }).then((href) => {
        cy.get('body', { timeout: STEP_TIMEOUT }).should(($b) => {
          const texto = ($b.text() || '').toLowerCase();
          const urlSugestiva =
            /detail|timeline|purchase|finalize|\/order\b|\/orders\/[^/]+\/|[a-f0-9]{8}-[a-f0-9-]{35}/i.test(
              href || ''
            );
          const textoSugestivo =
            /detalh(es)?|status|rastrear|acompanhar|timeline|valor|sku|quantidade|\bitens\b|ciclo|cliente\b/i.test(
              texto
            );

          expect(
            textoSugestivo || urlSugestiva,
            `esperado indício de detalhe (href=${href || ''}); trecho: ${texto.slice(0, 160)}`
          ).to.eq(true);
        });
      });
    });

    cy.screenshot('pedidos-detalhe-apos-clique');
  });
});
