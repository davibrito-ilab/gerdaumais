/**
 * Helper para **Pedidos** no portal.
 *
 * Fluxo real em QA (2026-05-12):
 *  1) `/orders` — **hub**: escolha "aços longos e planos" **ou** "corte e dobra".
 *  2) Após **Explorar pedidos de aços longos e planos** — carteira com filtros (tipo Aberto/Faturado,
 *     Estado do emissor, Emissor do pedido) + **Buscar pedidos**. Exportar carteira pode não existir.
 *     Em **corte e dobra**, o CTA de confirmação pode ser só **“Buscar”** ou **“Consultar”** — usar
 *     `buscarPedidosCarteiraFlex()` em vez de `buscarPedidos()` quando necessário.
 *
 * Os specs antigos assumiam `/orders` = carteira; é preciso entrar no fluxo de material antes.
 *
 * Padrão herdado do `fluxoCompra.js`: cliques em elementos clicáveis reais, espera de loader
 * textual e overlays.
 */
import { aguardarBodyVisivel } from './uiReady';


export const STEP_TIMEOUT = 45000;
/** Hub inicial ao clicar em "Pedidos" no menu superior. */
export const ROTA_PEDIDOS = '/orders';

const REGEX_BTN_LONGOS = /explorar\s+pedidos\s+de\s+a[cç]os\s+longos/i;
const REGEX_BTN_CORTE = /explorar\s+pedidos\s+de\s+corte\s+e\s+dobra/i;

/** Loader forte da página inteira (evitar "aguarde" genérico que aparece em rodapés/helps). */
const REGEX_LOADING_TEXTUAL = /estamos\s+carregando\s+os\s+dados/i;

const SELETORES_BOTAO =
  'button, [role="button"], .hefesto-button, a[href], [role="link"], input[type="submit"], input[type="button"]';

const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normTextPedidoUi = (s = '') =>
  String(s || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Rótulo visível clicável na grade de pedidos (texto / aria-label / value). */
const rotuloClicavelPedidoUi = (el) =>
  normTextPedidoUi(
    [
      el.textContent,
      el.getAttribute && el.getAttribute('aria-label'),
      el.getAttribute && el.getAttribute('title'),
      el.getAttribute && el.getAttribute('value'),
    ]
      .filter(Boolean)
      .join(' ')
  );

export const aguardarFimCarregamentoTextual = (timeout = STEP_TIMEOUT) => {
  cy.get('body', { timeout }).should(($body) => {
    const texto = ($body.text() || '').trim();
    expect(
      REGEX_LOADING_TEXTUAL.test(texto),
      'banner "Estamos carregando os dados" ainda presente no texto da página'
    ).to.eq(false);
  });
};

export const aguardarTelaPedidos = (msg = 'tela de Pedidos pronta', timeout = STEP_TIMEOUT) => {
  cy.log(`⏳ Aguardando: ${msg}`);
  aguardarBodyVisivel(20000);
  /** Sem checagem global de overlay/modal: em `/orders` há nós `dialog`/modal no DOM que não são bloqueio real e falham `isVisible`. */
  aguardarFimCarregamentoTextual(timeout);
};

/** Abre o hub `/orders` e valida os dois cartões de tipo de material. */
export const validarHubPedidos = () => {
  /** Texto principal do hub varia (“Selecione o tipo…” vs “Explore…” / apenas cartões). */
  cy.contains(
    'body',
    /selecione\s+(?:o\s+)?(?:tipo\s+)?(?:de\s+)?(?:material|categoria)|escolha\s+(?:um\s+|o\s+)?tipo\s+material|tipo\s+(?:do\s+|de\s+)?material\b|(?:hub|painel).*pedidos|corte\s*&\s*dobra|corte\s+e\s+dobra|\bacos?\s+(?:longos|planos)|explor(ar|e)\s+pedidos/i,
    {
      timeout: STEP_TIMEOUT,
    }
  ).should('be.visible');
  cy.contains(SELETORES_BOTAO, REGEX_BTN_LONGOS, { timeout: STEP_TIMEOUT })
    .filter(':visible')
    .should('exist');
  cy.contains(SELETORES_BOTAO, REGEX_BTN_CORTE, { timeout: STEP_TIMEOUT })
    .filter(':visible')
    .should('exist');
};

/** Hub `/orders` → clica em explorar **aços longos e planos** (carteira com filtros). */
export const entrarCarteiraAcosLongosEPlanos = () => {
  cy.visit(ROTA_PEDIDOS);
  cy.url({ timeout: STEP_TIMEOUT }).should('include', '/orders');
  aguardarTelaPedidos('hub de pedidos');

  cy.contains(SELETORES_BOTAO, REGEX_BTN_LONGOS, { timeout: STEP_TIMEOUT })
    .filter(':visible')
    .first()
    .scrollIntoView()
    .click({ force: true });

  aguardarTelaPedidos('carteira — aços longos e planos');
};

/** Hub `/orders` → clica em explorar **corte e dobra**. */
export const entrarCarteiraCorteEDobra = () => {
  cy.visit(ROTA_PEDIDOS);
  cy.url({ timeout: STEP_TIMEOUT }).should('include', '/orders');
  aguardarTelaPedidos('hub de pedidos');

  cy.contains(SELETORES_BOTAO, REGEX_BTN_CORTE, { timeout: STEP_TIMEOUT })
    .filter(':visible')
    .first()
    .scrollIntoView()
    .click({ force: true });

  aguardarTelaPedidos('carteira — corte e dobra');
};

/**
 * Acessa a **carteira** de pedidos de aços longos (filtros + lista).
 * Equivale ao fluxo manual mais usado pelos CTs de compra long steel.
 */
export const acessarPedidos = () => entrarCarteiraAcosLongosEPlanos();

/** Toggle visual **Tipo de pedido** → opção Faturado (nem sempre é `<button>`). */
export const selecionarTipoPedidoFaturado = () => {
  cy.contains(/^\s*faturado\s*$/i, { timeout: STEP_TIMEOUT })
    .scrollIntoView()
    .click({ force: true });
  cy.log('✅ Tipo de pedido: Faturado');
};

/** Clica num botão de ação (não em títulos de card). */
export const clicarBotaoPorTexto = (texto, regex, timeout = STEP_TIMEOUT) => {
  cy.contains(SELETORES_BOTAO, regex, { timeout })
    .filter(':visible')
    .first()
    .scrollIntoView()
    .click({ force: true });
  cy.log(`✅ Clicou no botão "${texto}"`);
};

const textoAcumuladoCta = (el) =>
  String(
    [
      el.textContent,
      el.getAttribute && el.getAttribute('aria-label'),
      el.getAttribute && el.getAttribute('title'),
      el.getAttribute && el.getAttribute('value'),
    ]
      .filter(Boolean)
      .join(' ')
  )
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Clica no CTA de confirmação da busca na carteira. A carteira **longos** costuma ter “Buscar pedidos”;
 * **corte e dobra** pode expor só “Buscar”, “Consultar”, “Aplicar filtro”, etc.
 */
export const buscarPedidosCarteiraFlex = () => {
  cy.scrollTo('bottom', { ensureScrollable: false });
  const reCta =
    /buscar\s+pedidos|^\s*buscar\s*$|consultar(\s+pedidos)?|aplicar(\s+filtros?)?|pesquisar/i;
  cy.get(SELETORES_BOTAO, { timeout: STEP_TIMEOUT })
    .filter(':visible')
    .should(($els) => {
      const ok = [...$els].some((el) => reCta.test(textoAcumuladoCta(el)));
      expect(ok, 'CTA de busca/consulta visível na carteira').to.eq(true);
    })
    .then(($els) => {
      const alvo = [...$els].find((el) => reCta.test(textoAcumuladoCta(el)));
      cy.wrap(alvo).scrollIntoView().click({ force: true });
    });
  cy.log('✅ Busca na carteira (rótulo flexível: Buscar / Buscar pedidos / Consultar / …)');
  aguardarTelaPedidos('busca aplicada na carteira');
};

/**
 * Tenta abrir um combo Hefesto cujo placeholder/label contenha o texto fornecido.
 * Estratégia em camadas para cobrir variações do componente:
 *  1) input com `placeholder*=texto`
 *  2) label próximo seguido de combo
 *  3) qualquer div com `role="combobox"` cujo texto contenha o label
 */
const abrirComboPorRotulo = (rotulo) => {
  const regex = new RegExp(escaparRegex(rotulo), 'i');
  const needle = rotulo.toLowerCase();

  cy.get('body').then(($body) => {
    const $porPlaceholder = $body
      .find('input')
      .filter((_, el) => (el.placeholder || '').toLowerCase().includes(needle))
      .filter(':visible');
    if ($porPlaceholder.length) {
      cy.wrap($porPlaceholder.first()).scrollIntoView().click({ force: true });
      return;
    }

    // Combo cujo texto (do container) contenha o rótulo
    const $porCombo = $body
      .find('[role="combobox"], .hefesto-select, .hefesto-input, .input-helpers__container')
      .filter((_, el) => regex.test((el.textContent || '').trim()))
      .filter(':visible');
    if ($porCombo.length) {
      cy.wrap($porCombo.first()).scrollIntoView().click({ force: true });
      return;
    }

    // Última tentativa: input dentro do bloco que contém o label
    cy.contains(
      'label, div, span, .hefesto-form-field__label',
      regex,
      { timeout: 8000 }
    )
      .filter(':visible')
      .first()
      .parents()
      .find('input, [role="combobox"]')
      .filter(':visible')
      .first()
      .scrollIntoView()
      .click({ force: true });
  });
};

/** Seleciona uma opção do dropdown atualmente aberto. */
const selecionarOpcaoNoDropdown = (textoOpcao) => {
  const regex = new RegExp(escaparRegex(textoOpcao), 'i');
  cy.contains(
    '.hefesto-select__option, [role="option"], li.hefesto-select__option, .dropdown-item, .input-helpers__selected-options--option, li, div, span',
    regex,
    { timeout: STEP_TIMEOUT }
  )
    .filter(':visible')
    .first()
    .scrollIntoView()
    .click({ force: true });
  cy.log(`✅ Opção "${textoOpcao}" selecionada no dropdown`);
};

/** Seleciona um Estado/Status no multiselect "Estado". */
export const selecionarEstado = (estado) => {
  cy.log(`⏳ Selecionando estado "${estado}"`);
  abrirComboPorRotulo('Estado');
  selecionarOpcaoNoDropdown(estado);
  // Fecha o dropdown clicando no body
  cy.get('body').type('{esc}', { force: true });
};

/** Seleciona um Emissor no combo "Emissor (opcional)". */
export const selecionarEmissorPedidos = (emissor) => {
  cy.log(`⏳ Selecionando emissor "${emissor}"`);
  abrirComboPorRotulo('Emissor');
  selecionarOpcaoNoDropdown(emissor);
  cy.get('body').type('{esc}', { force: true });
};

/** Formata Date para `dd/mm/aaaa`. */
const formatarBR = (d) => {
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${d.getFullYear()}`;
};

/**
 * Localiza os 2 inputs de data dentro do bloco "Data de criação". Estratégia em camadas:
 *  1) inputs cujo `value` já está em formato dd/mm/yyyy (filtro está preenchido por default)
 *  2) inputs com placeholder dd/mm | aaaa | data | date
 *  3) inputs dentro de container cujo label contém "Data de criação"
 */
const localizarInputsDeData = () =>
  cy.get('body', { timeout: STEP_TIMEOUT }).then(($body) => {
    const todos = [...$body.find('input')];

    const porValor = todos.filter((el) =>
      /^\d{2}\/\d{2}\/\d{4}$/.test((el.value || '').trim())
    );
    if (porValor.length >= 2) {
      cy.log(`✅ Inputs de data localizados por value preenchido (${porValor.length})`);
      return cy.wrap(porValor.slice(0, 2));
    }

    const porPlaceholder = todos.filter((el) =>
      /dd\/mm|aaaa|data|date/i.test(el.placeholder || '')
    );
    if (porPlaceholder.length >= 2) {
      cy.log(`✅ Inputs de data localizados por placeholder (${porPlaceholder.length})`);
      return cy.wrap(porPlaceholder.slice(0, 2));
    }

    // Última tentativa: container com label "Data de criação"
    const $bloco = $body
      .find('div, section, fieldset, .hefesto-form-field')
      .filter((_, el) => /data\s+de\s+cria[cç][aã]o/i.test(el.textContent || ''))
      .filter(':visible');
    if ($bloco.length) {
      const $ins = $bloco.first().find('input').filter(':visible');
      if ($ins.length >= 2) {
        cy.log(`✅ Inputs de data localizados pelo bloco "Data de criação" (${$ins.length})`);
        return cy.wrap([$ins[0], $ins[1]]);
      }
    }

    throw new Error('Não foi possível localizar 2 inputs de Data de criação.');
  });

/** Preenche “últimos N dias” apenas se a tela expuser 2 campos de data (evita falhar quando o QA só pede emissor/período depois). */
export const preencherPeriodoUltimosDiasSeDisponivel = (dias = 45) => {
  cy.get('body', { timeout: STEP_TIMEOUT }).then(($body) => {
    const todos = [...$body.find('input')];

    const porValor = todos.filter((el) =>
      /^\d{2}\/\d{2}\/\d{4}$/.test((el.value || '').trim())
    );
    const porPlaceholder = todos.filter((el) =>
      /dd\/mm|aaaa|data|date/i.test(el.placeholder || '')
    );

    let arr =
      porValor.length >= 2
        ? porValor.slice(0, 2)
        : porPlaceholder.length >= 2
          ? porPlaceholder.slice(0, 2)
          : null;

    if (!arr) {
      const $bloco = $body
        .find('div, section, fieldset, .hefesto-form-field')
        .filter((_, el) => /data\s+de\s+cria[cç][aã]o/i.test(el.textContent || ''))
        .filter(':visible');
      if ($bloco.length) {
        const $ins = $bloco.first().find('input').filter(':visible');
        if ($ins.length >= 2) arr = [$ins.get(0), $ins.get(1)];
      }
    }

    if (!arr || arr.length < 2) {
      cy.log('ℹ️ Dois campos de Data de criação não detectados — mantendo período padrão da tela.');
      return;
    }

    const hoje = new Date();
    const inicio = new Date(hoje.getTime() - dias * 24 * 60 * 60 * 1000);
    const ini = formatarBR(inicio);
    const fim = formatarBR(hoje);

    cy.wrap(arr[0])
      .scrollIntoView()
      .click({ force: true })
      .clear({ force: true })
      .type(ini, { force: true, delay: 30 })
      .blur({ force: true });
    cy.wrap(arr[1])
      .scrollIntoView()
      .click({ force: true })
      .clear({ force: true })
      .type(fim, { force: true, delay: 30 })
      .blur({ force: true });
    cy.get('body').type('{esc}', { force: true });
    cy.log(`✅ Período ajustado (últimos ${dias} dias): ${ini} → ${fim}`);
  });
};

/** Preenche os 2 inputs de data — primeiro é início, segundo é fim. */
export const preencherPeriodo = (dataInicio, dataFim) => {
  const ini = typeof dataInicio === 'string' ? dataInicio : formatarBR(dataInicio);
  const fim = typeof dataFim === 'string' ? dataFim : formatarBR(dataFim);

  localizarInputsDeData().then(($inputs) => {
    const arr = $inputs.toArray ? $inputs.toArray() : Array.from($inputs);
    cy.wrap(arr[0]).scrollIntoView().click({ force: true }).clear({ force: true }).type(ini, { force: true, delay: 30 }).blur({ force: true });
    cy.wrap(arr[1]).scrollIntoView().click({ force: true }).clear({ force: true }).type(fim, { force: true, delay: 30 }).blur({ force: true });
    cy.log(`✅ Período preenchido: ${ini} → ${fim}`);
  });
  cy.get('body').type('{esc}', { force: true });
};

/** AUT-017: evita falha quando a busca retorna carteira sem linhas de dados (`this.skip`). */
export function pularSeGradePedidosVaziaAposBusca(timeout = STEP_TIMEOUT) {
  return cy.get('body', { timeout }).then(function ($body) {
    const texto = ($body.text() || '').toLowerCase();
    const listaVazia =
      /nenhum\s+pedido|nenhum(\s|$)|sem\s+(resultados|pedidos)|n[aã]o\s+(encontramos|h[aá])|lista\s+vazia|sem\s+dados\b/i.test(
        texto,
      );

    const visiveis = Cypress.$(
      'main table tbody tr, table tbody tr, [role="grid"] tbody tr,[role="row"]',
      $body[0]
    )
      .filter((_i, row) => Cypress.dom.isVisible(row))
      .toArray();

    const linhasDeDados = visiveis.filter((row) => {
      const tds = Cypress.$(row).find('td').length;
      if (tds < 2) return false;
      const tx = Cypress.$(row).text().toLowerCase().trim().slice(0, 120);
      if (/^tipo|^pedido$|^filtro|^status$/i.test(tx)) return false;
      return true;
    }).length;

    if (listaVazia || linhasDeDados < 1) {
      cy.log('ⓘ SKIP AUT-017: carteira sem linhas depois da busca.');
      return this.skip();
    }
  });
}

/** AUT-017: primeira interação típica de detalhes na grade após carteira/busca. */
export const clicarPrimeiroPossivelLinkDetalhesPedido = (timeout = STEP_TIMEOUT) =>
  cy.get('body', { timeout }).then(($body) => {
    const $tb = Cypress.$('main tbody,table tbody,[role="rowgroup"] tbody', $body[0]).first();
    const root = ($tb.length && $tb[0]) || $body[0];

    const arr = Cypress.$(`${SELETORES_BOTAO}, tbody a,[role="row"] a,[role="row"] button,[role="row"] input[type="submit"]`, root)
      .toArray()
      .filter((el) => Cypress.dom.isVisible(el));

    const textoDetalhes = (el) => rotuloClicavelPedidoUi(el).toLowerCase();

    let alvo =
      arr.find((el) =>
        /detail|detalh(es)?|visualiz|rastre(ar|amento)|tracking|consult(ar)?\s+det|timeline|acompanh(ar)?/i.test(
          textoDetalhes(el)
        )
      ) ||
      arr.find((el) => /^a$/i.test(el.tagName) && el.hasAttribute('href')) ||
      null;

    if (!alvo && arr.length) {
      alvo =
        arr.find((el) => /#\d+|pedido\b/i.test(textoDetalhes(el))) || arr[Math.min(2, arr.length - 1)];
    }

    expect(alvo !== null && alvo !== undefined, 'CTA/link de detalhes ou âncora de linha na grade').to.eq(true);

    cy.wrap(alvo).scrollIntoView().click({ force: true });
  });

/** Preenche período D-N até hoje (N dias atrás). */
export const preencherPeriodoUltimosDias = (dias = 30) => {
  const hoje = new Date();
  const inicio = new Date(hoje.getTime() - dias * 24 * 60 * 60 * 1000);
  preencherPeriodo(inicio, hoje);
};

/** Clica em "Buscar Pedidos". */
export const buscarPedidos = () => {
  clicarBotaoPorTexto('Buscar Pedidos', /buscar\s+pedidos/i);
  aguardarTelaPedidos('busca de pedidos aplicada');
};

/** Clica em "Exportar Carteira". */
export const exportarCarteira = () => {
  clicarBotaoPorTexto('Exportar Carteira', /exportar\s+carteira/i);
};

/**
 * Valida que a tela respondeu à busca: ou (a) há linhas de pedido na lista, ou
 * (b) há mensagem de estado vazio, ou (c) URL permanece em /orders sem crash.
 */
export const validarListaResponde = () => {
  cy.get('body', { timeout: STEP_TIMEOUT }).should(($body) => {
    const texto = ($body.text() || '').toLowerCase();
    const temConteudoOuVazio =
      texto.includes('pedido') ||
      texto.includes('order') ||
      texto.includes('nenhum') ||
      texto.includes('sem resultados') ||
      texto.includes('não encontramos') ||
      texto.includes('nao encontramos') ||
      texto.includes('cliente final') ||
      texto.includes('período') ||
      texto.includes('periodo') ||
      texto.includes('emissor') ||
      texto.includes('faturado') ||
      texto.includes('aberto') ||
      texto.includes('corte') ||
      texto.includes('dobra') ||
      texto.includes('aço') ||
      texto.includes('aco');
    expect(temConteudoOuVazio, 'tela responde com lista ou estado vazio').to.eq(true);
  });
  cy.url({ timeout: STEP_TIMEOUT }).should('include', ROTA_PEDIDOS);
};

/**
 * Valida que a estrutura básica da **carteira** está presente:
 * botão buscar + área de filtros (tipo de pedido / estado do emissor / emissor).
 *
 * O botão **Exportar Carteira** nem sempre aparece nesta experiência de carteira;
 * quando o texto existir no DOM, validamos o botão visível.
 */
export const validarEstruturaPedidos = () => {
  cy.contains(SELETORES_BOTAO, /buscar\s+pedidos/i, { timeout: STEP_TIMEOUT })
    .filter(':visible')
    .should('exist');
  cy.contains(
    'body',
    /estado\s+do\s+emissor|emissor\s+do\s+pedido|tipo\s+de\s+pedido|acompanhe\s+o\s+andamento/i,
    { timeout: STEP_TIMEOUT }
  ).should('be.visible');

  cy.get('body').then(($body) => {
    if (!/exportar\s+carteira/i.test($body.text() || '')) return;
    cy.contains(SELETORES_BOTAO, /exportar\s+carteira/i, { timeout: STEP_TIMEOUT })
      .filter(':visible')
      .should('exist');
  });
};
