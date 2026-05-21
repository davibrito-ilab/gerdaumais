// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import 'cypress-xpath';
import 'cypress-plugin-xhr-toggle';
import './commands';

/** Último recurso: `allure-cypress` pode falhar ao serializar steps com DOM gigante (RangeError no stringify). */
(() => {
  const jsonStringifyOrig = JSON.stringify;
  JSON.stringify = function stringifyGuard(value, replacer, space) {
    try {
      return jsonStringifyOrig.call(JSON, value, replacer, space);
    } catch (e) {
      const msg = String(e && e.message ? e.message : e);
      if (e instanceof RangeError || /invalid string length/i.test(msg)) {
        return '{"__allure_truncated":true}';
      }
      throw e;
    }
  };
})();

/** Limita dumps DOM antes do relatório Allure (alguns comandos fazem yield de árvores enormes). */
(() => {
  const orig = Cypress.dom.stringify;
  Cypress.dom.stringify = function patchedDomStringify(el, fmt) {
    try {
      const out = orig.call(Cypress.dom, el, fmt);
      const max = 120000;
      if (typeof out === 'string' && out.length > max) {
        return `${out.slice(0, max)}… [truncado para relatório Allure]`;
      }
      return out;
    } catch (e) {
      const msg = String(e && e.message ? e.message : e);
      if (e instanceof RangeError || /invalid string length/i.test(msg)) {
        return '[DOM omitido — excedeu limite para Allure]';
      }
      return `[DOM stringify: ${msg.slice(0, 160)}]`;
    }
  };
})();

import 'allure-cypress';

// Ignorar erros de serialização do React
Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('Converting circular structure to JSON') || 
      err.message.includes('__reactFiber$')) {
    return false; 
  }
  return true;
});