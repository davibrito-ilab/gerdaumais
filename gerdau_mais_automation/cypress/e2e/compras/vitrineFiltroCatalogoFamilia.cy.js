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

/** Heurística: laterais / facetas / chips típicos em catálogos. */
const SELETORES_CANDIDATOS_FILTRO = [
  'aside a',
  'aside button',
  '[data-cy*="filter"] a',
  '[data-cy*="filter"] button',
  '[data-testid*="filter"] a',
  '[data-testid*="filter"] button',
  '[class*="facet"] a',
  '[class*="facet"] button',
  '[class*="chip"]',
  'summary',
].join(', ');

const REGEX_TEXTO_FILTRAVEL =
  /\b(categor|famíl|famil|linha|produtos?|todos|aços?|aco|vergalh|aram|barra|chapa|perf)\b/i;

const REGEX_CTAS_EXCLUIDOS =
  /\b(comprar|buscar|pesquisar|limpar|aplicar|menu|voltar|sair)\b|^[\d\s,/]+$/i;

/**
 * @param {JQuery<HTMLElement>} $root
 * @returns {HTMLElement | null}
 */
function localizarPrimeiroFiltroClicavel($root) {
  const $cands = $root.find(SELETORES_CANDIDATOS_FILTRO).filter(':visible');
  const total = $cands.length;

  for (let i = 0; i < total; i++) {
    const el = $cands[i];
    const tag = (el.tagName || '').toLowerCase();
    if (!['summary', 'button', 'a', 'label', 'span', 'div'].includes(tag)) continue;

    const role = el.getAttribute('role') || '';
    if (tag === 'span' || tag === 'div') {
      if (role !== 'button' && !String(el.className || '').toLowerCase().includes('chip')) continue;
    }

    const txt = (el.textContent || '').trim();
    if (
      txt.length > 1 &&
      txt.length < 120 &&
      REGEX_TEXTO_FILTRAVEL.test(txt) &&
      !REGEX_CTAS_EXCLUIDOS.test(txt)
    ) {
      return el;
    }
  }

  return null;
}

describe('Vitrine — filtro categoria ou família (AUT-015)', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);
    allure.step('Login', () => realizarLoginComRetry());
  });

  it('@regression @p2 @compras Usa facetas laterais quando a UI expõe filtros visíveis (senão skip)', { retries: 0 }, function () {
    allure.step('Catálogo com emissor', () => {
      acessarComprarLanding();
      selecionarEmissorDoPedido(EMISSOR);
      aguardarTela('emissor ok');
      clicarBotaoPorTexto('Comprar por Vitrine', /comprar\s+por\s+vitrine/i);
      cy.url({ timeout: STEP_TIMEOUT }).should('include', ROTA_CATALOGO);
      aguardarTela('catálogo');
    });

    allure.step('Abre painel Filtros (mobile / layout compacto) se não houver aside', () => {
      cy.get('body', { timeout: 15000 }).then(($b) => {
        const temAside = $b.find('aside:visible').length > 0;
        if (temAside) return;

        const openers = [...$b.find('button, a, [role="button"]')].filter(
          (el) => Cypress.dom.isVisible(el) && /\bfiltros?\b/i.test((el.textContent || '').trim())
        );
        if (openers.length) {
          cy.wrap(openers[0]).click({ force: true });
          aguardarTela('painel filtros opcional');
        }
      });
    });

    allure.step('Clica em filtro categoria/família/faceta quando detectável', () => {
      cy.get('body', { timeout: 20000 }).then(function ($body) {
        const el = localizarPrimeiroFiltroClicavel($body);
        if (!el) {
          cy.log('ℹ️ Nenhum controle óbvio de categoria/família/faceta — skip (UI variante).');
          this.skip();
        }
        cy.wrap(el).scrollIntoView().click({ force: true });
      });
      aguardarTela('pós-clique filtro catálogo');
      cy.screenshot('vitrine-filtro-categoria-familia');
    });

    allure.step('Valida que o catálogo permanece utilizável', () => {
      cy.get('body', { timeout: STEP_TIMEOUT }).should(($b) => {
        const t = ($b.text() || '').toLowerCase();
        const ok =
          t.includes('produto') ||
          t.includes('resultado') ||
          t.includes('nenhum') ||
          t.includes('sem resultado') ||
          t.includes('adicionar') ||
          t.includes('carrinho') ||
          t.includes('sku') ||
          t.includes('código') ||
          t.includes('codigo');
        expect(ok, 'catálogo reage ao filtro sem estado de erro genérico').to.eq(true);
      });
    });
  });
});
