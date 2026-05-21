/**
 * Fluxo igual a `compraHistoricoRevisarPedido.cy.js`, mas até **confirmar/enviar** o pedido.
 * Sem fallback no catálogo — depende do emissor possuir pedidos repetíveis no QA.
 */
import ComprarPage from '../../pages/comprarPage/comprarPageMetods';
import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  STEP_TIMEOUT,
  acessarComprarLanding,
  selecionarEmissorDoPedido,
  clicarBotaoPorTexto,
  aguardarTela,
  clicarFinalizarPedido,
  validarPedidoEnviado,
  tratarModaisTransientes,
} from '../../support/helpers/fluxoCompra';
import {
  avancosRepeatOrderAtePontoDeRevisaoOuCarrinho,
  garantirEtapaRevisarPedidoPosHistoricoOuCarrinho,
} from '../../support/helpers/historicoRepeatCompra';

const EMISSOR_ESPERADO =
  Cypress.env('emissor') || 'ACOS FAVORIT DISTRIBUIDORA LTDA';

describe('Compra por histórico — finalização sem catálogo', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Login', () => {
      realizarLoginComRetry();
    });
  });

  it('@regression @p1 @compras Histórico → revisar pedido → enviar (sem fallback vitrine)', { retries: 0 }, () => {
    allure.step('Landing Comprar + emissor', () => {
      acessarComprarLanding();
      selecionarEmissorDoPedido(EMISSOR_ESPERADO);
      aguardarTela('emissor confirmado, cards habilitados');
    });

    allure.step('Abre Comprar por histórico', () => {
      clicarBotaoPorTexto('Comprar por Histórico', /comprar\s+por\s+hist[óo]rico/i);
      cy.url({ timeout: STEP_TIMEOUT }).should('match', /\/repeat-order|\/order-history|\/history/i);
      aguardarTela('página do histórico de pedidos carregada');
      cy.screenshot('historico-finalize-lista');
    });

    allure.step('Repetir pedido até carrinho ou revisão', () => {
      avancosRepeatOrderAtePontoDeRevisaoOuCarrinho(ComprarPage);
    });

    allure.step('Checkout até etapa revisar pedido', () => {
      garantirEtapaRevisarPedidoPosHistoricoOuCarrinho();
    });

    allure.step('CTA final e confirmação de pedido enviado', () => {
      clicarFinalizarPedido();
      tratarModaisTransientes();
      aguardarTela('confirmação do pedido carregada');
      validarPedidoEnviado();
    });

    cy.screenshot('historico-finalize-confirmacao', { capture: 'fullPage' });
  });
});
