# Identidade visual "Ingresso"

Data: 13/11/2026 · Branch: `feat/nova-identidade-visual` (a partir de `feat/reconstrucao-frontend`)
Referência visual aprovada: [`docs/design/propostas/a-ingresso.html`](../../design/propostas/a-ingresso.html)

## Intenção

O autor sente que "falta algo" na interface. A identidade atual (papel creme, Newsreader serifada, terracota, cantos retos, sombra deslocada) é o visual mais comum de interfaces geradas por IA, e por isso não tem cara própria. Das três propostas, o autor escolheu a **A · Ingresso**: cada evento é tratado como um ingresso que a pessoa guarda, com canhoto da data, perfuração e QR. Cobalto confiável como cor principal e amarelo de sinalização para o que pede ação.

Sucesso: abrir qualquer tela e reconhecer o Muttley, com data, horário e local dos eventos saltando aos olhos e a próxima ação óbvia.

## Objetivos

1. Trocar toda a identidade (cor, tipografia, forma, sombra, logo) por meio dos tokens, para que as cerca de 1.000 referências `var(--color-*)` existentes mudem sem edição tela a tela.
2. Criar o componente **Ingresso** (`Ticket`) e usá-lo onde existe um evento concreto.
3. Recompor as três telas de referência conforme o mockup: início do participante (celular), painel da coordenação (desktop) e lista pública de eventos.
4. Manter tema claro e escuro.
5. Remover o código legado morto antes de restilizar, para não restilizar o que não roda.

## Fora do escopo

- Rotas, contratos da API, regras de negócio, novas funcionalidades.
- Novos indicadores no painel. Só os que `/admin/inicio` já devolve: `eventosAtivos`, `eventosAtivosNaSemana`, `certificadosUltimos30Dias`, `variacaoCertificadosUltimos30Dias`, `proximosEventos`, `certificadosPorEvento`, `medalhasPorParticipante`.
- Atualizar as figuras do documento do TCC (tarefa separada, depois de pronto).

## Anti-objetivos (falha mesmo que funcione)

- Metáfora de ingresso em tudo: cards de cadastro, certificados e tabelas **não** viram ingresso.
- Amarelo virando cor decorativa. Ele marca só o que pede ação (presença aberta, evento aguardando conclusão, horário no canhoto).
- Perder acessibilidade: contraste AA, foco visível, alvos de 44px e `prefers-reduced-motion` continuam valendo.
- Indicador inventado, como "lotando" ou vagas restantes sem dado da API.

## Abordagens consideradas

| Abordagem | Como | Troca |
|---|---|---|
| **Remapear os tokens no lugar (escolhida)** | Mesmos nomes de variáveis em `tokens.css`, valores novos; raio vira token; componentes compartilhados ganham a nova forma; telas de referência recompostas | Menor diff, risco baixo, tudo muda de uma vez. Nomes como `--color-primary-text` continuam genéricos, o que é bom |
| Renomear o sistema de tokens | Novo vocabulário (`--cobalt`, `--signal`) e reescrita das classes | Muito churn em ~80 arquivos sem ganho visual |
| Reescrever tela a tela | Cada página com estilos próprios | Inconsistência garantida e o mesmo trabalho repetido |

## Decisões

### Cor (claro)

| Token | Valor | Uso |
|---|---|---|
| `--color-bg-page` | `#eef0f6` | fundo |
| `--color-bg-surface` | `#ffffff` | cards, painéis |
| `--color-bg-subtle` / `muted` | `#f5f6fa` / `#e6e9ff` | áreas secundárias, ícones |
| `--color-text-primary` | `#0e1330` | tinta |
| `--color-text-secondary` / `muted` | `#4a5070` / `#5d6385` | metadados (muted precisa ≥ 4.5:1 no branco) |
| `--color-primary` | `#2236e0` | ação principal, faixa do topo, links |
| `--color-primary-hover` / `active` | `#1a2bc0` / `#141f8f` | |
| `--color-primary-subtle` | `#e6e9ff` | fundos de ícone, barras vazias |
| `--color-border` | `#d9dceb` | perfuração, divisórias |
| **novo** `--color-signal` / `--color-signal-ink` | `#ffd93b` / `#0e1330` | o que pede ação; texto sobre amarelo é sempre tinta |
| `--color-success-*` | texto `#0b7550`, fundo `#e3f5ec` | inscrição confirmada, aberto |

Info, perigo e aviso: manter a estrutura atual, reajustando os tons para conviver com o cobalto (aviso usa o amarelo de sinalização com texto tinta).

### Cor (escuro)

Fundo `#0c1029`, superfície `#161b3d`, borda `#2b3160`, texto `#eef0ff` / `#b4b9d9`, primária `#6170ff` (cobalto clareado para contraste), sinalização igual. Sombras neutras pretas.

### Tipografia

- **Bricolage Grotesque** (variável, eixos `wdth` e `opsz`) para títulos, números grandes e o dia no canhoto. Títulos com `wdth` 80–90, números com 75.
- **Schibsted Grotesk** para interface e texto.
- Sem fonte mono decorativa. Códigos de certificado usam `ui-monospace` só onde é código.
- Fontes locais via Fontsource (`@fontsource-variable/bricolage-grotesque`, `@fontsource-variable/schibsted-grotesk`, ambos 5.3.0), sem Google Fonts. Atende à exigência de alternativas locais do `PRODUCT_DESIGN.md`. Remover Newsreader, Plus Jakarta Sans e JetBrains Mono do `index.html`.
- `--font-serif` deixa de existir. Os 13 usos passam para `--font-display`.

### Forma e profundidade

- Raios: `--radius-sm: 10px` (controles), `--radius-md: 14px` (painéis e cards), `--radius-lg: 18px` (ingresso), `--radius-full` (selos). Os ~200 `rounded-none` passam a classes de token (`rounded-[var(--radius-md)]` ou utilitários mapeados no `@theme`).
- Sombras neutras: `--shadow-card: 0 10px 24px rgb(0 0 0 / 12%)`. A sombra deslocada terracota sai.
- Selos de status em pílula com ponto colorido, padding mínimo `4px 10px`.

### Componente Ingresso (`shared/ui/Ticket.tsx`)

Corpo + canhoto de 92px separados por borda tracejada, com dois recortes semicirculares feitos por `mask` CSS (como no mockup). O canhoto mostra o dia grande, o mês e o horário num selo amarelo. Variante compacta para listas (canhoto menor). Sem `mask` disponível, o card cai para um retângulo arredondado com a borda tracejada.

Onde usar: próximo evento do participante, cards da lista pública, cabeçalho do detalhe do evento, tela de confirmação de presença. Em nenhum outro lugar.

Momento de movimento único: ao confirmar presença com sucesso, o canhoto recebe um carimbo "Presente" (escala 1.15 → 1 com leve rotação, ~220ms, usando o `motion` já instalado). Sob movimento reduzido, aparece sem animação.

### Telas recompostas

1. **Início do participante (celular):** faixa cobalto no topo com a frase do próximo compromisso; ingresso sobreposto à faixa, com a janela de presença calculada pela regra (10 min antes do início até 10 min após o fim; o servidor prevalece); lista de certificados em linhas com ícone, nome do evento e data de emissão; medalhas como contagem com link. Barra inferior de 4 abas.
2. **Painel da coordenação (desktop):** barra lateral tinta (`#0e1330`) com item ativo em cobalto; cabeçalho com resumo em frase a partir de `eventosAtivosNaSemana` e "Criar evento"; três números; próximos eventos com chip de data tracejado, local ou modalidade e horário, e ação "Abrir" por linha; certificados por evento em barras (`certificadosPorEvento`).

Correções em relação ao mockup, que tinha dados que a API não fornece: **sem contagem de inscritos por evento** (`EventoResumo` não traz), **sem carga horária nos certificados** (`CertificadoResumo` não traz) e **sem "aguarda conclusão" no painel** (`/admin/inicio` só lista eventos futuros). Esse aviso de conclusão é desejável, mas depende de outra consulta e fica fora deste trabalho.
3. **Lista pública de eventos:** cards de ingresso compactos em grade (1 coluna no celular, 2–3 no desktop).

A landing (`/`, `LandingPage`) mantém a estrutura atual; os eventos que ela mostra passam a ser ingressos compactos e o título usa Bricolage em tamanho de destaque.

As demais telas recebem a identidade pelos tokens e pelos componentes compartilhados (`Button`, `Card`, `Badge`, `Input`, `Alert`, `Logo`, layouts), sem recomposição.

### Logo

Wordmark "Muttley" em Bricolage condensada com a marca do mockup: retângulo amarelo com um recorte semicircular (um canhoto). `Logo.tsx` e o favicon passam a usá-la.

### Limpeza prévia (commit separado)

Remover `src/pages`, `src/components`, `src/data` e `src/services`, que nada importa (só se importam entre si). Tirar as entradas correspondentes do `globalIgnores` do ESLint. `src/utils/auth.ts` fica, porque `tests/auth.test.mjs` o usa.

### 21st.dev

O MCP do 21st não carregou na sessão em que este documento foi escrito. Na implementação, se estiver disponível, usar `search` como referência para peças pontuais (barra lateral, abas inferiores, campo de QR) e adaptar aos tokens. O projeto não usa shadcn, então nada de registry nem `cn` novo. Não é bloqueante.

### Documentação

- Novo ADR `docs/decisoes/003-identidade-ingresso.md`, substituindo a direção Stitch.
- Atualizar o guia visual (`docs/design/DESIGN.md`) e a seção "Direção vigente" do `PRODUCT_DESIGN.md`.
- Os mockups em `docs/design/propostas/` ficam como registro da escolha.

## Verificação

- `npm test`, `npm run lint`, `npm run build` passando.
- Conferência no navegador a 390px e 1440px das três telas recompostas e de login, detalhe do evento, confirmação de presença e certificado público, nos dois temas.
- Contraste AA dos pares de token (texto muted, primária sobre branco, tinta sobre amarelo, primária escura sobre fundo escuro).

## Deixado para quem implementa

Escala tipográfica exata, espaçamentos internos, ícones das abas (usar `lucide-react`, já instalado), estados de hover e foco dentro dos tokens, skeletons seguindo a nova forma.
