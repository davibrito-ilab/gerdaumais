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

describe('Carrinho — persistência após refresh', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);
    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@regression @p1 Mantém evidência de carrinho após recarregar a página', { retries: 0 }, () => {
    allure.step('Acessa landing e seleciona emissor', () => {
      acessarComprarLanding();
      selecionarEmissorDoPedido(EMISSOR_ESPERADO);
      aguardarTela('emissor confirmado, cards habilitados');
    });

    allure.step('Acessa catálogo via "Comprar por Vitrine" e adiciona produto', () => {
      clicarBotaoPorTexto('Comprar por Vitrine', /comprar\s+por\s+vitrine/i);
      cy.url({ timeout: STEP_TIMEOUT }).should('include', '/purchase/long-steel/commerce/catalog');
      aguardarTela('catálogo da vitrine carregado');
      ComprarPage.adicionarPrimeiroProdutoDaListaAoCarrinho();
      ComprarPage.assertTextoContemIndicioDeCarrinho();
    });

    allure.step('Recarrega e valida que o contexto de carrinho permanece', () => {
      cy.reload();
      cy.get('body', { timeout: STEP_TIMEOUT }).should('be.visible');
      aguardarTela('página recarregada');
      ComprarPage.assertTextoContemIndicioDeCarrinho();
      cy.screenshot('carrinho-persistencia-pos-refresh');
    });

    allure.step('Efetiva compra após validar persistência', () => {
      irParaCarrinhoViaHeader(ComprarPage);
      finalizarPedidoNoCarrinho();
      cy.screenshot('carrinho-persistencia-pedido-efetivado');
    });
  });
});
