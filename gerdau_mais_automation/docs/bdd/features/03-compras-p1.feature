# language: pt

@compras @p1 @regression
Funcionalidade: Gestão de carrinho e busca de produtos
  Como comprador
  Quero gerenciar itens e pesquisar produtos
  Para montar pedidos corretos e rápidos

  Contexto:
    Dado que o usuário autenticado está no fluxo de compras
    E existe pelo menos um item disponível para compra quando necessário ao cenário

  # Spec: cypress/e2e/compras/carrinhoQuantidade.cy.js
  @AUT-009 @p1 @regression
  Cenário: Alterar quantidade no carrinho
    Quando o usuário incrementa a quantidade do primeiro item no carrinho
    Então o sistema atualiza subtotal e total conforme a nova quantidade

  # Spec: cypress/e2e/compras/carrinhoRemocao.cy.js
  @AUT-010 @p1 @regression
  Cenário: Remover item do carrinho
    Quando o usuário remove o primeiro item do carrinho
    Então o sistema remove o item da lista
    E recalcula o total do pedido

  # Spec: cypress/e2e/compras/carrinhoPersistencia.cy.js
  @AUT-011 @p1 @regression
  Cenário: Persistência de carrinho após refresh
    Quando o usuário adiciona item no carrinho
    E recarrega a página
    Então o sistema mantém os itens previamente adicionados conforme regra da sessão

  # Spec: cypress/e2e/compras/carrinhoPersistenciaRelogin.cy.js
  @AUT-012 @p1 @regression
  Cenário: Persistência de carrinho após relogin
    Quando o usuário adiciona item no carrinho
    E encerra sessão
    E autentica novamente
    Então o fluxo valida comportamento esperado da UI de carrinho após novo login

  # Alinhamento: busca textual no catálogo — spec vitrineBuscaCatalogo.cy.js cobre caso principal
  @AUT-013 @p2 @regression
  Esquema do Cenário: Busca no catálogo por termo
    Quando o usuário pesquisa pelo termo "<termo>" no catálogo
    Então o sistema responde com resultados ou estado esperado pela busca

    Exemplos:
      | termo     |
      | vergalhao |
      | arame     |

  # Spec: cypress/e2e/compras/buscaSemResultados.cy.js
  @AUT-014 @p1 @regression
  Cenário: Busca sem resultados
    Quando o usuário pesquisa um termo inexistente
    Então o sistema exibe estado de vazio sem erro técnico

  # Cobertura BDD apenas: não há spec E2E dedicado a este filtro hoje (@backlog-automacao)
  @AUT-015 @p2 @manual @regression @backlog-automacao
  Cenário: Filtro por categoria ou família de produtos
    Quando o usuário aplica filtro de categoria ou família no catálogo
    Então o sistema mostra apenas produtos compatíveis com o filtro aplicado

  # Spec: cypress/e2e/compras/vitrineBuscaCatalogo.cy.js
  @AUT-023 @p2 @regression
  Cenário: Buscar produto por texto ou SKU após entrada na vitrine
    Dado que o usuário iniciou fluxo por vitrine e está no catálogo
    Quando o usuário utiliza busca por texto ou código de produto
    Então o sistema apresenta listagem utilizável pela jornada de compra

  # Spec: cypress/e2e/compras/vitrineMaisDetalhes.cy.js — pendente quando CTA não existir na listagem
  @AUT-024 @p2 @regression
  Cenário: Abrir detalhes expandidos do produto quando o CTA existir
    Dado que o usuário está no catálogo
    Quando existe o call-to-action de mais detalhes na listagem
    E o usuário aciona esse detalhamento
    Então o sistema exibe informação adicional do produto de forma navegável

  # Spec: cypress/e2e/compras/planilhaDownloadModelo.cy.js
  @AUT-025 @p2 @regression
  Cenário: Download ou abertura do modelo de planilha quando disponível
    Dado que o usuário está no fluxo de compra por planilha
    Quando o sistema oferece o modelo oficial
    E o usuário solicita o recurso de modelo
    Então o download ou abertura do arquivo é iniciada sem falha

  # Spec: cypress/e2e/compras/planilhaUploadArquivoInvalido.cy.js
  @AUT-026 @p2 @negative @regression
  Cenário: Rejeitar upload de arquivo que não é planilha válida
    Quando o usuário anexa um arquivo inválido (ex.: formato .txt em vez da planilha esperada)
    Então o sistema informa inconsistência ou impede prosseguir sem aceitar dados inválidos

  # Spec: cypress/e2e/compras/posPedidoMeusPedidosEPdf.cy.js
  @AUT-027 @p1 @regression
  Cenário: Após envio do pedido, exibir CTAs de PDF e Meus pedidos
    Dado que o usuário concluiu o envio de um pedido
    Então a tela confirma o envio
    E há caminhos disponíveis para PDF do pedido e para Meus pedidos

  # Spec: cypress/e2e/compras/carrinhoChecklistCampos.cy.js
  @AUT-028 @p3 @regression
  Cenário: Detectar campos opcionais de carrinho (unidade, destinação, pagamento)
    Dado que o usuário está no carrinho
    Então são verificadas na interface presença ou ausência esperada dos campos de configuração
