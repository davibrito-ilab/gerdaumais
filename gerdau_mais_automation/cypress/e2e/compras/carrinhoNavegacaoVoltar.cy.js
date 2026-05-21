import ComprarPage from '../../pages/comprarPage/comprarPageMetods';
import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  STEP_TIMEOUT,
  acessarCatalogoVitrineComEmissor,
  aguardarTela,
  irParaCarrinhoViaHeader,
} from '../../support/helpers/fluxoCompra';
import { URL_ROTAS_CARRINHO_COMERCIO } from '../../support/helpers/historicoRepeatCompra';

const EMISSOR_ESPERADO =
  Cypress.env('emissor') || 'ACOS FAVORIT DISTRIBUIDORA LTDA';

describe('Carrinho — navegação voltar', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);
    allure.step('Login', () => realizarLoginComRetry());
  });

  it('@regression @p2 Voltar pelo histórico do browser após entrar no carrinho', { retries: 0 }, () => {
    allure.step('Catálogo e item no carrinho', () => {
      acessarCatalogoVitrineComEmissor(EMISSOR_ESPERADO);
      aguardarTela('catálogo vitrine');
      ComprarPage.adicionarPrimeiroProdutoDaListaAoCarrinho();
    });

    irParaCarrinhoViaHeader(ComprarPage);

    cy.url({ timeout: STEP_TIMEOUT }).should(($href) =>
      URL_ROTAS_CARRINHO_COMERCIO.test(String($href || '').toLowerCase())
    );

    cy.go('back');
    aguardarTela('pós voltar do histórico do navegador');

    cy.location('pathname', { timeout: STEP_TIMEOUT }).should(($p) => {
      /** Manter dentro da área compras após navegação `back`. */
      expect(/^\/purchase\//i.test(String($p || '')), 'pathname continua em /purchase/**').eq(true);
    });

    cy.screenshot('carrinho-apos-history-back');
  });
});
