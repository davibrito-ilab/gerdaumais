# Principais alterações (sessão de automação)

## Convenção de manutenção

Sempre que um ajuste neste projeto for **concluído** (código, Cypress, env, scripts, documentação de testes, etc.), este arquivo deve ser **atualizado na mesma entrega**: acrescentar uma linha ou bloco em **Registro cronológico** (data + o que mudou + arquivos relevantes). Objetivo: histórico legível para equipe e para revisão sem depender só do Git.

A regra também está descrita em `.cursor/rules/atualizar-alteracoes-md.mdc` para sessões futuras no Cursor.

---

Data de referência inicial: 2026-05-04.

## Contexto

A suíte E2E (Cypress) falhava em vários fluxos de **compras** com o erro *“Não foi possível localizar o emissor na lista”*. O emissor usado (`ACOS FAVORIT DISTRIBUIDORA LTDA.`) não aparecia mais na lista do ambiente **QA**, enquanto login, pedidos e outros fluxos seguiam funcionando com outro cadastro.

## O que foi alterado (visão geral)

### Configuração de emissor

| Arquivo | Alteração |
|---------|-----------|
| `cypress.env.json` | Valor de `emissor` alinhado ao QA (ex.: `ACOCON` / cadastro disponível); não versionar segredos. |
| `cypress.env.example.json` | Valores de exemplo para novos clones. |

### Specs E2E

Emissor centralizado via `Cypress.env('emissor')` e `ComprarPage.selecionaEmissorCorretamente()` onde aplicável. Evolução da suíte: compras, menu, finanças, documentos, pedidos, fluxoCompra, Allure, workflow GitHub Pages, relatório gerencial HTML/PDF, Gherkin, etc.

## Execução de testes

- **`npm run cy:run`** na pasta `gerdau_mais_automation` (ou atalhos na raiz do monorepo).
- **PowerShell (Windows):** preferir `Set-Location "caminho"; npm run ...` se `&&` não for suportado.

## Documentação BDD (`.feature`)

Arquivos em `docs/bdd/features/` são referência; a implementação executável está em `cypress/e2e/**/*.cy.js`.

## Próximos passos sugeridos (opcional)

- Ajustar `emissor` / credenciais no `cypress.env.json` ou `CYPRESS_*` no CI conforme o QA.
- Painel Allure: `docs/ALLURE.md` (local e GitHub Pages).

---

## Registro cronológico

| Data | Resumo |
|------|--------|
| 2026-05-04 | Criado `docs/ALTERACOES.md` com histórico do emissor QA, specs usando `Cypress.env('emissor')`, notas PowerShell / `cy:open` / BDD. |
| 2026-05-04 | Incluída **Convenção de manutenção**. Criada regra `.cursor/rules/atualizar-alteracoes-md.mdc` (`alwaysApply: true`). |
| 2026-05-05 | Carrinho (AUT-009/010/012), menu superior, finanças, documentos, scripts npm; robustez emissor em `comprarPageEmissorActions.js`. |
| 2026-05-06 a 2026-05-11 | Iterações em helpers/pages/compras (checkout, modais, planilha, histórico, etc.); conferir commits locais para detalhe. |
| 2026-05-12 | Auditoria E2E, specs auth/pedidos/planilha/vitrine, `GUIA-COBERTURA`, relatório textual, checklist/HTML gerencial, PDF, matriz. |
| 2026-05-13 | `cy:run:headed`; relatório 5.1 mobile/Chrome; PDF; **Allure** (`allure-commandline`, `scripts/allure-cli.js`, scripts npm, `docs/ALLURE.md`). |
| 2026-05-13 | **GitHub Pages:** `.github/workflows/allure-pages.yml`, push + `workflow_dispatch`, segredos `CYPRESS_*`. |
| 2026-05-13 | **ALLURE.md:** Opções A/B deploy em detalhe. **Gherkin** alinhado aos specs (`docs/bdd`). |
| 2026-05-13 | Removida seção “roteiro de vídeo” de `docs/ALLURE.md`. **`docs/ALTERACOES.md` restaurado** após corrupção acidental (histórico condensado; detalhes antigos nos commits). |
| 2026-05-13 | Adicionado **`LICENSE`** (ISC) na raiz do repositório, alinhado ao campo `"license": "ISC"` em `gerdau_mais_automation/package.json`. |
| 2026-05-13 | **GitHub:** `docs/GITHUB.md` (Git no Windows, estrutura do monorepo, `git push` com PAT, segredos `CYPRESS_*`, Pages). `README.md` na raiz do workspace; link no `gerdau_mais_automation/README.md`. |
