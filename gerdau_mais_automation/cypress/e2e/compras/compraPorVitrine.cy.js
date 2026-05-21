import ComprarPage from '../../pages/comprarPage/comprarPageMetods';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  STEP_TIMEOUT,
  acessarCatalogoVitrineComEmissor,
  irParaCarrinhoViaHeader,
  finalizarPedidoNoCarrinho,
} from '../../support/helpers/fluxoCompra';

const EMISSOR_ESPERADO =
  Cypress.env('emissor') || 'ACOS FAVORIT DISTRIBUIDORA LTDA';

describe('Compra por Vitrine', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    cy.log('↪ Realizar login');
    realizarLoginComRetry();
  });

  it('@smoke @critical Comprar Por Vitrine', { retries: 0 }, function () {
    cy.log(`Landing → emissor → catálogo (vitrine) — "${EMISSOR_ESPERADO}"`);
    acessarCatalogoVitrineComEmissor(EMISSOR_ESPERADO);
    cy.url({ timeout: STEP_TIMEOUT }).should('include', '/purchase/long-steel/commerce/catalog');

    cy.log('Adiciona o primeiro produto ao carrinho (emissor já aplicado na landing)');
    ComprarPage.adicionarPrimeiroProdutoDaListaAoCarrinho({ skipEmissorRecover: true });
    cy.screenshot('vitrine-confirmacao-adicionado-carrinho');

    irParaCarrinhoViaHeader(ComprarPage);

    cy.log('⏳ Checkout: datas + finalizar pedido');
    finalizarPedidoNoCarrinho();
    cy.screenshot('vitrine-pedido-efetivado');
  });
});
