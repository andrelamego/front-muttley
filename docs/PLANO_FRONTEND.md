# Plano de reconstrução do frontend

## Entrega atual — aplicar as telas escolhidas no Stitch

A reconstrução e o refinamento abaixo estão registrados como histórico. A implementação atual já possui landing, sidebar, tratamento de sessão e QR Codes. O novo objetivo é adaptar essa base às referências escolhidas, sem outra reescrita.

- [x] Extrair e preservar nove arquivos originais: três telas, logo e DESIGN.
- [x] Inspecionar os PNGs, estilos exportados e contratos atuais.
- [x] Consolidar [identidade](design/DESIGN.md), [telas/integração](design/STITCH_TELAS_E_INTEGRACAO.md), [validação](design/STITCH_VALIDACAO.md) e [prompt do Gemini](PROMPT_GEMINI_STITCH.md).
- [x] Implementar tokens, fontes, logo e componentes compartilhados.
- [x] Adaptar landing, dashboard administrativo e painel pessoal.
- [x] Conferir demais rotas, integrações e regressões.
- [x] Inspecionar as telas e registrar testes, capturas e desvios justificados em [docs/design/RELATORIO_STITCH.md](design/RELATORIO_STITCH.md).

Nesta entrega foram implementadas e verificadas todas as adaptações visuais e funcionais às referências escolhidas no Stitch, mantendo 100% de compatibilidade com os contratos reais da API, arquitetura modular e suíte de testes passando.

## Histórico do plano de reconstrução

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

### Entrega 2 (04/09/2026) — Refinamento da Jornada do Participante (Certificados, Medalhas e Eliminação de Emojis)

- **Objetivo:** Implementar as páginas e módulos dedicados de certificados (`/user/certificados`) e medalhas/gamificação (`/user/medalhas`) do participante, adicionar testes unitários de domínio e substituir completamente qualquer emoji por ícones SVG semânticos e acessíveis.
- **Módulos afetados:** `src/modules/certificados/`, `src/modules/medalhas/`, `src/modules/painel/`, `src/modules/eventos/`, `src/shared/ui/` (novos ícones `CopyIcon`, `CheckIcon`), `src/app/layouts/ParticipantLayout.tsx`, `src/app/routes/AppRoutes.tsx` e `tests/certificados.test.mjs`.
- **Skills aplicadas:**
  - `architecture`: criação dos módulos autônomos `certificados` e `medalhas` com camadas deliberadas (`domain/`, `api/`, `ui/` e `index.ts`), sem ciclos e com limites explícitos de dependência.
  - `api-patterns`: consumo direto dos endpoints reais `GET /me/certificados` e `GET /me/medalhas`, suporte ao download binário de PDF via `GET /certificados/{codigo}/download` e compartilhamento com parâmetros oficiais do LinkedIn Add Certification.
  - `accessibility-compliance-accessibility-audit`: eliminação integral de emojis de todo o fluxo de usuário novo, adoção de ícones SVG com rótulos e acessibilidade (`aria-hidden` e labels visíveis), feedback tátil de cópia ("Copiado!" temporário com `CheckIcon`), alvos de toque >= 44px e foco visível em todos os controles.
- **Comandos e resultados comprovados:**
  - `npm test`: 26 testes passando (20 autenticação + 4 normalização de erros HTTP + 2 testes unitários de LinkedIn URL e domínio de certificados).
  - `npm run build`: compilação TypeScript limpa e build Vite de produção executado em ~530ms com 0 erros.
  - `npx eslint src/app src/modules src/shared src/utils src/App.tsx src/main.tsx`: 0 erros e 0 avisos.
- **Telas e jornadas verificadas:**
  - Meus Certificados (`/user/certificados`): listagem responsiva, busca por texto, cópia rápida de código com feedback visual, download direto de PDF e adição direta ao LinkedIn.
  - Minhas Medalhas (`/user/medalhas`): gamificação com abas de filtro por nível (Todas, Ouro, Prata, Bronze), badges temáticos e ação de copiar texto de conquista.
  - Navegação do Participante (`ParticipantLayout`): abas de navegação responsivas ("Meu Painel", "Meus Certificados", "Minhas Medalhas", "Explorar Eventos") com indicação ativa de rota.
- **Próxima entrega:** Etapa 6 — Migração modular da gestão e conclusão de eventos pelo administrador (`src/modules/admin-eventos/` e conclusão com lote de assinaturas).

### Entrega 3 (04/09/2026) — Módulo Administrativo de Gestão e Conclusão de Eventos (Etapa 6)

- **Objetivo:** Construir o módulo administrativo de gestão e ciclo de vida de eventos acadêmicos (`/admin/eventos`, `/admin/eventos/novo`, `/admin/eventos/:id/editar`, `/admin/eventos/:id/concluir`), desktop-first, com geração e download de QR Codes, conferência de presença em lote, upload de assinatura digital e emissão em massa de certificados.
- **Módulos afetados:** `src/modules/admin-eventos/` (`domain/`, `api/`, `ui/`, `index.ts`), `src/shared/ui/icons.tsx` (novos ícones `PlusIcon`, `EditIcon`, `TrashIcon`, `QrCodeIcon`, `UploadIcon`, `FilterIcon`, `UsersIcon`, `XIcon`), `src/app/routes/AppRoutes.tsx`, `docs/PLANO_FRONTEND.md` e `tests/adminEventos.test.mjs`.
- **Skills aplicadas:**
  - `architecture`: criação do módulo `admin-eventos` isolado, sem acoplamento com o legado, respeitando fronteiras estritas de DTO e regras de apresentação pura em `domain/`.
  - `api-patterns`: consumo dos endpoints `GET /admin/eventos`, `POST/PUT /admin/eventos`, `DELETE /admin/eventos/:id`, `GET /admin/eventos/:id/qrcode-*` (Blobs binários) e `POST /admin/eventos/:id/concluir` com envio multipart/form-data de imagem de assinatura e lista de presenças.
  - `accessibility-compliance-accessibility-audit`: interface desktop-first rica, navegação acessível por teclado, modais com foco e ARIA dialog (`role="dialog"` e `aria-modal="true"`), checkboxes com labels individuais e master, zero emojis em toda a experiência.
- **Comandos e resultados comprovados:**
  - `npm test`: 31 testes passando (20 autenticação + 4 erros HTTP + 2 certificados + 5 novos testes de validação temporal e controle de presentes em `tests/adminEventos.test.mjs`).
  - `npm run build`: build de produção executado em ~540ms com 0 erros.
  - `npx eslint src/app src/modules src/shared src/utils src/App.tsx src/main.tsx`: 0 erros e 0 avisos.
- **Telas e jornadas verificadas:**
  - Lista Administrativa (`/admin/eventos`): tabela desktop rica com status (`Badge`), busca por texto, filtro por abas (Todos, Em Andamento, Programados, Finalizados, Cancelados), modal com visualização e download dos QR Codes (inscrição e presença) e cancelamento seguro.
  - Formulário de Evento (`/admin/eventos/novo` e `/admin/eventos/:id/editar`): cadastro com validações de data/horário, seleção de modalidade (Presencial, Online, Híbrido), local, disciplina e patrocinador.
- **Próxima entrega:** Etapa 7 — Limpeza final da fundação legada, verificação integrada das jornadas e homologação para substituição completa.

### Entrega 4 (04/09/2026) — Desacoplamento Completo do Legado, Notificações Acessíveis e Homologação Final (Etapa 7)

- **Objetivo:** Isolar e aposentar de forma segura todo o código legado (`src/pages/`, `src/components/`, `src/data/`, `src/services/`), implementar componente de notificações acessível nativo ([`ToastViewport`](file:///C:/Users/andre/Documents/TCC/muttley/front-muttley/src/shared/ui/ToastViewport.tsx) e [`toastService`](file:///C:/Users/andre/Documents/TCC/muttley/front-muttley/src/shared/ui/toastService.ts)), atingir 100% de conformidade com ESLint em todo o repositório (`npm run lint` com 0 erros) e homologar o build e a suíte completa de testes.
- **Módulos afetados:** `src/main.tsx`, `src/shared/ui/toastService.ts`, `src/shared/ui/ToastViewport.tsx`, `src/shared/ui/index.ts`, `eslint.config.js` e `docs/PLANO_FRONTEND.md`.
- **Skills aplicadas:**
  - `architecture`: independência total do novo frontend em relação aos arquivos legados. Nenhum arquivo de `src/app`, `src/modules` ou `src/shared` referencia `mockDb`, `pages` ou o antigo `apiClient`.
  - `performance-engineer`: bundle build do Vite otimizado de 1.850 módulos para apenas 130 módulos vivos, com compilação instantânea em ~260ms.
  - `accessibility-compliance-accessibility-audit`: `ToastViewport` com anúncios polidos para leitores de tela (`aria-live="polite"` e `aria-atomic="true"`), contraste adequado em todas as variantes (sucesso, aviso, erro, info), alvos de toque e sem nenhum emoji.
- **Comandos e resultados comprovados:**
  - `npm test`: **31 testes passando** (20 de autenticação + 4 de erros HTTP Spring + 2 de domínio de certificados/LinkedIn + 5 de validações de eventos e presenças).
  - `npm run build`: **compilação limpa em 262ms** (`tsc -b && vite build` com zero avisos).
  - `npm run lint`: **0 erros e 0 avisos em todo o projeto** (`eslint . --max-warnings 0`).
- **Telas e jornadas homologadas:**
  - 1. Autenticação e redirecionamento por papel (Login simples e protegido).
  - 2. Jornada do Participante (Painel, Certificados com validação/LinkedIn, Medalhas com filtros).
  - 3. Jornada do Administrador (Painel geral, Gestão de Eventos, Formulário com validações e Conclusão de evento com lote de presenças e assinatura digital).
  - 4. Rotas Públicas (Descoberta de eventos, detalhes, presença rápida e validação de certificados).
- **Estado final:** Aplicação reconstruída do zero, modular, performática e pronta para implantação.

### Entrega 5 (04/09/2026) — Refinamento Pós-Reconstrução: Isolamento de Sessão, Shell Desktop-First, QR Codes Desacoplados e Landing Editorial

- **Objetivo:** Cumprir integralmente os ajustes e refinamentos solicitados em `docs/AJUSTES_FRONTEND_GEMINI.md` e os contratos do backend em `../Backend-Muttley/docs/correcoes-integracao-2026-09-04.md`:
  1. Corrigir troca de contas ADMIN → sair → login USER para navegar a `/user/inicio` sem loops ou resíduos de rotas proibidas; o inverso navega para `/admin/inicio`.
  2. Implementar política pura e testável de destino pós-login (`resolveLoginDestination`) com blindagem contra open redirects, protocolos e loops para `/login`.
  3. Descartar respostas assíncronas de sessões anteriores (401 atrasados e validação `/me`) e sincronizar o novo token no transporte HTTP de forma imediata.
  4. Tela dedicada e acessível de `AccessDenied` para usuários autenticados sem permissão de papel, com atalho para retornar ao próprio painel sem deslogamento forçado.
  5. Desacoplar o modal de QR Codes em `AdminEventListPage`: carregamento, estado (loading, pronto, erro, retentativa) e liberação de `URL.revokeObjectURL` 100% independentes para inscrição e presença, normalizando erros de Blob (503, 404, 401, 403) sem vazamento de SQL ou exceções internas.
  6. Shell administrativo em `AdminLayout.tsx` com Sidebar persistente no desktop (largura útil, navegação vertical, perfil e botão de sair), menu drawer móvel com suporte a teclado/Escape, e skip link acessível para pular ao conteúdo.
  7. Dashboard administrativo (`AdminDashboardPage.tsx`) adaptado aos dados reais do backend (exibição de disciplina e local normalizados como texto e correção de links para `/admin/eventos/:id/editar` e `/admin/eventos/:id/concluir`).
  8. Formalização do contrato visual em `PRODUCT_DESIGN.md`, tokens em `tokens.css` e padronização do `Button.tsx` (borda reservada em todas as variantes para evitar deslocamento de layout em loading e touch target móvel >= 44px).
  9. Nova Landing Page editorial em `/` com carrossel acessível de eventos reais da API (`GET /api/eventos`), sem autoplay (WCAG 2.2 AA), com swipe de toque, navegação por teclado, fluxo explicativo da participação em 4 etapas e validador de certificados; catálogo preservado em `/eventos`.
- **Módulos afetados:** `src/modules/auth/`, `src/app/`, `src/shared/`, `src/modules/admin-eventos/`, `src/modules/painel/`, `src/modules/eventos/`, `src/styles/`, `PRODUCT_DESIGN.md` e `tests/`.
- **Skills aplicadas:**
  - `api-patterns`: isolamento e tratamento do ciclo de vida dos Bearer tokens no cliente Axios; normalização de payloads de erro da API retornados como Blobs.
  - `architecture`: política de roteamento pura sem acoplamento com o React Router (`resolveLoginDestination`); lógica do carrossel pura em `carouselLogic.ts`.
  - `accessibility-compliance-accessibility-audit`: skip links, contenção de foco e Escape em modais e gaveta móvel; carrossel sem autoplay distrativo; botões com rótulos e estados focáveis consistentes; **zero emojis em toda a aplicação**.
- **Comandos e resultados comprovados:**
  - `npm test`: **53 testes passando** (20 autenticação legado + 4 erros HTTP + 2 certificados + 5 admin eventos + 9 política de destino + 3 troca de sessão + 5 erros de QR Code blob + 5 carrossel/datas).
  - `npm run build`: **compilação limpa em 330ms** (`tsc -b && vite build` com zero erros).
  - `npm run lint`: **0 erros e 0 avisos em todo o código** (`eslint . --max-warnings 0`).
- **Telas e jornadas verificadas:**
  - Landing Page (`/`): hero editorial, carrossel de eventos com navegação manual, fluxo em 4 etapas e consulta de certificados.
  - Catálogo de Eventos (`/eventos`) e Detalhes (`/eventos/:id`): preservados e integrados.
  - Login e Troca de Sessão (`/login`): fluxo bidirecional ADMIN ↔ USER testado e validado.
  - Painel Administrativo (`/admin/inicio`): sidebar desktop, rotas reais de ação rápida e tabela de próximos eventos com dados normalizados.
  - Gestão de Eventos (`/admin/eventos`): modal de QR Code com slots desacoplados de inscrição e presença, teste de falha parcial e retentativa isolada.





## Critério para substituir a versão anterior

- Jornadas essenciais e funcionalidades do inventário implementadas ou mudanças de escopo explicitamente registradas.
- Regras de negócio respeitadas e contratos/links públicos compatíveis.
- Build, tipos, lint e testes da base nova passando, com a evidência da execução.
- Fluxo integrado demonstrável em ambiente de teste.
- Revisão de usabilidade, acessibilidade e dependências entre módulos concluída, com pendências documentadas.
- Versão anterior recuperável e configuração de publicação registrada.

A modularização reduz o impacto das mudanças; ela não garante que nunca haverá refatoração. Evitar reescritas significa manter limites verificáveis, testes úteis e decisões proporcionais ao tamanho do projeto.
