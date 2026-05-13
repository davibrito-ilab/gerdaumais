const path = require('path');
const internalConfig = require('./gerdau_mais_automation/cypress.config.js');

module.exports = {
  projectId: 'mj7v11',
  allowCypressEnv: true,

  e2e: {
    ...internalConfig.e2e,
    specPattern: 'gerdau_mais_automation/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'gerdau_mais_automation/cypress/support/e2e.js',
    fixturesFolder: 'gerdau_mais_automation/cypress/fixtures',
    downloadsFolder: 'gerdau_mais_automation/cypress/downloads',
    screenshotsFolder: 'gerdau_mais_automation/cypress/screenshots',
    videosFolder: 'gerdau_mais_automation/cypress/videos',
    setupNodeEvents(on, config) {
      const updatedConfig = {
        ...config,
        projectRoot: path.resolve(__dirname, 'gerdau_mais_automation'),
      };

      return internalConfig.e2e.setupNodeEvents(on, updatedConfig);
    },
  },
};
