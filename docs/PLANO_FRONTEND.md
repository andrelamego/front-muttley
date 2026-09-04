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

| Etapa                       | Entrega                                                                                                      | Critério de conclusão                                                                                   | Skills pertinentes                                             | Estado      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------- |
| 0. Preservação e inventário | Checkpoint, ambiente separado e mapa de funcionalidades/contratos do legado                                  | Versão anterior recuperável; dependências e acessos públicos identificados                              | architecture, api-patterns                                     | Concluída   |
| 1. Produto e IHC            | Arquitetura de informação, jornadas e wireframes de login, início do participante e dashboard administrativo | Tarefas, estados, navegação e comportamento por dispositivo definidos; dúvidas registradas              | anti-ui-slop; acessibilidade na revisão                        | Concluída   |
| 2. Fundação técnica         | Projeto limpo, composição da aplicação, módulos iniciais, tipos, lint e testes                               | Base executa; verificações passam; imports entre módulos têm regras verificáveis                        | architecture, architect-review                                 | Concluída   |
| 3. Sistema visual novo      | Tokens, componentes essenciais e protótipos navegáveis das três telas de referência                          | Hierarquia, estados, teclado e responsividade avaliados; linguagem visual registrada                    | anti-ui-slop, accessibility-compliance-accessibility-audit     | Concluída   |
| 4. Autenticação e navegação | Login, sessão, acesso por perfil e retorno à tarefa solicitada                                               | Sucesso, erro, expiração e acesso negado exercitados; descoberta pública sem login obrigatório          | api-patterns; auditoria de acessibilidade                      | Concluída   |
| 5. Jornada do participante  | Eventos, inscrição, presença, área pessoal e certificados                                                    | Fluxo mobile-first integrado, com regras reais e testes dos limites entre módulos                       | anti-ui-slop, api-patterns                                     | Em andamento|
| 6. Administração            | Dashboard desktop, gestão de eventos e participantes e conclusão                                             | Ações prioritárias acessíveis; métricas reais; formulários e conclusão sem responsabilidades misturadas | anti-ui-slop, architect-review                                 | Pendente    |
| 7. Validação e transição    | E2E, avaliação de usabilidade, acessibilidade e conferência do inventário                                    | Jornada completa validada; links antigos compatíveis; pendências explícitas e plano de retorno          | accessibility-compliance-accessibility-audit, architect-review | Pendente    |

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

### Entrega 1 (04/09/2026) — Fundação Modular e Primeira Fatia Vertical de Autenticação

- **Objetivo:** Estabelecer a nova fundação modular da aplicação em React + Vite + TypeScript, centralizar tokens semânticos, implementar o módulo de autenticação integrado à API real (`POST /api/auth/login` e `GET /api/me`) e conectar a chegada aos dashboards de cada perfil com preservação das rotas públicas.
- **Módulos afetados:** `src/styles/` (tokens), `src/shared/` (http, ui, config), `src/modules/auth/`, `src/modules/painel/`, `src/modules/eventos/`, `src/modules/certificados/`, `src/app/` (rotas, layouts e guards).
- **Skills aplicadas:**
  - `architecture`: módulo `app` compõe módulos funcionais sem ciclos; `domain` puro em TypeScript; contratos e DTOs isolados em `api`.
  - `api-patterns`: mapeamento estrito dos contratos existentes do Spring Boot; normalização de erros (`HttpError` tratando `erros: string[]`, `erro: string` e `message`); ciclo do Bearer token com expiração tratada via interceptor HTTP.
  - `architect-review`: ausência de acoplamento entre UI e transporte HTTP; zero chamadas de rede diretas nos componentes burros; suíte de testes isolada.
  - `accessibility-compliance-accessibility-audit`: formulário de login com rótulos semânticos explícitos, suporte a autofill (`autoComplete`), alternância de exibição de senha via teclado, mensagens com `role="alert"`, alvos de toque >= 44px em mobile e foco visível em todos os controles.
- **Comandos e resultados comprovados:**
  - `npm test`: 24 testes passando (20 testes de regressão de autenticação + 4 testes novos de normalização de erros HTTP da API).
  - `npm run build`: compilação TypeScript limpa (`tsc -b && vite build`) com redução significativa de bundle (CSS de 115 kB para 39.8 kB; JS de 442 kB para 335 kB).
  - `npx eslint src/app src/modules src/shared src/utils src/App.tsx src/main.tsx`: 0 erros e 0 avisos no código novo reconstruído.
- **Telas e jornadas verificadas:**
  - Login em celular (360px - 390px) e desktop (1366px): campos, alternância de senha, submissão por teclado, tratamento de erro 401 e sessão expirada.
  - Início do Participante (`/user/inicio`): dados reais de `/me/participacoes`, próximo evento em destaque, janela de presença calculada ([-10m, +10m]) e estado vazio acolhedor.
  - Dashboard Administrativo (`/admin/inicio`): métricas operacionais reais de `/api/admin/inicio` (eventos ativos, próximos 7 dias, certificados 30 dias com variação percentual) e tabela de próximos eventos.
  - Descoberta pública de eventos (`/` e `/eventos`), detalhes (`/eventos/:id`), confirmação de presença (`/eventos/:id/confirmar-presenca`) e validação de certificados (`/certificados/:codigo`) preservadas.
- **Limitações atuais e pendências reais:**
  - Os CRUDs administrativos detalhados de edição de eventos, criação e conclusão com lote de assinaturas (`src/pages/admin/*`) ainda utilizam o modelo antigo e serão refatorados na Etapa 6.
  - Validação E2E com backend em execução local requer o serviço Spring Boot online na porta 8083.
- **Próxima entrega:** Etapa 5 (Refinamento da jornada completa de inscrição, presença e certificados do participante) e Etapa 6 (Migração modular da gestão e conclusão de eventos pelo administrador).

## Critério para substituir a versão anterior

- Jornadas essenciais e funcionalidades do inventário implementadas ou mudanças de escopo explicitamente registradas.
- Regras de negócio respeitadas e contratos/links públicos compatíveis.
- Build, tipos, lint e testes da base nova passando, com a evidência da execução.
- Fluxo integrado demonstrável em ambiente de teste.
- Revisão de usabilidade, acessibilidade e dependências entre módulos concluída, com pendências documentadas.
- Versão anterior recuperável e configuração de publicação registrada.

A modularização reduz o impacto das mudanças; ela não garante que nunca haverá refatoração. Evitar reescritas significa manter limites verificáveis, testes úteis e decisões proporcionais ao tamanho do projeto.
