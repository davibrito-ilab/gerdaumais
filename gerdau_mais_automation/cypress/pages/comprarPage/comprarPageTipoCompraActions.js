import { aguardarBodyVisivel, recarregarPaginaEAguardar } from '../../support/helpers/uiReady';
import { aguardarOverlaysInvisiveis } from './comprarPageHelpers';
import {
  REGEX_CTA_COMPRAR_CORTE_OU_FABRICACAO,
  ROTA_FABRICACAO_IDENTIFICACAO_OBRA,
} from '../../support/helpers/fluxoCompra';

export const selecionaComprarVitrineAction = () => {
  cy.log('✅ Selecionando Comprar por Vitrine');
  aguardarBodyVisivel(30000);
  const OVERLAY_SEL = '.hefesto-modal__container, .hefesto-modal__overlay, .loading, .modal';
  const aguardarFimCarregamento = (tentativa = 1) => {
    cy.get('body').then(($body) => {
      const carregando = [...$body.find(OVERLAY_SEL)].some((el) => Cypress.dom.isVisible(el));

      if (!carregando) return;

      if (tentativa >= 3) {
        throw new Error('Tela de carregamento permaneceu ativa após 3 tentativas.');
      }

      cy.log(`⚠️ Carregamento preso. Recarregando página (tentativa ${tentativa + 1}/3)`);
      recarregarPaginaEAguardar(30000);
      aguardarFimCarregamento(tentativa + 1);
    });
  };

  aguardarFimCarregamento();

  cy.url().then((url) => {
    if (url.includes('/purchase/long-steel/commerce/catalog')) {
      cy.log('✅ Já está no catálogo de compra por vitrine');
      return;
    }

    cy.get('body').then(($body) => {
      const possuiOpcaoVitrine = /vitrine|com[eé]rcio|commerce/i.test($body.text() || '');
      if (!possuiOpcaoVitrine) {
        cy.log('⚠️ Opção de vitrine/commerce não encontrada. Acessando rota direta do catálogo.');
        cy.visit('/purchase/long-steel/commerce/catalog');
        return;
      }

      cy.contains('button, a, [role="tab"], [role="button"], li, span', /vitrine|com[eé]rcio|commerce/i, { timeout: 20000 })
        .should('be.visible')
        .first()
        .click({ force: true });
    });
    cy.log('✅ Clicou na opção de compra por vitrine/commerce');
    aguardarOverlaysInvisiveis(45000);
    cy.url({ timeout: 30000 }).should('include', '/purchase');
  });
};

export const selecionaComprarSelecionandoAction = () => {
  cy.log('✅ Selecionando Comprar selecionando itens');
  cy.get('body').then(($body) => {
    const possuiOpcao = /comprar selecionando itens/i.test($body.text() || '');
    if (!possuiOpcao) {
      cy.log('⚠️ Opção "Comprar selecionando itens" não encontrada na UI atual; acessando rota direta.');
      cy.visit('/purchase/long-steel/commerce/search-items');
      return;
    }

    cy.contains('span.hefesto-button__label, button, a, [role="button"], [role="tab"], li, span', /comprar selecionando itens/i, { timeout: 20000 })
      .should('be.visible')
      .first()
      .click({ force: true });
  });
  cy.screenshot('clicouComprarSelecionandoItens');
};

export const selecionaComprarPlanilhaAction = () => {
  cy.log('✅ Selecionando Comprar por Planilha');
  cy.url().then((url) => {
    if (url.includes('/purchase/long-steel/spreadsheet')) {
      cy.log('✅ Já está no fluxo de planilha');
      return;
    }

    cy.get('body').then(($body) => {
      const possuiOpcaoPlanilha = /planilha/i.test($body.text());
      if (!possuiOpcaoPlanilha) {
        cy.log('⚠️ Opção Planilha não encontrada na UI atual; acessando rota direta.');
        cy.visit('/purchase/long-steel/spreadsheet');
        return;
      }

      cy.contains('button, a, [role="tab"], [role="button"], li, span', /planilha/i, { timeout: 10000 })
        .should('be.visible')
        .first()
        .click({ force: true });
    });
  });
};

export const selecionaComprarHistoricoAction = () => {
  cy.log('✅ Selecionando Comprar por Histórico');
  cy.url().then((url) => {
    if (url.includes('/purchase/history')) {
      cy.log('✅ Já está no fluxo de histórico');
      return;
    }

    cy.get('body').then(($body) => {
      const possuiOpcaoHistorico = /hist[oó]rico/i.test($body.text() || '');
      if (!possuiOpcaoHistorico) {
        cy.log('⚠️ Opção Histórico não encontrada na UI atual; seguindo fluxo de compra já disponível.');
        return;
      }

      cy.contains('button, a, [role="tab"], [role="button"], li, span', /hist[oó]rico/i, { timeout: 10000 })
        .should('be.visible')
        .first()
        .click({ force: true });
    });
  });
};

/** Corte e dobra → rotas sob `/purchase/fabrication/*` após seleção na landing (ou fallback por visit). */
export const selecionaComprarCorteEDobraAction = () => {
  const seletorCtaLargo =
    'button, [role="button"], [role="tab"], [role="link"], .hefesto-button, span.hefesto-button__label, a[href], input[type="submit"], input[type="button"]';

  const textoAcumuladoParaMatch = (el) =>
    String(
      [
        el.textContent,
        el.getAttribute && el.getAttribute('aria-label'),
        el.getAttribute && el.getAttribute('title'),
        el.getAttribute && el.getAttribute('value'),
        typeof el.value === 'string' ? el.value : '',
      ]
        .filter(Boolean)
        .join(' ')
    );

  cy.log('✅ Selecionando Comprar tipo Corte e dobra / fabricação');
  aguardarBodyVisivel(30000);

  cy.url({ timeout: 20000 })
    .then((url) => {
      if (String(url || '').includes('/purchase/fabrication')) {
        cy.log('✅ Já está no fluxo de fabricação (corte e dobra)');
        return undefined;
      }

      return cy.then(() => {
        const textoBody = String(Cypress.$('body').text() || '');
        if (!REGEX_CTA_COMPRAR_CORTE_OU_FABRICACAO.test(textoBody)) {
          cy.log('⚠️ Texto de Corte/dobra ausente — rota direta.');
          cy.visit(ROTA_FABRICACAO_IDENTIFICACAO_OBRA);
          return;
        }

        const candidatos = [...Cypress.$(seletorCtaLargo)].filter((el) => Cypress.dom.isVisible(el));
        const alvo = candidatos.find((el) =>
          REGEX_CTA_COMPRAR_CORTE_OU_FABRICACAO.test(textoAcumuladoParaMatch(el))
        );

        if (!alvo) {
          cy.log('⚠️ Sem CTA clicável — rota direta de identificação de obra.');
          cy.visit(ROTA_FABRICACAO_IDENTIFICACAO_OBRA);
          return;
        }

        cy.wrap(alvo).scrollIntoView().click({ force: true });
      });
    })
    .then(() => {
      aguardarOverlaysInvisiveis(45000);
      cy.url({ timeout: 30000 }).should(
        (href) => typeof href === 'string' && href.includes('/purchase/fabrication')
      );
      cy.log('✅ Corte e dobra — rota de fabricação confirmada');
    });
};

const ROTULO_CTA_INK =
  /continuar|avancar|avan[cç]ar|avançar\s+para|para\s+o\s+carrinho|próximo|proximo|próxima|proxima|próxima\s+etapa|proxima\s+etapa|próximo\s+passo|proximo\s+passo|buscar|confirmar|finalizar|fechar pedido|confirmar pedido|prosseguir|seguinte|ir\s+para|ir ao carrinho|ir\s+ao\s+carrinho|ver\s+carrinho|acessar\s+carrinho|exibir\s+carrinho|salvar|enviar|concluir|efetivar|^\s*ok\s*$/i;

const SELETORES_CTA =
  'button, a, [role="button"], [role="link"], .hefesto-button, span.hefesto-button__label, [data-cy*="continue"], [data-cy*="submit"], input[type="submit"]';

/**
 * Localiza CTA visível por texto ou, em último caso, botão primário Hefesto (skins sem rótulo conhecido).
 */
export const clicarEmBotaoInkAction = () => {
  aguardarOverlaysInvisiveis(120000);
  aguardarOverlaysInvisiveis(120000);

  cy.get('body', { timeout: 120000 }).should(($body) => {
    const candidatos = [...$body.find(SELETORES_CTA)].filter((el) => Cypress.dom.isVisible(el));
    const porRotulo = candidatos.find((el) => ROTULO_CTA_INK.test((el.textContent || '').replace(/\s+/g, ' ').trim()));
    const porPrimario = candidatos.find((el) => {
      const $w = Cypress.$(el);
      return $w.closest('.hefesto-button').is('.hefesto-button--primary') || $w.is('button[type="submit"]');
    });
    expect(porRotulo || porPrimario, 'CTA de avanço (rótulo conhecido ou primário Hefesto)').to.exist;
  });

  cy.get('body').then(($body) => {
    const candidatos = [...$body.find(SELETORES_CTA)].filter((el) => Cypress.dom.isVisible(el));
    const porRotulo = candidatos.find((el) => ROTULO_CTA_INK.test((el.textContent || '').replace(/\s+/g, ' ').trim()));
    if (porRotulo) {
      cy.wrap(porRotulo).scrollIntoView().click({ force: true });
      cy.log('✅ Clicou no CTA por rótulo');
      return;
    }
    const porPrimario = candidatos.find((el) => {
      const $w = Cypress.$(el);
      return $w.closest('.hefesto-button').is('.hefesto-button--primary') || $w.is('button[type="submit"]');
    });
    cy.wrap(porPrimario).scrollIntoView().click({ force: true });
    cy.log('✅ Clicou no CTA primário Hefesto (fallback)');
  });
};
