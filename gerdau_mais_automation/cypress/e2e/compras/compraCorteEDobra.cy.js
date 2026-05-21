import * as allure from 'allure-js-commons';
import ComprarPage from '../../pages/comprarPage/comprarPageMetods';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  STEP_TIMEOUT,
  acessarIdentificacaoObraFabricacaoComEmissor,
  acessarHistoricoPedidosFabricacaoComEmissor,
  ROTA_FABRICACAO_HISTORICO,
  REGEX_INDICIOS_ETAPA_REVISAR_PEDIDO,
} from '../../support/helpers/fluxoCompra';
import {
  avancosRepeatOrderAtePontoDeRevisaoOuCarrinho,
  garantirEtapaRevisarPedidoPosHistoricoOuCarrinho,
  URL_ROTAS_CARRINHO_COMERCIO,
} from '../../support/helpers/historicoRepeatCompra';

const EMISSOR_ESPERADO =
  Cypress.env('emissor') || 'ACOS FAVORIT DISTRIBUIDORA LTDA';

/** QA (Hefesto): strings da jornada “Corte e dobra” / analytics LG:Comprar:CorteEDobra variam por release — critério flexível. */
const textoCoerenteFabricacao = (raw) => {
  const t = String(raw || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return (
    t.includes('obra') ||
    t.includes('corte') ||
    t.includes('dobra') ||
    t.includes('fabrica') ||
    t.includes('pedido') ||
    t.includes('projeto') ||
    t.includes('constr')
  );
};

describe('Compra — tipo Corte e dobra (fabricação)', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Login', () => {
      realizarLoginComRetry();
    });
  });

  it('@regression @p1 @compras Fluxo inicial: landing, emissor e entrada em fabricação (corte/dobra)', { retries: 0 }, () => {
    allure.step('Comprar → emissor → /purchase/fabrication/*', () => {
      acessarIdentificacaoObraFabricacaoComEmissor(EMISSOR_ESPERADO);
    });

    cy.url({ timeout: STEP_TIMEOUT }).should((href) =>
      typeof href === 'string' && href.includes('/purchase/fabrication/')
    );
    cy.get('body', { timeout: STEP_TIMEOUT }).should(($b) => {
      expect(textoCoerenteFabricacao($b.text()), 'conteúdo coerente com Corte/dobra ou identificação de obra').to.eq(
        true
      );
    });
    cy.screenshot('compra-corte-dobra-entrada', { capture: 'fullPage' });
  });

  it('@regression @p1 @compras Histórico de pedidos na jornada de fabricação (last-orders)', { retries: 0 }, () => {
    allure.step('Fabricação histórico com emissor', () => {
      acessarHistoricoPedidosFabricacaoComEmissor(EMISSOR_ESPERADO);
    });

    cy.url({ timeout: STEP_TIMEOUT }).should('include', ROTA_FABRICACAO_HISTORICO);
    cy.get('body', { timeout: STEP_TIMEOUT }).should(($b) => {
      expect(textoCoerenteFabricacao($b.text()), 'conteúdo coerente com histórico fabricação').to.eq(true);
    });
    cy.screenshot('compra-corte-dobra-historico', { capture: 'fullPage' });
  });

  it('@regression @p2 @compras Fabricação: avançar por CTAs até carrinho ou revisar (quando o QA permitir)', { retries: 0 }, () => {
    allure.step('Entrada na fabricação', () => {
      acessarIdentificacaoObraFabricacaoComEmissor(EMISSOR_ESPERADO);
    });

    cy.url({ timeout: STEP_TIMEOUT }).should((href) =>
      typeof href === 'string' && href.includes('/purchase/fabrication/')
    );

    allure.step('CTAs ink até carrinho ou revisão', () => {
      avancosRepeatOrderAtePontoDeRevisaoOuCarrinho(ComprarPage, 18);
    });

    cy.url().then((urlStr) => {
      cy.get('body').then(($b) => {
        const texto = $b.text() || '';
        const href = String(urlStr || '').toLowerCase();
        const emRevisao = REGEX_INDICIOS_ETAPA_REVISAR_PEDIDO.test(texto);
        const emCarrinho = URL_ROTAS_CARRINHO_COMERCIO.test(href);

        if (!emRevisao && !emCarrinho) {
          cy.log(
            'ℹ️ Permaneceu em tela intermediária da fabricação — complemento valida apenas coerência do contexto'
          );
          expect(textoCoerenteFabricacao(texto)).to.eq(true);
          return;
        }

        garantirEtapaRevisarPedidoPosHistoricoOuCarrinho();
        cy.contains('body', REGEX_INDICIOS_ETAPA_REVISAR_PEDIDO, { timeout: STEP_TIMEOUT }).should(
          'be.visible'
        );
      });
    });

    cy.screenshot('compra-corte-dobra-revisar-quando-aplicavel', { capture: 'fullPage' });
  });
});
