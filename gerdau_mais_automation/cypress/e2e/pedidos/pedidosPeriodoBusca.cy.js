import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';
import {
  acessarPedidos,
  buscarPedidos,
  preencherPeriodoUltimosDiasSeDisponivel,
  validarListaResponde,
} from '../../support/helpers/pedidosFiltros';

/**
 * Exercita o helper de período quando a carteira exibe 2 datas; caso contrário mantém o default e só busca
 * (comportamento seguro no QA que nem sempre mostra os dois inputs até outras ações).
 */
describe('Pedidos — período e busca', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });
  });

  it('@regression @p1 @pedidos Ajusta período quando disponível e dispara busca', { retries: 0 }, () => {
    allure.step('Abre carteira de aços longos e planos', () => {
      acessarPedidos();
    });

    allure.step('Tenta últimos 45 dias nas datas visíveis', () => {
      preencherPeriodoUltimosDiasSeDisponivel(45);
      cy.screenshot('pedidos-periodo-ajustado-ou-default', { capture: 'fullPage' });
    });

    allure.step('Buscar pedidos', () => {
      buscarPedidos();
    });

    allure.step('Valida resposta', () => {
      validarListaResponde();
      cy.screenshot('pedidos-periodo-busca-resultado', { capture: 'fullPage' });
    });
  });
});
