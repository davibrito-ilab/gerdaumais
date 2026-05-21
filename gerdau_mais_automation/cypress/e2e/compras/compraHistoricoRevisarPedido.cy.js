import ComprarPage from '../../pages/comprarPage/comprarPageMetods';
import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  STEP_TIMEOUT,
  acessarComprarLanding,
  selecionarEmissorDoPedido,
  clicarBotaoPorTexto,
  aguardarTela,
} from '../../support/helpers/fluxoCompra';
import {
  avancosRepeatOrderAtePontoDeRevisaoOuCarrinho,
  garantirEtapaRevisarPedidoPosHistoricoOuCarrinho,
} from '../../support/helpers/historicoRepeatCompra';

const EMISSOR_ESPERADO =
  Cypress.env('emissor') || 'ACOS FAVORIT DISTRIBUIDORA LTDA';

describe('Compra por histórico — revisar pedido', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Login', () => {
      realizarLoginComRetry();
    });
  });

  it('@regression @p1 @compras Comprar por histórico até etapa Revisar pedido (sem enviar pedido)', { retries: 0 }, () => {
    allure.step('Landing Comprar + emissor', () => {
      acessarComprarLanding();
      selecionarEmissorDoPedido(EMISSOR_ESPERADO);
      aguardarTela('emissor confirmado, cards habilitados');
    });

    allure.step('Abre Comprar por histórico (repeat-order / order-history)', () => {
      clicarBotaoPorTexto('Comprar por Histórico', /comprar\s+por\s+hist[óo]rico/i);
      cy.url({ timeout: STEP_TIMEOUT }).should('match', /\/repeat-order|\/order-history|\/history/i);
      aguardarTela('página do histórico de pedidos carregada');
      cy.screenshot('historico-revisar-lista-inicial');
    });

    allure.step('Avança pela lista refazer/repetir até carrinho ou revisão', () => {
      avancosRepeatOrderAtePontoDeRevisaoOuCarrinho(ComprarPage);
    });

    allure.step('Se necessário, percorre carrinho até “Revisar pedido”', () => {
      garantirEtapaRevisarPedidoPosHistoricoOuCarrinho();
    });

    cy.screenshot('historico-revisar-pedido-etapa', { capture: 'fullPage' });
  });
});
