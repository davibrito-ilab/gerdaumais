@echo off
echo ========================================
echo    GERDAU MAIS - EXECUTOR DE TESTES
echo ========================================
echo.

echo Selecione o tipo de teste:
echo [1] Todos os testes
echo [2] Apenas Login
echo [3] Apenas Compra por Vitrine
echo [4] Apenas Compra por Historico
echo [5] Todos os testes de Compras
echo [6] Todos os testes de Auth
echo [7] Abrir interface Cypress
echo.

set /p choice="Digite sua opcao (1-7): "

if "%choice%"=="1" goto all
if "%choice%"=="2" goto login
if "%choice%"=="3" goto vitrine
if "%choice%"=="4" goto historico
if "%choice%"=="5" goto compras
if "%choice%"=="6" goto auth
if "%choice%"=="7" goto open
goto invalid

:all
echo Executando todos os testes...
npx cypress run
goto end

:login
echo Executando teste de login...
npx cypress run --spec="cypress/e2e/auth/login.cy.js"
goto end

:vitrine
echo Executando compra por vitrine...
npx cypress run --spec="cypress/e2e/compras/compraPorVitrine.cy.js"
goto end

:historico
echo Executando compra por historico...
npx cypress run --spec="cypress/e2e/compras/compraPorHistorico.cy.js"
goto end

:compras
echo Executando todos os testes de compras...
npx cypress run --spec="cypress/e2e/compras/*.cy.js"
goto end

:auth
echo Executando todos os testes de auth...
npx cypress run --spec="cypress/e2e/auth/*.cy.js"
goto end

:open
echo Abrindo interface Cypress...
npx cypress open
goto end

:invalid
echo Opcao invalida! Use 1-7.
goto end

:end
echo.
echo Teste concluido!
pause