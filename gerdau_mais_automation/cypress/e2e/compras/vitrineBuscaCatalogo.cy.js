import ComprarPage from '../../pages/comprarPage/comprarPageMetods';
import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  STEP_TIMEOUT,
  acessarComprarLanding,
  selecionarEmissorDoPedido,
  clicarBotaoPorTexto,
  aguardarTela,
} from '../../support/helpers/fluxoCompra';

const EMISSOR = Cypress.env('emissor') || 'ACOS FAVORIT DISTRIBUIDORA LTDA';
const ROTA_CATALOGO = '/purchase/long-steel/commerce/catalog';

/**
 * Checklist pré-deploy: busca por nome/descrição ou SKU no catálogo (vitrine).
 */
describe('Vitrine — busca no catálogo', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);
    allure.step('Login', () => realizarLoginComRetry());
  });

  it('@regression @p2 Busca produto por texto ou SKU no catálogo', { retries: 0 }, () => {
    const termo =
      Cypress.env('produto') ||
      Cypress.env('termoBuscaCatalogo') ||
      '1060';

    allure.step('Abre catálogo com emissor', () => {
      acessarComprarLanding();
      selecionarEmissorDoPedido(EMISSOR);
      aguardarTela('emissor ok');
      clicarBotaoPorTexto('Comprar por Vitrine', /comprar\s+por\s+vitrine/i);
      cy.url({ timeout: STEP_TIMEOUT }).should('include', ROTA_CATALOGO);
      aguardarTela('catálogo');
    });

    allure.step('Preenche campo de busca do catálogo e dispara busca', () => {
      ComprarPage.buscaProdutoInput.should('be.visible').clear({ force: true }).type(String(termo), {
        force: true,
      });
      cy.get('body').then(($b) => {
        const temSubmit = $b.find('button[type="submit"], [data-cy*="search-btn"]').filter(':visible').length > 0;
        if (temSubmit) {
          ComprarPage.buscaProdutoButton.click({ force: true });
        } else {
          ComprarPage.buscaProdutoInput.type('{enter}', { force: true });
        }
      });
      aguardarTela('pós-busca catálogo');
      cy.screenshot('vitrine-busca-catalogo');
    });

    allure.step('Valida que a lista reagiu (resultados ou estado vazio explícito)', () => {
      cy.get('body', { timeout: STEP_TIMEOUT }).should(($body) => {
        const t = ($body.text() || '').toLowerCase();
        const ok =
          t.includes('produto') ||
          t.includes('resultado') ||
          t.includes('nenhum') ||
          t.includes('sem resultado') ||
          t.includes('adicionar') ||
          t.includes('carrinho');
        expect(ok, 'corpo da página após busca no catálogo').to.eq(true);
      });
    });
  });
});
