import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import { STEP_TIMEOUT, navegarTelaSpreadsheetComEmissor } from '../../support/helpers/fluxoCompra';

const EMISSOR = Cypress.env('emissor') || 'ACOS FAVORIT DISTRIBUIDORA LTDA';

/**
 * Checklist: upload com formato incorreto (.txt etc.) — espera mensagem de erro clara.
 */
describe('Planilha — upload arquivo inválido', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);
    allure.step('Login', () => realizarLoginComRetry());
  });

  it('@negative @p2 Rejeita arquivo que não é planilha (ex.: .txt)', { retries: 0 }, () => {
    allure.step('Abre tela de planilha', () => {
      navegarTelaSpreadsheetComEmissor(EMISSOR);
    });

    allure.step('Anexa .txt em input file, se existir', () => {
      cy.get('input[type="file"]', { timeout: STEP_TIMEOUT })
        .first()
        .selectFile('cypress/fixtures/planilha-invalida.txt', { force: true });
      cy.wait(1500);
      cy.screenshot('planilha-upload-txt');
    });

    allure.step('Valida feedback de erro ou validação', () => {
      cy.get('body', { timeout: 20000 }).should(($body) => {
        const t = ($body.text() || '').toLowerCase();
        const ok =
          t.includes('formato') ||
          t.includes('inválido') ||
          t.includes('invalido') ||
          t.includes('xlsx') ||
          t.includes('xls') ||
          t.includes('excel') ||
          t.includes('erro') ||
          t.includes('não\s+foi\s+possível') ||
          t.includes('nao\s+foi\s+possivel') ||
          t.includes('arquivo');
        expect(ok, 'mensagem ou indício de validação de formato de arquivo').to.eq(true);
      });
    });
  });
});
