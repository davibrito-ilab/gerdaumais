import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  STEP_TIMEOUT,
  acessarComprarLanding,
  selecionarEmissorDoPedido,
  clicarBotaoPorTexto,
  aguardarTela,
  tratarModaisTransientes,
} from '../../support/helpers/fluxoCompra';
import {
  ADD_TO_CART_SELECTORS,
  REGEX_CTA_DETALHES_LISTAGEM,
  assertTextoConfirmacaoCarrinho,
} from '../../pages/comprarPage/comprarPageHelpers';

const EMISSOR = Cypress.env('emissor') || 'ACOS FAVORIT DISTRIBUIDORA LTDA';
const ROTA_CATALOGO = '/purchase/long-steel/commerce/catalog';

/** Landing → emissor → catálogo vitrine. */
const prepararCatalogoVitrine = () => {
  acessarComprarLanding();
  selecionarEmissorDoPedido(EMISSOR);
  aguardarTela('emissor ok');
  clicarBotaoPorTexto('Comprar por Vitrine', /comprar\s+por\s+vitrine/i);
  cy.url({ timeout: STEP_TIMEOUT }).should('include', ROTA_CATALOGO);
  aguardarTela('catálogo');
};

describe('Vitrine — mais detalhes do produto', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);
    allure.step('Login', () => realizarLoginComRetry());
  });

  it('@regression @p2 Abre detalhes quando o CTA existir (senão skip)', { retries: 0 }, function () {
    allure.step('Catálogo com emissor', () => {
      prepararCatalogoVitrine();
    });

    allure.step('Verifica CTA de detalhes na listagem', () => {
      cy.get('body', { timeout: 15000 }).then(function ($body) {
        const t = $body.text() || '';
        if (!REGEX_CTA_DETALHES_LISTAGEM.test(t)) {
          cy.log('ℹ️ CTA "Mais detalhes" não encontrado no catálogo — skip (UI variante).');
          this.skip();
        }
      });
    });

    allure.step('Clica em detalhes', () => {
      cy.contains('a, button, [role="button"], span', REGEX_CTA_DETALHES_LISTAGEM, { timeout: STEP_TIMEOUT })
        .filter(':visible')
        .first()
        .scrollIntoView()
        .click({ force: true });
      aguardarTela('página de detalhe ou drawer');
      cy.screenshot('vitrine-mais-detalhes');
    });

    allure.step('Valida navegação ou painel de detalhe', () => {
      cy.url({ timeout: STEP_TIMEOUT }).then((url) => {
        const mudouRota =
          !String(url).includes('/commerce/catalog') || /product|item|detail|sku/i.test(String(url));
        cy.get('body', { timeout: STEP_TIMEOUT }).should(($body) => {
          const t = ($body.text() || '').toLowerCase();
          const textoOk =
            t.includes('descrição') ||
            t.includes('descricao') ||
            t.includes('sku') ||
            t.includes('código') ||
            t.includes('codigo') ||
            t.includes('especific') ||
            t.includes('dimens');
          expect(textoOk || mudouRota, 'URL mudou ou corpo sugere painel de detalhe do produto').to.eq(true);
        });
      });
    });
  });

  it('@regression @p2 Detalhes + adicionar ao carrinho quando disponível (senão skip)', { retries: 0 }, function () {
    allure.step('Catálogo com emissor', () => {
      prepararCatalogoVitrine();
    });

    allure.step('Critérios para prosseguir (CTA detalhes + depois botão incluir)', () => {
      cy.get('body', { timeout: 15000 }).then(function ($body) {
        const t = $body.text() || '';
        if (!REGEX_CTA_DETALHES_LISTAGEM.test(t)) {
          cy.log('ℹ️ Sem detalhes na vitrine.');
          this.skip();
        }
      });
    });

    allure.step('Abre detalhes do primeiro card', () => {
      cy.contains('a, button, [role="button"], span', REGEX_CTA_DETALHES_LISTAGEM, { timeout: STEP_TIMEOUT })
        .filter(':visible')
        .first()
        .scrollIntoView()
        .click({ force: true });
      aguardarTela('detalhes/drawer aberto para tentativa de inclusão ao carrinho');
      cy.screenshot('vitrine-detalhes-pre-add');
      tratarModaisTransientes(4000);
    });

    allure.step('Adicionar ao carrinho na vista de detalhe', () => {
      cy.get('body', { timeout: 8000 }).then(function ($body) {
        const $add = Cypress.$(ADD_TO_CART_SELECTORS, $body[0]).filter(':visible');
        const hasAddWord = /\badicionar\b/i.test($body.text() || '');

        if (!$add.length && !hasAddWord) {
          cy.log('ℹ️ Nenhum CTA típico de “Adicionar” na página de detalhes — skip.');
          this.skip();
        }
      });

      cy.then(() => {
        const primeiroAdd = Cypress.$(`${ADD_TO_CART_SELECTORS}`).filter(':visible')[0];

        if (primeiroAdd) {
          cy.wrap(primeiroAdd).scrollIntoView().click({ force: true });
        } else {
          cy.contains(
            'button, [role="button"], a, span',
            /adicionar ao carrinho|adicionar/i,
            { timeout: STEP_TIMEOUT }
          )
            .filter(':visible')
            .first()
            .scrollIntoView()
            .click({ force: true });
        }
      });

      assertTextoConfirmacaoCarrinho('adicionado a partir dos detalhes do produto');
      cy.screenshot('vitrine-detalhes-apos-adicionar-carrinho');
    });
  });
});
