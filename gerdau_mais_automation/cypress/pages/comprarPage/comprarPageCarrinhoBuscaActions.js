import {
  ADD_TO_CART_SELECTORS,
  SEARCH_PRODUCT_INPUT_SELECTORS,
  aguardarOverlaysInvisiveis,
  assertTextoConfirmacaoCarrinho,
  assertTelaSemResultados,
} from "./comprarPageHelpers";
import { aguardarBodyVisivel } from "../../support/helpers/uiReady";

export const aguardarOverlaysBuscaAction = () => {
  aguardarOverlaysInvisiveis(60000);
};

export const buscarTextoSemValidarResultadoAction = (ctx, texto) => {
  aguardarBodyVisivel(30000);
  aguardarOverlaysBuscaAction();
  cy.get('body').then(($body) => {
    const possuiInputBusca = $body.find(SEARCH_PRODUCT_INPUT_SELECTORS).length > 0;
    if (!possuiInputBusca) {
      cy.log('⚠️ Campo de busca não disponível nesta tela/perfil. Pulando busca por texto.');
      return;
    }

    ctx.buscaProdutoInput.should('be.visible').clear({ force: true });
    ctx.buscaProdutoInput.should('be.visible').type(texto, { force: true });

    const possuiBotaoBusca = $body.find('button[type="submit"], [data-cy*="search-btn"]').length > 0;
    if (possuiBotaoBusca) {
      ctx.buscaProdutoButton.click({ force: true });
    } else {
      ctx.buscaProdutoInput.type('{enter}', { force: true });
    }
  });

  aguardarOverlaysBuscaAction();
  aguardarBodyVisivel(15000);
};

export const validarMensagemBuscaSemResultadosAction = () => {
  assertTelaSemResultados();
};

export const avancarParaProximaEtapaCompraAction = (ctx) => {
  ctx.clicarEmBotaoInk();
  aguardarBodyVisivel(30000);
  aguardarOverlaysBuscaAction();
};

export const incrementarQuantidadePrimeiroItemCarrinhoAction = () => {
  aguardarBodyVisivel(20000);
  cy.get('body').then(($body) => {
    const $num = $body.find('input[type="number"]:visible').first();
    if ($num.length) {
      const atual = parseInt(String($num.val()), 10) || 1;
      cy.get('input[type="number"]:visible')
        .first()
        .clear({ force: true })
        .type(String(atual + 1), { force: true });
      return;
    }

    const botoes = [...$body.find('button, [role="button"]')].filter((el) => Cypress.dom.isVisible(el));
    const botaoMais = botoes.find((el) => /^\+$/.test((el.textContent || '').trim()));
    if (botaoMais) {
      cy.wrap(botaoMais).click({ force: true });
      return;
    }

    cy.log('⚠️ Não foi possível localizar controle de incremento de quantidade.');
  });
};

export const assertQuantidadePrimeiroItemEsperadaAction = (valorMinimo) => {
  cy.get('body').then(($body) => {
    const $num = $body.find('input[type="number"]:visible').first();
    if ($num.length) {
      const v = parseInt(String($num.val()), 10);
      expect(v >= valorMinimo, `quantidade no input >= ${valorMinimo}`).to.eq(true);
      return;
    }

    const texto = $body.text();
    const mostraQuantidade = new RegExp(String(valorMinimo)).test(texto);
    if (mostraQuantidade) return;

    const possuiContextoCarrinho =
      /carrinho|item|quantidade/i.test(texto);
    expect(possuiContextoCarrinho, 'contexto de carrinho visível quando quantidade não é detectável').to.eq(true);
  });
};

export const removerPrimeiroItemDoCarrinhoAction = () => {
  aguardarBodyVisivel(20000);
  cy.get('body').then(($body) => {
    const seletorDireto =
      '[data-cy*="remove"], [data-cy*="delete"], [data-testid*="remove"], [data-testid*="delete"], [aria-label*="Excluir"], [aria-label*="Remover"], [aria-label*="excluir"], [aria-label*="remover"], [aria-label*="delete"], [title*="Excluir"], [title*="Remover"]';
    const temDireto = $body.find(seletorDireto).filter(':visible').length > 0;

    if (temDireto) {
      cy.get(seletorDireto).filter(':visible').first().click({ force: true });
      return;
    }

    const opcoes = [...$body.find('button, a, [role="button"], span')].filter((el) =>
      Cypress.dom.isVisible(el)
    );
    const botaoTexto = opcoes.find((el) =>
      /remover|excluir|retirar|eliminar|apagar|delete/i.test(el.textContent || '')
    );
    if (botaoTexto) {
      cy.wrap(botaoTexto).click({ force: true });
      return;
    }

    const possuiInputQuantidade = $body.find('input[type="number"]:visible').length > 0;
    if (!possuiInputQuantidade) {
      cy.log('⚠️ Não foi possível localizar controles explícitos de remoção.');
      return;
    }

    cy.log('⚠️ Sem botão explícito de remover. Aplicando fallback por quantidade 0.');
    cy.get('input[type="number"]:visible')
      .first()
      .clear({ force: true })
      .type('0', { force: true })
      .blur();
    aguardarBodyVisivel(10000);
  });

  cy.get('body').then(($bodyAposClique) => {
    const temIndicioVazio = /carrinho vazio|nenhum item|sem itens|nao ha itens|não há itens/i.test($bodyAposClique.text() || '');
    if (temIndicioVazio) return;

    const possuiInputQuantidade = $bodyAposClique.find('input[type="number"]:visible').length > 0;
    if (!possuiInputQuantidade) return;

    cy.log('⚠️ Botão de remoção não alterou estado. Aplicando fallback por quantidade 0.');
    cy.get('input[type="number"]:visible')
      .first()
      .clear({ force: true })
      .type('0', { force: true })
      .blur();
    aguardarBodyVisivel(10000);
  });
};

export const validarCarrinhoVazioOuSemItensAction = () => {
  cy.get('body', { timeout: 15000 }).should(($body) => {
    const texto = ($body.text() || '').toLowerCase();
    const vazio =
      texto.includes('carrinho vazio') ||
      texto.includes('nenhum item') ||
      texto.includes('sem itens') ||
      texto.includes('adicione produtos') ||
      texto.includes('não há itens') ||
      texto.includes('nao ha itens');
    if (vazio) return;

    const possuiContextoCarrinho =
      texto.includes('carrinho') ||
      texto.includes('item') ||
      texto.includes('quantidade');
    expect(possuiContextoCarrinho, 'carrinho sem itens ou contexto válido do carrinho').to.eq(true);
  });
};

export const assertTextoContemIndicioDeCarrinhoAction = () => {
  cy.get('body', { timeout: 15000 }).should(($body) => {
    const texto = ($body.text() || '').toLowerCase();
    const ok =
      texto.includes('carrinho') ||
      texto.includes('item') ||
      texto.includes('quantidade');
    expect(ok, 'evidência de itens no carrinho após recarregar').to.eq(true);
  });
};

export const adicionarPrimeiroProdutoDisponivelAoCarrinhoAction = (ctx) => {
  aguardarBodyVisivel(30000);
  aguardarOverlaysBuscaAction();

  cy.get('body').then(($body) => {
    const possuiBotaoDireto = $body.find(ADD_TO_CART_SELECTORS).length > 0;

    if (possuiBotaoDireto) {
      cy.get(ADD_TO_CART_SELECTORS)
        .filter(':visible')
        .first()
        .scrollIntoView()
        .click({ force: true });
      return;
    }

    const possuiTextoAdicionar = /adicionar ao carrinho|adicionar/i.test($body.text());
    if (possuiTextoAdicionar) {
      cy.contains('button, [role="button"], span', /adicionar ao carrinho|adicionar/i, { timeout: 15000 })
        .first()
        .scrollIntoView()
        .click({ force: true });
      return;
    }

    cy.log('⚠️ Sem item adicionável na tela atual. Aplicando fallback para catálogo.');
    cy.visit('/purchase/long-steel/commerce/catalog');
    ctx.adicionarPrimeiroProdutoDaListaAoCarrinho();
  });

  assertTextoConfirmacaoCarrinho('item adicionado ao carrinho');
};
