# Gerdau Mais — automação (monorepo)

Repositório com testes E2E (Cypress) para a plataforma **Gerdau Mais**.

## Estrutura

| Caminho | Conteúdo |
|---------|----------|
| **`gerdau_mais_automation/`** | Projeto npm com Cypress, `package-lock.json` e **toda a automação** — é aqui que corre `npm install` e os testes |
| `.github/workflows/` | GitHub Actions (ex.: Allure em GitHub Pages) |
| `LICENSE` | Licença ISC |
| Inventário E2E (ref. documentação) | **40** specs / **55** casos `it` — [`gerdau_mais_automation/docs/RELATORIO-AUTOMACAO-E2E-TEXTO-COMPLETO.md`](gerdau_mais_automation/docs/RELATORIO-AUTOMACAO-E2E-TEXTO-COMPLETO.md) |

## Início rápido (qualquer pessoa)

1. **Instale [Node.js 18+](https://nodejs.org/)** (inclui `npm`).
2. No terminal, entre na pasta do código de testes e instale dependências:

   ```bash
   cd gerdau_mais_automation
   npm install
   ```

   **PowerShell (Windows), se o caminho tiver espaços:**

   ```powershell
   Set-Location "C:\caminho\completo\para\gerdau_mais_automation"
   npm install
   ```

3. Crie o ficheiro de credenciais a partir do exemplo:

   ```bash
   cp cypress.env.example.json cypress.env.json
   ```

   No Windows (PowerShell): `Copy-Item cypress.env.example.json cypress.env.json`

4. Edite **`cypress.env.json`**: preencha **`username`**, **`password`**, e alinhe **`emissor`** / **`produto`** com o que a equipa passar para o QA.

5. Valide com um spec pequeno:

   ```bash
   npm run cy:run:login
   ```

6. Leia o guia completo (comandos, Allure, problemas comuns):  
   **[`gerdau_mais_automation/README.md`](gerdau_mais_automation/README.md)**

### Atalhos a partir desta raiz

Se já correram `npm install` **dentro** de `gerdau_mais_automation/`, podem usar da raiz do monorepo:

```bash
npm run cy:run:login
npm run cy:open
npm run cy:run
```

(Isto usa o `package.json` da raiz, que delega para a pasta interna.)

## Documentação extra

- **Allure (relatório HTML / GitHub Pages):** [`gerdau_mais_automation/docs/ALLURE.md`](gerdau_mais_automation/docs/ALLURE.md)
- **Git (push, segredos, Actions):** [`gerdau_mais_automation/docs/GITHUB.md`](gerdau_mais_automation/docs/GITHUB.md)
