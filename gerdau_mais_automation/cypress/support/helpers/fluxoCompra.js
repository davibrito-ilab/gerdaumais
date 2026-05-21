/**
 * Helper compartilhado entre os fluxos de compra (Vitrine, Selecionando Itens, Planilha, Histórico, Corte e dobra / fabricação).
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
 *  - **Contrato de CTA:** o time de front pode expor `data-testid`/`data-cy` no botão final
 *    (lista em `PRIORIDADE_CTA_FINALIZAR_SELECTOR`); rótulos em português/inglês são fallback.
 *  - Após "Avançar para revisão" pode aparecer o modal "Produtos idênticos encontrados",
 *    que precisa ter "Continuar" clicado.
 *  - A confirmação final é "Seu pedido foi enviado." na rota `/finalize-order`.
 */
import { aguardarBodyVisivel } from './uiReady';
import { aguardarOverlaysInvisiveis } from '../../pages/comprarPage/comprarPageHelpers';

export const STEP_TIMEOUT = 45000;

/** Pausas curtas p/ calendário e máscara (substituem cy.wait 400–700 ms e encurtam a suíte). */
const MS_CAL_ABRIR = 360;
const MS_CAL_REFORCO = 200;
const MS_POS_SCROLL_EXTRA = 220;

export const ROTA_COMPRAR_LANDING =
  '/purchase/commerce/steel-type-choose/steel-type-choose';

/** Paralelo aos longos: jornada “Corte e dobra” (analytics: LG:Comprar:CorteEDobra:*). Rotas vistas no bundle QA. */
export const ROTA_FABRICACAO_IDENTIFICACAO_OBRA =
  '/purchase/fabrication/construction-identification';
export const ROTA_FABRICACAO_HISTORICO = '/purchase/fabrication/last-orders';

/** CTA esperada na landing após escolha de emissor (rótulos reais podem truncar "&"). */
export const REGEX_CTA_COMPRAR_CORTE_OU_FABRICACAO =
  /corte\s*&\s*dobra|corte\s+e\s+dobra|fabrica[cç][aã]o\s+estrutura|fabrica[cç][aã]o|comprar.*?corte|pedido.*?corte/i;

/**
 * Indícios da etapa **Revisar pedido** (checkout longos) antes do CTA final de envio — alinhado ao `pedido.js`.
 * Evitar `\bcheckout\b` isolado: o bundle do carrinho (`/shopping-cart`) costuma repetir "checkout" no copy/HTML
 * e gerava falso positivo em `avancarCarrinhoAteEtapaRevisarPedido`, pulando datas e avanços.
 */
export const REGEX_INDICIOS_ETAPA_REVISAR_PEDIDO =
  /revis(ar|ão)\s+pedido|revis(ar|ão)\s+da\s+compra|step\s*3\s+de\s*4|step\s*3\s+of\s*4|step\s*3\s*\/\s*4|etapa\s*3\b|confer(ência|encia)\s+do\s+pedido|confirmar\s+dados|resumo\s+(do\s+)?pedido|fechar\s+compra/i;

const REGEX_LOADING_TEXTUAL =
  /\bestamos\s+carregando\s+os\s+dados\b|\bpor\s+favor,?\s+aguarde\b|\baguarde\s+alguns\s+instantes\b|\bprocessando\s+sua\s+solicita[cç][aã]o\b/i;

const SELETORES_BOTAO =
  'button, [role="button"], .hefesto-button, a[href], [role="link"], input[type="submit"], input[type="button"]';

const normTextoBtn = (s) =>
  String(s || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const textoAcumuladoElemento = (el) =>
  normTextoBtn(
    [
      el.textContent,
      el.getAttribute && el.getAttribute('aria-label'),
      el.getAttribute && el.getAttribute('title'),
      el.getAttribute && el.getAttribute('data-testid'),
      el.getAttribute && el.getAttribute('data-cy'),
      el.getAttribute && el.getAttribute('value'),
      typeof el.value === 'string' ? el.value : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

/** Detecta botão/CTA de checkout desabilitado (HTML ou Hefesto). */
const elementoCtaDesabilitado = (el) =>
  !!(el.disabled ||
    el.getAttribute('aria-disabled') === 'true' ||
    /disabled|hefesto-button--disabled/i.test(String(el.className || '')));

/** Padrões de rótulo do último passo do checkout (variam por release do QA). */
const casaComTextoFinalizarPedido = (textoOuEl) => {
  const raw = typeof textoOuEl === 'string' ? textoOuEl : textoAcumuladoElemento(textoOuEl);
  const t = normTextoBtn(raw);
  if (!t) return false;

  if (/\b(finalize-order|finalize_order|submit-order|place-order|confirm-order|send-order)\b/i.test(t))
    return true;

  const padroesCompletos = [
    /(finalizar|efetivar|confirmar|concluir|enviar|realizar|formalizar|solicitar|fechar|gravar)\s+(o\s+)?(pedido|compra)/i,
    /(pedido|compra)\s+(finalizar|efetivar|confirmar|enviar)/i,
    /\bcontinuar\s+com\s+(o\s+)?pedido\b/i,
    /\b(concluir|finalizar)\s+a\s+compra\b/i,
    /\b(enviar|transmitir|dispar(ar|ar)|process(ar|amento)|registrar)\s+(o\s+)?pedido\b/i,
    /\bpedido\b.*\b(enviar|confirmar)\b|\bconfirm(ar|ação)\s+envio\b/i,
    /\b(place|submit|complete)(\s+(the\s+)?order|\s+order\b)/i,
    /\bredigir\s+pedido\b/i,
    /\bgerar\b.*\bpedido\b/i,
    /\bassin(ar|atura)\s+pedido\b/i,
    /\bfechar\b.*\bcompra\b/i,
    /\bhomolog(ar|ação)\s+pedido\b/i,
    /\bregistrar\b.*\bpedido\b/i,
  ];
  if (padroesCompletos.some((p) => p.test(t))) return true;

  const temAcao = /(finalizar|efetivar|confirmar|concluir|enviar|realizar|formalizar|solicitar|fechar|gravar)/i.test(
    t
  );
  const temObjeto = /(pedido|compra)/i.test(t);
  if (temAcao && temObjeto && t.length < 80) return true;

  return /^\s*(finalizar|efetivar|confirmar|concluir)\s*$/i.test(t);
};

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

/** Rota típica de carrinho **ou** conteúdo de configuração de cesta (SPA pode não mudar pathname). */
export function bodyOuPathnameIndicaCarrinhoOuCheckout(win, textoBody) {
  const pathLower = `${win.location.pathname}${win.location.search}${win.location.hash}`.toLowerCase();
  const rota =
    /\/shopping-cart|\/configure-cart|\/cart-checkout|checkout\/(?:cart|carrinho)|\/carrinho\b|\bcart-checkout\b|configure-cart\b|shopping-cart\b|checkout\b|commerce\/[^\s]+\/(?:cart|carrinho|checkout|shopping|configure|shopping-cart)|order-items/i.test(
      pathLower
    );
  const t = String(textoBody || '').replace(/\u00a0/g, ' ');
  const b = t.toLowerCase();
  const conteudo =
    /\b(dd\s*[\/\\.]\s*mm|data\s*desejad|quantidade|cota(?:ç|c)a|valor\s+l[ií]quido|sub\s*\-?\s*total)\b/i.test(
      b
    ) ||
    /\bavan[cç]ar\b[\s\S]{0,52}\brevis(?:ão|ao)\b/i.test(b) ||
    /\b(meu\s+carrinho|carrinho\s+de\s+compras|itens\s+no\s+carrinho|itens\s+adicion)\b/i.test(b) ||
    /\b(itens?\b.*\br\$\s*[\d.,]+|valor\s+total|total\s+r\$|sub\s*\-?\s*total)\b/i.test(b) ||
    /\b(resumo|lista)\s+(?:de\s+)?(?:itens|do\s+pedido)\b/i.test(b) ||
    /\bcontinuar\b.*?\b(?:carrinho|cesta)\b|\bir\s+(?:para\s+)?(?:o\s+)?carrinho\b/i.test(b) ||
    (pathLower.includes('search-items') &&
      /\b(data\s*desejad|dd\s*[\/.\s]+\s*mm|valor\s+l[ií]quido|sub\s*-?\s*total|valor\s*r\$|(?:quant(?:idade)?))\s*[:\.]|\bund\.?\b|\balterar\b[^\n]{0,40}quant|\br\$\s*[\d.,]{2,}|avan[cç]ar\s+(?:para\s+)?(?:a\s+)?revis/i.test(
        b
      ));
  return Boolean(rota || conteudo);
}

export const esperarFluxoCarregamentoCarrinho = (timeout = STEP_TIMEOUT) => {
  cy.window({ timeout }).should((win) => {
    const texto = Cypress.$(win.document.body).text();
    expect(
      bodyOuPathnameIndicaCarrinhoOuCheckout(win, texto),
      'rotas típicas de carrinho ou conteúdo de configuração/cesta visível'
    ).to.eq(true);
  });
};

/** Clica no ícone do carrinho no header superior direito e aguarda a tela do carrinho. */
export const irParaCarrinhoViaHeader = (ComprarPage) => {
  aguardarOverlaysInvisiveis(STEP_TIMEOUT);
  ComprarPage.carrinho.should('be.visible').click({ force: true });
  esperarFluxoCarregamentoCarrinho(STEP_TIMEOUT);
  aguardarTela('página do carrinho carregada');
  tratarModaisTransientes();
};

/**
 * Clica em "Avançar para o carrinho" em listas pré-carrinho; aceita SPA que não atualiza só para `/shopping-cart`.
 */
export const avancarParaOCarrinho = () => {
  clicarBotaoPorTexto('Avançar para o carrinho', /avan[cç]ar\s+para\s+o\s+carrinho/i);
  esperarFluxoCarregamentoCarrinho(STEP_TIMEOUT);
  aguardarTela('página do carrinho carregada');
  tratarModaisTransientes();
};

/**
 * Comprar → emissor → rota **`/spreadsheet`** (fluxo Planilha).
 */
export const navegarTelaSpreadsheetComEmissor = (nomeEmissor) => {
  acessarComprarLanding();
  selecionarEmissorDoPedido(nomeEmissor);
  aguardarTela('emissor confirmado, cards habilitados');
  clicarBotaoPorTexto('Comprar por Planilha', /comprar\s+por\s+planilha/i);
  cy.url({ timeout: STEP_TIMEOUT }).should('match', /\/spreadsheet/i);
};

/**
 * Anexa arquivo no primeiro `input[type=file]` da tela de planilha.
 * Opcionalmente clica CTAs comuns (**importar**, **enviar**, **processar**…) quando o texto sugere esse passo extra.
 *
 * Caminho conforme Cypress: típico `cypress/fixtures/arquivo.xlsx` (cwd = pasta do projeto do Cypress).
 */
export const anexarArquivoFluxoSpreadsheet = (caminhoRelativoProjeto) => {
  tratarModaisTransientes(3200);
  cy.get('input[type="file"]', { timeout: STEP_TIMEOUT })
    .first()
    .selectFile(caminhoRelativoProjeto, { force: true });
  cy.wait(600);
  tratarModaisTransientes(4500);

  cy.get('body').then(($b) => {
    const texto = ($b.text() || '').toLowerCase();

    const bloqueador =
      texto.includes('formato') ||
      texto.includes('inválido') ||
      texto.includes('invalido') ||
      texto.includes('coluna obrig') ||
      texto.includes('erro na planilha');

    if (bloqueador) return;

    if (
      !/importar|enviar|processar|carregar|validar|aplicar|confirmar\s+upload|confirmar\s+arquivo/i.test(texto)
    ) {
      return;
    }

    cy.contains(SELETORES_BOTAO, /importar|enviar|processar|carregar|validar|aplicar|confirmar/i, {
      timeout: 14000,
    })
      .filter(':visible')
      .first()
      .click({ force: true });
  });

  aguardarOverlaysInvisiveis(STEP_TIMEOUT);
};

/**
 * Aguarda o SKU na página **ou**, em `/spreadsheet`, linhas suficientes em `tbody` (grade virtualizada
 * pode não repetir código no texto até agregar ao carrinho).
 */
export const aguardarSkuEmTextoOuHtmlPlanilha = (
  skuCrude,
  timeout = STEP_TIMEOUT,
  opts = {},
) => {
  const sku = String(skuCrude ?? '').trim();
  const skuEsc = escaparRegex(sku);
  const reSku = new RegExp(skuEsc, 'g');
  const minLinhasTbody = opts.minLinhasTbody ?? 0;

  cy.document({ timeout }).should(($doc) => {
    const root = $doc.documentElement || $doc.body;
    const win = $doc.defaultView;
    const pathLower = `${(win && win.location.pathname) || ''}`.toLowerCase();

    const texto = (($doc.body && $doc.body.innerText) || Cypress.$(root).text() || '').trim();
    const html = Cypress.$(root).prop('outerHTML') || '';

    const ocorSku = (`${texto}\n${html}`.match(reSku) || []).length;
    let linhasOk = false;
    if (minLinhasTbody >= 2 && pathLower.includes('spreadsheet')) {
      const nTr = Cypress.$('table tbody tr', $doc).length;
      const rowsGrid = Cypress.$('[role="grid"] [role="row"]', $doc).length;
      /** Grade virtualizada pode ocultar `<tr>`; +1 conta cabeçalho típico no grid role. */
      linhasOk = nTr >= minLinhasTbody || rowsGrid >= minLinhasTbody + 1;
    }

    const temMarcacaoDuasLinhas =
      pathLower.includes('spreadsheet') &&
      /(?:^|[\s>])linha\s*1[^\n]{0,220}(?:linha\s*2|item\s*2)/i.test(texto.replace(/\u00a0/g, ' '));

    expect(
      ocorSku >= 1 || linhasOk || temMarcacaoDuasLinhas,
      `SKU "${sku}" no texto/markup${minLinhasTbody >= 2 ? ` ou ≥ ${minLinhasTbody} linhas na grade ou duas linhas rotuladas` : ''}`
    ).eq(true);
  });
};

/**
 * Acessa o catálogo da vitrine **com emissor aplicado** (landing → emissor → “Comprar por Vitrine”).
 * Evita `cy.visit` direto em `/purchase/long-steel/commerce/catalog`, que no QA costuma perder
 * o contexto de emissor e quebra checkout (“Finalizar pedido” nunca aparece).
 */
export const acessarCatalogoVitrineComEmissor = (nomeEmissor) => {
  acessarComprarLanding();
  selecionarEmissorDoPedido(nomeEmissor);
  aguardarTela('emissor confirmado, cards habilitados');
  clicarBotaoPorTexto('Comprar por Vitrine', /comprar\s+por\s+vitrine/i);
  cy.url({ timeout: STEP_TIMEOUT }).should('include', '/purchase/long-steel/commerce/catalog');
  aguardarTela('catálogo da vitrine carregado');
};

/**
 * Comprar → emissor → **Corte e dobra** (fabricação): primeira tela típica identificação de obra.
 * O cartão da landing pode trazer o rótulo em texto que não coincide com elementos de `contains(button,…)`.
 * Nesse caso cai para `cy.visit` em `ROTA_FABRICACAO_IDENTIFICACAO_OBRA`.
 */
export const acessarIdentificacaoObraFabricacaoComEmissor = (nomeEmissor) => {
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

  acessarComprarLanding();
  selecionarEmissorDoPedido(nomeEmissor);
  aguardarTela('emissor confirmado, cards habilitados');

  cy.then(() => {
    const textoBody = String(Cypress.$('body').text() || '');
    if (!REGEX_CTA_COMPRAR_CORTE_OU_FABRICACAO.test(textoBody)) {
      cy.log('⚠️ Texto de Corte/dobra não encontrado na landing; usando rota direta de fabricação.');
      cy.visit(ROTA_FABRICACAO_IDENTIFICACAO_OBRA);
      return;
    }

    const candidatos = [...Cypress.$(seletorCtaLargo)].filter((el) => Cypress.dom.isVisible(el));
    const alvo = candidatos.find((el) => REGEX_CTA_COMPRAR_CORTE_OU_FABRICACAO.test(textoAcumuladoParaMatch(el)));

    if (!alvo) {
      cy.log('⚠️ Rótulo de Corte/dobra visível na página mas sem CTA clicável mapeada — rota direta de fabricação.');
      cy.visit(ROTA_FABRICACAO_IDENTIFICACAO_OBRA);
      return;
    }

    cy.wrap(alvo).scrollIntoView().click({ force: true });
    cy.log('✅ Clique na entrada Corte e dobra / fabricação');
  });

  cy.url({ timeout: STEP_TIMEOUT }).should(
    'satisfy',
    (href) => typeof href === 'string' && href.includes('/purchase/fabrication/')
  );
  aguardarTela('fabricação — passo inicial (identificação de obra ou navegação interna)');
};

/** Histórico de pedidos dentro do fluxo de fabricação (corte/dobra). */
export const acessarHistoricoPedidosFabricacaoComEmissor = (nomeEmissor) => {
  acessarComprarLanding();
  selecionarEmissorDoPedido(nomeEmissor);
  aguardarTela('emissor confirmado antes de histórico fabricação');
  cy.visit(ROTA_FABRICACAO_HISTORICO);
  cy.url({ timeout: STEP_TIMEOUT }).should('include', '/purchase/fabrication/last-orders');
  aguardarTela('fabricação — histórico / últimos pedidos');
};

/**
 * Preenche todos os campos "Data desejada" do carrinho com D+N dias (default 7).
 * - Inputs de texto / máscara (placeholder dd/mm/aaaa): valor `DD/MM/YYYY`.
 * - `input[type="date"]`: valor **ISO** `YYYY-MM-DD` (obrigatório no HTML5).
 * Evita `placeholder*="data"` genérico, que pegava campos errados fora do carrinho.
 */
export const preencherDatasDesejadasNoCarrinho = (diasAdiante = 7) => {
  const hoje = new Date();
  hoje.setDate(hoje.getDate() + diasAdiante);
  const yyyy = hoje.getFullYear();
  const mm = String(hoje.getMonth() + 1).padStart(2, '0');
  const dd = String(hoje.getDate()).padStart(2, '0');
  const valorBR = `${dd}/${mm}/${yyyy}`;
  const valorISO = `${yyyy}-${mm}-${dd}`;

  const SELETOR_CAMPOS_DATA =
    'input[type="date"], ' +
    'input[placeholder*="dd/mm"], input[placeholder*="DD/MM"], ' +
    'input[placeholder*="aaaa"], input[placeholder*="AAAA"], ' +
    'input[placeholder*="mm/aaaa"], ' +
    'input[placeholder*="esejada"], input[placeholder*="Esejada"], ' +
    'input[aria-label*="desejada" i], input[aria-label*="entrega" i], input[aria-label*="prazo" i], ' +
    '[data-cy*="date"] input, [data-cy*="Date"] input, [data-testid*="date" i] input, ' +
    '.hefesto-datepicker input, [class*="datepicker"] input:not([type="hidden"])';

  const aplicarValorNoCampo = ($input) => {
    const tipo = String($input.attr('type') || '').toLowerCase();
    const nativoDate = tipo === 'date';
    const valor = nativoDate ? valorISO : valorBR;

    cy.wrap($input)
      .should('be.visible')
      .should('be.enabled')
      .scrollIntoView()
      .click({ force: true });

    cy.wrap($input).clear({ force: true });

    if (nativoDate) {
      cy.wrap($input)
        .invoke('val', valor)
        .trigger('input', { force: true })
        .trigger('change', { force: true })
        .trigger('blur', { force: true });
    } else {
      cy.wrap($input).scrollIntoView().click({ force: true });
      cy.wait(MS_CAL_ABRIR);
      cy.get('body').then(() => {
        const $cells = Cypress.$(
          '[role="gridcell"]:visible, ' +
            '[role="option"]:visible, ' +
            '.hefesto-datepicker button:visible, ' +
            '.flatpickr-day:visible:not(.flatpickr-disabled), ' +
            '.rdp-day:visible:not(.rdp-day_disabled)'
        ).filter((_, el) => {
          const ad = Cypress.$(el).attr('aria-disabled');
          const dis = el.disabled || Cypress.$(el).is('.disabled');
          if (ad === 'true' || dis) return false;
          const t = String(el.textContent || '').trim();
          return /^\d{1,2}$/.test(t) && Number(t) >= 1 && Number(t) <= 31;
        });
        if ($cells.length >= 3) {
          const idx = Math.min($cells.length - 1, 14);
          cy.wrap($cells[idx]).click({ force: true });
        } else {
          cy.wrap($input).type('{selectall}{backspace}', { force: true });
          cy.wrap($input).type(valor, { force: true, delay: 45 });
          cy.wrap($input).type('{enter}', { force: true });
        }
        cy.wrap($input).blur({ force: true });
        cy.wrap($input).trigger('input', { force: true });
        cy.wrap($input).trigger('change', { force: true });
      });
    }

    cy.wrap($input).then(($el) => {
      const v = String($el.val() || '').trim();
      const okBr = /\d{2}\/\d{2}\/\d{4}/.test(v);
      const okIso = /^\d{4}-\d{2}-\d{2}$/.test(v);
      if (v.length === 0 || (!okBr && !okIso)) {
        cy.wrap($input)
          .invoke('val', nativoDate ? valorISO : valorBR)
          .trigger('input', { force: true })
          .trigger('change', { force: true })
          .trigger('blur', { force: true });
      }
    });

    cy.wrap($input).should(($el) => {
      const v = String($el.val() || '').trim();
      expect(
        /\d{2}\/\d{2}\/\d{4}/.test(v) || /^\d{4}-\d{2}-\d{2}$/.test(v),
        `data desejada ainda inválida ou vazia: "${v}"`
      ).to.eq(true);
    });

    cy.get('body').type('{esc}', { force: true });

    cy.log(
      `✅ Data preenchida (${nativoDate ? 'type=date ISO' : 'texto BR'}): ${nativoDate ? valorISO : valorBR}`
    );
  };

  const reforcoEventosData = () => {
    cy.get(SELETOR_CAMPOS_DATA, { timeout: 15000 })
      .filter(':visible')
      .each(($input) => {
        const tipo = String($input.attr('type') || '').toLowerCase();
        const nativoDate = tipo === 'date';
        const v = nativoDate ? valorISO : valorBR;
        cy.wrap($input).scrollIntoView().click({ force: true });
        cy.wait(MS_CAL_REFORCO);
        cy.get('body').then(() => {
          const $cells = Cypress.$(
            '[role="gridcell"]:visible, .hefesto-datepicker button:visible, .flatpickr-day:visible:not(.flatpickr-disabled)'
          ).filter((_, el) => {
            const ad = Cypress.$(el).attr('aria-disabled');
            if (ad === 'true' || el.disabled) return false;
            const t = String(el.textContent || '').trim();
            return /^\d{1,2}$/.test(t);
          });
          if ($cells.length >= 3) {
            cy.wrap($cells[Math.min($cells.length - 1, 14)]).click({ force: true });
          } else {
            cy.wrap($input)
              .invoke('val', v)
              .trigger('focus', { force: true })
              .trigger('input', { force: true })
              .trigger('change', { force: true });
          }
        });
        cy.wrap($input).blur({ force: true });
      });
  };

  cy.scrollTo('bottom', { ensureScrollable: false });
  aguardarOverlaysInvisiveis(7000);
  // Pós-relogin / Hefesto: linhas do carrinho podem hidratar depois do overlay; evita "Selecione uma data." preso.
  aguardarFimCarregamentoTextual(25000);

  cy.get(SELETOR_CAMPOS_DATA, { timeout: STEP_TIMEOUT })
    .filter(':visible')
    .filter(':enabled')
    .should('have.length.greaterThan', 0)
    .then(($inputs) => {
      cy.log(
        `⏳ Preenchendo ${$inputs.length} campo(s) de data desejada (D+${diasAdiante}); BR=${valorBR} ISO=${valorISO}`
      );
    });

  cy.get(SELETOR_CAMPOS_DATA, { timeout: STEP_TIMEOUT })
    .filter(':visible')
    .filter(':enabled')
    .each(($input) => {
      aplicarValorNoCampo($input);
    });

  cy.get('body', { timeout: 8000 }).then(($b) => {
    if (/selecione\s+uma\s+data/i.test($b.text() || '')) {
      cy.log('⚠️ Validação de data persiste — calendário / invoke de reforço.');
      reforcoEventosData();
    }
  });

  cy.get('body', { timeout: 5000 }).then(($b) => {
    if (!/selecione\s+uma\s+data/i.test($b.text() || '')) return;
    cy.log(
      '⚠️ Passagem extra: carrinho com mais de um campo de data (ex.: selecionando itens) ou linha rolada para fora da viewport.'
    );
    cy.scrollTo('bottom', { ensureScrollable: false });
    cy.wait(MS_POS_SCROLL_EXTRA);
    cy.get(SELETOR_CAMPOS_DATA, { timeout: STEP_TIMEOUT })
      .filter(':visible')
      .each(($input) => {
        const tipo = String($input.attr('type') || '').toLowerCase();
        const nativoDate = tipo === 'date';
        const v = nativoDate ? valorISO : valorBR;
        cy.wrap($input).scrollIntoView().click({ force: true });
        cy.wait(MS_CAL_ABRIR);
        cy.get('body').then(() => {
          const $cells = Cypress.$(
            '[role="gridcell"]:visible, ' +
              '.hefesto-datepicker button:visible, ' +
              '.flatpickr-day:visible:not(.flatpickr-disabled), ' +
              '.rdp-day:visible:not(.rdp-day_disabled)'
          ).filter((_, el) => {
            const ad = Cypress.$(el).attr('aria-disabled');
            const dis = el.disabled || Cypress.$(el).is('.disabled');
            if (ad === 'true' || dis) return false;
            const t = String(el.textContent || '').trim();
            return /^\d{1,2}$/.test(t) && Number(t) >= 1 && Number(t) <= 31;
          });
          if ($cells.length >= 3) {
            const idx = Math.min($cells.length - 1, 14);
            cy.wrap($cells[idx]).click({ force: true });
          } else {
            cy.wrap($input).invoke('val', v).trigger('input', { force: true }).trigger('change', { force: true });
            cy.wrap($input).type('{enter}', { force: true });
          }
        });
        cy.wrap($input).blur({ force: true });
      });
  });

  cy.get('body', { timeout: 9000 }).then(($b) => {
    if (!/selecione\s+uma\s+data/i.test($b.text() || '')) return;
    cy.log('⚠️ Validação persiste — scroll topo + reforço (linhas cortadas pela viewport).');
    cy.scrollTo('top', { ensureScrollable: false });
    cy.wait(MS_POS_SCROLL_EXTRA);
    reforcoEventosData();
  });

  cy.get('body', { timeout: 45000 }).should(($b) => {
    expect(
      /selecione\s+uma\s+data/i.test($b.text() || ''),
      'sumir validação "Selecione uma data" após preencher datas do carrinho'
    ).to.eq(false);
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

/** `true` se ainda há CTA explícito “avançar / ir para revisão” visível (passo anterior ao da revisão). */
const bodyTemCtaAvancarParaRevisaoVisivel = ($body) =>
  [...Cypress.$(`${SELETORES_BOTAO}, .hefesto-button`, $body.get(0)).toArray()].some(
    (el) =>
      Cypress.dom.isVisible(el) &&
      /avan[cç]ar\s+para\s+(a\s+)?revis[aã]o|ir\s+para\s+(a\s+)?revis[aã]o|continuar\s+para\s+revis[aã]o/i.test(
        textoAcumuladoElemento(el)
      )
  );

/** Clica em "Avançar para revisão". */
export const clicarAvancarParaRevisao = () => {
  tratarModaisTransientes(3200);
  cy.scrollTo('bottom', { ensureScrollable: false });
  const re =
    /avan[cç]ar\s+para\s+(a\s+)?revis[ãa]o|ir\s+para\s+(a\s+)?revis[ãa]o|revis[ãa]o\s+do\s+pedido|continuar\s+para\s+revis[ãa]o/i;
  clicarBotaoPorTexto('Avançar para revisão', re);
};

/** Seletores explícitos (contrato QA) — usar junto aos rótulos legíveis quando existirem. */
const PRIORIDADE_CTA_FINALIZAR_SELECTOR =
  [
    '[data-testid*="finalize-order"]',
    '[data-testid*="finalize_order"]',
    '[data-testid*="FinalizeOrder"]',
    '[data-testid*="confirm-order"]',
    '[data-testid*="ConfirmOrder"]',
    '[data-testid*="submit-order"]',
    '[data-testid*="place-order"]',
    '[data-testid*="send-order"]',
    '[data-cy*="finalize-order"]',
    '[data-cy*="finalizar-pedido"]',
  ].join(', ');

/** `cy.contains` quando elementos visíveis ao Cypress não aparecem no scraping de lista (sticky / texto em filhos). */
const REGEX_CTA_FINALIZAR_FALLBACK_CONTAINS =
  /(finalizar|efetivar|confirmar|concluir|enviar|realizar|formalizar|transmitir|gerar|redigir)(\s+[oa]*)?\s*(pedido|compra)|(pedido|compra)\s+(finalizar|enviar|confirmar)|(place|submit|complete)(\s+(the\s+)?order|\s+purchase|\s+checkout)|\b(fazer|solicitar|efetuar)\s+pedido\b|\b(prosseguir|continuar)\s+com\s+(?:a\s+)?(?:compra|pedido)\b|(finalize-order|finalize_order|submit-order|place-order|homolog|registrar.*pedido)/i;

const colecionarCandidatosCtaFinalPedido = ($body) => {
  const footerLike =
    'footer button, footer [role="button"], footer input[type="submit"], footer input[type="button"], footer .hefesto-button, footer a.hefesto-button, ' +
    '[class*="footer"] button, [class*="Footer"] button, [class*="sticky-actions"] button, [class*="bottom-bar"] button, ' +
    '[class*="action-bar"] button, [data-testid*="footer"] button, aside button';

  const wide = `${SELETORES_BOTAO}, span.hefesto-button__label, .hefesto-button, ${footerLike}`;
  const seen = new Set();
  const out = [];

  Cypress.$(wide, $body.get(0)).each((_, el) => {
    const target =
      Cypress.$(el).closest('.hefesto-button')[0] ||
      Cypress.$(el).closest(
        'button, [role="button"], input[type="submit"], input[type="button"], a[href]'
      )[0];

    if (!target || seen.has(target)) return;
    seen.add(target);

    const txAgg = textoAcumuladoElemento(target).toLowerCase();
    const hit =
      casaComTextoFinalizarPedido(target) ||
      /\b(submit-order|finalize|place-order|confirm-order|send-order|finalize-order)\b/i.test(txAgg);

    if (hit && txAgg.length <= 520) out.push(target);
  });

  return out;
};

/** Clica no CTA final da revisão (rótulos variam no Hefesto). */
export const clicarFinalizarPedido = () => {
  tratarModaisTransientes(3200);
  aguardarOverlaysInvisiveis(STEP_TIMEOUT);
  aguardarFimCarregamentoTextual(STEP_TIMEOUT);
  cy.scrollTo('bottom', { ensureScrollable: false });
  cy.wait(MS_POS_SCROLL_EXTRA);

  cy.get('body', { timeout: STEP_TIMEOUT }).then(($body) => {
    let $prioNodes = Cypress.$(PRIORIDADE_CTA_FINALIZAR_SELECTOR, $body[0]).filter((_i, el) =>
      Cypress.dom.isVisible(el)
    );

    // Alguns QA builds expõem o CTA apenas via atributos; `isVisible` falha até após scroll.
    if (!$prioNodes.length) {
      $prioNodes = Cypress.$(PRIORIDADE_CTA_FINALIZAR_SELECTOR, $body[0]);
    }

    if ($prioNodes.length >= 1) {
      const el =
        [...$prioNodes.toArray()].reverse().find((node) => !elementoCtaDesabilitado(node)) ??
        $prioNodes[$prioNodes.length - 1];
      cy.wrap(el).scrollIntoView({ offset: { top: -64, left: 0 } }).click({ force: true });
      cy.log('✅ CTA finalização via data-testid / data-cy');
      return;
    }

    const botoesLista = colecionarCandidatosCtaFinalPedido($body);
    const livres = botoesLista.filter((el) => !elementoCtaDesabilitado(el));
    const prefVisivel = [...livres].reverse().find((el) => Cypress.dom.isVisible(el));
    const alvoLista = prefVisivel ?? (livres.length ? livres[livres.length - 1] : undefined);

    if (alvoLista) {
      cy.wrap(alvoLista).scrollIntoView({ offset: { top: -64, left: 0 } }).click({ force: true });
      cy.log('✅ Clicou em CTA de finalização (texto/atributos, possivelmente só com force)');
      return;
    }

    const selLooseSubmit =
      '[data-testid*="Finalize"], [data-testid*="finalize"], [data-cy*="finalize"], [data-testid*="submit-order"], [data-testid*="place-order"]';
    const $loose = Cypress.$(`${selLooseSubmit}, button[type="submit"], input[type="submit"]`, $body[0]);
    const loosely = [...$loose.toArray()].filter((el) => !elementoCtaDesabilitado(el));
    const looseHit =
      [...loosely].reverse().find((el) => Cypress.dom.isVisible(el)) ??
      loosely[loosely.length - 1];
    const txLoose = looseHit ? textoAcumuladoElemento(looseHit).toLowerCase() : '';

    const looseOk =
      looseHit &&
      (casaComTextoFinalizarPedido(looseHit) ||
        /\b(submit-order|finalize|place-order|confirm-order)\b/i.test(txLoose) ||
        /\bfinalizar|efetivar|confirmar\s+pedido|enviar\s+pedido\b/i.test(txLoose));

    if (looseOk) {
      cy.wrap(looseHit).scrollIntoView({ offset: { top: -64, left: 0 } }).click({ force: true });
      cy.log('✅ CTA finalização via sel. solto / submit');
      return;
    }

    const $textoBruto = Cypress.$(`${SELETORES_BOTAO}, .hefesto-button, span.hefesto-button__label`, $body[0]);
    const $porSubstring = $textoBruto.filter((_, el) => {
      const u = textoAcumuladoElemento(el).toUpperCase();
      return (
        u.includes('FINALIZ') ||
        u.includes('EFETIV') ||
        (u.includes('ENVIAR') && u.includes('PEDID')) ||
        (u.includes('CONFIRM') && (u.includes('PEDID') || u.includes('COMPR')))
      );
    });
    if ($porSubstring.length) {
      const elSub = $porSubstring.get($porSubstring.length - 1);
      const alvoSub =
        Cypress.$(elSub).closest(
          'button, [role="button"], .hefesto-button, input[type="submit"], input[type="button"], a[href]'
        )[0] || elSub;
      cy.wrap(alvoSub).scrollIntoView({ offset: { top: -64, left: 0 } }).click({ force: true });
      cy.log('✅ CTA finalização via substring de rótulo (último recurso textual)');
      return;
    }

    cy.log(`⚠️ CTA não encontrado (${botoesLista.length} textuais); cy.contains no body`);
    cy.get('body', { timeout: STEP_TIMEOUT })
      .contains(REGEX_CTA_FINALIZAR_FALLBACK_CONTAINS)
      .then(($el) => {
        const alvo =
          Cypress.$($el.get(0)).closest(
            'button, [role="button"], .hefesto-button, input[type="submit"], input[type="button"], a[href]'
          )[0] || $el.get(0);
        cy.wrap(alvo).scrollIntoView({ offset: { top: -64, left: 0 } }).click({ force: true });
      });
    cy.log('✅ CTA finalização via body.contains + closest');
  });
};

/** Valida que o pedido foi enviado (banner "Seu pedido foi enviado." + URL /finalize-order). */
export const validarPedidoEnviado = () => {
  cy.window({ timeout: STEP_TIMEOUT }).should((win) => {
    const href = `${win.location.pathname}${win.location.search}${win.location.hash}`;
    const texto =
      (win.document.documentElement && win.document.documentElement.innerText) ||
      (win.document.body && win.document.body.innerText) ||
      '';
    /** Sucesso por rota (vários bundles) ou página ainda em carrinho mas com confirmação explícita no corpo. */
    const urlOk =
      /finalize-order|confirm-order|order-complete|checkout\/success|\/placed\b|thank-you|\bfinalize\b(?=\/|$)/i.test(
        href
      );
    /** Carrinho SPA às vezes permanece em /shopping-cart com toast/modal de sucesso ou resumo textual. */
    const bloqueOuCarregandoCheckout =
      /\/shopping-cart|configure-cart/i.test(href) &&
      (/sucesso/i.test(texto) ||
        /\bn[ºo°]\s*[.:]?\s*\d{5,}\b/i.test(texto) ||
        /\bprotocolo\b[\s\S]{0,40}\d+/i.test(texto) ||
        /\b(pedido|ordem)\b[\s\S]{0,220}\b(confirmad|enviad|realizad|registrad|efetivad)/i.test(texto));

    const txtOk =
      /seu\s+pedido\s+foi\s+enviado|pedido\s+(realizado|finalizado|efetivado|confirmado|registrado|criado|enviado)|recebemos\s+(o\s+)?seu\s+pedido|n[úu]mero\s+(do\s+)?pedido\b|baixar\s+pdf\s+do\s+pedido|ir\s+para\s+meus\s+pedidos|^\s*sucesso\b/mi.test(
        texto
      );
    expect(
      urlOk || txtOk || bloqueOuCarregandoCheckout,
      `esperava URL de finalize/sucesso (${href}) OU mensagem de pedido enviado no corpo`
    ).to.eq(true);
  });

  cy.contains(
    'body',
    /seu\s+pedido\s+foi\s+enviado|pedido\s+(realizado|finalizado|efetivado|confirmado|registrado|criado|enviado)|recebemos\s+(o\s+)?seu\s+pedido|\b(pedido|ordem)\b[\s\S]{0,220}\b(sucesso|confirmad|registrad|enviad|protocolo|n[ºo°])/i,
    { timeout: Math.min(STEP_TIMEOUT, 25000) }
  ).should('exist');
};

/**
 * Do carrinho (configurar itens + datas) até a UI indicar **Revisar pedido** / passo 3.
 * Não finaliza o envio do pedido.
 *
 * Aceita `pularPrimeiroAvancar` igual a `finalizarPedidoNoCarrinho`.
 */
export const avancarCarrinhoAteEtapaRevisarPedido = (opts = {}) => {
  const { pularPrimeiroAvancar = false } = opts;

  tratarModaisTransientes();

  cy.get('body', { timeout: STEP_TIMEOUT }).then(($b) => {
    const textoCorpo = $b.text() || '';
    const pareceEtapaRevisao = REGEX_INDICIOS_ETAPA_REVISAR_PEDIDO.test(textoCorpo);
    const aindaComCtaAvancarRevisao = bodyTemCtaAvancarParaRevisaoVisivel($b);
    if (pareceEtapaRevisao && !aindaComCtaAvancarRevisao) {
      cy.log('✅ Já na etapa revisar pedido (sem avanços adicionais)');
      return;
    }

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

    cy.get('body').then(($b2) => {
      const visiveis = [...$b2.find(SELETORES_BOTAO).toArray()].filter((el) =>
        Cypress.dom.isVisible(el)
      );
      const jaTemFinal = visiveis.some((el) => casaComTextoFinalizarPedido(el));
      const aindaAvancar = visiveis.some((el) =>
        /avan[cç]ar\s+para\s+(a\s+)?revis[aã]o|continuar\s+para\s+revis/i.test(
          textoAcumuladoElemento(el)
        )
      );
      if (!jaTemFinal && aindaAvancar) {
        cy.log('ℹ️ Reforço: ainda na etapa anterior ao CTA final — clicando Avançar para revisão de novo.');
        clicarAvancarParaRevisao();
        tratarModaisTransientes();
        aguardarTela('revisão após reforço de avançar');
      }
    });
  });

  cy.contains('body', REGEX_INDICIOS_ETAPA_REVISAR_PEDIDO, { timeout: STEP_TIMEOUT }).should('be.visible');
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
  avancarCarrinhoAteEtapaRevisarPedido(opts);

  clicarFinalizarPedido();
  tratarModaisTransientes();
  cy.wait(1500);

  cy.window().then((win) => {
    const href = `${win.location.pathname}${win.location.search}${win.location.hash}`;
    const texto = (win.document.body && win.document.body.innerText) || '';
    const urlOkJa =
      /finalize-order|confirm-order|order-complete|checkout\/success|\/placed\b|thank-you|\bfinalize\b(?=\/|$)/i.test(
        href
      );
    const txtJa = /seu\s+pedido\s+foi\s+enviado|pedido\s+(realizado|finalizado|efetivado|confirmado|enviado)/i.test(
      texto
    );

    if (urlOkJa || txtJa) {
      cy.log('✅ Após finalize: URL ou texto já indicam avanço/sucesso');
      return;
    }

    cy.log('ℹ️ Sem confirmação imediata (ex.: SPA/modal) — segunda tentativa de CTA finalize');
    clicarFinalizarPedido();
    tratarModaisTransientes(8000);
    cy.wait(800);
  });

  aguardarTela('confirmação do pedido carregada');

  validarPedidoEnviado();
};
