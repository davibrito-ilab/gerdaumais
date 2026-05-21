import ComprarPage from '../../pages/comprarPage/comprarPageMetods';
import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  STEP_TIMEOUT,
  ROTA_COMPRAR_LANDING,
  acessarComprarLanding,
  selecionarEmissorDoPedido,
  clicarBotaoPorTexto,
  aguardarTela,
  irParaCarrinhoViaHeader,
  finalizarPedidoNoCarrinho,
} from '../../support/helpers/fluxoCompra';

const EMISSOR_ESPERADO =
  Cypress.env('emissor') || 'ACOS FAVORIT DISTRIBUIDORA LTDA';

describe('Compra sem emissor', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@smoke @critical Bloqueia avanço da compra sem emissor', { retries: 0 }, () => {
    allure.step('Acessa tela de compra sem selecionar emissor', () => {
      acessarComprarLanding();
    });

    allure.step('Tenta clicar em "Comprar por Vitrine" sem emissor selecionado', () => {
      cy.contains('button, [role="button"], .hefesto-button', /comprar\s+por\s+vitrine/i, {
        timeout: STEP_TIMEOUT,
      })
        .filter(':visible')
        .first()
        .scrollIntoView()
        .click({ force: true });
      cy.wait(2000);
    });

    allure.step('Valida bloqueio de avanço sem emissor (URL permanece na landing OU exibe validação)', () => {
      cy.url({ timeout: STEP_TIMEOUT }).then((urlAtual) => {
        const aindaNaLanding = urlAtual.includes(ROTA_COMPRAR_LANDING);
        if (aindaNaLanding) {
          expect(aindaNaLanding, 'URL ainda na landing de Comprar').to.eq(true);
          return;
        }
        cy.get('body').should(($body) => {
          const texto = ($body.text() || '').toLowerCase();
          const possuiMensagemValidacao =
            /selecione\s+um\s+emissor|obrigat[óo]rio|campo\s+obrigat[óo]rio/i.test(texto);
          expect(possuiMensagemValidacao, 'mensagem de validação de emissor').to.eq(true);
        });
      });
    });
  });

  it('@regression @p2 Compra efetiva após selecionar emissor na landing', () => {
    allure.step(`Seleção "${EMISSOR_ESPERADO}" + vitrine + envio`, () => {
      acessarComprarLanding();
      selecionarEmissorDoPedido(EMISSOR_ESPERADO);
      aguardarTela('emissor confirmado, cards habilitados');

      clicarBotaoPorTexto('Comprar por Vitrine', /comprar\s+por\s+vitrine/i);
      cy.url({ timeout: STEP_TIMEOUT }).should('include', '/purchase/long-steel/commerce/catalog');
      aguardarTela('catálogo da vitrine carregado');

      ComprarPage.adicionarPrimeiroProdutoDaListaAoCarrinho();
      irParaCarrinhoViaHeader(ComprarPage);
      finalizarPedidoNoCarrinho();
      cy.screenshot('compra-sem-emissor-pedido-efetivado');
    });
  });
});
