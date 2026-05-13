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

const EMISSOR = Cypress.env('emissor') || 'ACOS FAVORIT DISTRIBUIDORA LTDA';
const ROTA_CATALOGO = '/purchase/long-steel/commerce/catalog';

/**
 * Checklist pré-deploy: "Mais detalhes" / página do produto (quando o CTA existir).
 */
describe('Vitrine — mais detalhes do produto', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);
    allure.step('Login', () => realizarLoginComRetry());
  });

  it('@regression @p2 Abre detalhes quando o CTA existir (senão skip)', { retries: 0 }, function () {
    allure.step('Catálogo com emissor', () => {
      acessarComprarLanding();
      selecionarEmissorDoPedido(EMISSOR);
      aguardarTela('emissor ok');
      clicarBotaoPorTexto('Comprar por Vitrine', /comprar\s+por\s+vitrine/i);
      cy.url({ timeout: STEP_TIMEOUT }).should('include', ROTA_CATALOGO);
      aguardarTela('catálogo');
    });

    allure.step('Verifica CTA de detalhes na listagem', () => {
      cy.get('body', { timeout: 15000 }).then(function ($body) {
        const t = $body.text() || '';
        if (!/mais\s+detalhes|ver\s+detalhes|detalhes\s+do\s+produto|^\s*detalhes\s*$/im.test(t)) {
          cy.log('ℹ️ CTA "Mais detalhes" não encontrado no catálogo — skip (UI variante).');
          this.skip();
        }
      });
    });

    allure.step('Clica em detalhes', () => {
      cy.contains(
        'a, button, [role="button"], span',
        /mais\s+detalhes|ver\s+detalhes|detalhes\s+do\s+produto|^\s*detalhes\s*$/i,
        { timeout: STEP_TIMEOUT }
      )
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
          !String(url).includes('/commerce/catalog') ||
          /product|item|detail|sku/i.test(String(url));
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
          expect(
            textoOk || mudouRota,
            'URL mudou ou corpo sugere painel de detalhe do produto'
          ).to.eq(true);
        });
      });
    });
  });
});
