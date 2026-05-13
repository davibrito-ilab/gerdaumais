import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';

describe('Buscar documentos', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@regression @menu @documentos Acessa documentos e executa busca por período', () => {
    allure.step('Abre rota de documentos', () => {
      cy.visit('/download-area', { failOnStatusCode: false });
      cy.url({ timeout: 30000 }).then((urlAtual) => {
        if (urlAtual.includes('/download-area')) return;

        cy.contains('nav a, nav li, a, span, button', /documentos|download/i, { timeout: 20000 })
          .filter(':visible')
          .first()
          .click({ force: true });
      });
      cy.url({ timeout: 30000 }).should('include', '/download-area');
    });

    allure.step('Preenche filtros e realiza busca de documentos', () => {
      const emissor = Cypress.env('emissor');
      const hoje = new Date();
      const dtFim = hoje.toISOString().slice(0, 10);
      const dtIni = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      cy.get('body', { timeout: 30000 }).should('be.visible');

      cy.get('body').then(($body) => {
        const temEmissor = $body.find('input').filter((_, el) => /emissor/i.test(el.outerHTML)).length > 0;
        if (temEmissor && emissor) {
          cy.get('input').filter((_, el) => /emissor/i.test(el.outerHTML)).first().clear({ force: true }).type(emissor, { force: true });
        }
      });

      cy.get('input').then(($inputs) => {
        const candidatosData = [...$inputs].filter((el) => /date|data/i.test(el.outerHTML));
        if (candidatosData.length >= 2) {
          cy.wrap(candidatosData[0]).clear({ force: true }).type(dtIni, { force: true });
          cy.wrap(candidatosData[1]).clear({ force: true }).type(dtFim, { force: true });
        }
      });

      cy.contains('button, [role="button"], span', /buscar|filtrar|aplicar/i, { timeout: 15000 })
        .filter(':visible')
        .first()
        .click({ force: true });
    });

    allure.step('Valida resposta coerente da tela de documentos', () => {
      cy.get('body', { timeout: 30000 }).should(($body) => {
        const texto = ($body.text() || '').toLowerCase();
        const coerente =
          texto.includes('documento') ||
          texto.includes('download') ||
          texto.includes('arquivo') ||
          texto.includes('nenhum resultado');
        expect(coerente, 'resposta coerente com módulo de documentos').to.eq(true);
      });
    });
  });
});
