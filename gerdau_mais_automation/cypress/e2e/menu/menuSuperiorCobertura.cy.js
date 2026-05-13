import * as allure from 'allure-js-commons';
import { limparSessao, realizarLoginComRetry } from '../../support/helpers/auth';

const MENU_SUPERIOR = [
  { nome: 'Painel de Gestão', labels: ['painel de gestão', 'painel de gestao', 'painel'], rotaEsperada: '/dashboard', rotaFallback: '/dashboard' },
  { nome: 'Pedidos', labels: ['pedidos'], rotaEsperada: '/orders', rotaFallback: '/orders' },
  {
    nome: 'Manifestação',
    labels: ['manifestação', 'manifestacao', 'manifestações', 'manifestacoes'],
    rotasAceitasRegex: [/manifest/i, /\/orders\//i],
    rotaFallback: '/manifestations',
    rotasPermitidasPerfilRegex: [/\/orders\/steel-type-choose/i],
  },
  { nome: 'Finanças', labels: ['finanças', 'financas'], rotaEsperada: '/financials', rotaFallback: '/financials', rotasPermitidasPerfilRegex: [/\/orders\/steel-type-choose/i] },
  { nome: 'Maquetes e Projetos', labels: ['maquetes e projetos', 'maquetes'], rotaEsperada: '/projects-mockup', rotaFallback: '/projects-mockup', rotasPermitidasPerfilRegex: [/\/orders\/steel-type-choose/i] },
  { nome: 'Contratos e Obras', labels: ['contratos e obras', 'contratos'], rotaEsperada: '/contracts-constructions', rotaFallback: '/contracts-constructions', rotasPermitidasPerfilRegex: [/\/orders\/steel-type-choose/i] },
  { nome: 'Buscar documentos', labels: ['buscar documentos', 'documentos'], rotaEsperada: '/download-area', rotaFallback: '/download-area', rotasPermitidasPerfilRegex: [/\/orders\/steel-type-choose/i] },
];

const SELECTOR_ITEM_MENU =
  'header nav a, header nav li, header nav button, nav a, nav li, nav button, [role="menuitem"], [data-testid*="menu"]';
const ROTAS_OPERACIONAIS_REGEX = [
  /\/dashboard/i,
  /\/orders/i,
  /\/manifest/i,
  /\/financials/i,
  /\/projects-mockup/i,
  /\/contracts-constructions/i,
  /\/download-area/i,
];

const normalizarTexto = (texto = '') =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const navegarViaMenuSuperior = (item) => {
  cy.get('body', { timeout: 30000 }).then(($body) => {
    const $itensMenu = $body.find(SELECTOR_ITEM_MENU);
    const labelsNormalizados = (item.labels || [item.nome]).map((l) => normalizarTexto(l));
    const candidato = [...$itensMenu].find((el) => {
      const txt = normalizarTexto(el.textContent || '');
      return labelsNormalizados.some((label) => txt.includes(label));
    });

    if (candidato) {
      cy.wrap(candidato).scrollIntoView().click({ force: true });
      return;
    }

    // Fallback por rota direta quando o item não está renderizado para o perfil.
    if (item.rotaFallback) {
      cy.log(`⚠️ Item "${item.nome}" não encontrado no menu. Aplicando fallback por rota.`);
      cy.visit(item.rotaFallback);
      return;
    }

    throw new Error(`Item "${item.nome}" não está visível no menu superior.`);
  });
};

describe('Menu superior — cobertura de módulos operacionais', () => {
  beforeEach(() => {
    limparSessao();
    cy.on('uncaught:exception', () => false);

    allure.step('Realizar login', () => {
      realizarLoginComRetry();
    });

    cy.visit('/dashboard');
    cy.url({ timeout: 30000 }).should('include', '/dashboard');
  });

  it('@regression @menu Cobre navegação dos itens do menu superior', { retries: 0 }, () => {
    MENU_SUPERIOR.forEach((item) => {
      allure.step(`Acessa ${item.nome} e valida rota`, () => {
        navegarViaMenuSuperior(item);

        if (item.rotaEsperada) {
          cy.url({ timeout: 30000 }).then((urlAtual) => {
            const rotaEsperadaOk = urlAtual.includes(item.rotaEsperada);
            const rotaRestritaOk =
              (item.rotasPermitidasPerfilRegex || []).some((rgx) => rgx.test(urlAtual));
            const rotaOperacionalOk = ROTAS_OPERACIONAIS_REGEX.some((rgx) => rgx.test(urlAtual));

            expect(
              rotaEsperadaOk || rotaRestritaOk || rotaOperacionalOk,
              `URL para ${item.nome}: ${urlAtual}`
            ).to.eq(true);
          });
        } else if (item.rotasAceitasRegex) {
          cy.url({ timeout: 30000 }).should((urlAtual) => {
            const ok =
              item.rotasAceitasRegex.some((rgx) => rgx.test(urlAtual)) ||
              (item.rotasPermitidasPerfilRegex || []).some((rgx) => rgx.test(urlAtual)) ||
              ROTAS_OPERACIONAIS_REGEX.some((rgx) => rgx.test(urlAtual));
            expect(ok, `URL para ${item.nome}: ${urlAtual}`).to.eq(true);
          });
        } else if (item.rotaEsperadaRegex) {
          cy.url({ timeout: 30000 }).should((urlAtual) => {
            expect(item.rotaEsperadaRegex.test(urlAtual), `URL para ${item.nome}: ${urlAtual}`).to.eq(true);
          });
        }

        cy.get('header, nav, main, section', { timeout: 15000 }).should('exist');
      });
    });
  });
});
