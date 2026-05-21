import ComprarPage from '../../pages/comprarPage/comprarPageMetods';
import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  STEP_TIMEOUT,
  acessarComprarLanding,
  acessarCatalogoVitrineComEmissor,
  selecionarEmissorDoPedido,
  clicarBotaoPorTexto,
  aguardarTela,
  irParaCarrinhoViaHeader,
  finalizarPedidoNoCarrinho,
} from '../../support/helpers/fluxoCompra';

const EMISSOR_ESPERADO =
  Cypress.env('emissor') || 'ACOS FAVORIT DISTRIBUIDORA LTDA';
const TERMO_INEXISTENTE = 'ZZZ_PRODUTO_INEXISTENTE_99999';

describe('Busca de produtos', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);
    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@smoke @p1 @regression Busca sem resultados exibe estado adequado', { retries: 0 }, () => {
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
  });

  /** E2E separado para não mascara falhas do comportamento principal de estado vazio. */
  it('@regression @p2 Após cenário sem resultados — compra rápida via vitrine fecha pedido', { retries: 0 }, () => {
    allure.step('Landing + emissor + busca sem resultados', () => {
      acessarComprarLanding();
      selecionarEmissorDoPedido(EMISSOR_ESPERADO);
      aguardarTela('emissor confirmado, cards habilitados');
      clicarBotaoPorTexto(
        'Comprar selecionando itens',
        /comprar\s+selecionando\s+itens/i
      );
      cy.url({ timeout: STEP_TIMEOUT }).should('include', '/search-items');
      aguardarTela('página de busca de itens carregada');
      ComprarPage.buscarTextoSemValidarResultado(TERMO_INEXISTENTE);
      ComprarPage.validarMensagemBuscaSemResultados();
    });

    allure.step('Fluxo paralelo até envio efetivo (valida checkout)', () => {
      acessarCatalogoVitrineComEmissor(EMISSOR_ESPERADO);
      ComprarPage.adicionarPrimeiroProdutoDaListaAoCarrinho();
      irParaCarrinhoViaHeader(ComprarPage);
      finalizarPedidoNoCarrinho();
      cy.screenshot('busca-sem-resultados-pedido-efetivado');
    });
  });
});
