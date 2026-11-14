# Muttley — guia visual "Ingresso"

Estado: vigente desde 13/11/2026 ([ADR-003](../decisoes/003-identidade-ingresso.md)). Referência visual aprovada: [`propostas/a-ingresso.html`](propostas/a-ingresso.html). A direção Stitch anterior está no histórico do Git.

## Ideia

Cada evento é um ingresso que a pessoa guarda: corpo com o conteúdo, perfuração tracejada com dois recortes e canhoto com dia, mês e horário. A data, o horário e o local são o que o participante procura primeiro, por isso ficam no canhoto e saltam aos olhos.

## Cores

Todas em `src/styles/tokens.css`. Telas usam só variáveis, nunca hex soltos.

| Token | Claro | Escuro | Uso |
| --- | --- | --- | --- |
| `--color-bg-page` | `#eef0f6` | `#0c1029` | Fundo global |
| `--color-bg-surface` | `#ffffff` | `#161b3d` | Cartões, painéis, ingresso |
| `--color-bg-muted` / `--color-primary-subtle` | `#e6e9ff` | `#222960` | Fundos de ícone, barras vazias |
| `--color-text-primary` | `#0e1330` | `#eef0ff` | Tinta |
| `--color-text-secondary` | `#4a5070` | `#b4b9d9` | Metadados |
| `--color-text-muted` | `#5d6385` | `#9da3cc` | Texto auxiliar (≥ 4.5:1) |
| `--color-primary` | `#2236e0` | `#4a5bff` | Ação principal, faixa do participante |
| `--color-primary-text` | `#2236e0` | `#9aa5ff` | Links e números em destaque |
| `--color-border` | `#d9dceb` | `#2b3160` | Divisórias e perfuração |
| `--color-signal` | `#ffd93b` | `#ffd93b` | Só o que pede ação |
| `--color-signal-ink` | `#0e1330` | `#0e1330` | Texto sobre o amarelo |

A barra lateral da coordenação é sempre tinta `#0e1330`, com o item ativo em cobalto, nos dois temas.

**Regra do amarelo:** horário no canhoto, aviso de evento aguardando conclusão e alertas de aviso. Nada decorativo. Texto sobre ele é sempre `--color-signal-ink`.

O contraste de todos os pares de texto e fundo é verificado por `tests/tokens.test.mjs`.

## Tipografia

- **Bricolage Grotesque** (`--font-display`, classe `font-display`): títulos `h1`–`h3`, números grandes e o dia do canhoto. Largura reduzida pelo eixo `wdth`: 85 em títulos, 75 em números.
- **Schibsted Grotesk** (`--font-sans`): interface e texto corrido.
- **Monoespaçada** (`font-mono`, pilha do sistema): só códigos de certificado.
- Fontes locais via `@fontsource-variable/*`, importadas em `src/main.tsx`.
- Sem rótulos em caixa alta espaçada; textos em sentença.

## Forma e profundidade

| Token | Valor | Uso | Classe |
| --- | --- | --- | --- |
| `--radius-sm` | 10px | Botões, campos, itens de menu | `rounded-sm` |
| `--radius-md` | 14px | Cartões e painéis | `rounded-md` |
| `--radius-lg` | 18px | Ingresso, faixas de aviso | `rounded-[var(--radius-lg)]` |
| `--radius-full` | — | Selos (`Badge`), avatares | `rounded-full` |

Sombras neutras (`--shadow-card`). O ingresso usa `drop-shadow` no invólucro, porque a máscara dos recortes corta `box-shadow`.

## Componente `Ticket`

`src/shared/ui/Ticket.tsx`. Recebe dados já formatados (`dia`, `mes`, `horario`), obtidos com `getTicketDateParts` de `modules/eventos`.

- `compact`: canhoto de 72px para listas e grades.
- `stamped`: carimbo "Presente" no canhoto após confirmar presença (220ms, sem animação com movimento reduzido).
- Sem suporte a `mask` CSS, vira retângulo arredondado com borda e perfuração tracejada.

Usar só onde há evento concreto: próximo evento do participante, lista pública, landing, detalhe do evento e confirmação de presença. Cadastros, certificados e tabelas não viram ingresso. Em listas densas, use o chip de data tracejado (dia e mês) no lugar do ingresso inteiro.

## Telas de referência

1. **Início do participante (celular):** faixa cobalto com a frase do próximo compromisso, ingresso sobreposto à faixa, janela de presença, certificados em linhas e contagem de medalhas.
2. **Painel da coordenação (desktop):** barra lateral tinta, saudação com resumo da semana, aviso amarelo de evento aguardando conclusão, três números, próximos eventos com chip de data e certificados por evento em barras.
3. **Lista pública:** grade de ingressos compactos (1, 2 e 3 colunas).

## Acessibilidade

Contraste AA em todos os pares de token, foco visível, alvos de pelo menos 44px, dia e mês do canhoto lidos por leitores de tela (`sr-only`), e `prefers-reduced-motion` respeitado.
