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

const adicionarPrimeiroProdutoEAcessarCarrinho = () => {
  acessarComprarLanding();
  selecionarEmissorDoPedido(EMISSOR_ESPERADO);
  aguardarTela('emissor confirmado, cards habilitados');

  clicarBotaoPorTexto('Comprar por Vitrine', /comprar\s+por\s+vitrine/i);
  cy.url({ timeout: STEP_TIMEOUT }).should('include', '/purchase/long-steel/commerce/catalog');
  aguardarTela('catálogo da vitrine carregado');
  ComprarPage.adicionarPrimeiroProdutoDaListaAoCarrinho();

  irParaCarrinhoViaHeader(ComprarPage);
  ComprarPage.assertTextoContemIndicioDeCarrinho();
};

describe('Carrinho — remoção de item', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);
    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@regression @p1 @AUT-010 Remove item do carrinho', { retries: 0 }, () => {
    allure.step('Adiciona item ao carrinho e acessa carrinho', () => {
      adicionarPrimeiroProdutoEAcessarCarrinho();
    });

    allure.step('Remove item e valida estado vazio do carrinho', () => {
      ComprarPage.removerPrimeiroItemDoCarrinho();
      ComprarPage.validarCarrinhoVazioOuSemItens();
      cy.screenshot('carrinho-vazio-apos-remocao');
    });

    allure.step('Readiciona produto e efetiva compra', () => {
      adicionarPrimeiroProdutoEAcessarCarrinho();
      finalizarPedidoNoCarrinho();
      cy.screenshot('carrinho-remocao-pedido-efetivado');
    });
  });
});
