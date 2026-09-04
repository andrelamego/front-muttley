# Plano de reconstrução do frontend

Revisão de 04/09/2026: este plano substitui a proposta anterior de melhorias incrementais da interface. O autor decidiu recomeçar o frontend do zero, com identidade visual nova, fundamentos de IHC/UI/UX e uma base desacoplada e modular.

A reconstrução inclui implementação, componentes, estilos e organização do frontend. Backend, regras de negócio e contratos existentes continuam como referência. React + Vite + TypeScript permanece como direção técnica; recomeçar não exige trocar o framework.

## Prioridades do autor

- Login descomplicado.
- Dashboard eficiente, orientado a tarefas e planejado antes de sua implementação.
- Mobile-first para público e participantes; administração projetada primeiro para desktop.
- Navegação fluida, consistente e com preservação de contexto.
- IHC, acessibilidade e UI/UX aplicadas e verificadas.
- Visual moderno, sem obrigação de manter a identidade atual.
- Módulos com responsabilidades e contratos claros para reduzir o custo de mudanças e a necessidade de reescritas amplas.

## Como recomeçar sem perder a referência

**Não apagar a pasta inteira do projeto.** Registrar um checkpoint recuperável da versão atual no Git, incluindo os documentos e alterações pendentes, antes de substituir a implementação. Arquivos locais ignorados pelo Git que ainda sejam necessários precisam ser preservados separadamente.

Criar uma branch de reconstrução; uma worktree é uma opção para manter a versão anterior acessível em outra pasta. A nova base pode substituir os arquivos da aplicação nessa branch, sem obrigação de carregar componentes ou CSS antigos. Não excluir .git nem os repositórios irmãos.

Antes da substituição, levantar páginas, endpoints, autenticação, formatos de erro, uploads e links públicos usados pelo sistema. A implementação legada serve para esse inventário. Depois da transição, pode permanecer somente no histórico, sem sustentar duas aplicações em produção.

Este pedido atualiza o planejamento: nenhum código do aplicativo foi removido, nenhuma branch foi criada e a implementação nova ainda não foi iniciada.

## Documentos que orientam o trabalho

- [Produto e design](../PRODUCT_DESIGN.md): jornadas e critérios observáveis.
- [Arquitetura](ARQUITETURA_FRONTEND.md): módulos, dependências e estratégia de testes.
- [Skills](SKILLS_FRONTEND.md): seleção por etapa e evidências necessárias.
- [ADR inicial](decisoes/001-frontend-modular.md): alternativas, custos e motivo da arquitetura proposta.
- [Requisitos do sistema](../../Backend-Muttley/docs/requisitos-e-regras-de-negocio.md): referência das regras de negócio.

## Etapas e critérios de conclusão

| Etapa                       | Entrega                                                                                                      | Critério de conclusão                                                                                   | Skills pertinentes                                             | Estado   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------- |
| 0. Preservação e inventário | Checkpoint, ambiente separado e mapa de funcionalidades/contratos do legado                                  | Versão anterior recuperável; dependências e acessos públicos identificados                              | architecture, api-patterns                                     | Pendente |
| 1. Produto e IHC            | Arquitetura de informação, jornadas e wireframes de login, início do participante e dashboard administrativo | Tarefas, estados, navegação e comportamento por dispositivo definidos; dúvidas registradas              | anti-ui-slop; acessibilidade na revisão                        | Pendente |
| 2. Fundação técnica         | Projeto limpo, composição da aplicação, módulos iniciais, tipos, lint e testes                               | Base executa; verificações passam; imports entre módulos têm regras verificáveis                        | architecture, architect-review                                 | Pendente |
| 3. Sistema visual novo      | Tokens, componentes essenciais e protótipos navegáveis das três telas de referência                          | Hierarquia, estados, teclado e responsividade avaliados; linguagem visual registrada                    | anti-ui-slop, accessibility-compliance-accessibility-audit     | Pendente |
| 4. Autenticação e navegação | Login, sessão, acesso por perfil e retorno à tarefa solicitada                                               | Sucesso, erro, expiração e acesso negado exercitados; descoberta pública sem login obrigatório          | api-patterns; auditoria de acessibilidade                      | Pendente |
| 5. Jornada do participante  | Eventos, inscrição, presença, área pessoal e certificados                                                    | Fluxo mobile-first integrado, com regras reais e testes dos limites entre módulos                       | anti-ui-slop, api-patterns                                     | Pendente |
| 6. Administração            | Dashboard desktop, gestão de eventos e participantes e conclusão                                             | Ações prioritárias acessíveis; métricas reais; formulários e conclusão sem responsabilidades misturadas | anti-ui-slop, architect-review                                 | Pendente |
| 7. Validação e transição    | E2E, avaliação de usabilidade, acessibilidade e conferência do inventário                                    | Jornada completa validada; links antigos compatíveis; pendências explícitas e plano de retorno          | accessibility-compliance-accessibility-audit, architect-review | Pendente |

A documentação de planejamento está preparada; isso não marca as etapas de implementação como concluídas. A disponibilidade das skills no Antigravity deve ser conferida antes de cada uso.

## Primeira entrega de desenvolvimento

Começar pelas etapas 0 e 1: inventário e decisões de experiência. Não reproduzir a tela antiga antes de definir a nova navegação.

A fundação técnica da etapa 2 deve ser pequena e executável. Em seguida, construir uma jornada integrada de login e chegada ao painel do perfil, usando os componentes essenciais da etapa 3. Evoluir os demais módulos em entregas verticais, sem esperar que todas as telas ou abstrações estejam prontas.

O dashboard administrativo precisa ser planejado na etapa 1, mesmo que suas consultas e ações sejam implementadas na etapa 6. Cada bloco terá usuário, pergunta, fonte de dados e próximo passo definidos.

## Uso das skills

**As skills fazem parte do método de desenvolvimento, e não apenas da lista de ferramentas.** Antes de uma etapa, selecionar e ler as skills adequadas, explicar o objetivo da aplicação e registrar os entregáveis produzidos. Revisão visual não substitui arquitetura, testes funcionais ou avaliação de acessibilidade.

Seguir [SKILLS_FRONTEND.md](SKILLS_FRONTEND.md). Não carregar todas as skills nem adicionar dependências sugeridas por elas sem relação com o problema. As decisões do autor prevalecem: a identidade antiga pode ser descartada e telas administrativas são planejadas para desktop.

## Primeiro pedido para o Antigravity

    Leia AGENTS.md, PRODUCT_DESIGN.md, docs/PLANO_FRONTEND.md,
    docs/ARQUITETURA_FRONTEND.md e docs/SKILLS_FRONTEND.md.

    O objetivo é reconstruir totalmente o frontend do Muttley em React + Vite,
    com identidade visual nova e módulos desacoplados.
    Comece pelas etapas 0 e 1: verifique o Git, preserve um checkpoint e
    levante as funcionalidades e os contratos do frontend anterior.
    Não apague a pasta do repositório nem altere os serviços irmãos.

    Verifique quais skills do plano estão disponíveis, leia as pertinentes e
    informe quais aplicará. Use architecture para revisar os limites dos módulos
    e anti-ui-slop para estruturar a nova experiência a partir das tarefas.
    A instrução de preservar a identidade existente não se aplica a esta reformulação.

    Produza o mapa de navegação e os wireframes de login simples em celular,
    início do participante em celular e dashboard administrativo em desktop.
    Defina estados, ações principais, critérios de IHC e verificação de acessibilidade.
    Relacione a proposta aos contratos reais, sem inventar métricas ou funcionalidades.
    Registre decisões, dúvidas e evidências nos documentos correspondentes.

## Registro por entrega

Registrar data, objetivo, módulos afetados, skill efetivamente aplicada, decisões, comandos e resultados, estados/tamanhos de tela verificados e limites das evidências. Quando uma decisão mudar, atualizar o ADR relacionado.

Os 20 testes do frontend anterior validam utilitários de autenticação. São referências para regressão, não cobertura automática da nova aplicação. O total histórico de 278 testes do sistema também não deve ser apresentado como validação do frontend reconstruído.

## Critério para substituir a versão anterior

- Jornadas essenciais e funcionalidades do inventário implementadas ou mudanças de escopo explicitamente registradas.
- Regras de negócio respeitadas e contratos/links públicos compatíveis.
- Build, tipos, lint e testes da base nova passando, com a evidência da execução.
- Fluxo integrado demonstrável em ambiente de teste.
- Revisão de usabilidade, acessibilidade e dependências entre módulos concluída, com pendências documentadas.
- Versão anterior recuperável e configuração de publicação registrada.

A modularização reduz o impacto das mudanças; ela não garante que nunca haverá refatoração. Evitar reescritas significa manter limites verificáveis, testes úteis e decisões proporcionais ao tamanho do projeto.
