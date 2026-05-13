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

describe('Carrinho — alteração de quantidade', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);
    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@regression @p1 @AUT-009 Incrementa quantidade do primeiro item no carrinho', { retries: 0 }, () => {
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
    });

    allure.step('Acessa carrinho pelo header', () => {
      irParaCarrinhoViaHeader(ComprarPage);
      ComprarPage.assertTextoContemIndicioDeCarrinho();
    });

    allure.step('Incrementa quantidade e valida valor mínimo esperado', () => {
      ComprarPage.incrementarQuantidadePrimeiroItemCarrinho();
      ComprarPage.assertQuantidadePrimeiroItemEsperada(2);
      cy.screenshot('carrinho-quantidade-incrementada');
    });

    allure.step('Efetiva pedido após validação de quantidade', () => {
      finalizarPedidoNoCarrinho();
      cy.screenshot('carrinho-quantidade-pedido-efetivado');
    });
  });
});
