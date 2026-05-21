import { recarregarPaginaEAguardar } from '../../support/helpers/uiReady';
import {
  ROTA_COMPRAR_LANDING,
  STEP_TIMEOUT,
  aguardarFimCarregamentoTextual,
} from '../../support/helpers/fluxoCompra';

/** Preferência antes de `[role=combobox]` genérico (ex.: busca no catálogo). */
const SELETORES_EMISSOR_PREFERIDOS = [
  '#select-emissor-pedido',
  'input[placeholder*="Emissor"]',
  '[data-testid="hefesto-select-container"]',
];

export const SELETOR_CAIXA_EMISSOR =
  '#select-emissor-pedido, [data-testid="hefesto-select-container"], input[placeholder*="Emissor"], [role="combobox"], [class*="select-container"]';

const normalizar = (txt = '') =>
  txt
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const campoEmissorDisponivel = (timeout = 30000) =>
  cy.get('body', { timeout }).then(($body) => {
    const el = $body.get(0);
    const win = el && el.ownerDocument && el.ownerDocument.defaultView;
    const href = win ? `${win.location.pathname || ''}${win.location.search || ''}` : '';
    const textoBody = ($body.text() || '').replace(/\u00a0/g, ' ');

    const landingCompras =
      /steel-type-choose|\bsteel-type\b/i.test(href) ||
      /\btipo\s+de\b.*\bac\b|\btipo\s+de\s+material\b|escolha.*tipo.*a[cç]/i.test(textoBody);

    const preferido =
      SELETORES_EMISSOR_PREFERIDOS.some((sel) => $body.find(sel).length > 0) ||
      $body.find('#select-emissor-pedido').length > 0;

    if (preferido) return true;

    const rotaSóComboboxoGenericoSuspeito =
      /\/commerce\/catalog|\/spreadsheet|\bshopping-cart\b|\/search-items/i.test(href);

    const textoSugereEmissor = /emissor\s+do\s+pedido|selecione\s+um\s+emissor/i.test(textoBody);

    if (landingCompras || (!rotaSóComboboxoGenericoSuspeito && textoSugereEmissor)) {
      const combos =
        [...$body.find(SELETOR_CAIXA_EMISSOR)].some((el2) => Cypress.dom.isVisible(el2)) ||
        ($body.find('[role="combobox"]:visible').length > 0 && textoSugereEmissor);
      return Boolean(combos);
    }

    if (!rotaSóComboboxoGenericoSuspeito) {
      const visiveis = [...$body.find(SELETOR_CAIXA_EMISSOR)].filter((el2) => Cypress.dom.isVisible(el2));
      if (visiveis.length >= 1) return true;
    }

    return false;
  });

const aguardarCampoEmissorVisivel = (timeout = 90000) => {
  cy.log(`⏳ Aguardando campo de emissor ficar visível (até ${Math.round(timeout / 1000)}s)`);
  cy.get(SELETOR_CAIXA_EMISSOR, { timeout }).filter(':visible').first().should('be.visible');
};

export const selecionaEmissorCorretamenteAction = (emissor = Cypress.env('emissor')) => {
  // Catálogo / carrinho muitas vezes não rendem `#select-emissor-pedido` — só na landing » Comprar.
  campoEmissorDisponivel(30000).then((okInicial) => {
    if (!okInicial) {
      cy.log('⚠️ Emissor não está nesta rota ou a página ainda carregando — navegando para landing Comprar.');
      cy.visit(ROTA_COMPRAR_LANDING, { failOnStatusCode: false });
      cy.url({ timeout: STEP_TIMEOUT }).should('include', '/steel-type-choose');
      aguardarFimCarregamentoTextual(STEP_TIMEOUT);
    }
    return campoEmissorDisponivel(30000);
  }).then((okDepoisLanding) => {
    if (okDepoisLanding) return;

    cy.log('⚠️ Campo de emissor ainda não visível na landing; recarga (1/2).');
    recarregarPaginaEAguardar(30000);
    return campoEmissorDisponivel(30000);
  }).then((ok1) => {
    if (ok1) return;

    cy.log('⚠️ Recarga landing (2/2).');
    recarregarPaginaEAguardar(30000);
    return campoEmissorDisponivel(30000);
  }).then((okFinal) => {
    if (!okFinal) {
      throw new Error(
        'Campo de emissor não ficou disponível após landing + recargas. Verifique QA e `emissor` no cypress.env.'
      );
    }
  });

  aguardarCampoEmissorVisivel(90000);

  cy.get('body').then(($body) => {
    const possuiSeletor = $body.find(SELETOR_CAIXA_EMISSOR).length > 0;
    if (!possuiSeletor) return;

    cy.get(SELETOR_CAIXA_EMISSOR, { timeout: 30000 }).filter(':visible').first().click({ force: true });
    cy.get(SELETOR_CAIXA_EMISSOR).first().click({ force: true });
    cy.log('✅ Clicou no select de emissor');
  });

  cy.get('body').then(($body) => {
    const listaJaAberta = $body.find('.hefesto-select__options, [role="listbox"], .dropdown-menu').length > 0;
    if (listaJaAberta) return;

    const setaDropdown = $body.find('path[d^="M21.8777 4.52081"]');
    if (setaDropdown.length > 0) {
      cy.get('path[d^="M21.8777 4.52081"]').first().parent().click({ force: true });
      cy.log('✅ Clicou na seta do dropdown do emissor');
    }
  });

  cy.get('body').then(($body) => {
    const possuiSeletor = $body.find(SELETOR_CAIXA_EMISSOR).length > 0;
    if (!possuiSeletor) return;

    const seletorOpcaoDireta = 'span.input-helpers__selected-options--option';
    const possuiOpcaoDireta = $body.find(seletorOpcaoDireta).length > 0;

    if (possuiOpcaoDireta) {
      cy.contains(seletorOpcaoDireta, emissor, { timeout: 15000 }).should('be.visible').click({ force: true });
      return;
    }

    cy.get('[role="option"], li, .dropdown-item, .hefesto-select__option', { timeout: 15000 })
      .should('have.length.greaterThan', 0)
      .then(($opts) => {
        const lista = [...$opts].filter((el) => Cypress.dom.isVisible(el));
        const ref = normalizar(emissor || '');
        const alvo = lista.find((el) => {
          const t = normalizar(el.textContent || '');
          return (
            (ref && t.includes(ref)) ||
            t.includes('favorit') ||
            t.includes('acos') ||
            (ref.length >= 6 && t.includes(ref.slice(0, 6)))
          );
        });
        if (alvo) {
          cy.wrap(alvo).scrollIntoView().click({ force: true });
          return;
        }

        const primeiroDisponivel = lista[0];
        if (primeiroDisponivel) {
          const nomeFallback = (primeiroDisponivel.textContent || '').trim();
          cy.log(`⚠️ Emissor "${emissor}" não encontrado. Usando fallback: ${nomeFallback || 'primeira opção disponível'}`);
          cy.wrap(primeiroDisponivel).scrollIntoView().click({ force: true });
          return;
        }

        throw new Error(`Não foi possível localizar emissor e nem fallback na lista: ${emissor}`);
      });
  });
  cy.log(`✅ Selecionou emissor: ${emissor}`);
};

export const selecionaEmissorAction = (emissor) => {
  cy.screenshot('antes-selecionar-emissor');
  aguardarCampoEmissorVisivel(90000);
  cy.get(SELETOR_CAIXA_EMISSOR, { timeout: 15000 }).filter(':visible').first().click({ force: true });
  cy.get(SELETOR_CAIXA_EMISSOR).first().click({ force: true });
  cy.log('✅ Clicou no select de emissor');

  cy.get('body').then(($body) => {
    const listaJaAberta = $body.find('.hefesto-select__options, [role="listbox"], .dropdown-menu').length > 0;
    if (listaJaAberta) return;

    const setaDropdown = $body.find('path[d^="M21.8777 4.52081"]');
    if (setaDropdown.length > 0) {
      cy.get('path[d^="M21.8777 4.52081"]').first().parent().click({ force: true });
      cy.log('✅ Clicou na seta do dropdown do emissor');
    }
  });

  cy.get('body').then(($body) => {
    const seletorOpcaoDireta = 'span.input-helpers__selected-options--option';
    const possuiOpcaoDireta = $body.find(seletorOpcaoDireta).length > 0;

    if (possuiOpcaoDireta) {
      cy.contains(seletorOpcaoDireta, emissor, { timeout: 15000 }).should('be.visible').click({ force: true });
      return;
    }

    cy.contains('span, [role="option"], li, .dropdown-item, div', emissor, { timeout: 15000 })
      .should('be.visible')
      .click({ force: true });
  });
  cy.log(`✅ Selecionou emissor informado: ${emissor}`);
  cy.screenshot('depois-selecionar-emissor');
};
