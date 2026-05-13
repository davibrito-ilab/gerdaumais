import ComprarPage from "./comprarPage";
import {
  ADD_TO_CART_SELECTORS,
  aguardarOverlaysInvisiveis,
  assertTextoConfirmacaoCarrinho,
  assertTelaSemResultados,
} from "./comprarPageHelpers";
import {
  selecionaComprarVitrineAction,
  selecionaComprarSelecionandoAction,
  selecionaComprarPlanilhaAction,
  selecionaComprarHistoricoAction,
  clicarEmBotaoInkAction,
} from "./comprarPageTipoCompraActions";
import {
  selecionaEmissorCorretamenteAction,
  selecionaEmissorAction,
} from "./comprarPageEmissorActions";
import { aguardarBodyVisivel, recarregarPaginaEAguardar } from '../../support/helpers/uiReady';
import {
  aguardarOverlaysBuscaAction,
  buscarTextoSemValidarResultadoAction,
  validarMensagemBuscaSemResultadosAction,
  avancarParaProximaEtapaCompraAction,
  incrementarQuantidadePrimeiroItemCarrinhoAction,
  assertQuantidadePrimeiroItemEsperadaAction,
  removerPrimeiroItemDoCarrinhoAction,
  validarCarrinhoVazioOuSemItensAction,
  assertTextoContemIndicioDeCarrinhoAction,
  adicionarPrimeiroProdutoDisponivelAoCarrinhoAction,
} from "./comprarPageCarrinhoBuscaActions";

class ComprarPageMetods extends ComprarPage{
  navegaParaComprar() {
    this.acessarComprarButton.click();
  }

  selecionaComprarVitrine() {
    selecionaComprarVitrineAction();
  }

  selecionaComprarSelecionando() {
    selecionaComprarSelecionandoAction();
  }

  selecionaComprarPlanilha() {
    selecionaComprarPlanilhaAction();
  }

  selecionaComprarHistorico() {
    selecionaComprarHistoricoAction();
  }

  selecionaEmissorCorretamente(emissor = Cypress.env('emissor')) {
    selecionaEmissorCorretamenteAction(emissor);
  }

  validarCarregamentodoComprar() {
    this.headerComprar.should('be.visible');
    cy.url().should('contain', '/purchase');
    cy.screenshot('comprarPage');
  }

  selecionaEmissor(emissor) {
    selecionaEmissorAction(emissor);
  }

  clicarEmBotaoInk() {
    clicarEmBotaoInkAction();
  }

  selecionaRecebedor (recebedor) {
      this.recebedorInput.type(recebedor);
  }

  validarCarregamentoProdutos() {
    aguardarBodyVisivel(20000);
    aguardarOverlaysInvisiveis(20000);
    this.listaProdutos.should('be.visible');
    cy.screenshot('produtosCarregados');
  }

  buscarProduto (codigo) {
    aguardarBodyVisivel(30000);
    cy.get('body').then(($body) => {
      const carregando = [...$body.find('.hefesto-modal__overlay, .hefesto-modal__container, .modal, .loading')].some(
        (el) => Cypress.dom.isVisible(el)
      );
      if (!carregando) return;

      cy.log('⚠️ Loading preso antes da busca. Recarregando catálogo uma vez.');
      recarregarPaginaEAguardar(30000, { urlIncludes: '/purchase/' });
    });

    aguardarOverlaysInvisiveis(60000);
    this.buscaProdutoInput.should('be.visible').clear({ force: true });
    this.buscaProdutoInput.should('be.visible').type(codigo, { force: true });

    cy.get('body').then(($body) => {
      const possuiBotaoBusca = $body.find('button[type="submit"], [data-cy*="search-btn"]').length > 0;
      if (possuiBotaoBusca) {
        this.buscaProdutoButton.click({ force: true });
      } else {
        this.buscaProdutoInput.type('{enter}', { force: true });
      }
    });

    aguardarOverlaysInvisiveis(60000);
    // Verificar se o produto apareceu na lista
    cy.contains(codigo, { timeout: 10000 }).should('be.visible');
    cy.screenshot('produtoBuscado');
  }

  adicionarProdutoAoCarrinho () {
    // Aguardar o produto estar visível
    cy.contains(Cypress.env('produto'), { timeout: 10000 }).should('be.visible');
    // Tentar encontrar o botão adicionar próximo ao produto
    cy.contains(Cypress.env('produto')).parent().parent().find('[data-cy*="add-cart"], button:contains("Adicionar"), .add-to-cart').first().click();
    // Critério de conclusão: precisa haver evidência explícita de item no carrinho.
    assertTextoConfirmacaoCarrinho('produto adicionado ao carrinho');
    cy.log('✅ Produto adicionado ao carrinho com sucesso');
    cy.screenshot('produtoAdicionado');
  }

  adicionarProdutoAoCarrinhoPorCodigo(codigo) {
    cy.contains(codigo, { timeout: 15000 }).should('be.visible');
    cy.contains(codigo)
      .parentsUntil('body')
      .parent()
      .find('[data-cy*="add-cart"], button:contains("Adicionar"), .add-to-cart')
      .first()
      .click({ force: true });

    assertTextoConfirmacaoCarrinho(`produto ${codigo} adicionado ao carrinho`);
    cy.log(`✅ Produto ${codigo} adicionado ao carrinho com sucesso`);
    cy.screenshot('produtoAdicionadoPorCodigo');
  }

  adicionarPrimeiroProdutoDaListaAoCarrinho(opts = {}) {
    const { skipPlanilhaOnce = false } = opts;
    const tentarAdicionarNaTelaAtual = () => {
      cy.get('body').then(($body) => {
        const possuiBotaoDireto = $body.find(ADD_TO_CART_SELECTORS).length > 0;
        if (possuiBotaoDireto) {
          cy.get(ADD_TO_CART_SELECTORS)
            .filter(':visible')
            .first()
            .click({ force: true });
          return;
        }

        const possuiTextoAdicionar = /adicionar ao carrinho|adicionar/i.test($body.text());
        if (possuiTextoAdicionar) {
          cy.contains('button, [role="button"], span', /adicionar ao carrinho|adicionar/i, { timeout: 15000 })
            .first()
            .click({ force: true });
        }
      });
    };

    const tentarBuscaPorCodigo = (codigo = Cypress.env('produto')) => {
      if (!codigo) return;
      cy.log(`⚠️ Catálogo sem itens. Tentando busca ativa pelo código ${codigo}.`);
      this.buscarTextoSemValidarResultado(codigo);
      tentarAdicionarNaTelaAtual();
    };

    cy.url({ timeout: 30000 }).should('include', '/purchase/long-steel/commerce/catalog');
    cy.log('⏳ Aguardando produtos do catálogo');
    aguardarOverlaysInvisiveis(60000);
    aguardarBodyVisivel(30000);

    cy.get('body').then(($body) => {
      const possuiListaProdutos =
        $body.find('.products-list, [data-cy*="products"], .product-grid, [class*="product"]').length > 0;
      const possuiBotaoDireto = $body.find(ADD_TO_CART_SELECTORS).length > 0;

      if (!possuiListaProdutos && !possuiBotaoDireto) {
        cy.log('⚠️ Catálogo sem itens visíveis. Tentando fallback em busca de itens.');
        this.selecionaEmissorCorretamente();
        cy.visit('/purchase/long-steel/commerce/search-items');
        aguardarOverlaysInvisiveis(60000);
        tentarBuscaPorCodigo();
        return;
      }

      tentarAdicionarNaTelaAtual();
    });

    cy.get('body').then(($body) => {
      const possuiBotaoAdicionar =
        $body.find(ADD_TO_CART_SELECTORS).length > 0 ||
        /adicionar ao carrinho|adicionar/i.test($body.text());

      if (possuiBotaoAdicionar) return;

      this.selecionaEmissorCorretamente();
      cy.visit('/purchase/long-steel/commerce/search-items');
      aguardarBodyVisivel(30000);
      aguardarOverlaysInvisiveis(60000);
      tentarBuscaPorCodigo();
      aguardarOverlaysInvisiveis(30000);
      aguardarBodyVisivel(15000);
      cy.get('body').then(($bodyBusca) => {
        const possuiBotaoBusca =
          $bodyBusca.find(ADD_TO_CART_SELECTORS).length > 0 ||
          /adicionar ao carrinho|adicionar/i.test($bodyBusca.text());
        if (!possuiBotaoBusca) {
          if (skipPlanilhaOnce) {
            cy.log('⚠️ Busca sem CTA após planilha; reforça emissor e retorna ao catálogo (sem novo ciclo planilha).');
            this.selecionaEmissorCorretamente();
            cy.visit('/purchase/long-steel/commerce/catalog');
            aguardarOverlaysInvisiveis(60000);
            aguardarBodyVisivel(30000);
            tentarAdicionarNaTelaAtual();
            return;
          }
          cy.log('⚠️ Produtos indisponíveis em catálogo/busca. Tentando fallback de adição via planilha.');
          cy.visit('/purchase/long-steel/spreadsheet');
          this.adicionarPrimeiroProdutoAoCarrinhoNaPlanilha();
          return;
        }
        if ($bodyBusca.find(ADD_TO_CART_SELECTORS).length > 0) {
          cy.get(ADD_TO_CART_SELECTORS).filter(':visible').first().click({ force: true });
          return;
        }
        cy.contains('button, [role="button"], span', /adicionar ao carrinho|adicionar/i, { timeout: 15000 })
          .first()
          .click({ force: true });
      });
    });

    assertTextoConfirmacaoCarrinho('primeiro produto adicionado ao carrinho');

    cy.log('✅ Primeiro produto da lista adicionado ao carrinho');
    cy.screenshot('primeiroProdutoAdicionado');
  }

  adicionarPrimeiroProdutoAoCarrinhoNaPlanilha(codigoFallback = '106040273') {
    cy.log('⏳ Aguardando etapa de seleção de produtos na planilha');
    aguardarBodyVisivel(60000);
    aguardarOverlaysInvisiveis(60000);
    cy.get('body').then(($body) => {
      const textoTela = ($body.text() || '').toLowerCase();
      const modalPedidoAndamento =
        textoTela.includes('continuar seu último pedido') ||
        textoTela.includes('continuar seu ultimo pedido');

      if (!modalPedidoAndamento) return;

      cy.log('⚠️ Modal de pedido em andamento detectado. Selecionando "Novo pedido".');
      cy.contains('button, [role="button"], span', /novo pedido/i, { timeout: 15000 })
        .should('be.visible')
        .click({ force: true });
      aguardarOverlaysInvisiveis(30000);
    });

    cy.scrollTo('bottom', { ensureScrollable: false });
    aguardarBodyVisivel(15000);

    cy.get('body').then(($body) => {
      const possuiBotaoAdicionar =
        $body.find(ADD_TO_CART_SELECTORS).length > 0;

      if (possuiBotaoAdicionar) {
        cy.get(ADD_TO_CART_SELECTORS)
          .filter(':visible')
          .first()
          .scrollIntoView()
          .click({ force: true });
        return;
      }

      const possuiTextoAdicionar = /adicionar ao carrinho|adicionar/i.test($body.text());
      if (possuiTextoAdicionar) {
        cy.contains('button, [role="button"], span', /adicionar ao carrinho|adicionar/i, { timeout: 20000 })
          .first()
          .scrollIntoView()
          .click({ force: true });
        return;
      }

      cy.log('⚠️ Sem botões de adição na planilha. Aplicando fallback para catálogo.');
      cy.visit('/purchase/long-steel/commerce/catalog');
      this.adicionarPrimeiroProdutoDaListaAoCarrinho({ skipPlanilhaOnce: true });
    });

    assertTextoConfirmacaoCarrinho('produto adicionado ao carrinho na planilha');

    cy.log('✅ Produto adicionado ao carrinho na planilha');
    cy.screenshot('produtoAdicionadoPlanilha');
  }

  adicionarPrimeiroProdutoDisponivelAoCarrinho() {
    adicionarPrimeiroProdutoDisponivelAoCarrinhoAction(this);
  }

  aguardarOverlaysBusca() {
    aguardarOverlaysBuscaAction();
  }

  /**
   * Executa busca sem exigir que o termo apareça na lista (ex.: cenário sem resultados).
   */
  buscarTextoSemValidarResultado(texto) {
    buscarTextoSemValidarResultadoAction(this, texto);
  }

  validarMensagemBuscaSemResultados() {
    validarMensagemBuscaSemResultadosAction();
  }

  avancarParaProximaEtapaCompra() {
    avancarParaProximaEtapaCompraAction(this);
  }

  incrementarQuantidadePrimeiroItemCarrinho() {
    incrementarQuantidadePrimeiroItemCarrinhoAction();
  }

  assertQuantidadePrimeiroItemEsperada(valorMinimo) {
    assertQuantidadePrimeiroItemEsperadaAction(valorMinimo);
  }

  removerPrimeiroItemDoCarrinho() {
    removerPrimeiroItemDoCarrinhoAction();
  }

  validarCarrinhoVazioOuSemItens() {
    validarCarrinhoVazioOuSemItensAction();
  }

  assertTextoContemIndicioDeCarrinho() {
    assertTextoContemIndicioDeCarrinhoAction();
  }
}

export default new ComprarPageMetods();