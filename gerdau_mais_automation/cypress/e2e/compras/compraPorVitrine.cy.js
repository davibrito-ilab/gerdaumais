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

describe('Compra por Vitrine', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@smoke @critical Comprar Por Vitrine', { retries: 0 }, function () {
    allure.step('Acessa a área de Comprar (mesma rota do menu superior)', () => {
      acessarComprarLanding();
    });

    allure.step(`Seleciona emissor "${EMISSOR_ESPERADO}"`, () => {
      selecionarEmissorDoPedido(EMISSOR_ESPERADO);
      aguardarTela('emissor confirmado, cards habilitados');
    });

    allure.step('Clica no botão "Comprar por Vitrine"', () => {
      clicarBotaoPorTexto('Comprar por Vitrine', /comprar\s+por\s+vitrine/i);
      cy.url({ timeout: STEP_TIMEOUT }).should('include', '/purchase/long-steel/commerce/catalog');
      aguardarTela('catálogo da vitrine carregado');
    });

    allure.step('Adiciona o primeiro produto ao carrinho', () => {
      ComprarPage.adicionarPrimeiroProdutoDaListaAoCarrinho();
      cy.screenshot('vitrine-confirmacao-adicionado-carrinho');
    });

    allure.step('Clica no ícone do carrinho no header superior direito', () => {
      irParaCarrinhoViaHeader(ComprarPage);
    });

    allure.step('Avança pelo carrinho, preenche data e finaliza o pedido', () => {
      finalizarPedidoNoCarrinho();
      cy.screenshot('vitrine-pedido-efetivado');
    });
  });
});
