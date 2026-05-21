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

  # Spec: cypress/e2e/documentos/documentosBusca.cy.js — segundo cenário valida apenas indícios de artefatos/CTAs
  @AUT-018 @p2 @regression @documentos
  Cenário: Após pesquisa, a tela apresenta elementos típicos de download ou resultado vazio
    Dado que o usuário concluiu busca válida conforme período configurado pelo teste
    Quando observa resultado ou estado vazio
    Então o corpo menciona arquivo ou expõe CTA/coerência com download quando aplicável ao perfil QA

  # Spec: cypress/e2e/menu/navegacaoCruzadaComprasPedidos.cy.js
  @AUT-052 @p2 @menu @pedidos @compras @regression
  Cenário: Navegar de Pedidos (hub) para Comprar via menu superior preserva UX operacional
    Dado dashboard autenticado
    Quando o usuário acessa Pedidos pelo menu até o hub `/orders`
    E em seguida aciona item Comprar no menu até contexto `/purchase/` ou tipo de material
    Então cada etapa não apresenta tela irreconhecível e mantém elementos principais esperados pelo portal
