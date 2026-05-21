/**
 * Após **Comprar por histórico** (repeat-order / order-history na Compra), avança pela lista
 * com CTA Hefesto até surgir rota de **carrinho** ou texto da etapa **Revisar pedido**.
 */
import {
  STEP_TIMEOUT,
  tratarModaisTransientes,
  aguardarTela,
  REGEX_INDICIOS_ETAPA_REVISAR_PEDIDO,
  avancarCarrinhoAteEtapaRevisarPedido,
} from './fluxoCompra';

export const URL_ROTAS_CARRINHO_COMERCIO =
  /shopping-cart|\/commerce\/(?:cart|carrinho)|configure-cart/i;

/**
 * Dispara `clicarEmBotaoInk` até o limite, parando se URL for de carrinho ou se o body já indicar revisão.
 *
 * @param page instância default export de `comprarPageMetods`
 */
export const avancosRepeatOrderAtePontoDeRevisaoOuCarrinho = (page, tentativas = 14) => {
  for (let k = 1; k <= tentativas; k += 1) {
    tratarModaisTransientes(4000);

    cy.url().then((urlStr) => {
      cy.get('body').then(($b) => {
        const texto = $b.text() || '';

        if (REGEX_INDICIOS_ETAPA_REVISAR_PEDIDO.test(texto)) {
          return;
        }

        const href = String(urlStr || '').toLowerCase();
        if (URL_ROTAS_CARRINHO_COMERCIO.test(href)) {
          return;
        }

        cy.log(`⏳ Histórico repetir pedido — avanço via ink ${k}/${tentativas}`);
        page.selecionaEmissorCorretamente();
        page.clicarEmBotaoInk();
        aguardarTela('histórico — após CTA de avanço');
      });
    });
  }
};

/** Se ainda não está em “Revisar pedido”, exige rota de carrinho e executa avanço do carrinho até a revisão. */
export const garantirEtapaRevisarPedidoPosHistoricoOuCarrinho = () => {
  cy.get('body', { timeout: STEP_TIMEOUT }).then(($b) => {
    if (REGEX_INDICIOS_ETAPA_REVISAR_PEDIDO.test($b.text() || '')) {
      cy.log('✅ Revisar pedido já visível após fluxo de histórico');
      return;
    }

    cy.url().then((urlStr) => {
      const href = String(urlStr || '').toLowerCase();
      expect(
        URL_ROTAS_CARRINHO_COMERCIO.test(href),
        'Após refazer/repetir pelo histórico, era esperada rota de carrinho antes da etapa “Revisar pedido” — confira se o emissor possui pedidos repetíveis no QA'
      ).to.eq(true);
    });

    avancarCarrinhoAteEtapaRevisarPedido();
  });

  cy.contains('body', REGEX_INDICIOS_ETAPA_REVISAR_PEDIDO, { timeout: STEP_TIMEOUT }).should('be.visible');
};
