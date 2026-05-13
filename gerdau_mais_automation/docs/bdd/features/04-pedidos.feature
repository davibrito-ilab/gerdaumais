# language: pt

@pedidos @p1 @regression
Funcionalidade: Módulo Pedidos e carteira comercial
  Como usuário da operação comercial
  Quero acessar hubs, carteiras e filtros de pedidos
  Para consultar e eventualmente exportar dados operacionais

  Contexto:
    Dado que o usuário está autenticado e possui acesso ao ecossistema logado

  # Spec: cypress/e2e/pedidos/pedidosListagem.cy.js (primeiro it)
  @AUT-029 @p1 @smoke @pedidos
  Cenário: Hub de pedidos expõe dois fluxos (ações longos/planos e corte e dobra)
    Quando o usuário acessa a rota principal de pedidos
    Então o hub apresenta fluxo de aços longos e planos
    E disponibiliza entrada para fluxo de corte e dobra

  # Spec: cypress/e2e/pedidos/pedidosListagem.cy.js (segundo it)
  @AUT-030 @p1 @regression @pedidos
  Cenário: Carteira de aços longos permite filtrar e exibir listagem
    Dado que o usuário abriu pedidos de aços longos e planos a partir do hub
    Quando mantém ou ajusta filtros e dispara a consulta
    Então a carteira responde com listagem coerente ao filtro aplicado

  # Spec: cypress/e2e/pedidos/pedidosBuscar.cy.js
  @AUT-031 @p1 @smoke @pedidos
  Cenário: Disparar Buscar pedidos com filtros default da tela
    Dado que o usuário está na carteira de pedidos com controles de busca habilitados
    Quando utiliza ação de buscar mantendo default visível
    Então a lista é atualizada segundo o comportamento atual do ambiente

  # Spec: cypress/e2e/pedidos/pedidosFiltroTipoPedido.cy.js
  @AUT-032 @p1 @regression @pedidos
  Cenário: Alternar tipo de pedido (ex.: Faturado) e buscar
    Dado que toggle de tipo de pedido está disponível
    Quando o usuário altera para estado de faturamento desejado pela regra de teste
    E dispara a busca
    Então os resultados ou estados de lista refletem o filtro solicitado

  # Spec: cypress/e2e/pedidos/pedidosFiltroEmissor.cy.js
  @AUT-033 @p2 @regression @pedidos
  Cenário: Filtrar pedidos por emissor configurado para o ambiente
    Quando o usuário define o emissor alinhado ao dado de QA
    E executa a busca na carteira
    Então o sistema aplica o filtro conforme componentes disponíveis

  # Spec: cypress/e2e/pedidos/pedidosExportarCarteira.cy.js
  @AUT-034 @p2 @regression @pedidos
  Cenário: Disparar exportação da carteira quando o CTA existir
    Dado que texto ou controle de exportar carteira está disponível
    Quando o usuário aciona exportação
    Então o navegador ou aplicação segue fluxo de download ou mensagem prevista

  # Spec: cypress/e2e/pedidos/pedidosCorteEDobra.cy.js
  @AUT-035 @p2 @regression @pedidos
  Cenário: Acessar carteira de corte e dobra a partir do hub
    Dado que o usuário está no hub de pedidos
    Quando escolhe entrada de corte e dobra
    Então a carteira correspondente carrega com estrutura esperada de consulta

  # Rastreabilidade de negócio (sem spec E2E dedicado hoje)
  @AUT-016 @p2 @manual @backlog-automacao @pedidos
  Cenário: Listagem consistente com período informado
    Quando o usuário aplica filtro por intervalo de datas explícito na UI de pedidos
    Então os registros retornados respeitam o período selecionado

  @AUT-017 @p2 @manual @backlog-automacao @pedidos
  Cenário: Detalhe de pedido exibe informações coerentes ao status
    Quando o usuário abre cartão ou tela de detalhe de pedido listado
    Então os dados exibidos são coerentes com o status e etapa do ciclo
