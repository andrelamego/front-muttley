# Muttley — guia visual consolidado a partir do Stitch

Estado: referência escolhida pelo autor, preparada para implementação; não aplicada ao frontend nesta entrega. Data: 04/09/2026.

## Referência e precedência

As capturas fornecidas são o alvo de composição. O HTML ajuda a identificar medidas e estilos, mas sua lógica é demonstrativa. Este documento resolve diferenças entre o HTML, o DESIGN exportado e as regras do aplicativo.

Ordem de decisão: instruções do autor e regras reais do produto; decisões consolidadas deste guia; capturas; valores do HTML; texto do DESIGN original. Conteúdo fictício das capturas não se torna requisito funcional. Ajustes por acessibilidade, dados reais ou ausência de funcionalidade devem ser documentados, preservando hierarquia e identidade.

Esta direção substitui a escolha anterior de azul/Slate com tipografia de sistema do ADR-002. Permanecem válidos os limites de módulos, acessibilidade e componentes compartilhados. Não criar outra proposta estética nem reconstruir a aplicação.

Referências: [landing](stitch/landing/screen.png), [admin](stitch/admin/screen.png), [participante](stitch/participante/screen.png), [logo](stitch/logo/code.html), [DESIGN original](stitch/sistema/DESIGN.md).

## Identidade observada

Papel quente, tinta escura e terracota. Newsreader estabelece a hierarquia editorial, Plus Jakarta Sans sustenta leitura e controles, JetBrains Mono organiza datas e códigos. Cabeçalhos de seção pequenos, títulos serifados, linhas discretas e áreas brancas estruturam a informação.

Os elementos que precisam permanecer reconhecíveis são: o título editorial amplo e a coluna de apoio da landing; a sidebar de 256 px e os três indicadores do admin; a sequência vertical de próximo evento, compromissos e certificados no participante. A marca aparece uma vez por área de identificação, sem a duplicação “logo + Muttley” presente em algumas capturas.

## Cores canônicas

Usar os nomes semânticos que já existem em `src/styles/tokens.css`, acrescentando somente os necessários. Esta tabela escolhe o tema efetivamente usado pelos HTMLs; a prosa do DESIGN original cita uma paleta ligeiramente diferente.

| Token de implementação | Valor | Uso |
| --- | --- | --- |
| `--color-bg-page` | `#fcf9f5` | Papel, fundo global |
| `--color-bg-surface` | `#ffffff` | Tabelas, cartões e formulários |
| `--color-bg-subtle` | `#f6f3ef` | Sidebar e seções de apoio |
| `--color-bg-muted` | `#f0edea` | Metadados e ações secundárias |
| `--color-bg-surface-raised` | `#ffffff` | Modal e menu |
| `--color-text-primary` | `#1c1c1a` | Tinta principal |
| `--color-text-secondary` | `#57423d` | Descrições e metadados legíveis |
| `--color-primary` | `#6b1705` | CTA principal, links e destaque editorial |
| `--color-primary-hover` | `#8b2e19` | Hover e destaque terracota da navegação |
| `--color-primary-active` | `#3d0600` | Pressionado |
| `--color-primary-subtle` | `#ffdad2` | Apoio suave da marca |
| `--color-primary-contrast` | `#ffffff` | Texto sobre terracota |
| `--color-info-text` | `#4059aa` | Informação e estado em andamento |
| `--color-success-text` | `#123f25` | Presença confirmada e certificado disponível |
| `--color-danger` | `#ba1a1a` | Erro/ação destrutiva, com rótulo explícito |
| `--color-border` | `#ddc0ba` | Divisórias decorativas discretas |
| `--color-border-strong` | `#8a726c` | Contorno de campo/controle quando necessário |
| `--focus-ring-color` | `#6b1705` | Foco em superfície clara; ajustar em fundo escuro |

Não usar terracota indistintamente para “ação principal” e “perigo”: confirmar a consequência por texto, ícone e diálogo apropriado. Badges de estado mantêm texto e diferença visual sem depender apenas de cor.

| Estado | Fundo | Texto |
| --- | --- | --- |
| Programado | `#f0edea` | `#57423d` |
| Em andamento | `#dce1ff` | `#1d3989` |
| Finalizado / confirmado | `#beeeca` | `#244f34` |
| Cancelado / falha | `#ffdad6` | `#93000a` |

As cores acima são a seleção consolidada; não é necessário migrar todos os tokens Material do export. Trocar tokens e eliminar usos relevantes de `blue-*`/`slate-*` nas telas vivas. Não substituir cegamente cores de status nem editar o legado apenas por conter um nome antigo.

### Contraste medido nesta preparação

Cálculo da razão de luminância sRGB para cores sólidas: tinta/papel 16,26:1; texto secundário/papel 8,88:1; branco/primária 12,00:1; branco/terracota hover 8,39:1; azul informativo/papel 6,20:1. São pares isolados, não auditoria da interface.

`#8a726c` sobre branco tem 4,46:1: não usar como texto pequeno que exige 4,5:1; escolher `--color-text-secondary`. `#ddc0ba` sobre branco tem 1,70:1: serve para divisória, mas não como única forma de identificar um campo interativo. Opacidade, fotografias, estados e foco devem ser verificados na tela real. A alegação “WCAG AAA” do export não está comprovada.

## Tipografia

| Papel | Família | Medida inicial |
| --- | --- | --- |
| Hero desktop | Newsreader 400 | 56/64 px, tracking −0,02em |
| Hero mobile | Newsreader 400 | 36/44 px |
| Título de página desktop | Newsreader 400 | 40/48 px |
| Título de página mobile | Newsreader 500 | 28/36 px |
| Título de seção | Newsreader 500 | 30/36 px desktop; 20/26 px mobile |
| Título de evento | Newsreader 500 | 20/26 px |
| Controle/título auxiliar | Plus Jakarta Sans 600 | 16/24 px |
| Corpo | Plus Jakarta Sans 400 | 15/24 px; 16/24 px em formulários mobile |
| Apoio | Plus Jakarta Sans 400 | 13/20 px; não usar em texto longo |
| Data, horário, código | JetBrains Mono 500 | 12/16 px, espaçamento 0,02em |

Newsreader itálica deve aparecer no destaque “conhecimento” da landing, conforme a captura. Não aplicar itálico aos formulários ou à tabela inteira. Números de indicadores podem usar Newsreader em 48–56 px, respeitando espaço disponível e valores longos.

Centralizar três famílias em tokens. Fallbacks: Newsreader → Georgia/serif; Plus Jakarta Sans → system-ui/sans-serif; JetBrains Mono → ui-monospace/monospace. Definir carregamento com `font-display: swap`, pesos reais e suporte a acentos. O logo exportado usa Newsreader 700: carregar esse peso se mantiver o texto do SVG, ou documentar outra representação fiel. Não criar negritos artificiais para simular a fonte.

As fontes são referências externas, não arquivos presentes no ZIP. Preferir WOFF2 local com origem/licença registradas quando os arquivos estiverem disponíveis. Não declarar que fontes foram incorporadas ou licenciadas sem verificar. Evitar imports duplicados e carregar somente variantes usadas.

## Medidas, formas e componentes

- Ritmo: 4, 8, 16, 24, 32 e 48 px; intervalo entre seções públicas de até 72 px.
- Conteúdo público: máximo de 1216 px (76rem), margens mínimas de 24 px em desktop e 16 px em mobile.
- Admin: sidebar de 256 px; cabeçalho de 64 px; conteúdo a partir da borda da sidebar, padding de 24–32 px. Medidas menores devem ser adaptadas à largura disponível, sem manter três colunas à força.
- Raio: 0 em cartões, modais, controles, menus e badges. A geometria ortogonal faz parte da direção aprovada pelo autor. Círculos permanecem somente onde a forma tem significado próprio, como avatar, indicador de status, progresso e spinner.
- Cartões usam borda definida e sombra deslocada para criar profundidade editorial. Em superfícies interativas, o hover amplia discretamente a sombra e desloca o cartão em 1 px; não aplicar esse movimento a formulários ou blocos estáticos.
- `Button`: tamanhos deliberados, altura de 44 px padrão e 48 px no CTA mobile/hero; borda reservada de 1 px em todas as variantes; ícone de 18–20 px; loading com largura estável. Rótulos maiores quebram/reorganizam o grupo, sem cortar texto.
- Inputs com label visível, 44 px de altura mínima para toque e texto 16 px no celular. Os 40 px do DESIGN original não prevalecem sobre a usabilidade mobile.
- `Card` genérico não recebe lógica de evento, sessão ou HTTP. Datas, badges e ações de evento pertencem ao módulo correspondente.
- Manter a biblioteca SVG existente para ícones equivalentes. Não adicionar a fonte Material Symbols só para copiar pictogramas. Preservar rótulos e `aria-hidden` nos ícones decorativos.

## Logo e imagens

O arquivo `stitch/logo/code.html` é um SVG, apesar da extensão. É a melhor fonte para adaptar o logo a um componente local; não ampliar o PNG pequeno. Preserve monograma, cor e proporção. Não carregar a versão remota presente nos cabeçalhos do HTML nem duplicar o nome ao lado do wordmark.

As duas fotografias aparecem apenas como URLs externas no export. Quando disponíveis com origem e direito de uso conhecidos, usar arquivo local com dimensão, recorte e texto alternativo adequados. Não assumir propriedade/licença a partir do domínio de hospedagem. Não usar hotlink temporário como dependência de produção.

Na ausência dos arquivos, preservar a área e a proporção da imagem da landing com um painel editorial local de apresentação, identificado no relatório como adaptação. No participante, substituir a capa por cabeçalho gráfico de data/tema; não apresentar uma imagem institucional como se fosse foto específica do evento. Não produzir novas imagens de IA nesta entrega sem pedido específico.

## Como demonstrar fidelidade

Comparar as telas lado a lado nas larguras originais e revisar também 390 e 1440 px. A hierarquia, as proporções, a família tipográfica, a paleta e a sequência dos blocos precisam ser reconhecíveis. Dados reais podem alterar a altura e o número de itens. Não perseguir igualdade de pixels reproduzindo cortes, textos falsos ou ações inexistentes.

A implementação deve registrar cada desvio necessário em uma tabela: referência → implementação → motivo. Seguir a [especificação de telas e integração](STITCH_TELAS_E_INTEGRACAO.md) e o [roteiro de validação](STITCH_VALIDACAO.md).
