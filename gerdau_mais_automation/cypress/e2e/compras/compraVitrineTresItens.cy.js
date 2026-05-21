import ComprarPage from '../../pages/comprarPage/comprarPageMetods';
import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  acessarCatalogoVitrineComEmissor,
  aguardarTela,
  irParaCarrinhoViaHeader,
  finalizarPedidoNoCarrinho,
} from '../../support/helpers/fluxoCompra';

const EMISSOR_ESPERADO =
  Cypress.env('emissor') || 'ACOS FAVORIT DISTRIBUIDORA LTDA';

/** Segundo SKU: `produto2` ou repete `produto`. */
function sku2De(sku1) {
  const p2 = String(Cypress.env('produto2') || '').trim();
  return p2.length ? p2 : sku1;
}

/** Terceiro SKU: `produto3` ou repete `sku1`. */
function sku3De(sku1) {
  const p3 = String(Cypress.env('produto3') || '').trim();
  return p3.length ? p3 : sku1;
}

describe('Compra vitrine — três itens', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Login', () => {
      realizarLoginComRetry();
    });
  });

  it('@regression @p1 @compras Vitrine: três inclusões ao carrinho e finalização', { retries: 0 }, () => {
    const sku1 = String(Cypress.env('produto') || '').trim();
    const skuB = sku2De(sku1);
    const skuC = sku3De(sku1);

    expect(sku1, 'Defina Cypress.env("produto") com um SKU válido no QA').to.have.length.gt(4);

    allure.step('Catálogo vitrine com emissor', () => {
      acessarCatalogoVitrineComEmissor(EMISSOR_ESPERADO);
      aguardarTela('catálogo pronto');
    });

    const adicionarSku = (codigo) => {
      ComprarPage.buscarProduto(codigo);
      ComprarPage.adicionarProdutoAoCarrinhoPorCodigo(codigo);
    };

    allure.step('1ª inclusão', () => {
      adicionarSku(sku1);
    });

    allure.step('2ª inclusão', () => {
      if (skuB !== sku1) {
        adicionarSku(skuB);
      } else {
        cy.log(`ℹ️ Sem produto2 — repete SKU ${sku1}`);
        ComprarPage.adicionarProdutoAoCarrinhoPorCodigo(sku1);
      }
    });

    allure.step('3ª inclusão', () => {
      if (skuC !== sku1 && skuC !== skuB) {
        adicionarSku(skuC);
      } else if (skuC === skuB && skuB !== sku1) {
        ComprarPage.adicionarProdutoAoCarrinhoPorCodigo(skuB);
      } else {
        cy.log(`ℹ️ Sem produto3 distinto — terceira adição repetindo ${sku1}`);
        ComprarPage.adicionarProdutoAoCarrinhoPorCodigo(sku1);
      }
    });

    allure.step('Carrinho + checkout completo', () => {
      irParaCarrinhoViaHeader(ComprarPage);
      finalizarPedidoNoCarrinho();
    });

    cy.screenshot('vitrine-tres-itens-pedido-enviado', { capture: 'fullPage' });
  });
});
