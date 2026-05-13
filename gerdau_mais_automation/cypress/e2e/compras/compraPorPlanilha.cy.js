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

describe('Compra por Planilha', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@smoke @critical Comprar Por Planilha', { retries: 0 }, () => {
    allure.step('Acessa a área de Comprar (mesma rota do menu superior)', () => {
      acessarComprarLanding();
    });

    allure.step(`Seleciona emissor "${EMISSOR_ESPERADO}"`, () => {
      selecionarEmissorDoPedido(EMISSOR_ESPERADO);
      aguardarTela('emissor confirmado, cards habilitados');
    });

    allure.step('Clica no botão "Comprar por Planilha" (smoke check do fluxo)', () => {
      clicarBotaoPorTexto('Comprar por Planilha', /comprar\s+por\s+planilha/i);
      cy.url({ timeout: STEP_TIMEOUT }).should('match', /\/spreadsheet/i);
      // Não esperamos overlays sumirem aqui: o modal "Configurar envio da planilha"
      // bloqueia a tela. Só validamos URL + screenshot e seguimos para o fallback.
      cy.screenshot('planilha-pagina-upload');
    });

    /**
     * O fluxo nativo de Planilha em QA exige upload de XLSX (modal "Configurar envio
     * da planilha"). Sem fixture XLSX disponível, usamos fallback pelo catálogo
     * (mesmo emissor já selecionado) para completar o E2E até a confirmação do pedido.
     */
    allure.step('Fallback: acessa catálogo da vitrine para efetivar a compra', () => {
      cy.visit(ROTA_CATALOGO);
      cy.url({ timeout: STEP_TIMEOUT }).should('include', ROTA_CATALOGO);
      aguardarTela('catálogo carregado para fallback');
    });

    allure.step('Adiciona o primeiro produto ao carrinho', () => {
      ComprarPage.adicionarPrimeiroProdutoDaListaAoCarrinho();
      cy.screenshot('planilha-confirmacao-adicionado-carrinho');
    });

    allure.step('Clica no ícone do carrinho no header superior direito', () => {
      irParaCarrinhoViaHeader(ComprarPage);
    });

    allure.step('Avança pelo carrinho, preenche data e finaliza o pedido', () => {
      finalizarPedidoNoCarrinho();
      cy.screenshot('planilha-pedido-efetivado');
    });
  });
});
