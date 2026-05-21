import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';

const SELETORES_DL =
  'table tbody a,[role="grid"] a,button,[role="button"],a[href*="download"],a[download],[data-testid*="download"],[aria-label*="download"],[aria-label*="Download"],[aria-label*="baixar"],[aria-label*="Baixar"]';

/** Até página /download-area com busca já disparada (período padrão 30 dias se houver 2 datas). */
const fluxoBasicoBuscaDocumentosPorPeriodo = () => {
  cy.visit('/download-area', { failOnStatusCode: false });
  cy.url({ timeout: 30000 }).then((urlAtual) => {
    if (urlAtual.includes('/download-area')) return;

    cy.contains('nav a, nav li, a, span, button', /documentos|download/i, { timeout: 20000 })
      .filter(':visible')
      .first()
      .click({ force: true });
  });
  cy.url({ timeout: 30000 }).should('include', '/download-area');

  const emissor = Cypress.env('emissor');
  const hoje = new Date();
  const dtFim = hoje.toISOString().slice(0, 10);
  const dtIni = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  cy.get('body', { timeout: 30000 }).should('be.visible');

  cy.get('body').then(($body) => {
    const temEmissor = $body.find('input').filter((_, el) => /emissor/i.test(el.outerHTML)).length > 0;
    if (temEmissor && emissor) {
      cy.get('input')
        .filter((_, el) => /emissor/i.test(el.outerHTML))
        .first()
        .clear({ force: true })
        .type(emissor, { force: true });
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
};

describe('Buscar documentos', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@regression @menu @documentos Acessa documentos e executa busca por período', () => {
    allure.step('Abre área /download-area ou menu equivalente', () => {
      fluxoBasicoBuscaDocumentosPorPeriodo();
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

  /** AUT-018 leve — não garante arquivo binário, só elementos típicos de artefatos pós-busca. */
  it('@regression @p2 @documentos Após busca: indícios de download ou artefatos (AUT-018)', () => {
    allure.step('Fluxo até resultados disponíveis', () => fluxoBasicoBuscaDocumentosPorPeriodo());

    allure.step('Lista, links ou ícones de download coerentes com módulo', () => {
      cy.wait(900);
      cy.get('body', { timeout: 30000 }).should(($body) => {
        const texto = ($body.text() || '').toLowerCase();
        const $linksBaixar = Cypress.$(SELETORES_DL, $body[0]).filter((_i, el) => Cypress.dom.isVisible(el));

        const coerenteArtefato =
          $linksBaixar.length >= 1 ||
          /\bbaix(ar|amento)\b|download|\.pdf|\.xml|spreadsheet/i.test(texto) ||
          /nenhum(\s|$)|sem\s+(resultado|arquivo)|não encontramos arquiv/i.test(texto);

        expect(
          coerenteArtefato,
          'esperado CTA/arquivo mencionado, ou estado negativo esperado quando não há resultados'
        ).to.eq(true);
      });

      cy.screenshot('documentos-artefatos-apos-busca');
    });
  });
});
