# Identidade "Ingresso" — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar a identidade visual do front-muttley pela direção "Ingresso" (cobalto + amarelo de sinalização, Bricolage Grotesque + Schibsted Grotesk, cantos arredondados, componente de ingresso) sem mudar rotas, API ou regras.

**Architecture:** A troca acontece principalmente em `src/styles/tokens.css`, mantendo os nomes das variáveis que as telas já usam. Lógica pura nova (janela de presença, datas do ingresso, frase do painel) fica em `domain/` com testes `node --test`. Um componente `Ticket` em `shared/ui` recebe dados já formatados, para que `shared` não importe `modules`.

**Tech Stack:** React 19, Vite 8, TypeScript 6, Tailwind 4 (`@theme`), `motion` 13, `lucide-react`, Fontsource, `node --test` (Node 24, importa `.ts` direto).

**Spec:** `docs/superpowers/specs/2026-11-13-identidade-ingresso-design.md` (ler junto). Referência visual: `docs/design/propostas/a-ingresso.html`.

## Global Constraints

- Branch `feat/nova-identidade-visual`. Rotas em `src/app/routes/AppRoutes.tsx`, contratos da API e regras de negócio não mudam.
- Painel admin usa só `eventosAtivos`, `eventosAtivosNaSemana`, `certificadosUltimos30Dias`, `variacaoCertificadosUltimos30Dias`, `proximosEventos`, `certificadosPorEvento`, `medalhasPorParticipante`. Sem inscritos por evento, sem carga horária de certificado, sem "aguarda conclusão", sem "lotando".
- Ingresso só onde há evento concreto: próximo evento do participante, lista pública, landing, detalhe do evento, confirmação de presença.
- Amarelo `--color-signal` só para o que pede ação; texto sobre ele sempre `--color-signal-ink`.
- Contraste AA (4.5:1 em texto normal), foco visível, alvos ≥ 44px, `prefers-reduced-motion` respeitado.
- Fontes locais via `@fontsource-variable/bricolage-grotesque@5.3.0` e `@fontsource-variable/schibsted-grotesk@5.3.0`. Sem Google Fonts.
- `shared/` não importa de `modules/`.
- Textos em português, voz ativa, botões com verbo ("Confirmar presença", "Criar evento", "Abrir", "Baixar").
- Cada tarefa termina com `npm test`, `npm run lint` e `npm run build` passando.

## Review Focus

1. **Título de evento longo** (ex.: 120 caracteres sem espaço curto) no ingresso: quebra dentro do corpo, nunca invade o canhoto nem estoura a 390px. Conferido no passo de navegador das Tasks 5 e 7.
2. **Evento sem horário ou sem local** (`horarioInicio`, `local` nulos): o ingresso mostra só dia e mês, sem selo de horário vazio. Teste em `ticketFormat.test.mjs` (Task 4).
3. **Limites da janela de presença**: exatamente 10 min antes do início e exatamente 10 min após o fim contam como abertos; 1 min fora, fechado; data inválida, fechado. Testes em `presenceWindow.test.mjs` (Task 4).
4. **Tema escuro**: todos os pares de texto e fundo passam AA também no escuro. Teste em `tokens.test.mjs` (Task 2).
5. **Navegador sem `mask` CSS**: o ingresso cai para retângulo arredondado com perfuração tracejada, sem recortes quebrados. Regra `@supports not (mask: …)` na Task 5, conferida desativando `mask` no DevTools.

---

### Task 1: Remover código legado morto

**Files:**
- Delete: `src/pages/`, `src/components/`, `src/data/`, `src/services/`
- Modify: `eslint.config.js` (tirar essas 4 pastas de `globalIgnores`)
- Keep: `src/utils/auth.ts` (usado por `tests/auth.test.mjs`)

- [ ] **Step 1:** Confirmar que nada fora dessas pastas as importa: `grep -rlE "(pages|components|data|services)/" src/app src/modules src/shared src/main.tsx src/App.tsx tests` deve listar só `tests/auth.test.mjs` apontando para `src/utils` (não removido).
- [ ] **Step 2:** Apagar as pastas e as entradas do ESLint.
- [ ] **Step 3:** `npm test && npm run lint && npm run build`. Esperado: 60 testes passando, lint sem avisos, build ok.
- [ ] **Step 4: Commit** — `git commit -m "chore: remove telas e componentes legados sem uso"`

### Task 2: Tokens, fontes e base global

**Files:**
- Modify: `src/styles/tokens.css`, `src/index.css`, `index.html`, `src/main.tsx`, `package.json`
- Test: `tests/tokens.test.mjs`

**Interfaces:**
- Produces (variáveis CSS que as próximas tarefas usam): `--color-signal`, `--color-signal-ink`, `--font-display`, `--font-sans`, `--radius-sm` (10px), `--radius-md` (14px), `--radius-lg` (18px), `--radius-full`, `--shadow-card` (neutra). Nomes `--color-bg-*`, `--color-text-*`, `--color-primary*`, `--color-border*`, `--color-{info,success,danger,warning}-*` continuam. `--font-serif` e `--font-mono` deixam de existir.

- [ ] **Step 1: Escrever o teste que falha** em `tests/tokens.test.mjs`: lê `src/styles/tokens.css`, extrai os blocos `:root {…}` e `:root[data-theme='dark'] {…}`, resolve hex e calcula contraste WCAG (helper local ao teste: luminância relativa sRGB). Assertivas:

```js
// claro (light) e escuro (dark), cada par ≥ 4.5
const pares = [
  ['--color-text-primary', '--color-bg-surface'],
  ['--color-text-secondary', '--color-bg-surface'],
  ['--color-text-muted', '--color-bg-surface'],
  ['--color-text-muted', '--color-bg-page'],
  ['--color-primary-contrast', '--color-primary'],
  ['--color-primary-text', '--color-bg-surface'],
  ['--color-signal-ink', '--color-signal'],
  ['--color-success-text', '--color-success-bg'],
  ['--color-danger-text', '--color-danger-bg'],
  ['--color-warning-text', '--color-warning-bg'],
]
test('tema claro: pares de texto passam AA', ...)
test('tema escuro: pares de texto passam AA', ...)  // usa o valor claro quando o escuro não redefine
test('valores-chave do claro seguem o spec', () => {
  assert.equal(light['--color-primary'], '#2236e0')
  assert.equal(light['--color-signal'], '#ffd93b')
  assert.equal(light['--color-text-primary'], '#0e1330')
  assert.equal(light['--color-bg-page'], '#eef0f6')
  assert.equal(light['--radius-lg'], '18px')
})
```

- [ ] **Step 2:** `node --test tests/tokens.test.mjs` → FAIL (valores atuais terracota, `--color-signal` ausente).
- [ ] **Step 3:** Reescrever `tokens.css` com as tabelas "Cor (claro)", "Cor (escuro)" e "Forma e profundidade" do spec. Escuro: page `#0c1029`, surface `#161b3d`, border `#2b3160`, texto `#eef0ff`/`#b4b9d9`, primary `#6170ff`; muted e estados ajustados até o teste passar. Aviso usa o amarelo com texto tinta. `--shadow-card` e `--shadow-card-hover` neutras (pretas, sem deslocamento colorido). Skeleton em tons do novo fundo.
- [ ] **Step 4:** `npm i @fontsource-variable/bricolage-grotesque@5.3.0 @fontsource-variable/schibsted-grotesk@5.3.0`; importar ambos em `src/main.tsx` (`import '@fontsource-variable/bricolage-grotesque/wdth.css'` — usar o arquivo que expõe o eixo `wdth`; conferir o nome em `node_modules/@fontsource-variable/bricolage-grotesque/`). `--font-display: 'Bricolage Grotesque Variable', system-ui, sans-serif`; `--font-sans: 'Schibsted Grotesk Variable', system-ui, sans-serif`.
- [ ] **Step 5:** Em `index.html`, remover os três `<link>` do Google Fonts. Em `index.css`: `@theme` troca `--font-serif`/`--font-mono` por `--font-display`; `h1,h2,h3` usam `--font-display` com `font-variation-settings: 'wdth' 85`; `.font-serif-editorial` vira `.font-display` (renomear os 13 usos); `.font-mono-tabular` passa a `font-family: var(--font-sans)` com `tabular-nums`, e `ui-monospace` só onde é código de certificado; `.surface-depth-interactive:hover` sem `translate`, só troca de sombra.
- [ ] **Step 6:** `node --test tests/tokens.test.mjs` → PASS. `grep -rn "font-serif\|Newsreader\|Plus Jakarta\|JetBrains" src index.html` → nenhum resultado.
- [ ] **Step 7:** `npm test && npm run lint && npm run build`.
- [ ] **Step 8: Commit** — `feat(design): tokens, fontes e base da identidade Ingresso`

### Task 3: Componentes compartilhados, logo e layouts

**Files:**
- Modify: `src/shared/ui/{Button,Badge,Card,Input,Alert,Logo,ThemeToggle,ToastViewport,AccessDenied}.tsx`, `src/shared/ui/skeleton/*`, `src/app/layouts/{AdminLayout,ParticipantLayout,PublicLayout}.tsx`, `public/favicon.svg`, todo `rounded-none` em `src/`

**Interfaces:**
- Consumes: tokens da Task 2.
- Produces: `Logo` mantém `LogoProps { className?: string; variant?: 'full' | 'mark' }`. `Badge` mantém sua API atual e passa a desenhar pílula com ponto.

- [ ] **Step 1:** Trocar todo `rounded-none` por classes de token: controles e campos `rounded-sm`, cards e painéis `rounded-md`, selos `rounded-full`. Tailwind 4 resolve `rounded-md` para `var(--radius-md)`, que o `tokens.css` sobrescreve. Verificação: `grep -rn "rounded-none" src` → nenhum resultado.
- [ ] **Step 2:** `Button`: primário cobalto com hover `--color-primary-hover`, secundário com borda `--color-border` e texto `--color-primary-text`, altura mínima 44px. `Badge`: pílula `padding: 4px 10px` com ponto `currentColor` antes do texto. `Card`: `rounded-md`, `--shadow-card`. `Alert` de aviso: fundo `--color-signal`, texto `--color-signal-ink`.
- [ ] **Step 3:** `Logo`: marca = retângulo amarelo `--color-signal` 14×22 com recorte semicircular de raio 4 no meio da borda direita (o canhoto do mockup, `.brand::before`); wordmark "Muttley" em `--font-display` peso 800 `wdth` 78, cor `--color-text-primary` (no `AdminLayout`, branco). Remover o "acadêmico" em itálico. `public/favicon.svg` com a mesma marca sobre fundo `#2236e0`.
- [ ] **Step 4:** `AdminLayout`: barra lateral `#0e1330` (texto `#c9cdea`), item ativo fundo `--color-primary` texto branco, `rounded-sm`. `ParticipantLayout`: barra inferior de 4 abas para as rotas que já existem (`/user/inicio`, `/user/eventos`, `/user/certificados`, `/user/medalhas`; não há rota de perfil), ícones `lucide-react`, aba ativa em `--color-primary-text` e peso 700, alvos ≥ 44px. `PublicLayout`: cabeçalho com o novo `Logo` e fundo `--color-bg-surface`.
- [ ] **Step 5:** `npm test && npm run lint && npm run build`. Abrir `npm run dev` e conferir login, `/user/inicio` e `/admin/inicio` a 390px e 1440px, nos temas claro e escuro: sem canto reto restante, foco visível com Tab.
- [ ] **Step 6: Commit** — `feat(design): componentes, logo e layouts na identidade Ingresso`

### Task 4: Lógica pura do ingresso e da janela de presença

**Files:**
- Create: `src/modules/eventos/domain/presenceWindow.ts`, `src/modules/eventos/domain/ticketFormat.ts`
- Modify: `src/modules/eventos/index.ts` (exportar), `src/modules/painel/ui/ParticipantDashboardPage.tsx` e `src/modules/painel/ui/AdminDashboardPage.tsx` (apagar as cópias locais de `isWithinPresenceWindow`/`parseEventDateTime` e importar as novas)
- Test: `tests/presenceWindow.test.mjs`, `tests/ticketFormat.test.mjs`

**Interfaces:**
- Produces:
  - `getPresenceWindow(data?: string | null, horarioInicio?: string | null, horarioFim?: string | null): { abre: Date; fecha: Date } | null` — abre = início − 10 min, fecha = fim + 10 min, hora local; `null` se faltar campo ou data inválida.
  - `isWithinPresenceWindow(data?: string | null, horarioInicio?: string | null, horarioFim?: string | null, agora: Date = new Date()): boolean` — limites inclusivos.
  - `formatPresenceWindow(janela: { abre: Date; fecha: Date }): string` → `"Disponível das 18h50 às 21h10"`.
  - `getTicketDateParts(data: string, horarioInicio?: string | null): { dia: string; mes: string; horario: string | null }`.

- [ ] **Step 1: Testes que falham**

```js
// presenceWindow.test.mjs
const j = getPresenceWindow('2026-11-13', '19:00:00', '21:00:00')
assert.equal(j.abre.getHours(), 18); assert.equal(j.abre.getMinutes(), 50)
assert.equal(j.fecha.getHours(), 21); assert.equal(j.fecha.getMinutes(), 10)
test('limite de abertura conta como aberto', () =>
  assert.equal(isWithinPresenceWindow('2026-11-13', '19:00', '21:00', new Date(2026, 10, 13, 18, 50, 0)), true))
test('limite de fechamento conta como aberto', () =>
  assert.equal(isWithinPresenceWindow('2026-11-13', '19:00', '21:00', new Date(2026, 10, 13, 21, 10, 0)), true))
test('um minuto antes ou depois fica fechado', ...)  // 18:49 e 21:11 → false
test('campos ausentes ou data inválida', () => {
  assert.equal(getPresenceWindow(null, '19:00', '21:00'), null)
  assert.equal(getPresenceWindow('2026-13-45', '19:00', '21:00'), null)
  assert.equal(isWithinPresenceWindow(undefined, undefined, undefined), false)
})
test('texto da janela', () => assert.equal(formatPresenceWindow(j), 'Disponível das 18h50 às 21h10'))

// ticketFormat.test.mjs
assert.deepEqual(getTicketDateParts('2026-11-13', '19:00:00'), { dia: '13', mes: 'nov', horario: '19h' })
assert.deepEqual(getTicketDateParts('2026-03-05', '09:30'), { dia: '5', mes: 'mar', horario: '9h30' })
assert.deepEqual(getTicketDateParts('2026-11-13', null), { dia: '13', mes: 'nov', horario: null })
```

- [ ] **Step 2:** `node --test tests/presenceWindow.test.mjs tests/ticketFormat.test.mjs` → FAIL (módulos não existem).
- [ ] **Step 3:** Implementar. Montar datas com `new Date(ano, mês-1, dia, h, m)` a partir de `split`, nunca `new Date('2026-11-13')` (seria UTC). Data inválida = componentes fora de faixa ou `Date` resultante com dia diferente do informado. Meses em array fixo `['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']`.
- [ ] **Step 4:** Trocar as cópias locais nos dois painéis pelas funções novas.
- [ ] **Step 5:** `npm test && npm run lint && npm run build` → tudo passa.
- [ ] **Step 6: Commit** — `refactor(eventos): centraliza janela de presença e datas do ingresso`

### Task 5: Componente `Ticket`

**Files:**
- Create: `src/shared/ui/Ticket.tsx`
- Modify: `src/shared/ui/index.ts`, `src/index.css` (classes `.ticket*`)

**Interfaces:**
- Consumes: tokens da Task 2.
- Produces: `Ticket(props: { dia: string; mes: string; horario?: string | null; compact?: boolean; stamped?: boolean; className?: string; children: React.ReactNode }): JSX.Element` — `children` é o corpo; o canhoto é desenhado pelo componente a partir de `dia`/`mes`/`horario`.

- [ ] **Step 1:** Estrutura e CSS como `.ticket` do mockup: grid `1fr 92px` (compacto `1fr 72px`), canhoto com borda esquerda `2px dashed var(--color-border)`, dia em `--font-display` 800 `wdth` 75 cor `--color-primary-text`, mês em `--color-text-secondary`, horário em pílula `--color-signal`/`--color-signal-ink` (omitida quando `horario` é nulo). Recortes com `mask` de dois `radial-gradient` de raio 11px no eixo da perfuração; `@supports not (mask: radial-gradient(#000, #000))` remove a máscara. `--radius-lg`, `--shadow-card`. Corpo com `min-width: 0` e `overflow-wrap: anywhere` no título.
- [ ] **Step 2:** `stamped`: renderiza no canhoto um carimbo "Presente" (borda 2px `--color-success-text`, texto `--color-success-text`, rotação −8°) com `motion` (`initial={{ scale: 1.15, opacity: 0 }}`, `animate={{ scale: 1, opacity: 1 }}`, 220ms, `--motion-ease-standard`); com `useReducedMotion()` verdadeiro, sem animação.
- [ ] **Step 3:** Exportar em `shared/ui/index.ts`. `npm run lint && npm run build`.
- [ ] **Step 4:** Conferir visualmente usando-o na Task 6 (não criar página de demonstração). Nesta tarefa basta build verde.
- [ ] **Step 5: Commit** — `feat(ui): componente Ticket`

### Task 6: Início do participante recomposto

**Files:**
- Modify: `src/modules/painel/ui/ParticipantDashboardPage.tsx`, `src/modules/painel/ui/skeletons/*` (forma nova)

**Interfaces:**
- Consumes: `Ticket` (Task 5); `getTicketDateParts`, `getPresenceWindow`, `formatPresenceWindow`, `isWithinPresenceWindow` (Task 4).

- [ ] **Step 1:** Manter a seleção do evento em destaque que já existe (janela aberta → próximo futuro → primeiro). Recompor conforme spec, tela 1: faixa `--color-primary` com saudação e frase do compromisso ("Seu próximo evento é hoje/amanhã/em 13 de nov"); `Ticket` sobreposto à faixa (margem negativa) com selo de status, tema, local/modalidade, botão "Confirmar presença" (habilitado só com `isWithinPresenceWindow`) e a frase de `formatPresenceWindow`; lista "Certificados" (evento e data de emissão, ação "Baixar", sem horas); "Medalhas" como contagem com link para `/user/medalhas`. Estado vazio: "Você ainda não tem inscrições" com link para a lista pública.
- [ ] **Step 2:** `npm test && npm run lint && npm run build`.
- [ ] **Step 3:** Navegador a 390px e 1440px, claro e escuro: comparar com `docs/design/propostas/a-ingresso.html`; testar um tema de 120 caracteres (Review Focus 1) e evento sem horário (Review Focus 2) alterando a resposta no DevTools ou com dados de seed.
- [ ] **Step 4: Commit** — `feat(painel): início do participante na identidade Ingresso`

### Task 7: Painel da coordenação recomposto

**Files:**
- Create: `src/modules/painel/domain/resumoSemana.ts`
- Modify: `src/modules/painel/ui/AdminDashboardPage.tsx`, skeletons do painel
- Test: `tests/resumoSemana.test.mjs`

**Interfaces:**
- Produces: `formatResumoSemana(eventosNaSemana: number): string`.

- [ ] **Step 1: Teste que falha**

```js
assert.equal(formatResumoSemana(0), 'Nenhum evento acontece esta semana.')
assert.equal(formatResumoSemana(1), '1 evento acontece esta semana.')
assert.equal(formatResumoSemana(4), '4 eventos acontecem esta semana.')
```

- [ ] **Step 2:** `node --test tests/resumoSemana.test.mjs` → FAIL. Implementar. → PASS.
- [ ] **Step 3:** Recompor conforme spec, tela 2: cabeçalho "Bom dia/Boa tarde/Boa noite, coordenação" + `formatResumoSemana(eventosAtivosNaSemana)` + botão "Criar evento"; três números (`eventosAtivos`, `eventosAtivosNaSemana`, `certificadosUltimos30Dias` com a variação em `--color-success-text` ou `--color-danger-text` conforme o sinal, texto "+18% que os 30 dias anteriores"); "Próximos eventos" com chip de data tracejado (`getTicketDateParts`), tema, local ou modalidade, horário e botão "Abrir"; "Certificados por evento" em barras usando `percentual`. Manter o bloco de medalhas por participante se já existir. Remover qualquer contagem de inscritos ou indicador fora da lista de Global Constraints.
- [ ] **Step 4:** `npm test && npm run lint && npm run build`; navegador a 1440px e 1024px, claro e escuro.
- [ ] **Step 5: Commit** — `feat(painel): painel da coordenação na identidade Ingresso`

### Task 8: Lista pública, landing, detalhe e presença

**Files:**
- Modify: `src/modules/eventos/ui/{PublicEventListPage,LandingPage,PublicEventDetailPage,ConfirmarPresencaPage}.tsx` e os skeletons de eventos

**Interfaces:**
- Consumes: `Ticket` (Task 5), `getTicketDateParts`, `getPresenceWindow`, `formatPresenceWindow` (Task 4).

- [ ] **Step 1:** Lista pública: grade de `Ticket compact` (1 coluna até 640px, 2 até 1024px, 3 acima), corpo com tema, local/modalidade e link "Ver detalhes". Landing: mesma estrutura atual, eventos como `Ticket compact`, título principal em `--font-display`. Detalhe: cabeçalho em `Ticket` com a janela de presença. Confirmação de presença: `Ticket` do evento e, após sucesso da API, `stamped`.
- [ ] **Step 2:** Rodar `node --test tests/landingCarousel.test.mjs tests/participantEventRoutes.test.mjs` (lógica reaproveitada) e depois `npm test && npm run lint && npm run build`.
- [ ] **Step 3:** Navegador a 390px e 1440px, claro e escuro: lista, landing, detalhe, presença (sucesso com carimbo e com movimento reduzido ligado no DevTools), certificado público. Desativar `mask` no DevTools e conferir o fallback (Review Focus 5).
- [ ] **Step 4: Commit** — `feat(eventos): ingresso na lista, landing, detalhe e presença`

### Task 9: Documentação e verificação final

**Files:**
- Create: `docs/decisoes/003-identidade-ingresso.md`
- Modify: `docs/design/DESIGN.md`, `PRODUCT_DESIGN.md` (seção "Direção vigente"), `docs/decisoes/README.md` (índice)

- [ ] **Step 1:** ADR 003 no formato dos ADRs 001/002: contexto (identidade Stitch genérica), decisão (Ingresso, link para spec e mockup), consequências (tokens com os mesmos nomes, `Ticket` restrito a eventos, amarelo só para ação). Marca a direção Stitch como substituída.
- [ ] **Step 2:** `DESIGN.md`: paleta clara e escura, tipografia, raios, sombra, `Ticket`, regras do amarelo. `PRODUCT_DESIGN.md`: trocar o parágrafo da direção Stitch pela direção Ingresso com link para o ADR.
- [ ] **Step 3:** `npm test && npm run lint && npm run build` e uma volta completa no navegador: público, participante e admin, 390px e 1440px, claro e escuro, só teclado no login.
- [ ] **Step 4: Commit** — `docs(design): registra a identidade Ingresso`
