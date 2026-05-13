import LoginPage from '../../pages/loginPage/loginPage';
import { aguardarBodyVisivel } from './uiReady';
import ComprarPage from '../../pages/comprarPage/comprarPageMetods';

const loginPage = new LoginPage();

export const limparSessao = () => {
  cy.clearCookies();
  cy.clearLocalStorage();
};

/**
 * Pós-login (padrão estável 05/05): confirma saída de `/auth` e documento pronto.
 */
export const aguardarPosLoginCarregado = () => {
  cy.log('⏳ Aguardando pós-login (URL + body).');
  cy.url({ timeout: 45000 }).should('not.include', '/auth');
  aguardarBodyVisivel(30000);
};

export const realizarLoginComRetry = () => {
  const username = Cypress.env('username');
  const password = Cypress.env('password');

  if (!username || !password) {
    throw new Error('Defina CYPRESS_username e CYPRESS_password antes de executar os testes.');
  }

  loginPage.acessar();
  loginPage.usernameInput.should('be.visible');
  loginPage.passwordInput.should('be.visible');
  loginPage.preencheFormulario(username, password);
  loginPage.fazLogin();

  cy.url({ timeout: 20000 }).then((urlAtual) => {
    if (!urlAtual.includes('/auth')) return undefined;

    cy.log('⚠️ Login não concluiu na primeira tentativa. Repetindo autenticação.');
    loginPage.acessar();
    loginPage.usernameInput.should('be.visible').clear({ force: true }).type(username, { force: true });
    loginPage.passwordInput.should('be.visible').clear({ force: true }).type(password, { force: true });
    loginPage.fazLogin();
    return cy.url({ timeout: 30000 }).should('not.include', '/auth');
  });

  aguardarPosLoginCarregado();
};

/**
 * Logout (checklist pré-deploy: após sair, rota protegida deve ir ao login).
 * Usa o menu do header em `ComprarPage` / `GerdauHeader` (XPath do projeto).
 */
export const fazerLogoutResiliente = () => {
  cy.log('🔐 Executando logout…');
  cy.visit('/dashboard', { failOnStatusCode: false });
  aguardarBodyVisivel(30000);

  cy.url({ timeout: 5000 }).then((url) => {
    if ((url || '').includes('/auth')) {
      cy.log('ℹ️ Já está em contexto de autenticação.');
      return;
    }
    ComprarPage.menuHeader.click({ force: true });
    ComprarPage.logout.click({ force: true });
  });

  cy.url({ timeout: 45000 }).should((url) => {
    expect(
      /\/auth|openid|login|signin|accounts\.|sso/i.test(url || ''),
      `esperado redirecionar para login após logout; URL=${url}`
    ).to.eq(true);
  });
};
