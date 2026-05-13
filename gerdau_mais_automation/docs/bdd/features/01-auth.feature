# language: pt

@auth @p0
Funcionalidade: Autenticação de usuários
  Como usuário da plataforma
  Quero autenticar com segurança
  Para acessar apenas funcionalidades permitidas

  Contexto:
    Dado que o usuário está na página de autenticação

  # Spec: cypress/e2e/auth/login.cy.js
  @AUT-001 @p0 @smoke @critical
  Cenário: Login válido
    Quando o usuário informa credenciais válidas
    E confirma o login
    Então o sistema redireciona para a área autenticada
    E o usuário não permanece na rota de autenticação

  # Spec: cypress/e2e/auth/login.cy.js
  @AUT-002 @p0 @smoke @critical @negative
  Cenário: Login inválido com senha incorreta
    Quando o usuário informa senha incorreta para um usuário válido
    E confirma o login
    Então o sistema mantém o usuário no contexto de autenticação
    E exibe feedback de falha de login

  # Spec: cypress/e2e/auth/login.cy.js
  @AUT-019 @p0 @smoke @security @negative
  Cenário: Login inválido com email incorreto
    Quando o usuário informa email inválido
    E confirma o login
    Então o sistema mantém o usuário no contexto de autenticação

  # Spec: cypress/e2e/auth/login.cy.js
  @AUT-020 @p1 @regression @validation @negative
  Cenário: Login bloqueado com campos vazios
    Quando o usuário não preenche email nem senha
    E tenta confirmar o login
    Então o sistema não autentica o usuário permanecendo na tela de login

  # Spec: cypress/e2e/auth/login.cy.js
  @AUT-021 @p1 @regression @validation @negative
  Cenário: Login bloqueado com apenas email preenchido
    Quando o usuário preenche apenas o email
    E tenta confirmar o login
    Então o sistema não autentica o usuário permanecendo na tela de login

  # Spec: cypress/e2e/auth/logoutProtegida.cy.js
  @AUT-022 @p1 @regression @security @critical
  Cenário: Após logout, rota protegida redireciona ao login
    Dado que o usuário está autenticado
    Quando o usuário encerra a sessão
    E tenta acessar uma URL protegida sem sessão válida
    Então o sistema redireciona para o fluxo de autenticação
