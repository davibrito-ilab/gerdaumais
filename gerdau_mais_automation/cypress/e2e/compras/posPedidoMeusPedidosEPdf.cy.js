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

const EMISSOR = Cypress.env('emissor') || 'ACOS FAVORIT DISTRIBUIDORA LTDA';
const ROTA_CATALOGO = '/purchase/long-steel/commerce/catalog';

const SELETORES_BOTAO =
  'button, [role="button"], .hefesto-button, a[href], [role="link"], input[type="submit"]';

/**
 * Checklist pós-pedido: links "Baixar PDF" e "Ir para Meus pedidos" na confirmação.
 * (Validação de conteúdo binário do PDF e ERP ficam fora do E2E.)
 */
describe('Pós-pedido — Meus pedidos e PDF', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);
    allure.step('Login', () => realizarLoginComRetry());
  });

  it('@regression @p1 Após envio, exibe CTAs de PDF e Meus pedidos', { retries: 0 }, () => {
    allure.step('Efetiva pedido mínimo (vitrine)', () => {
      acessarComprarLanding();
      selecionarEmissorDoPedido(EMISSOR);
      aguardarTela('emissor');
      clicarBotaoPorTexto('Comprar por Vitrine', /comprar\s+por\s+vitrine/i);
      cy.url({ timeout: STEP_TIMEOUT }).should('include', ROTA_CATALOGO);
      aguardarTela('catálogo');
      ComprarPage.adicionarPrimeiroProdutoDaListaAoCarrinho();
      irParaCarrinhoViaHeader(ComprarPage);
      finalizarPedidoNoCarrinho();
    });

    allure.step('Confirma CTAs de pós-pedido', () => {
      cy.contains(SELETORES_BOTAO, /baixar\s+pdf|pdf\s+do\s+pedido/i, {
        timeout: STEP_TIMEOUT,
      })
        .filter(':visible')
        .should('exist');
      cy.contains(SELETORES_BOTAO, /ir\s+para\s+meus\s+pedidos|meus\s+pedidos/i, {
        timeout: STEP_TIMEOUT,
      })
        .filter(':visible')
        .should('exist');
      cy.screenshot('pos-pedido-ctas');
    });

    allure.step('Smoke: clique em Meus pedidos navega para pedidos', () => {
      cy.contains(SELETORES_BOTAO, /ir\s+para\s+meus\s+pedidos|meus\s+pedidos/i, { timeout: STEP_TIMEOUT })
        .filter(':visible')
        .first()
        .click({ force: true });
      cy.url({ timeout: STEP_TIMEOUT }).should('match', /\/orders|pedido/i);
      cy.screenshot('pos-pedido-meus-pedidos');
    });
  });
});
