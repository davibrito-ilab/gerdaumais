import ComprarPage from '../../pages/comprarPage/comprarPageMetods';
import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  STEP_TIMEOUT,
  acessarComprarLanding,
  selecionarEmissorDoPedido,
  clicarBotaoPorTexto,
  aguardarTela,
  avancarParaOCarrinho,
  finalizarPedidoNoCarrinho,
} from '../../support/helpers/fluxoCompra';

const EMISSOR_ESPERADO =
  Cypress.env('emissor') || 'ACOS FAVORIT DISTRIBUIDORA LTDA';
const CODIGO_PRODUTO = Cypress.env('produto') || '106040273';

describe('Compra selecionando itens', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@smoke @critical Comprar selecionando itens', { retries: 0 }, function () {
    allure.step('Acessa a área de Comprar (mesma rota do menu superior)', () => {
      acessarComprarLanding();
    });

    allure.step(`Seleciona emissor "${EMISSOR_ESPERADO}"`, () => {
      selecionarEmissorDoPedido(EMISSOR_ESPERADO);
      aguardarTela('emissor confirmado, cards habilitados');
    });

    allure.step('Clica no botão "Comprar selecionando itens"', () => {
      clicarBotaoPorTexto(
        'Comprar selecionando itens',
        /comprar\s+selecionando\s+itens/i
      );
      cy.url({ timeout: STEP_TIMEOUT }).should('include', '/purchase/long-steel/commerce/search-items');
      aguardarTela('página de busca de itens carregada');
    });

    allure.step(`Busca e adiciona o produto ${CODIGO_PRODUTO} ao carrinho`, () => {
      ComprarPage.buscarProduto(CODIGO_PRODUTO);
      ComprarPage.adicionarProdutoAoCarrinhoPorCodigo(CODIGO_PRODUTO);
      cy.screenshot('selecionando-confirmacao-adicionado-carrinho');
    });

    allure.step('Clica em "Avançar para o carrinho" pra efetivar a lista no carrinho', () => {
      avancarParaOCarrinho();
    });

    allure.step('Avança pelo carrinho, preenche data e finaliza o pedido', () => {
      finalizarPedidoNoCarrinho();
      cy.screenshot('selecionando-pedido-efetivado');
    });
  });
});
