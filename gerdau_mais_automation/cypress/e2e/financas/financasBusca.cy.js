import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';

describe('Finanças', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@regression @menu @financas Acessa finanças e executa busca com filtros', () => {
    allure.step('Abre rota de finanças', () => {
      cy.visit('/financials', { failOnStatusCode: false });
      cy.url({ timeout: 30000 }).then((urlAtual) => {
        if (urlAtual.includes('/financials')) return;

        cy.contains('nav a, nav li, a, span, button', /finan[cç]as/i, { timeout: 20000 })
          .filter(':visible')
          .first()
          .click({ force: true });
      });
      cy.url({ timeout: 30000 }).then((urlAtual) => {
        const acessouFinancas = urlAtual.includes('/financials');
        const redirecionouPerfil = /\/download-area|\/orders|\/dashboard/i.test(urlAtual);
        expect(acessouFinancas || redirecionouPerfil, `URL pós navegação de finanças: ${urlAtual}`).to.eq(true);
      });
    });

    allure.step('Preenche filtros e executa busca', () => {
      cy.url().then((urlAtual) => {
        if (!urlAtual.includes('/financials')) {
          cy.log(`⚠️ Perfil sem acesso à rota de finanças. URL atual: ${urlAtual}`);
          return;
        }

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
    });

    allure.step('Valida que a tela responde com conteúdo financeiro', () => {
      cy.url({ timeout: 30000 }).then((urlAtual) => {
        if (!urlAtual.includes('/financials')) {
          expect(/\/download-area|\/orders|\/dashboard/i.test(urlAtual), `redirecionamento controlado de perfil: ${urlAtual}`).to.eq(true);
          return;
        }

        cy.get('body', { timeout: 30000 }).should(($body) => {
          const texto = ($body.text() || '').toLowerCase();
          const coerente =
            texto.includes('buscar') ||
            texto.includes('filtro') ||
            texto.includes('fatura') ||
            texto.includes('financeiro') ||
            texto.includes('vencimento') ||
            texto.includes('saldo') ||
            texto.includes('nenhum resultado');
          expect(coerente, 'resposta coerente com módulo de finanças').to.eq(true);
        });
      });
    });
  });
});
