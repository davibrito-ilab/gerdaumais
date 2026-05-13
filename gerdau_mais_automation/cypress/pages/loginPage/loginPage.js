/**
 * Page Object for the Login page
 * Handles login form interactions and validations
 */
class LoginPage {
  getByPrimaryOuFallback(primarySelector, fallbackXPath) {
    return cy.get('body').then(($body) => {
      const possuiPrimary = $body.find(primarySelector).length > 0;
      if (possuiPrimary) {
        return cy.get(primarySelector).first();
      }

      return cy.xpath(fallbackXPath).first();
    });
  }

  /**
   * Gets the username input field
   * @returns {Cypress.Chainable} Username input element
   */
  get usernameInput() {
    return this.getByPrimaryOuFallback(
      'input[type="email"], input[name*="email"], input[name*="Email"], input[id*="email"], input[id*="Email"], input[autocomplete="username"]',
      '/html/body/div/div[2]/div/div/div/div/div/form/div[3]/input'
    );
  }

  /**
   * Gets the password input field
   * @returns {Cypress.Chainable} Password input element
   */
  get passwordInput() {
    return this.getByPrimaryOuFallback(
      'input[type="password"], input[name*="password"], input[name*="Password"], input[id*="password"], input[id*="Password"], input[autocomplete="current-password"]',
      '/html/body/div/div[2]/div/div/div/div/div/form/div[7]/input'
    );
  }

  /**
   * Gets the login button
   * @returns {Cypress.Chainable} Login button element
   */
  get loginButton() {
    return this.getByPrimaryOuFallback(
      'button[type="submit"], button[data-cy*="login"], button[data-cy*="Login"], button[data-testid*="login"], button[data-testid*="Login"]',
      '/html/body/div/div[2]/div/div/div/div/div/form/div[10]/button'
    );
  }

  /**
   * Accesses the login page
   */
  acessar() {
    cy.visit('/auth');
    this.usernameInput.should('be.visible');
    this.passwordInput.should('be.visible');
  }

  /**
   * Fills the login form with username and password
   * @param {string} username - The username to enter
   * @param {string} password - The password to enter
   */
  preencheFormulario(username, password) {
    this.usernameInput.type(username);
    this.passwordInput.type(password);
  }

  /**
   * Clicks the login button
   */
  fazLogin() {
    this.loginButton.click();
  }
}

export default LoginPage;