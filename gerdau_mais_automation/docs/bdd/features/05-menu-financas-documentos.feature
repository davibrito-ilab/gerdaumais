# language: pt

@menu @operacional @p1 @regression
Funcionalidade: Navegação em menu finanças e documentos
  Como usuário corporativo
  Quero alcançar módulos pela navegação superior
  Para executar buscas e operações de apoio ao pedido

  Contexto:
    Dado que o usuário está autenticado na aplicação principal

  # Spec: cypress/e2e/menu/menuSuperiorCobertura.cy.js
  @AUT-036 @p1 @regression @menu
  Cenário: Menu superior cobre módulos operacionais esperados
    Dado que está visível a navegação superior
    Quando o usuário navega por Painel, Pedidos, Finanças e demais itens da matriz de cobertura
    Então cada item alcança rota ou contexto permitido ao perfil atual

  # Spec: cypress/e2e/financas/financasBusca.cy.js
  @AUT-037 @p1 @regression @financas
  Cenário: Módulo Finanças — acessar e executar busca com filtros
    Quando o usuário entra em finanças pela rota ou navegação utilizada no teste
    E dispara pesquisa segundo os controles disponíveis na tela
    Então os resultados ou área de trabalho carregam sem falha funcional de rota

  # Spec: cypress/e2e/documentos/documentosBusca.cy.js
  @AUT-038 @p1 @regression @documentos
  Cenário: Buscar documentos com filtro de período ou campos equivalentes
    Quando o usuário acessa a área de busca de documentos
    E aplica parâmetros de busca (incluindo período quando disponível)
    Então a lista ou mensagem de resultado reflete a consulta realizada

  # Comportamento de produto alvo de outro canal (download além da busca registrada no E2E atual)
  @AUT-018 @p2 @manual @documentos
  Cenário: Download de documento após pesquisa válida
    Dado que existe documento encontrado na busca
    Quando o usuário solicita download
    Então o arquivo é disponibilizado sem erro de negócio tratável
