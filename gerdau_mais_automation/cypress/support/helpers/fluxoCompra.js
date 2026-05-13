/**
 * Helper compartilhado entre os fluxos de compra (Vitrine, Selecionando Itens, Planilha, Histórico).
 * Baseado no padrão estabilizado no fluxo "Compra por Vitrine" em 2026-05-11.
 *
 * Pontos chave aprendidos:
 *  - O Hefesto exibe um loading textual "Estamos carregando os dados / Por favor, aguarde"
 *    que não é capturado por overlays. Precisamos esperar esse texto sumir.
 *  - O emissor é mais confiável de localizar via `#select-emissor-pedido` do que por
 *    `[role="combobox"]` / `[class*="select-container"]` (pegam combos de outros lugares).
 *  - Cliques de ação ("Comprar por Vitrine", "Avançar...", "Finalizar...") devem mirar
 *    `button / [role="button"] / .hefesto-button / a[href]` para não pegar `span.hefesto-title`.
 *  - O carrinho pode ter múltiplas linhas e cada produto tem seu próprio campo "Data desejada"
 *    com placeholder `dd/mm/aaaa`. Todos precisam estar preenchidos.
 *  - Após "Avançar para revisão" pode aparecer o modal "Produtos idênticos encontrados",
 *    que precisa ter "Continuar" clicado.
 *  - A confirmação final é "Seu pedido foi enviado." na rota `/finalize-order`.
 */
import { aguardarBodyVisivel } from './uiReady';
import { aguardarOverlaysInvisiveis } from '../../pages/comprarPage/comprarPageHelpers';

export const STEP_TIMEOUT = 45000;
export const ROTA_COMPRAR_LANDING =
  '/purchase/commerce/steel-type-choose/steel-type-choose';

const REGEX_LOADING_TEXTUAL =
  /estamos\s+carregando\s+os\s+dados|por\s+favor,?\s+aguarde|aguarde\s+alguns\s+instantes|carregando\.{0,3}\s*$/i;

const SELETORES_BOTAO =
  'button, [role="button"], .hefesto-button, a[href], [role="link"], input[type="submit"]';

const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const aguardarFimCarregamentoTextual = (timeout = STEP_TIMEOUT) => {
  cy.get('body', { timeout }).should(($body) => {
    const texto = ($body.text() || '').trim();
    expect(
      REGEX_LOADING_TEXTUAL.test(texto),
      'loading textual "Estamos carregando / aguarde" ainda visível'
    ).to.eq(false);
  });
};

export const aguardarTela = (msg, timeout = STEP_TIMEOUT) => {
  cy.log(`⏳ Aguardando: ${msg}`);
  aguardarBodyVisivel(20000);
  aguardarOverlaysInvisiveis(timeout);
  aguardarFimCarregamentoTextual(timeout);
};

/** Clica em algo realmente clicável, evitando títulos de card (`span.hefesto-title`). */
export const clicarBotaoPorTexto = (texto, regex, timeout = STEP_TIMEOUT) => {
  cy.contains(SELETORES_BOTAO, regex, { timeout })
    .filter(':visible')
    .first()
    .scrollIntoView()
    .click({ force: true });
  cy.log(`✅ Clicou no botão "${texto}"`);
};

/** Acessa a área de Comprar (mesma rota do menu superior "Comprar"). */
export const acessarComprarLanding = () => {
  cy.visit(ROTA_COMPRAR_LANDING);
  cy.url({ timeout: STEP_TIMEOUT }).should('include', ROTA_COMPRAR_LANDING);
  aguardarTela('tela de Comprar carregada');
};

/**
 * Seleciona o emissor "Emissor do pedido" via `#select-emissor-pedido`.
 * Valida que o placeholder "Selecione um emissor" sumiu, garantindo seleção efetiva.
 */
export const selecionarEmissorDoPedido = (nomeEmissor) => {
  cy.log(`⏳ Selecionando emissor "${nomeEmissor}"`);
  aguardarFimCarregamentoTextual(STEP_TIMEOUT);

  cy.get('#select-emissor-pedido', { timeout: STEP_TIMEOUT })
    .should('be.visible')
    .scrollIntoView()
    .click({ force: true });
  cy.log('✅ Abriu dropdown do emissor');

  const regexEmissor = new RegExp(escaparRegex(nomeEmissor), 'i');
  cy.contains(
    '.hefesto-select__option, [role="option"], li.hefesto-select__option, .dropdown-item, .input-helpers__selected-options--option, li, div, span, p',
    regexEmissor,
    { timeout: STEP_TIMEOUT }
  )
    .filter(':visible')
    .first()
    .scrollIntoView()
    .click({ force: true });
  cy.log(`✅ Clicou na opção "${nomeEmissor}"`);

  cy.get('#select-emissor-pedido', { timeout: STEP_TIMEOUT }).should(($cx) => {
    const texto = ($cx.text() || '').toLowerCase();
    const placeholder = /selecione\s+um\s+emissor/i.test(texto);
    expect(placeholder, 'placeholder "Selecione um emissor" ainda visível').to.eq(false);
  });
  cy.log('✅ Emissor confirmado no campo');
};

/** Clica no ícone do carrinho no header superior direito e aguarda a tela do carrinho. */
export const irParaCarrinhoViaHeader = (ComprarPage) => {
  aguardarOverlaysInvisiveis(STEP_TIMEOUT);
  ComprarPage.carrinho.should('be.visible').click({ force: true });
  aguardarTela('página do carrinho carregada');
  tratarModaisTransientes();
};

/**
 * Clica no botão "Avançar para o carrinho" (usado nos fluxos de Selecionando Itens /
 * Planilha / Histórico que primeiro montam uma lista e depois efetivam no carrinho).
 * Espera o redirecionamento para /shopping-cart.
 */
export const avancarParaOCarrinho = () => {
  clicarBotaoPorTexto('Avançar para o carrinho', /avan[cç]ar\s+para\s+o\s+carrinho/i);
  cy.url({ timeout: STEP_TIMEOUT }).should('include', '/shopping-cart');
  aguardarTela('página do carrinho carregada');
  tratarModaisTransientes();
};

/** Preenche todos os campos "Data desejada" visíveis (placeholder `dd/mm/aaaa`) com D+N dias (default 7). */
export const preencherDatasDesejadasNoCarrinho = (diasAdiante = 7) => {
  const hoje = new Date();
  hoje.setDate(hoje.getDate() + diasAdiante);
  const yyyy = hoje.getFullYear();
  const mm = String(hoje.getMonth() + 1).padStart(2, '0');
  const dd = String(hoje.getDate()).padStart(2, '0');
  const valorBR = `${dd}/${mm}/${yyyy}`;

  cy.get(
    'input[placeholder*="dd/mm"], input[placeholder*="aaaa"], input[placeholder*="data"], input[type="date"], [data-cy*="date"] input, [class*="date"] input',
    { timeout: STEP_TIMEOUT }
  )
    .filter(':visible')
    .then(($inputs) => {
      cy.log(`⏳ Preenchendo ${$inputs.length} campo(s) de data desejada (D+${diasAdiante})`);
      [...$inputs].forEach((input, idx) => {
        cy.wrap(input).scrollIntoView().click({ force: true });
        cy.wrap(input).clear({ force: true });
        cy.wrap(input).type(valorBR, { force: true, delay: 50 });
        cy.wrap(input).blur({ force: true });
        cy.get('body').type('{esc}', { force: true });
        cy.log(`✅ Data preenchida (campo ${idx + 1}): ${valorBR}`);
      });
    });
};

const REGEX_MODAL_TRANSIENTE =
  /produtos\s+id[eê]nticos|quantidades\s+dos\s+produtos\s+id[eê]nticos\s+ser[aã]o\s+somadas|servi[cç]o\s+indispon[ií]vel|tente\s+novamente\s+mais\s+tarde|aten[cç][aã]o|compra\s+em\s+andamento|continuar\s+de\s+onde\s+parou/i;

/**
 * Detecta modais transientes (produtos idênticos, serviço indisponível, etc.) e clica em
 * "Continuar" / "OK" / "Fechar" / "Entendi" pra dismissar. Não falha se não houver modal.
 */
export const tratarModaisTransientes = (timeoutDeteccao = 8000) => {
  cy.get('body', { timeout: timeoutDeteccao }).then(($body) => {
    const $modal = $body.find('.hefesto-modal__container, [role="dialog"]').filter(':visible');
    if ($modal.length === 0) return;

    const textoModal = ($modal.text() || '').toLowerCase();
    const ehTransiente = REGEX_MODAL_TRANSIENTE.test(textoModal);
    if (!ehTransiente) {
      cy.log(`ℹ️ Modal visível mas não reconhecido como transiente: "${textoModal.slice(0, 80)}"`);
      return;
    }

    cy.log(`ℹ️ Modal transiente detectado ("${textoModal.slice(0, 60)}…"). Dismissando.`);
    cy.contains(
      '.hefesto-modal__container button, [role="dialog"] button, button',
      /(^\s*(continuar|ok|fechar|entendi|confirmar)\s*$)|(sim,?\s+continuar(\s+pedido)?)|(continuar\s+pedido)/i,
      { timeout: STEP_TIMEOUT }
    )
      .filter(':visible')
      .first()
      .click({ force: true });
  });
};

/** Alias retrocompatível para o nome anterior, agora delega ao handler genérico. */
export const tratarModalProdutosIdenticos = (timeoutDeteccao = 8000) =>
  tratarModaisTransientes(timeoutDeteccao);

/** Clica em "Avançar para revisão". */
export const clicarAvancarParaRevisao = () => {
  clicarBotaoPorTexto('Avançar para revisão', /avan[cç]ar\s+para\s+revis[ãa]o/i);
};

/** Clica em "Finalizar pedido". */
export const clicarFinalizarPedido = () => {
  clicarBotaoPorTexto('Finalizar pedido', /finalizar\s+pedido/i);
};

/** Valida que o pedido foi enviado (banner "Seu pedido foi enviado." + URL /finalize-order). */
export const validarPedidoEnviado = () => {
  cy.url({ timeout: STEP_TIMEOUT }).should(
    'match',
    /finalize-order|success|order-complete|confirm/i
  );
  cy.contains(
    'body',
    /seu\s+pedido\s+foi\s+enviado|pedido\s+(realizado|finalizado|efetivado|confirmado|registrado|criado|enviado)|recebemos\s+(o\s+)?seu\s+pedido|sucesso|n[úu]mero\s+do\s+pedido|baixar\s+pdf\s+do\s+pedido|ir\s+para\s+meus\s+pedidos/i,
    { timeout: STEP_TIMEOUT }
  ).should('be.visible');
};

/**
 * Fluxo padrão de finalização a partir do carrinho:
 *  1) Avançar para revisão (1ª)
 *  2) Preencher datas desejadas em todos os itens
 *  3) Avançar para revisão (2ª)
 *  4) Tratar modal de produtos idênticos (se aparecer)
 *  5) Finalizar pedido
 *  6) Validar confirmação
 *
 * Aceita opções:
 *   - pularPrimeiroAvancar: se a tela já estiver pedindo data antes do botão "Avançar".
 */
export const finalizarPedidoNoCarrinho = (opts = {}) => {
  const { pularPrimeiroAvancar = false } = opts;

  tratarModaisTransientes();

  if (!pularPrimeiroAvancar) {
    clicarAvancarParaRevisao();
    tratarModaisTransientes();
    aguardarTela('etapa pós primeiro avançar carregada');
  }

  preencherDatasDesejadasNoCarrinho();
  aguardarOverlaysInvisiveis(STEP_TIMEOUT);
  clicarAvancarParaRevisao();
  tratarModaisTransientes();
  aguardarTela('página de revisão carregada');

  clicarFinalizarPedido();
  tratarModaisTransientes();
  aguardarTela('confirmação do pedido carregada');

  validarPedidoEnviado();
};
