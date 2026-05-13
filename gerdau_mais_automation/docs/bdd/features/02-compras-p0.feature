# language: pt

@compras @p0
Funcionalidade: Fluxos críticos de compra
  Como comprador
  Quero realizar compras por diferentes jornadas
  Para concluir pedidos com segurança e previsibilidade

  Contexto:
    Dado que o usuário autenticado acessou o módulo de compras
    E o emissor de pedido está disponível para seleção quando exigido pelo fluxo

  # Spec: cypress/e2e/compras/compraPorVitrine.cy.js
  @AUT-003 @p0 @smoke @critical
  Cenário: Compra por vitrine
    Quando o usuário seleciona um emissor válido
    E escolhe a opção de compra por vitrine
    E adiciona produto ao carrinho pelo catálogo
    E finaliza pedido até confirmação de envio
    Então o sistema confirma que o pedido foi enviado com sucesso

  # Spec: cypress/e2e/compras/compraPorHistorico.cy.js
  @AUT-004 @p0 @smoke @critical
  Cenário: Compra por histórico
    Quando o usuário seleciona um emissor válido
    E escolhe a opção de compra por histórico quando disponível
    E monta ou complementa carrinho e finaliza o pedido quando aplicável ao ambiente
    Então o sistema confirma que o pedido foi enviado com sucesso quando o fluxo E2E se completa

  # Spec: cypress/e2e/compras/compraSelecionandoItens.cy.js
  @AUT-005 @p0 @smoke @critical
  Cenário: Compra selecionando itens por código
    Quando o usuário seleciona um emissor válido
    E escolhe a opção de compra selecionando itens
    E pesquisa por código configurado para o QA
    E adiciona o item ao carrinho
    E avança até finalização do pedido
    Então o sistema confirma que o pedido foi enviado com sucesso

  # Spec: cypress/e2e/compras/compraPorPlanilha.cy.js
  @AUT-006 @p0 @smoke @critical
  Cenário: Compra por planilha (ou fallback por catálogo quando fluxo não aplicável ao snapshot)
    Quando o usuário seleciona um emissor válido
    E segue pela opção de compra por planilha ou equivalente válido na versão atual
    E conclui a jornada até envio confirmado quando possível pelo ambiente
    Então o sistema confirma que o pedido foi enviado com sucesso

  # Spec: cypress/e2e/compras/compraFinalizacaoCompleta.cy.js
  @AUT-007 @p0 @smoke @critical
  Cenário: Finalização de pedido nos passos de carrinho e checkout
    Quando o usuário possui itens no carrinho
    E avança pelas etapas de configurar carrinho, revisar e efetivar o pedido
    Então o sistema conclui o pedido com mensagem ou indicadores de pedido efetivado

  # Spec: cypress/e2e/compras/compraSemEmissor.cy.js
  @AUT-008 @p0 @smoke @critical @negative
  Cenário: Bloqueio de avanço sem emissor
    Quando o usuário tenta iniciar ou prosseguir na compra sem selecionar emissor quando obrigatório
    Então o sistema não permite ignorar obrigatoriedade do emissor
    E bloqueia com validação esperada até correção pela seleção
