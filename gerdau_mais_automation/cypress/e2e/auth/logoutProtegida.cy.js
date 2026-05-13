import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry, fazerLogoutResiliente } from '../../support/helpers/auth';

describe('Autenticação — logout e página protegida', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);
  });

  it('@regression @security Após logout, acesso a rota protegida redireciona para login', { retries: 0 }, () => {
    allure.step('Login', () => {
      realizarLoginComRetry();
    });

    allure.step('Logout', () => {
      fazerLogoutResiliente();
      cy.screenshot('logout-concluido');
    });

    allure.step('Tenta acessar área protegida sem sessão', () => {
      cy.visit('/dashboard', { failOnStatusCode: false });
      cy.url({ timeout: 45000 }).should((url) => {
        expect(
          /\/auth|openid|login|signin|accounts\.|sso/i.test(url || ''),
          `URL após visitar /dashboard sem sessão: ${url}`
        ).to.eq(true);
      });
      cy.screenshot('protegida-redireciona-login');
    });
  });
});
