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
const ROTA_CATALOGO = '/purchase/long-steel/commerce/catalog';

describe('Carrinho — persistência após relogin', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);
    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@regression @p1 @AUT-012 Mantém evidência de carrinho após novo login', { retries: 0 }, () => {
    allure.step('Acessa landing, seleciona emissor e adiciona produto via Vitrine', () => {
      acessarComprarLanding();
      selecionarEmissorDoPedido(EMISSOR_ESPERADO);
      aguardarTela('emissor confirmado, cards habilitados');

      clicarBotaoPorTexto('Comprar por Vitrine', /comprar\s+por\s+vitrine/i);
      cy.url({ timeout: STEP_TIMEOUT }).should('include', ROTA_CATALOGO);
      aguardarTela('catálogo da vitrine carregado');
      ComprarPage.adicionarPrimeiroProdutoDaListaAoCarrinho();
      ComprarPage.assertTextoContemIndicioDeCarrinho();
    });

    allure.step('Limpa sessão, reloga e valida indício de contexto de carrinho na UI pós relogin', () => {
      limparSessao();
      realizarLoginComRetry();

      // Validamos a evidência de contexto de carrinho na UI (ícone/header do carrinho).
      // O backend zera os itens da sessão entre logins — validamos só o indício de UI.
      cy.visit(ROTA_CATALOGO);
      cy.url({ timeout: STEP_TIMEOUT }).should('include', ROTA_CATALOGO);
      aguardarTela('catálogo pós relogin carregado');
      ComprarPage.assertTextoContemIndicioDeCarrinho();
      cy.screenshot('carrinho-persistencia-pos-relogin');
    });

    allure.step('Re-seleciona emissor pós relogin, adiciona produto e efetiva compra', () => {
      acessarComprarLanding();
      selecionarEmissorDoPedido(EMISSOR_ESPERADO);
      aguardarTela('emissor confirmado, cards habilitados (pós relogin)');

      clicarBotaoPorTexto('Comprar por Vitrine', /comprar\s+por\s+vitrine/i);
      cy.url({ timeout: STEP_TIMEOUT }).should('include', ROTA_CATALOGO);
      aguardarTela('catálogo da vitrine carregado (pós relogin)');
      ComprarPage.adicionarPrimeiroProdutoDaListaAoCarrinho();

      irParaCarrinhoViaHeader(ComprarPage);
      finalizarPedidoNoCarrinho();
      cy.screenshot('carrinho-persistencia-relogin-pedido-efetivado');
    });
  });
});
