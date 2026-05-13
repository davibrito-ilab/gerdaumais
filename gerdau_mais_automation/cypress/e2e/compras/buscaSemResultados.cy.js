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
const TERMO_INEXISTENTE = 'ZZZ_PRODUTO_INEXISTENTE_99999';

describe('Busca de produtos', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);
    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@regression @p1 Busca sem resultados exibe estado adequado', { retries: 0 }, () => {
    allure.step('Acessa landing de Comprar e seleciona emissor', () => {
      acessarComprarLanding();
      selecionarEmissorDoPedido(EMISSOR_ESPERADO);
      aguardarTela('emissor confirmado, cards habilitados');
    });

    allure.step('Acessa tela de busca de itens via "Comprar selecionando itens"', () => {
      clicarBotaoPorTexto(
        'Comprar selecionando itens',
        /comprar\s+selecionando\s+itens/i
      );
      cy.url({ timeout: STEP_TIMEOUT }).should('include', '/search-items');
      aguardarTela('página de busca de itens carregada');
    });

    allure.step(`Pesquisa termo inexistente "${TERMO_INEXISTENTE}"`, () => {
      ComprarPage.buscarTextoSemValidarResultado(TERMO_INEXISTENTE);
    });

    allure.step('Valida mensagem ou estado sem resultados', () => {
      ComprarPage.validarMensagemBuscaSemResultados();
      cy.screenshot('busca-sem-resultados');
    });

    allure.step('Conclui compra efetivada via catálogo após cenário sem resultados', () => {
      cy.visit(ROTA_CATALOGO);
      cy.url({ timeout: STEP_TIMEOUT }).should('include', ROTA_CATALOGO);
      aguardarTela('catálogo carregado');

      ComprarPage.adicionarPrimeiroProdutoDaListaAoCarrinho();
      irParaCarrinhoViaHeader(ComprarPage);
      finalizarPedidoNoCarrinho();
      cy.screenshot('busca-sem-resultados-pedido-efetivado');
    });
  });
});
