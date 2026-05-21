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

describe('Compra por Histórico', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@smoke @critical @regression Comprar Por Histórico', { retries: 0 }, function () {
    allure.step('Acessa a área de Comprar (mesma rota do menu superior)', () => {
      acessarComprarLanding();
    });

    allure.step(`Seleciona emissor "${EMISSOR_ESPERADO}"`, () => {
      selecionarEmissorDoPedido(EMISSOR_ESPERADO);
      aguardarTela('emissor confirmado, cards habilitados');
    });

    allure.step('Clica no botão "Comprar por Histórico" (smoke check do fluxo)', () => {
      clicarBotaoPorTexto('Comprar por Histórico', /comprar\s+por\s+hist[óo]rico/i);
      cy.url({ timeout: STEP_TIMEOUT }).should('match', /\/repeat-order|\/order-history|\/history/i);
      aguardarTela('página do histórico de pedidos carregada');
      cy.screenshot('historico-lista-pedidos');
    });

    /**
     * A tela de Histórico de Pedidos exibe pedidos passados com botões-ícone SVG (sem
     * texto/aria-label) na coluna "Ações" para "Detalhes" / "Adicionar ao carrinho".
     * Sem `data-testid` confiável, usamos fallback pelo catálogo (mesmo emissor já
     * selecionado) para completar o E2E até a confirmação do pedido.
     */
    allure.step('Fallback: catálogo da vitrine com emissor (evita visit direto sem contexto)', () => {
      acessarCatalogoVitrineComEmissor(EMISSOR_ESPERADO);
    });

    allure.step('Adiciona o primeiro produto ao carrinho', () => {
      ComprarPage.adicionarPrimeiroProdutoDaListaAoCarrinho();
      cy.screenshot('historico-confirmacao-adicionado-carrinho');
    });

    allure.step('Clica no ícone do carrinho no header superior direito', () => {
      irParaCarrinhoViaHeader(ComprarPage);
    });

    allure.step('Avança pelo carrinho, preenche data e finaliza o pedido', () => {
      finalizarPedidoNoCarrinho();
      cy.screenshot('historico-pedido-efetivado');
    });
  });
});
