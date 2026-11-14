# Plano de fluidez, motion e estados de carregamento

Estado: em implementação. Fundação e skeletons das jornadas ativas implementados em 04/09/2026.

## Progresso comprovado

- Motion configurado com carregamento enxuto de recursos, preferência de redução e transição interna dos três shells.
- Tokens de duração, easing, cores de skeleton e shimmer adicionados aos temas claro e escuro.
- Skeletons específicos implementados para sessão, landing, lista e detalhe de eventos, dashboards, certificados, medalhas e gestão administrativa de eventos.
- QR Codes preservam a área quadrada final durante geração.
- Ações em botões usam reticências discretas e mantêm o rótulo; as telas modulares ativas não usam roda de carregamento.
- Refresh dos dashboards, lista e detalhe mantém dados já disponíveis na tela.
- Indicador ativo compartilhado implementado na navegação desktop e mobile do participante.
- Verificações desta etapa: 57 testes aprovados, lint aprovado, build aprovado e inspeção responsiva do skeleton da lista em desktop e 390 × 844 sem overflow horizontal.

Permanecem para a etapa de refinamento: motion em modais, drawers, toasts e listas filtradas; restauração de foco/rolagem; divisão do bundle por rota; testes visuais automatizados.

## Objetivo

Tornar o Muttley mais fluido sem transformar a interface em uma demonstração de animações. O movimento deve explicar mudanças de estado, preservar contexto durante a navegação e reduzir a sensação de espera. Todo carregamento de conteúdo deve reservar o espaço do resultado real por meio de um skeleton específico daquela tela.

Este plano mantém a direção visual aprovada no Stitch: geometria ortogonal, superfícies com borda e sombra deslocada, tipografia editorial e movimento contido.

## Decisões de base

- Adotar `motion` por meio de `motion/react` para presença, transições entre rotas e mudanças de layout. A versão escolhida no momento da implementação deve ser registrada no `package-lock.json`.
- Manter CSS para transições simples de cor, borda, sombra e deslocamento de 1 px. Não transformar todo elemento em componente Motion.
- Manter os layouts público, participante e administrativo montados durante a navegação. Somente o conteúdo do `Outlet` deve fazer a transição.
- Retirar rodas de carregamento dos estados de dados. Ações dentro de botões devem manter largura estável, texto explícito e `aria-busy`, usando reticências ou uma barra curta de progresso quando a duração justificar. Skeleton não substitui o rótulo de uma ação em andamento.
- Preservar dados já renderizados durante atualizações manuais. O refresh deve sinalizar atualização local sem apagar a tela e remontar todo o skeleton.
- Respeitar `prefers-reduced-motion`. Com redução ativa, remover deslocamentos, springs, shimmer e transições de página; mudanças essenciais podem usar uma troca curta de opacidade.

## Linguagem de movimento

Centralizar os valores em tokens para impedir que cada módulo invente sua própria animação.

| Papel | Duração inicial | Uso |
| --- | ---: | --- |
| Instantâneo | 100–120 ms | Pressionar botão, foco e alteração de cor |
| Interface | 160–180 ms | Menu, tooltip, toast e troca de estado local |
| Composição | 200–240 ms | Entrada de página, modal e reorganização de lista |

Diretrizes:

- Entrada de página: opacidade de 0 para 1 e deslocamento vertical máximo de 4 px, uma única vez por navegação.
- Saída de página: apenas opacidade curta. Não deixar a tela vazia esperando uma animação terminar.
- Modal e drawer: overlay em 120 ms; painel em 180 ms com deslocamento de até 6 px. O foco deve entrar no diálogo depois da montagem e voltar ao acionador no fechamento.
- Listas filtradas: usar animação de layout apenas nos itens que mudaram de posição, entraram ou saíram. Limitar o stagger aos quatro primeiros itens e a 30 ms entre eles.
- Navegação ativa: mover um único indicador compartilhado entre itens. Sidebar e barra inferior permanecem estáveis.
- Botão: feedback de pressão entre 1 e 2 px, sem zoom elástico. Hover não deve mover controles que possam alterar a área clicável.
- Toast e alertas: entrada lateral curta no desktop e vertical no celular; saída por opacidade.
- Números, textos longos e tabelas não devem animar caractere por caractere.
- Não usar parallax, animação contínua decorativa, cursor customizado, rotação, zoom grande ou movimento disparado em toda rolagem.

## Sistema de skeletons

### Primitivas compartilhadas

Criar somente primitivas visuais em `src/shared/ui/skeleton/`:

- `SkeletonBlock`: retângulo base, quadrado por padrão, configurável por largura e altura.
- `SkeletonText`: linhas com alturas tipográficas conhecidas e última linha deliberadamente menor.
- `SkeletonMedia`: reserva proporção de imagem ou QR Code.
- `SkeletonTable`: estrutura acessível para cabeçalho e linhas, configurada pelo módulo consumidor.

O skeleton deve usar tokens próprios para fundo e brilho nos temas claro e escuro. A animação deve ser sutil, com ciclo entre 1,4 e 1,8 segundo, sem alto contraste. Em movimento reduzido, exibir blocos estáticos.

Cada composição pertence ao módulo cuja tela representa. Evitar componentes como `GenericCardSkeleton`, pois eles perdem a relação com o conteúdo real.

### Regras de fidelidade

- Skeleton e conteúdo usam o mesmo grid, `gap`, padding, borda, largura, altura mínima e breakpoints.
- As áreas devem representar o tipo do dado: título, metadado, badge, ação, mídia, linha de tabela ou indicador.
- Quantidades iniciais devem reproduzir o primeiro viewport: três indicadores no admin, duas colunas de eventos no desktop, um card no celular e assim por diante.
- Não mostrar dados falsos, ícones apagados ou texto lorem ipsum.
- O container real deve permanecer estável durante a troca. A entrada do conteúdo usa somente uma transição curta de opacidade.
- Acessibilidade: container com `aria-busy="true"` e texto de status para leitor de tela; blocos visuais com `aria-hidden="true"`.
- Aplicar um atraso curto de cerca de 120 ms antes de revelar o skeleton para evitar flash em respostas imediatas. Se aparecer, a troca deve ser estável e curta, sem atrasar artificialmente dados já disponíveis.

## Matriz por jornada

| Tela ou região | Skeleton fiel a implementar |
| --- | --- |
| Landing, carrossel de eventos | Manter hero e navegação visíveis; renderizar cards do carrossel com faixa de status, data, título em duas linhas, metadados e área da ação nas mesmas dimensões. |
| Lista pública e “Explorar eventos” | Manter título, descrição e busca; usar a grade real de cards, com badge, título, descrição, data/local e CTA. Uma coluna no celular e duas no desktop. |
| Detalhe do evento | Cabeçalho editorial, bloco de data/horário/local, descrição e card lateral de inscrição com as mesmas proporções do conteúdo final. |
| Dashboard do participante | Cabeçalho real; card do próximo evento, lista de compromissos e painel de certificados no grid 8/4 do desktop e na ordem linear do celular. |
| Certificados do participante | Cabeçalho e resumo estáveis; reproduzir linhas ou cards de certificado, código, evento, carga horária e região de download. |
| Medalhas | Reproduzir introdução, indicadores e grade de medalhas. Reservar os círculos apenas para a arte da medalha, conforme o componente real. |
| Dashboard administrativo | Cabeçalho e ações estáveis; três KPIs, aviso de pendência quando o contrato permitir identificá-lo, agenda de eventos e tabela operacional. |
| Lista administrativa de eventos | Filtros estáveis; cabeçalho da tabela e cinco linhas no desktop; cards administrativos equivalentes no breakpoint móvel. |
| Formulário de evento em edição | Reproduzir grupos, labels, campos e rodapé de ações. Na criação vazia, não há carregamento inicial e nenhum skeleton deve aparecer. |
| Conclusão do evento | Resumo do evento, tabela de participantes, área de assinatura e ações finais nas posições reais. |
| Certificado público | Moldura do certificado, identificação, evento, carga horária e área de validação nas dimensões finais. |
| QR Codes | Placeholder quadrado exatamente no tamanho do QR, dentro do modal existente. Não substituir todo o modal por um carregamento central. |
| Sessão protegida | Evitar flash entre login e painel. Enquanto a sessão é restaurada, usar um shell neutro e curto que preserve a região principal sem revelar dados do perfil errado. |

## Outras melhorias recomendadas

### Prioridade alta

1. **Atualização sem apagar conteúdo:** separar `isLoading` inicial de `isRefreshing`. Ao clicar em “Atualizar”, manter os dados na tela e sinalizar somente a região afetada.
2. **Transições de estado:** animar de forma curta a passagem entre skeleton, conteúdo, vazio e erro. Alertas devem ocupar uma região previsível para evitar saltos.
3. **Foco e posição de rolagem:** levar foco para o título da nova rota, restaurar rolagem ao voltar para listas e posicionar o usuário no erro de formulário relevante.
4. **Indicador ativo compartilhado:** transição discreta na navegação do participante e na sidebar administrativa, sem remontar os menus.
5. **Modais e drawers acessíveis:** presença animada, bloqueio de rolagem, fechamento por Escape e devolução correta do foco.
6. **Feedback de operações:** inscrição, presença, emissão e download devem informar progresso e resultado no próprio contexto, sem congelar a página inteira.

### Prioridade média

1. **Filtros e busca estáveis:** atraso de digitação apenas quando houver chamada remota; transição de layout nos resultados e mensagem clara quando o filtro zera a lista.
2. **Imagens sem salto:** reservar `aspect-ratio`, usar placeholder com a paleta do produto e aplicar fade somente após o carregamento da imagem.
3. **Estados de sucesso com continuidade:** atualizar badge, contagem e ação no card que originou a operação; evitar recarregar a rota inteira.
4. **Toast com fila curta:** agrupar mensagens repetidas e impedir que várias notificações cubram ações importantes no celular.
5. **Prefetch seletivo:** carregar código ou dados de detalhes ao demonstrar intenção real, como foco ou hover persistente, sem baixar todos os eventos antecipadamente.
6. **Carregamento por rota:** dividir módulos administrativos e públicos com `lazy`, preservando um fallback específico para cada shell.

### Depois da base estabilizada

1. Transição compartilhada do card de evento para o detalhe, apenas se a navegação permanecer clara no celular e no desktop.
2. Animação de expansão para informações secundárias e filtros avançados.
3. Barra de progresso para operações realmente longas quando o backend puder fornecer progresso mensurável.
4. Testes visuais automatizados dos estados skeleton e carregado para detectar divergência de grid e quebra responsiva.

## Arquitetura proposta

```text
src/
  shared/
    motion/
      motionTokens.ts
      MotionPreferences.tsx
      PageTransition.tsx
    ui/
      skeleton/
        SkeletonBlock.tsx
        SkeletonText.tsx
        SkeletonMedia.tsx
        index.ts
  modules/
    painel/ui/skeletons/
      AdminDashboardSkeleton.tsx
      ParticipantDashboardSkeleton.tsx
    eventos/ui/skeletons/
      EventListSkeleton.tsx
      EventDetailSkeleton.tsx
      LandingEventsSkeleton.tsx
    certificados/ui/skeletons/
      CertificateListSkeleton.tsx
      PublicCertificateSkeleton.tsx
    medalhas/ui/skeletons/
      MedalGridSkeleton.tsx
    admin-eventos/ui/skeletons/
      AdminEventListSkeleton.tsx
      AdminEventFormSkeleton.tsx
      AdminEventConcludeSkeleton.tsx
```

As primitivas não conhecem eventos, certificados nem respostas HTTP. Cada skeleton de página fica próximo do conteúdo real e reutiliza as mesmas constantes de grid e espaçamento quando isso reduzir divergência concreta.

## Ordem de implementação

### Etapa 1 — fundação

- Instalar `motion` e registrar tokens de duração, easing, deslocamento e skeleton.
- Criar preferência de movimento e integração com `prefers-reduced-motion`.
- Criar primitivas de skeleton, `PageTransition` e testes das preferências.
- Substituir o fallback da sessão protegida.

### Etapa 2 — jornadas principais

- Dashboard administrativo.
- Dashboard do participante.
- Lista pública e lista interna de eventos.
- Detalhe do evento.
- Validar desktop em 1440 px e mobile em 390 px antes de avançar.

### Etapa 3 — operações administrativas e documentos

- Lista, formulário e conclusão de evento.
- QR Codes.
- Certificados, validação pública e medalhas.
- Diferenciar carregamento inicial, refresh e ação local em todos os módulos.

### Etapa 4 — refinamento e verificação

- Transições de rota, navegação ativa, modais, toasts e reorganização de listas.
- Navegação completa por teclado e verificação de movimento reduzido.
- Medir mudança de layout e responsividade; corrigir skeletons que não ocupem a geometria final.
- Avaliar testes visuais para pares “carregando/carregado” nas telas críticas.

## Critérios de aceite

- Nenhuma tela de conteúdo usa uma roda central de carregamento.
- Todo skeleton identificado na matriz mantém a estrutura responsiva do conteúdo correspondente.
- Refresh não apaga dados já disponíveis.
- Sidebar, cabeçalho e barra inferior não remontam durante a troca entre rotas da mesma área.
- Transições comuns terminam em até 240 ms e podem ser interrompidas por nova interação.
- Não há animação contínua fora do skeleton ou de um progresso real.
- `prefers-reduced-motion: reduce` elimina deslocamento, shimmer e animações de layout.
- Foco, leitura por teclado e mensagens de status continuam funcionais durante carregamento e transições.
- Não há rolagem horizontal em 390 px nem quebra do dashboard em 1440 px.
- `npm test`, `npm run build` e `npm run lint` passam após cada etapa verificável.

## Limites desta etapa

Este documento define o trabalho e não instala dependências nem altera as telas. A implementação deve ser feita em entregas pequenas para que a fidelidade de cada skeleton possa ser conferida contra o respectivo conteúdo real.
