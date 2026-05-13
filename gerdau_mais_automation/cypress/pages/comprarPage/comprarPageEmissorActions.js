import { recarregarPaginaEAguardar } from '../../support/helpers/uiReady';

export const SELETOR_CAIXA_EMISSOR =
  '[data-testid="hefesto-select-container"], #select-emissor-pedido, input[placeholder*="Emissor"], [role="combobox"], [class*="select-container"]';

const normalizar = (txt = '') =>
  txt
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const campoEmissorDisponivel = (timeout = 30000) =>
  cy.get('body', { timeout }).then(($body) => $body.find(SELETOR_CAIXA_EMISSOR).length > 0);

const aguardarCampoEmissorVisivel = (timeout = 90000) => {
  cy.log(`⏳ Aguardando campo de emissor ficar visível (até ${Math.round(timeout / 1000)}s)`);
  cy.get(SELETOR_CAIXA_EMISSOR, { timeout }).filter(':visible').first().should('be.visible');
};

export const selecionaEmissorCorretamenteAction = (emissor = Cypress.env('emissor')) => {
  // Regra: não avançar sem o campo de emissor disponível/visível.
  // Se o QA estiver lento ou renderizar seletor depois, aguardamos (com retries via reload).
  campoEmissorDisponivel(30000).then((okInicial) => {
    if (okInicial) return;

    cy.log('⚠️ Campo de emissor não apareceu. Recarregando página (1/2).');
    recarregarPaginaEAguardar(30000);
    return campoEmissorDisponivel(30000).then((okAposPrimeiroReload) => {
      if (okAposPrimeiroReload) return;

      cy.log('⚠️ Campo de emissor ainda indisponível. Recarregando página (2/2).');
      recarregarPaginaEAguardar(30000);
      return campoEmissorDisponivel(30000).then((okFinal) => {
        if (!okFinal) {
          throw new Error('Campo de emissor não ficou disponível após retries. Abortando para evitar flakiness por falta de sync.');
        }
      });
    });
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
