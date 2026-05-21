import ComprarPage from '../../pages/comprarPage/comprarPageMetods';
import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  acessarComprarLanding,
  acessarCatalogoVitrineComEmissor,
  selecionarEmissorDoPedido,
  aguardarTela,
  irParaCarrinhoViaHeader,
  finalizarPedidoNoCarrinho,
} from '../../support/helpers/fluxoCompra';

const EMISSOR_ESPERADO =
  Cypress.env('emissor') || 'ACOS FAVORIT DISTRIBUIDORA LTDA';

/** SKU secundário opcional (`produto2` no env); igual a `produto` adiciona o mesmo código duas vezes. */
function obterSkuSecundario() {
  const p1 = String(Cypress.env('produto') || '').trim();
  const p2 = String(Cypress.env('produto2') || '').trim();
  return p2.length ? p2 : p1;
}

describe('Compra vitrine — dois itens', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Login', () => {
      realizarLoginComRetry();
    });
  });

  it('@regression @p1 @compras Vitrine: dois produtos no carrinho e finalização', { retries: 0 }, () => {
    const sku1 = String(Cypress.env('produto') || '').trim();
    const sku2 = obterSkuSecundario();

    expect(sku1, 'Defina Cypress.env("produto") com um SKU válido no QA').to.have.length.gt(4);

    allure.step('Comprar + emissor', () => {
      acessarComprarLanding();
      selecionarEmissorDoPedido(EMISSOR_ESPERADO);
      aguardarTela('emissor confirmado, cards habilitados');
    });

    allure.step('Catálogo vitrine', () => {
      acessarCatalogoVitrineComEmissor(EMISSOR_ESPERADO);
    });

    allure.step('Primeiro item ao carrinho', () => {
      ComprarPage.buscarProduto(sku1);
      ComprarPage.adicionarProdutoAoCarrinhoPorCodigo(sku1);
    });

    allure.step('Segundo item ao carrinho', () => {
      if (sku2 && sku2 !== sku1) {
        ComprarPage.buscarProduto(sku2);
        ComprarPage.adicionarProdutoAoCarrinhoPorCodigo(sku2);
      } else {
        cy.log(`ℹ️ Sem produto2 distinto — segunda adição usando o SKU ${sku1}`);
        ComprarPage.adicionarProdutoAoCarrinhoPorCodigo(sku1);
      }
    });

    allure.step('Ir ao carrinho e finalizar', () => {
      irParaCarrinhoViaHeader(ComprarPage);
      finalizarPedidoNoCarrinho();
    });

    cy.screenshot('vitrine-dois-itens-pedido-enviado', { capture: 'fullPage' });
  });
});
