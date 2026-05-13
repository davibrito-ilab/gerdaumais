// commands.js
import * as allure from "allure-js-commons";

const getAuthOrigin = () => {
  const loginUrl = Cypress.env('auth_login_url');
  const baseUrl = Cypress.config('baseUrl');

  try {
    return new URL(loginUrl || baseUrl).origin;
  } catch (e) {
    return 'https://qa.gab.egerdau.com.br';
  }
};

Cypress.Commands.add('getToken', () => {
  const clientId = Cypress.env('auth_client_id');
  const clientSecret = Cypress.env('auth_client_secret');
  const tokenUrl = Cypress.env('auth_token_url');

  if (!clientId || !clientSecret) {
    throw new Error('Defina CYPRESS_auth_client_id e CYPRESS_auth_client_secret para usar login via API.');
  }

  return cy.request({
    method: 'POST',
    url: tokenUrl,
    headers: {
      'client_id': clientId,
      'client_secret': clientSecret,
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body.access_token // Ajuste conforme a resposta real
  })
})

Cypress.Commands.add('loginPelaApi', (username, password) => {
  const loginUrl = Cypress.env('auth_login_url');
  const redirectUri = `${getAuthOrigin()}/auth`;
  
  cy.getToken().then((token) => {
    cy.request({
      method: 'POST',
      url: loginUrl,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'redirect_uri': redirectUri,
        'sso-access': 'false'
      },
      body: {
        username: username,
        password: password,
      }
    }).then((loginResponse) => {
      expect(loginResponse.status).to.eq(200)
      
      const sessionToken = loginResponse.body.token
      const body = loginResponse.body

      localStorage.setItem('azureToken', sessionToken)
      localStorage.setItem('azure', JSON.stringify(loginResponse))
      localStorage.setItem('__userEmail', username)
      localStorage.setItem('__userBp', JSON.stringify(loginResponse.body.__userBp))
      localStorage.setItem('__userId', JSON.stringify(loginResponse.body.__userId))
    })
  })
})

Cypress.Commands.add('fazLoginPeloFront', (email, password) => {
  const authOrigin = getAuthOrigin();

  allure.step("Preenche email, senha e aciona o botão de login", () => {
    cy.origin(
      authOrigin,
      { args: { email, password } },
      ({ email, password}) => {
        cy.get('input[type="email"]').type(email)
        cy.get('input[type="password"]').type(password)
        cy.screenshot('credenciaisLogin');
        cy.get('button[type="submit"]').click()
        cy.url().should('not.include', '/auth');
      }
    )
  })
})