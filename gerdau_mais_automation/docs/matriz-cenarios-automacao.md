# Matriz de Cenários de Automação (Site Gerdau Mais)

> **Inventário E2E atualizado (specs, tags, scripts):** ver [`GUIA-COBERTURA-AUTOMACAO-E2E.md`](./GUIA-COBERTURA-AUTOMACAO-E2E.md). Este arquivo mantém a visão estratégica e a lista dos 30 cenários priorizados; o guia lista o que está implementado no repositório.

## Objetivo
Definir cenários de maior valor para automação E2E com foco em risco de negócio, estabilidade operacional e cobertura regressiva.

## Legenda de prioridade
- **P0**: crítico (receita/operação), executar em smoke diária
- **P1**: alto impacto, executar em regressão frequente
- **P2**: médio impacto, executar em regressão completa
- **P3**: segurança/não funcional, executar em janela dedicada

## 30 Cenários Priorizados

### P0 - Críticos (Smoke)
1. **AUT-001 | Login válido**  
   - Pré-condição: usuário ativo  
   - Fluxo: acessar `/auth`, autenticar, validar saída de `/auth`  
   - Resultado esperado: acesso ao portal sem erro

2. **AUT-002 | Login inválido (senha incorreta)**  
   - Fluxo: autenticar com senha inválida  
   - Resultado esperado: permanece no login com feedback de falha

3. **AUT-003 | Compra por Vitrine (happy path)**  
   - Fluxo: selecionar emissor, entrar em vitrine, adicionar 1 item  
   - Resultado esperado: confirmação de item no carrinho

4. **AUT-004 | Compra por Histórico (happy path)**  
   - Fluxo: selecionar emissor, acessar histórico, adicionar item  
   - Resultado esperado: item adicionado ao carrinho

5. **AUT-005 | Compra selecionando itens por código**  
   - Fluxo: emissor -> comprar selecionando itens -> buscar código -> adicionar  
   - Resultado esperado: item específico adicionado ao carrinho

6. **AUT-006 | Compra por planilha (novo pedido)**  
   - Fluxo: acessar planilha, tratar modal de pedido em andamento com "Novo pedido", adicionar item  
   - Resultado esperado: item no carrinho

7. **AUT-007 | Finalização de pedido (passos 1-4)**  
   - Fluxo: selecionar produtos -> configurar carrinho -> revisar -> finalizar  
   - Resultado esperado: pedido concluído com confirmação final

8. **AUT-008 | Bloqueio sem emissor**  
   - Fluxo: tentar avançar compra sem emissor  
   - Resultado esperado: sistema impede avanço e exibe validação

### P1 - Alta prioridade (Regressão funcional)
9. **AUT-009 | Alterar quantidade no carrinho**  
   - Resultado esperado: subtotal/total atualizam corretamente

10. **AUT-010 | Remover item do carrinho**  
    - Resultado esperado: item removido e total recalculado

11. **AUT-011 | Persistência de carrinho após refresh**  
    - Resultado esperado: itens permanecem após reload

12. **AUT-012 | Persistência de carrinho após relogin**  
    - Resultado esperado: estado do carrinho preservado conforme regra de negócio

13. **AUT-013 | Busca por descrição parcial de produto**  
    - Resultado esperado: lista retorna itens relevantes

14. **AUT-014 | Busca sem resultados**  
    - Resultado esperado: empty state amigável sem erro técnico

15. **AUT-015 | Filtro por categoria/família**  
    - Resultado esperado: lista reflete filtro aplicado

16. **AUT-016 | Navegação para Pedidos + filtro por período**  
    - Resultado esperado: listagem filtrada corretamente

17. **AUT-017 | Detalhe do pedido por status**  
    - Resultado esperado: dados coerentes com lista

18. **AUT-018 | Buscar documentos + download**  
    - Resultado esperado: documento disponível para download sem erro

### P2 - Cobertura de robustez e experiência
19. **AUT-019 | Timeout de carregamento de catálogo**  
    - Fluxo: simular lentidão/reload controlado  
    - Resultado esperado: tratamento resiliente sem travamento permanente

20. **AUT-020 | Overlay/modal de loading intermitente**  
    - Resultado esperado: interação aguarda fim do overlay corretamente

21. **AUT-021 | Modal "Continuar último pedido?" - opção continuar**  
    - Resultado esperado: retoma fluxo anterior sem inconsistência

22. **AUT-022 | Modal "Continuar último pedido?" - opção novo pedido**  
    - Resultado esperado: reinicia fluxo limpo

23. **AUT-023 | Sessão expirada no meio da compra**  
    - Resultado esperado: redireciona para login e recupera contexto esperado

24. **AUT-024 | Navegação cruzada entre módulos (Compras -> Pedidos -> Compras)**  
    - Resultado esperado: sem perda indevida de estado ou crash

25. **AUT-025 | Validação de campos obrigatórios na revisão**  
    - Resultado esperado: bloqueio de finalização e mensagem clara

26. **AUT-026 | Comportamento com recebedor inválido/inativo**  
    - Resultado esperado: bloqueio e orientação ao usuário

### P3 - Segurança e não-funcional
27. **AUT-027 | Controle de acesso por perfil (menus permitidos)**  
    - Resultado esperado: menus/ações respeitam role

28. **AUT-028 | Tentativa de acesso direto por URL sem permissão**  
    - Resultado esperado: bloqueio com redirecionamento seguro

29. **AUT-029 | Performance base do funil de compra**  
    - Métrica: tempo login, tempo abrir catálogo, tempo adicionar carrinho  
    - Resultado esperado: dentro do SLA definido

30. **AUT-030 | Sanitização de mensagens de erro**  
    - Resultado esperado: sem stack traces ou segredos expostos no front

## Escopo de dispositivo e navegador

- **Desktop:** os E2E assumem viewport desktop (`cypress.config.js`); jornadas críticas são validadas nesse contexto.
- **Mobile / responsividade:** **despriorizado** — o Gerdau Mais não foi preparado para mobile; não há automação responsiva versionada no repositório.
- **Navegador:** **Google Chrome** como baseline da automação e padrão recomendado pelo produto; Firefox, Safari e Edge **não são alvo formal** da suíte (o portal pode exibir mensagem para uso do Chrome).

---

## Estratégia de execução sugerida
- **Smoke diária (P0)**: AUT-001 a AUT-008
- **Regressão curta (P0 + P1)**: AUT-001 a AUT-018
- **Regressão completa (P0 + P1 + P2)**: AUT-001 a AUT-026
- **Janela de segurança/não-funcional (P3)**: AUT-027 a AUT-030

## Execução no repositório

| Comando (na pasta `gerdau_mais_automation` ou na raiz com `npm run`) | Escopo |
|----------------------------------------------------------------------|--------|
| `npm run cy:run` | **Suite completa** — todos os specs (ver [`GUIA-COBERTURA-AUTOMACAO-E2E.md`](./GUIA-COBERTURA-AUTOMACAO-E2E.md)) |
| `npm run cy:run:smoke-pr` | Smoke PR (login + vitrine + histórico) |
| `npm run cy:run:regression-nightly` | Regressão noturna (compras P0 + pedidos + menu + finanças + documentos) |
| `npm run cy:run:p0` | Smoke crítica (login + compras P0) |
| `npm run cy:run:p1` | Regressão P1 estável: módulo Pedidos (`pedidosListagem`) |
| `npm run cy:run:p1-compras-opcional` | P1 adicional: carrinho (refresh) e busca sem resultados |
| `npm run cy:run:p0-p1` | P0 + P1 estável em sequência |
| `npm run cy:run:auth` | Todos os specs em `auth/` |
| `npm run cy:run:compras` | Todos os specs em `compras/` |

## Próximo passo recomendado

AUT-009 e AUT-010 estão cobertos por `carrinhoQuantidade.cy.js` e `carrinhoRemocao.cy.js`. Para o **inventário completo** dos specs (incl. pedidos, logout, planilha, pós-pedido) e lacunas vs. esta matriz, use o [`GUIA-COBERTURA-AUTOMACAO-E2E.md`](./GUIA-COBERTURA-AUTOMACAO-E2E.md). Cenários P2/P3 ainda sem spec dedicado (ex.: performance formal, sessão expirada simulada) permanecem candidatos a novas iterações ou testes manuais no pré-deploy.
