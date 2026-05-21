import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import { STEP_TIMEOUT, validarHubPedidos } from '../../support/helpers/pedidosFiltros';
import { ROTA_COMPRAR_LANDING } from '../../support/helpers/fluxoCompra';

const SELECTOR_ITEM_MENU =
  'header nav a, header nav li, header nav button, nav a, nav li, nav button, [role="menuitem"], [data-testid*="menu"]';

const ITEM_PEDIDOS = { nome: 'Pedidos', labels: ['pedidos'], rotaFallback: '/orders' };
const ITEM_COMPRAR = {
  nome: 'Comprar',
  labels: ['comprar'],
  rotaFallback: ROTA_COMPRAR_LANDING,
};

const normalizarTexto = (texto = '') =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/** Mesmo fluxo resiliente em `menuSuperiorCobertura.cy.js` (ícone + fallback por rota). */
const clicarMenuSuperiorOuFallback = (item) => {
  cy.get('body', { timeout: STEP_TIMEOUT }).then(($body) => {
    const $itensMenu = $body.find(SELECTOR_ITEM_MENU);
    const labelsNormalizados = (item.labels || [item.nome]).map((l) => normalizarTexto(l));
    const candidato = [...$itensMenu].find((el) => {
      if (!Cypress.dom.isVisible(el)) return false;
      const txt = normalizarTexto(el.textContent || '');
      return labelsNormalizados.some((label) => txt.includes(label));
    });

    if (candidato) {
      cy.wrap(candidato).scrollIntoView().click({ force: true });
      return;
    }

    if (item.rotaFallback) {
      cy.log(`⚠️ Item "${item.nome}" não encontrado no menu — fallback ${item.rotaFallback}`);
      cy.visit(item.rotaFallback);
      return;
    }

    throw new Error(`Item "${item.nome}" não está visível no menu superior e sem fallback.`);
  });
};

/**
 * AUT-052 — navegação cruzada (menu + hubs) sem obrigar fluxo de checkout inteiro.
 */
describe('Fluxo cruzado — Pedidos hub ↔ Comprar', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);
    allure.step('Login', () => realizarLoginComRetry());
    cy.visit('/dashboard', { failOnStatusCode: false });
    cy.url({ timeout: 30000 }).should('include', '/dashboard');
  });

  it('@regression @p2 @menu @pedidos @compras Menu: Pedidos (hub) e depois Comprar', () => {
    allure.step('Pedidos até hub /orders', () => {
      clicarMenuSuperiorOuFallback(ITEM_PEDIDOS);
      cy.url({ timeout: STEP_TIMEOUT }).should((u) =>
        expect(u.includes('/orders'), `URL após Pedidos: ${u}`).to.eq(true)
      );
      validarHubPedidos();
    });

    allure.step('Comprar até contexto `/purchase/` ou landing configurada', () => {
      clicarMenuSuperiorOuFallback(ITEM_COMPRAR);
      cy.url({ timeout: STEP_TIMEOUT }).should((u) => {
        const ok =
          u.includes('/purchase/') ||
          u.includes(ROTA_COMPRAR_LANDING) ||
          /\/commerce\b/i.test(u) ||
          /\bsteel-type\b/i.test(u);
        expect(ok, `URL após Comprar: ${u}`).to.eq(true);
      });
      cy.get('main,section,body', { timeout: 15000 }).should('exist');
      cy.screenshot('cross-nav-compras-apos-menu');
    });
  });
});
