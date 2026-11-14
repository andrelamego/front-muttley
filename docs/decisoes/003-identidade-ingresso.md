# ADR-003 — Identidade visual "Ingresso"

## Estado

Vigente desde 13/11/2026. Substitui a direção Stitch (papel creme, Newsreader, terracota, cantos retos) descrita na versão anterior de [DESIGN.md](../design/DESIGN.md). Do ADR-002 continuam valendo a centralização em tokens e os critérios de acessibilidade.

## Contexto

O autor sentiu que faltava personalidade à interface. A direção Stitch combinava papel creme, título serifado, acento terracota e cantos retos. Essa combinação é hoje a aparência mais comum de interfaces geradas por IA e não diz nada sobre o domínio do Muttley. O autor comparou três propostas (Ingresso, Medalha e Selo, em `docs/design/propostas/`) e escolheu a **Ingresso**.

Especificação: [`docs/superpowers/specs/2026-11-13-identidade-ingresso-design.md`](../superpowers/specs/2026-11-13-identidade-ingresso-design.md).

## Decisão

1. **Metáfora:** cada evento é um ingresso que a pessoa guarda, com corpo, perfuração e canhoto com a data. O componente `Ticket` (`src/shared/ui/Ticket.tsx`) aparece só onde há um evento concreto: próximo evento do participante, lista pública, landing, detalhe do evento e confirmação de presença.
2. **Cor:** cobalto `#2236e0` para ação principal e destaques. Amarelo de sinalização `#ffd93b` só para o que pede ação (horário no canhoto, evento aguardando conclusão, alerta de aviso), sempre com texto tinta `#0e1330`. Fundo `#eef0f6`. Há tema escuro azul-noite com primária `#4a5bff`.
3. **Tipografia:** Bricolage Grotesque (variável, eixo de largura) em títulos e números, Schibsted Grotesk na interface. Ambas são servidas localmente via Fontsource, sem Google Fonts. Fonte monoespaçada só em códigos de certificado.
4. **Forma:** raios de 10px (controles), 14px (painéis) e 18px (ingresso). Sombras neutras.
5. **Tokens:** os nomes das variáveis em `src/styles/tokens.css` foram mantidos e só os valores mudaram, para que as telas existentes herdassem a identidade sem edição. Entraram `--color-signal`, `--color-signal-ink` e `--font-display`; saíram `--font-serif` e `--font-mono`.
6. **Movimento:** um único momento novo, o carimbo "Presente" no canhoto ao confirmar presença, que respeita movimento reduzido.

## Consequências

- O contraste AA de todos os pares de texto e fundo, nos dois temas, é verificado por `tests/tokens.test.mjs`. Mudar um token que quebre o contraste quebra o teste.
- A janela de presença e as datas do canhoto passaram a ser funções testadas em `src/modules/eventos/domain/`, deixando de existir como cópias nas páginas.
- O amarelo perde força se for usado como decoração. Novas telas devem reservá-lo para ação pendente.
- A landing manteve a estrutura anterior; algumas seções ainda têm rótulos em caixa alta e passos numerados herdados da direção Stitch.
