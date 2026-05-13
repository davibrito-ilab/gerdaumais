import LoginPage from '../../pages/loginPage/loginPage';
import * as allure from "allure-js-commons";

const login = new LoginPage();
const assertPermaneceNoContextoDeLogin = () => {
  cy.location('href', { timeout: 15000 }).then((href) => {
    if ((href || '').includes('/auth')) {
      return;
    }

    // Fallback para casos em que o app permanece no formulário sem refletir URL estável imediatamente.
    login.usernameInput.should('be.visible');
    login.passwordInput.should('be.visible');
  });
};

describe('Cenários de Login', () => {

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Ignorar erros de JavaScript não capturados da aplicação
    cy.on('uncaught:exception', (err, runnable) => {
      return false;
    });
  });

  it('@smoke @positive Login com credenciais válidas', () => {
    allure.step("Acessar página de login", () => {
      login.acessar();
      login.usernameInput.should('be.visible');
      login.passwordInput.should('be.visible');
    });

    allure.step("Preencher formulário com credenciais válidas", () => {
      login.preencheFormulario(Cypress.env('username'), Cypress.env('password'));
    });

    allure.step("Clicar em botão de login", () => {
      login.fazLogin();
    });

    allure.step("Validar que login foi bem-sucedido", () => {
      // Aguardar redirecionamento - não tentar validar elementos específicos
      // pois pode haver mudança de domínio/origem
      cy.url({ timeout: 15000 }).should('not.include', '/auth');
      // O teste passa se chegou aqui sem erro de timeout
      cy.log('Login realizado com sucesso - redirecionamento detectado');
    });
  });

  it('@negative @security Login com email inválido', () => {
    allure.step("Acessar página de login", () => {
      login.acessar();
      login.usernameInput.should('be.visible');
      login.passwordInput.should('be.visible');
    });

    allure.step("Preencher formulário com email inválido", () => {
      login.preencheFormulario(Cypress.env('invalidUsername'), Cypress.env('password'));
    });

    allure.step("Clicar em botão de login", () => {
      login.fazLogin();
      cy.get('body', { timeout: 15000 }).should('be.visible');
    });

    allure.step("Validar que permanece na página de login", () => {
      assertPermaneceNoContextoDeLogin();
    });
  });

  it('@negative @security Login com senha inválida', () => {
    allure.step("Acessar página de login", () => {
      login.acessar();
      login.usernameInput.should('be.visible');
      login.passwordInput.should('be.visible');
    });

    allure.step("Preencher formulário com senha inválida", () => {
      login.preencheFormulario(Cypress.env('username'), Cypress.env('invalidPassword'));
    });

    allure.step("Clicar em botão de login", () => {
      login.fazLogin();
      cy.get('body', { timeout: 15000 }).should('be.visible');
    });

    allure.step("Validar que permanece na página de login", () => {
      assertPermaneceNoContextoDeLogin();
    });
  });

  it('@validation @negative Login com campos vazios', () => {
    allure.step("Acessar página de login", () => {
      login.acessar();
      login.usernameInput.should('be.visible');
      login.passwordInput.should('be.visible');
    });

    allure.step("Tentar clicar em botão de login sem preencher campos", () => {
      login.fazLogin();
    });

    allure.step("Validar que permanece na página de login", () => {
      assertPermaneceNoContextoDeLogin();
      login.usernameInput.should('be.visible');
    });
  });

  it('@validation @negative Login com apenas email preenchido', () => {
    allure.step("Acessar página de login", () => {
      login.acessar();
      login.usernameInput.should('be.visible');
      login.passwordInput.should('be.visible');
    });

    allure.step("Preencher apenas o campo de email", () => {
      login.usernameInput.type(Cypress.env('username'));
    });

    allure.step("Tentar clicar em botão de login", () => {
      login.fazLogin();
    });

    allure.step("Validar que permanece na página de login", () => {
      assertPermaneceNoContextoDeLogin();
      login.usernameInput.should('be.visible');
    });
  });

});
