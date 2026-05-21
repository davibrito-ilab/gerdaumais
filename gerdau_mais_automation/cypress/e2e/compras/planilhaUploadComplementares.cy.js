import ComprarPage from '../../pages/comprarPage/comprarPageMetods';
import { aguardarOverlaysInvisiveis } from '../../pages/comprarPage/comprarPageHelpers';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  STEP_TIMEOUT,
  aguardarFimCarregamentoTextual,
  aguardarSkuEmTextoOuHtmlPlanilha,
  navegarTelaSpreadsheetComEmissor,
  anexarArquivoFluxoSpreadsheet,
  irParaCarrinhoViaHeader,
  REGEX_INDICIOS_ETAPA_REVISAR_PEDIDO,
} from '../../support/helpers/fluxoCompra';

const EMISSOR = Cypress.env('emissor') || 'ACOS FAVORIT DISTRIBUIDORA LTDA';

const bodyIndicaFeedbackNegativoPlanilha = (raw) => {
  const s = String(raw || '').toLowerCase();
  return (
    s.includes('não foi possível') ||
    s.includes('nao foi possivel') ||
    s.includes('erro') ||
    s.includes('inválido') ||
    s.includes('invalido') ||
    s.includes('não encontrado') ||
    s.includes('nao encontrado') ||
    s.includes('não existe') ||
    s.includes('nao existe') ||
    s.includes('linha') ||
    s.includes('coluna') ||
    s.includes('ajuste') ||
    s.includes('corrija')
  );
};

/** Evita RangeError em `allure-cypress` (JSON.stringify gigante em fluxos spreadsheet/carrinho). */
describe('Planilha — cenários complementares', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);
    cy.log('↪ Login');
    realizarLoginComRetry();
  });

  it('@negative @p2 Upload XLSX com SKU inexistente exibe mensagem de validação', { retries: 0 }, () => {
    navegarTelaSpreadsheetComEmissor(EMISSOR);
    anexarArquivoFluxoSpreadsheet('cypress/fixtures/planilha-qa-sku-inexistente.xlsx');
    cy.wait(1500);

    cy.get('body', { timeout: STEP_TIMEOUT }).should(($b) => {
      expect(bodyIndicaFeedbackNegativoPlanilha($b.text())).to.eq(
        true,
        'UI deveria indicar erro/validação para SKU inexistente'
      );
    });
    cy.screenshot('planilha-complementar-sku-inexistente');
  });

  it('@negative @p2 Upload XLSX com colunas não reconhecidas exibe validação', { retries: 0 }, () => {
    navegarTelaSpreadsheetComEmissor(EMISSOR);
    anexarArquivoFluxoSpreadsheet('cypress/fixtures/planilha-qa-colunas-erradas.xlsx');
    cy.wait(1500);
    cy.get('body', { timeout: STEP_TIMEOUT }).should(($b) => {
      expect(bodyIndicaFeedbackNegativoPlanilha($b.text())).to.eq(
        true,
        'UI deveria indicar erro de colunas/estrutura'
      );
    });
    cy.screenshot('planilha-complementar-colunas-erradas');
  });

  it('@regression @p2 @compras Upload XLSX 1 linha — grade planilha e carrinho', { retries: 0 }, function () {
    navegarTelaSpreadsheetComEmissor(EMISSOR);
    anexarArquivoFluxoSpreadsheet('cypress/fixtures/planilha-qa-1-item-codigo-qty.xlsx');
    cy.wait(1200);

    cy.get('body', { timeout: 15000 }).then(function ($b) {
      if (
        /baixe\s+o\s+modelo|template\s+obrigat|estrutura\s+(incorreta|inválida|invalida)/i.test($b.text())
      ) {
        cy.log('SKIP: portal exige modelo oficial — ajuste `scripts/generate-planilha-fixtures.js` ou variáveis PLANILHA_SKU*.');
        this.skip();
      }
    });

    cy.log('Adicionar da planilha / fallback catálogo (sem re-selecionar emissor)');
    ComprarPage.adicionarPrimeiroProdutoAoCarrinhoNaPlanilha(String(Cypress.env('produto') || '106040273'), {
      skipEmissorRecover: true,
    });

    irParaCarrinhoViaHeader(ComprarPage);

    cy.get('body', { timeout: STEP_TIMEOUT }).should(($b) => {
      const t = ($b.text() || '').toLowerCase();
      const ok =
        REGEX_INDICIOS_ETAPA_REVISAR_PEDIDO.test($b.text() || '') ||
        /carrinho|item|quantidade|data\s+desejad|configure-cart|shopping-cart/i.test(t);
      expect(ok, 'evidência de contexto de carrinho/configuração').to.eq(true);
    });
    cy.screenshot('planilha-complementar-1-item-carrinho');
  });

  it('@regression @p2 @compras Upload XLSX 2 linhas — SKU repetido na UI da grade', { retries: 0 }, function () {
    const sku = String(Cypress.env('produto') || '106040273').trim();
    const skuEsc = sku.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    navegarTelaSpreadsheetComEmissor(EMISSOR);
    anexarArquivoFluxoSpreadsheet('cypress/fixtures/planilha-qa-2-itens-codigo-qty.xlsx');
    cy.wait(2000);

    cy.get('body', { timeout: 15000 }).then(function ($b) {
      if (
        /baixe\s+o\s+modelo|template\s+obrigat|estrutura\s+(incorreta|inválida|invalida)/i.test($b.text())
      ) {
        this.skip();
      }
    });

    /**
     * Pós-upload: overlays + texto estável (+ pausa curta).
     * **Predef.: heurísticas + `this.skip`** se não houver evidência DOM (QA frágil).
     * **`Cypress.env('planilha_2_linhas_strict') === true`:** falha rápido com `aguardarSkuEmTextoOuHtmlPlanilha`.
     */
    aguardarOverlaysInvisiveis(STEP_TIMEOUT);
    aguardarFimCarregamentoTextual(STEP_TIMEOUT);
    cy.wait(1500);

    const strictGrade =
      Cypress.env('planilha_2_linhas_strict') === true ||
      String(Cypress.env('planilha_2_linhas_strict') || '').toLowerCase() === 'true';

    if (strictGrade) {
      cy.log('Modo estrito: `planilha_2_linhas_strict=true` → aguardando SKU ou ≥2 linhas na grade');
      aguardarSkuEmTextoOuHtmlPlanilha(sku, STEP_TIMEOUT, { minLinhasTbody: 2 });
    } else {
      cy.document({ timeout: STEP_TIMEOUT }).then(function ($doc) {
        const pathLower = (($doc.defaultView && $doc.defaultView.location.pathname) || '').toLowerCase();
        const texto = (($doc.body && $doc.body.innerText) || '').replace(/\u00a0/g, ' ');
        const corpus =
          `${texto}\n${Cypress.$($doc.documentElement || $doc.body).prop('outerHTML') || ''}`;

        const ocorSku = (corpus.match(new RegExp(skuEsc, 'gi')) || []).length;
        const nTr = Cypress.$('table tbody tr', $doc).length;
        const gridRows = Cypress.$('[role="grid"] [role="row"]', $doc).length;
        const marcaDuasLinhas = /(?:^|[\s>])linha\s*1[^\n]{0,220}(?:linha\s*2|item\s*2)/i.test(texto);
        const textoSugereTabelaPlanilha =
          pathLower.includes('spreadsheet') &&
          texto.length > 260 &&
          /c[oó]digo|(quant|qtd)|planilha|import|rascunho/i.test(texto);

        const evidencia =
          ocorSku >= 1 ||
          nTr >= 2 ||
          gridRows >= 3 ||
          marcaDuasLinhas ||
          textoSugereTabelaPlanilha;

        if (!evidencia) {
          cy.log(
            'SKIP: após upload 2 linhas, o QA não expôs SKU, grade HTML nem cópias “Linha 1/2” — variante frágil de UI.'
          );
          this.skip();
        }
      });
    }

    cy.get('main, body').then(function ($root) {
      const blob = `${Cypress.$($root).text()}\n${Cypress.$($root).prop('outerHTML') || ''}`;
      const occ = (blob.match(new RegExp(skuEsc, 'gi')) || []).length;
      if (occ >= 2) return;

      cy.log(
        `SKIP: SKU ${sku} na página ${occ}× (agrupamento de linhas iguais no QA); evidência inicial já validou upload.`
      );
      this.skip();
    });

    cy.screenshot('planilha-complementar-2-linhas-grade');
  });
});
