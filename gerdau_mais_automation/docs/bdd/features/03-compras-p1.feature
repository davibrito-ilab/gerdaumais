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

  # Spec: cypress/e2e/compras/vitrineFiltroCatalogoFamilia.cy.js — `skip` quando não há laterais/facetas detectáveis
  @AUT-015 @p2 @regression @compras
  Cenário: Filtro por categoria ou família de produtos
    Quando o usuário aplica filtro de categoria ou família no catálogo conforme elementos laterais ou facetas expostos
    Então o catálogo permanece navegável e sem erro genérico após aplicar uma faceta detectável pela automação

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

  # Spec: cypress/e2e/compras/vitrineMaisDetalhes.cy.js (segundo it) — skip se não houver inclusão típica na vista de detalhe
  @AUT-051 @p2 @regression @compras
  Cenário: Da página ou modal de detalhe, adicionar produto ao carrinho quando a UI disponibilizar inclusão típica
    Dado que o usuário abriu o detalhamento conforme cenário AUT-024
    Quando a interface disponibiliza ação típica de incluir ao carrinho conforme selectors compartilhados do fluxo de compras
    E o usuário aciona inclusão ao carrinho
    Então o corpo apresenta indícios de confirmação de inclusão ao carrinho segundo os mesmos critérios usados no fluxo principal de compras

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

  # Spec: cypress/e2e/compras/compraCorteEDobra.cy.js — rotas QA `/purchase/fabrication/*`
  # Distinto da carteira Pedidos (/orders — ver `pedidosCorteEDobra.cy.js`).
  @AUT-039 @p1 @regression @compras
  Cenário: Entrar na compra tipo Corte e dobra até a área de fabricação após seleção do emissor
    Dado que o usuário autenticado acessou a landing de Comprar e selecionou um emissor válido quando exigido
    Quando o usuário escolhe a entrada Corte e dobra ou fabricação conforme disponível ou rota de identificação de obra na fabricação
    Então o sistema exibe uma tela dentro de `/purchase/fabrication/` coerente com obra, projeto, pedidos ou fabricação conforme o texto disponível no QA

  @AUT-040 @p1 @regression @compras
  Cenário: Acessar o histórico de pedidos da jornada de fabricação (corte/dobra)
    Dado que o usuário mantém sessão válida na Comprar após aplicar emissor quando necessário
    Quando o usuário navega para o histórico de fabricação configurado como `/purchase/fabrication/last-orders`
    Então a interface apresenta conteúdo coerente com pedidos ou fabricação segundo o texto visível na tela

  # Spec: cypress/e2e/compras/compraHistoricoRevisarPedido.cy.js — distinto de `compraPorHistorico.cy.js` (smoke até envio).
  @AUT-041 @p1 @regression @compras
  Cenário: Compra por histórico na página Comprar até etapa revisar pedido
    Dado que o usuário autenticado está na página de Comprar com um emissor válido selecionado
    Quando o usuário abre comprar por histórico repetir/refazer desde repeat-order até o carrinho quando aplicável e avança até a etapa de revisão do pedido
    Então o sistema indica textualmente ou por passo equivalente à etapa revisar pedido antes do envio final

  # Spec: cypress/e2e/compras/compraHistoricoFinalizePedido.cy.js — sem fallback pelo catálogo; exige histórico repetível no QA.
  @AUT-042 @p1 @regression @compras
  Cenário: Histórico de compras até pedido enviado sem passar pela vitrine
    Dado que o usuário autenticado seleciona emissor com pedidos repetíveis no histórico de Comprar
    Quando o usuário refaz pelo repeat-order até o carrinho, avança até revisão e confirma o envio final
    Então o sistema confirma o pedido enviado segundo os mesmos critérios do fluxo vigente na confirmação

  # Spec: cypress/e2e/compras/compraVitrineDoisItens.cy.js — opcional segundo SKU (`produto2` no Cypress env).
  @AUT-043 @p1 @regression @compras
  Cenário: Carrinho vitrine com duas inclusões antes da finalização
    Dado que o usuário autenticado está na vitrine após seleção de emissor
    Quando o usuário adiciona dois itens pelo catálogo (mesmo SKU duas vezes ou `produto` + `produto2`) e conclui o checkout
    Então o pedido é finalizado enviado com evidência típica de confirmação pós-checkout

  # --- Cenários complementares (suite 2026-05-18) ---
  # Spec: cypress/e2e/compras/planilhaUploadComplementares.cy.js + `npm run fixtures:planilhas`
  @AUT-044 @p2 @negative @regression @compras
  Cenário: Planilha XLSX com SKU inexistente acusa validação ao importar
    Dado que o usuário abriu spreadsheet com emissor selecionado
    Quando o usuário anexa arquivo com código claramente inexistente para o QA
    Então o texto da interface indica erro ou validação atrelados à linha ou ao produto

  @AUT-045 @p2 @negative @regression @compras
  Cenário: Planilha XLSX com colunas estranhas gera erro de validação ao importar
    Dado que o usuário envia arquivo com nomes fictícios de coluna
    Então aparece comunicação falando sobre formato, modelo ou estrutura da planilha

  @AUT-046 @p2 @regression @compras
  Cenário: Planilha com uma linha aceita modelo genérico e chega ao carrinho quando o QA permitir colunas exemplo
    Dado upload do arquivo gerado pela automação (“Código / Quantidade”)
    Quando o usuário conclui a etapa disponível para adicionar à compra pelo fluxo spreadsheet
    E abre o carrinho pelo header superior
    Então o corpo apresenta indícios de carrinho/configuração até revisão inicial

  @AUT-047 @p2 @regression @compras
  Cenário: Planilha com duas linhas do mesmo SKU repete código na página após importação
    Dado dois registros com o SKU principal do Cypress env na fixture de duas linhas
    Quando o arquivo é processado e a grade volta visível ao usuário
    Então o código do SKU aparece ao menos duas vezes antes de outros passos manuais

  # Spec: cypress/e2e/compras/compraVitrineTresItens.cy.js — `produto2`/`produto3` opcional
  @AUT-048 @p1 @regression @compras
  Cenário: Vitrine com três inclusões segue checkout até pedido efetivo
    Dado que há catálogo de vitrine configurado pelo emissor
    Quando o usuário faz três adições (varia SKU por env quando existir senão mesmo SKU repetido)
    Então sistema confirma pedido segundo critérios usuais de finalização

  # Spec: cypress/e2e/compras/carrinhoNavegacaoVoltar.cy.js
  @AUT-049 @p2 @regression @compras
  Cenário: Histórico do browser para trás desde carrinho mantém navegação em compras
    Quando há item no carrinho e navegador regressa usando histórico
    Então o pathname atual segue sendo subconjunto habitual `/purchase/` do portal

  # Spec: cypress/e2e/compras/compraCorteEDobra.cy.js (terceiro `it` automatizado dentro do arquivo)
  @AUT-050 @p2 @regression @compras
  Cenário complementar de fabricação — avanço por CTAs até revisar pedido quando o QA integrar ao checkout longos
    Dado que o usuário permanece dentro de `/purchase/fabrication/` após escolha Corte/dobra
    Quando aciona até o número máximo previsto nos passos automatizados
    Então o fluxo alcança carrinho longos/texto revisar pedidos ou permanece com conteúdo coerente de fabricação
