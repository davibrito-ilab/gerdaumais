import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  STEP_TIMEOUT,
  acessarComprarLanding,
  selecionarEmissorDoPedido,
  clicarBotaoPorTexto,
} from '../../support/helpers/fluxoCompra';

const EMISSOR = Cypress.env('emissor') || 'ACOS FAVORIT DISTRIBUIDORA LTDA';

/**
 * Checklist: download do modelo de planilha (quando o link existir na tela/modal).
 */
describe('Planilha — download do modelo', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);
    allure.step('Login', () => realizarLoginComRetry());
  });

  it('@regression @p2 Dispara download ou abertura do modelo quando disponível', { retries: 0 }, () => {
    allure.step('Abre fluxo Comprar por Planilha', () => {
      acessarComprarLanding();
      selecionarEmissorDoPedido(EMISSOR);
      clicarBotaoPorTexto('Comprar por Planilha', /comprar\s+por\s+planilha/i);
      cy.url({ timeout: STEP_TIMEOUT }).should('match', /\/spreadsheet/i);
    });

    allure.step('Procura CTA de modelo / download', () => {
      cy.get('body', { timeout: STEP_TIMEOUT }).then(($body) => {
        const texto = $body.text() || '';
        const temCta =
          /baixar|download|modelo|template|planilha\s+modelo|exemplo/i.test(texto);
        if (!temCta) {
          cy.log('ℹ️ Nenhum CTA explícito de modelo nesta versão da tela — smoke de URL apenas.');
          return;
        }
        cy.contains(
          'a, button, [role="button"], span',
          /baixar|download|modelo|template|exemplo/i,
          { timeout: 15000 }
        )
          .filter(':visible')
          .first()
          .scrollIntoView()
          .click({ force: true });
      });
      cy.screenshot('planilha-download-modelo');
    });
  });
});
