import { aguardarBodyVisivel } from './uiReady';
import { aguardarOverlaysInvisiveis } from '../../pages/comprarPage/comprarPageHelpers';

/**
 * Evidência forte de estar na etapa do carrinho (não confundir com “carrinho” só no header do catálogo).
 */
const REGEX_ETAPA_CARRINHO_FORTE =
  /configurar\s+carrinho|step\s*2\s+de\s+4|step\s*2\s+of\s+4|step\s*2\s*\/\s*4|etapa\s*2|dados\s+do\s+carrinho|resumo\s+do\s+carrinho|itens\s+do\s+pedido|avan[cç]ar\s+para\s+o\s+carrinho|resumo\s+da\s+compra/i;

/** Exportado para asserts em specs, se necessário. */
export const REGEX_TEXTO_ETAPA_CARRINHO = REGEX_ETAPA_CARRINHO_FORTE;

const pathCatalogoOuBusca = (path) => /\/commerce\/catalog|\/search-items/i.test(path || '');

const urlIndicaRotaCarrinho = (path) =>
  /\/cart(\/|$|\?|#)|\/carrinho(\/|$|\?|#)|configure-cart|shopping-cart|\/checkout(\/|$)/i.test(path || '');

const atingiuEtapaCarrinho = (win) => {
  const texto = (win.document.body?.innerText || win.document.body?.textContent || '').toLowerCase();
  const path = (win.location.pathname + win.location.search + win.location.hash).toLowerCase();

  const forte = REGEX_ETAPA_CARRINHO_FORTE.test(texto);
  if (pathCatalogoOuBusca(path)) {
    return forte;
  }
  return forte || urlIndicaRotaCarrinho(path);
};

const tentarVisitCarrinhoSeAindaCatalogo = () => {
  cy.url().then((url) => {
    if (!pathCatalogoOuBusca(url)) return;
    cy.log('⚠️ Ainda em catálogo/busca após tentativas; tentando rota direta de carrinho.');
    cy.visit('/purchase/long-steel/commerce/cart', { failOnStatusCode: false });
    aguardarBodyVisivel(30000);
    aguardarOverlaysInvisiveis(60000);
  });
};

/**
 * Após “adicionar ao carrinho”, reforça emissor e aciona CTA até evidência forte de etapa carrinho
 * (no catálogo/busca não basta URL genérica — evita falso positivo).
 */
export const garantirChegadaAoPassoCarrinho = (ComprarPage, timeout = 120000) => {
  const tentarAvancarUmaVez = () => {
    cy.window().then((win) => {
      if (atingiuEtapaCarrinho(win)) return;

      cy.log('⏳ Ainda fora da etapa do carrinho; reforça emissor e aciona CTA de avanço.');
      ComprarPage.selecionaEmissorCorretamente();
      ComprarPage.clicarEmBotaoInk();
      aguardarOverlaysInvisiveis(90000);
    });
  };

  aguardarOverlaysInvisiveis(90000);
  aguardarOverlaysInvisiveis(90000);

  tentarAvancarUmaVez();
  tentarAvancarUmaVez();
  tentarAvancarUmaVez();
  tentarAvancarUmaVez();
  tentarAvancarUmaVez();
  tentarAvancarUmaVez();
  tentarAvancarUmaVez();
  tentarAvancarUmaVez();

  tentarVisitCarrinhoSeAindaCatalogo();

  cy.window({ timeout }).should((win) => {
    expect(atingiuEtapaCarrinho(win), 'etapa do carrinho (texto step 2 / resumo / rota de carrinho fora do catálogo)').to.eq(true);
  });
};

/**
 * Fluxo comum de checkout em 4 etapas (carrinho → revisar → finalizar → confirmação).
 */
export const finalizarPedidoE2E = (ComprarPage) => {
  const stepTimeout = 120000;
  const overlayWait = 120000;

  garantirChegadaAoPassoCarrinho(ComprarPage, stepTimeout);

  aguardarOverlaysInvisiveis(60000);
  ComprarPage.clicarEmBotaoInk();
  aguardarBodyVisivel(30000);
  aguardarOverlaysInvisiveis(overlayWait);

  cy.contains(
    'body',
    /revis(ar|ão)\s+pedido|revis(ar|ao)\s+pedido|step\s*3\s+de\s+4|step\s*3\s+of\s+4|step\s*3\s*\/\s*4|etapa\s*3|confer(ência|encia)\s+do\s+pedido|confirmar\s+dados|revis(ão|ao)\s+da\s+compra/i,
    { timeout: stepTimeout }
  ).should('be.visible');
  ComprarPage.clicarEmBotaoInk();
  aguardarBodyVisivel(30000);
  aguardarOverlaysInvisiveis(overlayWait);

  cy.contains(
    'body',
    /finalizar\s+pedido|step\s*4\s+de\s+4|step\s*4\s+of\s+4|step\s*4\s*\/\s*4|etapa\s*4|confirmar\s+pedido|fechar\s+pedido|efetivar(\s+pedido)?|enviar\s+pedido|confirmar\s+compra|concluir\s+(pedido|compra)|gerar\s+pedido|place\s+order|submit\s+order/i,
    { timeout: stepTimeout }
  ).should('be.visible');
  ComprarPage.clicarEmBotaoInk();
  aguardarBodyVisivel(30000);
};

export const assertPedidoEfetivado = () => {
  cy.window({ timeout: 120000 }).should((win) => {
    const texto = (win.document.body?.innerText || win.document.body?.textContent || '').toLowerCase();
    const path = (win.location.pathname + win.location.search + win.location.hash).toLowerCase();

    const urlOk =
      /success|confirm|conclu[ií]d|finalizad|thank|obrigad|order-complete|pedido-sucesso|resumo.*pedido/i.test(path);

    const textoOk =
      texto.includes('pedido finalizado') ||
      texto.includes('pedido realizado') ||
      texto.includes('pedido criado') ||
      texto.includes('pedido registrado') ||
      texto.includes('pedido efetuado') ||
      texto.includes('pedido enviado') ||
      texto.includes('compra concluída') ||
      texto.includes('compra concluida') ||
      texto.includes('compra realizada') ||
      texto.includes('compra registrada') ||
      texto.includes('número do pedido') ||
      texto.includes('numero do pedido') ||
      texto.includes('código do pedido') ||
      texto.includes('codigo do pedido') ||
      texto.includes('seu pedido foi') ||
      texto.includes('recebemos seu pedido') ||
      texto.includes('recebemos o seu pedido') ||
      texto.includes('registrado com sucesso') ||
      texto.includes('sucesso na compra') ||
      texto.includes('pedido confirmado') ||
      texto.includes('compra confirmada') ||
      texto.includes('protocolo') ||
      texto.includes('order placed') ||
      texto.includes('order confirmed') ||
      texto.includes('thank you') ||
      (texto.includes('obrigad') && (texto.includes('pedido') || texto.includes('compra'))) ||
      /\bpedido\s*#?\s*\d{3,}\b/i.test(texto) ||
      /\bn[úu]mero\s*do\s*pedido\s*:?\s*\d{2,}\b/i.test(texto) ||
      /\bpedido\s*:\s*\d{2,}\b/i.test(texto) ||
      /\bc[óo]digo\s*:?\s*\d{4,}\b/i.test(texto);

    expect(urlOk || textoOk, 'confirmação de pedido finalizado (URL ou texto)').to.eq(true);
  });
};
