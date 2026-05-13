const { allureCypress } = require("allure-cypress/reporter");
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: 'mj7v11',
  e2e: {
    baseUrl: 'https://qa.gab.egerdau.com.br',
    video: true,
    pageLoadTimeout: 120000,
    // Desktop-first: o produto Gerdau Mais não é alvo mobile; E2E não cobre layouts responsivos/pequenos.
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    chromeWebSecurity: false, // Permite acesso a frames de origens diferentes
    screenshotOnRunFailure: true,
    retries: {
      runMode: 0,
      openMode: 0
    },
    env: {
      username: process.env.CYPRESS_username || '',
      password: process.env.CYPRESS_password || '',
      invalidUsername: process.env.CYPRESS_invalidUsername || 'usuario.invalido@gmail.com',
      invalidPassword: process.env.CYPRESS_invalidPassword || 'SenhaIncorreta123',
      emissor: process.env.CYPRESS_emissor || 'ACOS FAVORIT DISTRIBUIDORA LTDA',
      produto: process.env.CYPRESS_produto || '106040040',
      auth_client_id: process.env.CYPRESS_auth_client_id || '',
      auth_client_secret: process.env.CYPRESS_auth_client_secret || '',
      auth_token_url: process.env.CYPRESS_auth_token_url || 'https://gerdau-authentications.us-e1.cloudhub.io/api/token',
      auth_login_url: process.env.CYPRESS_auth_login_url || 'https://qa-experience-gerdau-gmais-login.us-e1.cloudhub.io/api/v1/login',
      hideXhr: true
    },
    setupNodeEvents(on, config) {
      allureCypress(on, config, {
        resultsDir: "allure-results",
      });
    },
  },
});
