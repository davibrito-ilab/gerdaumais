import ComprarPage from '../../pages/comprarPage/comprarPageMetods';
import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  STEP_TIMEOUT,
  acessarComprarLanding,
  selecionarEmissorDoPedido,
  clicarBotaoPorTexto,
  aguardarTela,
  irParaCarrinhoViaHeader,
  finalizarPedidoNoCarrinho,
} from '../../support/helpers/fluxoCompra';

const EMISSOR_ESPERADO =
  Cypress.env('emissor') || 'ACOS FAVORIT DISTRIBUIDORA LTDA';

describe('Compra com finalização completa', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@smoke @critical Finalizar pedido completo (passos 1-4)', { retries: 0 }, () => {
    allure.step('Acessa fluxo de compra', () => {
      acessarComprarLanding();
    });

    allure.step(`Seleciona emissor "${EMISSOR_ESPERADO}"`, () => {
      selecionarEmissorDoPedido(EMISSOR_ESPERADO);
      aguardarTela('emissor confirmado, cards habilitados');
    });

    allure.step('Clica em "Comprar por Vitrine" e adiciona produto', () => {
      clicarBotaoPorTexto('Comprar por Vitrine', /comprar\s+por\s+vitrine/i);
      cy.url({ timeout: STEP_TIMEOUT }).should('include', '/purchase/long-steel/commerce/catalog');
      aguardarTela('catálogo da vitrine carregado');
      ComprarPage.adicionarPrimeiroProdutoDaListaAoCarrinho();
    });

    allure.step('Avança pelo carrinho até finalização do pedido', () => {
      irParaCarrinhoViaHeader(ComprarPage);
      finalizarPedidoNoCarrinho();
      cy.screenshot('finalizacao-completa-pedido-efetivado');
    });
  });
});
