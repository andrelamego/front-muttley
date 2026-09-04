# Muttley — produto e direção de interface

Atualizado em 04/09/2026 após a escolha das telas do Stitch. As regras de negócio têm sua referência principal no [documento do backend](../Backend-Muttley/docs/requisitos-e-regras-de-negocio.md).

## Direção vigente — telas escolhidas no Stitch

Aplicar à base existente o [guia visual consolidado](docs/design/DESIGN.md): papel `#fcf9f5`, tinta `#1c1c1a`, terracota `#6b1705`/`#8b2e19`, Newsreader nos títulos, Plus Jakarta Sans na interface e JetBrains Mono nos metadados. A escolha anterior de azul/Slate com fonte de sistema fica como histórico, não como restrição atual.

As [referências originais](docs/design/stitch/README.md) cobrem landing desktop, admin desktop e participante mobile. A [especificação](docs/design/STITCH_TELAS_E_INTEGRACAO.md) define adaptações, conteúdo real e limites da API. O [roteiro de verificação](docs/design/STITCH_VALIDACAO.md) exige comparação com as capturas. Esta preparação não implementou o visual nem homologou as telas.

## Objetivo

Permitir que uma pessoa encontre um evento acadêmico, entenda as condições de participação, faça sua inscrição e acesse o certificado. Para a organização, tornar claros o acompanhamento das inscrições, a presença e a conclusão do evento.

O objetivo atual é refinar a interface implementada com fundamentos de produto, IHC, UI/UX e arquitetura modular, usando as referências escolhidas no Stitch. Manter React + Vite, os módulos existentes e os serviços como referência funcional.

As prioridades do autor são: login descomplicado, dashboard eficiente e planejado, mobile-first para público e participantes, administração planejada para desktop, navegação fluida e visual moderno.

## Usuários e tarefas

| Perfil        | Tarefas principais                                                        | Informação prioritária                                                 |
| ------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Visitante     | Encontrar evento, consultar detalhes, inscrever-se e validar certificado  | Tema, data, horário, local/modalidade e disponibilidade de inscrição   |
| Participante  | Consultar inscrições próprias, confirmar presença e acessar certificados  | Próximo compromisso, situação da participação e certificado disponível |
| Administrador | Criar e editar eventos permitidos, acompanhar inscritos e concluir evento | Estado do evento, participantes, presença e resultado da emissão       |

## Jornadas que devem ser preservadas

1. **Inscrição:** lista pública → detalhes → formulário ou dados do usuário autenticado → confirmação com próximo passo claro.
2. **Presença:** link ou QR do evento → identificação do inscrito → confirmação ou explicação do impedimento.
3. **Certificado:** área pessoal ou link público → identificação do certificado → visualização e download.
4. **Administração:** lista de eventos → criação/edição → acompanhamento → seleção de presentes e assinatura → conclusão e resultado.

As rotas existentes estão em `src/app/routes/AppRoutes.tsx`. Links de QR e certificados podem circular fora do sistema; alterações de rotas precisam preservar esses acessos.

## Regras que precisam aparecer na experiência

| Regra definida pelo autor                                                                  | Consequência para a interface                                                                                |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Inscrição permitida antes do início e enquanto houver vagas                                | Exibir o estado real; impedir novas submissões quando encerrada e explicar conflitos retornados pela API     |
| Presença de dez minutos antes do início até dez minutos após o fim, com limites inclusivos | Informar a janela permitida e diferenciar confirmação disponível, fora de horário e presença já registrada   |
| USER administra somente participações próprias                                             | Área pessoal apresenta dados do titular; ações indevidas não aparecem como disponíveis                       |
| Assinaturas JPG/PNG                                                                        | Orientar formatos aceitos e apresentar erro útil para arquivo inválido; `.jpeg` também é aceito pelo backend |
| Verificação de email será futura                                                           | Não apresentar selo de email verificado nem criar bloqueio inexistente                                       |
| Evento cancelado não pode ser editado e mantém o ID                                        | Identificar cancelamento, desabilitar edição e preservar links para a identidade do evento                   |

Não derive vagas disponíveis apenas da capacidade do local: é necessário conhecer as inscrições atuais. Se o contrato público não fornecer essa informação, registre a necessidade de integração e trate a resposta de lotação do backend sem inventar uma contagem. O relógio e as permissões do servidor prevalecem sobre estimativas da interface.

## Diretrizes gerais de identidade

Use a identidade do Stitch consolidada no guia vigente. As diretrizes abaixo orientam legibilidade, acessibilidade e consistência, sem reabrir a escolha estética.

- Defina paleta e tipografia próprias, com hierarquia clara e contraste verificado. Não é obrigatório manter o vermelho atual nem a aparência institucional anterior.
- Crie tokens semânticos de cor, espaçamento, tipografia, bordas, elevação e movimento. A mudança de tema deve ocorrer principalmente nos tokens, sem espalhar valores pelas páginas.
- Reserve a maior ênfase visual para a ação principal da página. Evite múltiplos botões competindo pela mesma atenção.
- Dê destaque a tema, data, horário e local dos eventos. Medalhas e estatísticas são secundárias à participação e ao certificado.
- Use espaçamento consistente, hierarquia de títulos e conteúdo legível. Ícones devem apoiar rótulos compreensíveis.
- Separe o tom visual das áreas pública, pessoal e administrativa por composição e navegação, mantendo componentes coerentes.
- Evite animações decorativas que atrasem ações. Respeite preferência por movimento reduzido.

Escolha alternativas locais para a fonte adotada. A interface deve continuar utilizável quando recursos externos não carregarem. Efeitos 3D, transparências, animações intensas ou bibliotecas de movimento não são exigências de um visual moderno.

## Telas de referência antes da implementação em escala

Projete três telas para validar o sistema visual e a navegação em situações distintas:

1. **Login em celular:** identificação, email, senha, mostrar/ocultar senha e uma ação principal. Permitir colar credenciais e usar preenchimento automático. Mensagens claras, valores preservados e retorno à tarefa solicitada após autenticação. Cadastro fica como ação secundária; recuperação de senha ou login social só aparecem quando implementados.
2. **Início do participante em celular:** próximo evento, situação da inscrição, ação de presença quando permitida e acesso aos certificados. Navegação curta e rótulos reconhecíveis. A descoberta de eventos deve continuar acessível sem obrigar login.
3. **Dashboard administrativo em desktop:** priorizar eventos que exigem ação, próximos compromissos e atalhos de criação, participantes e conclusão. Métricas precisam indicar período e ajudar uma decisão; gráficos e números decorativos não justificam espaço.

No dashboard administrativo, cada bloco deve responder: qual pergunta ajuda a resolver, de onde vêm os dados e qual ação permite executar? Diferencie estado vazio de falha parcial de consulta. Conserve busca, filtros e contexto ao voltar de um detalhe; não invente indicadores ausentes no contrato.

A lista pública continua essencial à jornada de inscrição: tema, data, horário, modalidade/local, disponibilidade confirmada pela API e acesso aos detalhes. Busca e filtros dependem dos dados e contratos disponíveis.

## IHC e navegação

| Princípio                        | Aplicação concreta                                            | Evidência esperada                                |
| -------------------------------- | ------------------------------------------------------------- | ------------------------------------------------- |
| Visibilidade do estado           | Feedback de carregamento, envio, confirmação e falha          | Usuário identifica se a ação foi concluída        |
| Consistência e reconhecimento    | Mesmos termos e componentes para a mesma ação                 | Navegação compreensível sem memorizar caminhos    |
| Controle do usuário              | Voltar, cancelar e preservar dados não enviados quando viável | Retorno ao contexto anterior sem perda inesperada |
| Prevenção e recuperação de erros | Validação junto aos campos e confirmação de ações de impacto  | Erro explicado com caminho de correção            |
| Redução da carga cognitiva       | Hierarquia, agrupamento e divulgação gradual de detalhes      | Tarefa principal visível sem excesso de opções    |
| Acesso inclusivo                 | Teclado, foco, rótulos, contraste e movimento reduzido        | Verificação manual e automatizada documentada     |

Valide protótipos com tarefas representativas de participante e administrador. Registre conclusão da tarefa, erros, hesitações e feedback; medidas de tempo servem como diagnóstico, sem inventar resultados ou participantes.

## Estratégia responsiva

- Público, login e área pessoal: projetar primeiro para celular e ampliar para tablet e desktop.
- Administração: projetar primeiro para desktop, com espaço para filtros, tabelas e operações frequentes. Em telas menores, reorganizar conteúdo e navegação sem ocultar ações essenciais.
- Ajustar pontos de quebra conforme o conteúdo. Não aplicar o mesmo layout ou densidade a todos os perfis.
- Navegação fluida significa caminhos previsíveis, retorno ao contexto e feedback rápido; animação é apenas um apoio opcional.

## Padrões de interação

- Formulários: rótulos persistentes, obrigatoriedade explícita, erros próximos aos campos e valores preservados após falha.
- Submissões: impedir envio repetido enquanto a solicitação estiver em andamento e comunicar sucesso somente após confirmação da API.
- Listas: apresentar filtros ativos, estado vazio e ações com nomes claros. Tabelas administrativas precisam de adaptação para telas estreitas.
- Cancelamento e conclusão: explicitar consequências antes da ação; não apresentar operações irreversíveis como edição comum.
- Mensagens: explicar o problema e a ação possível. Diferenciar sessão expirada, acesso negado, evento lotado e falha temporária.

## Critérios de aceite de interface

- Área pública e pessoal conferidas primeiro em 360 px e 390 px; depois em 768 px e 1366 px. Administração conferida primeiro em 1366 px e 1440 px, com adaptação também em 768 px e 390 px.
- Sem rolagem horizontal da página; quando uma tabela exigir rolagem, ela deve ficar contida e identificável.
- Conteúdo utilizável com zoom de 200%, títulos claros e contraste legível.
- Jornada principal acessível por teclado, com foco visível e ordem coerente.
- Estados não dependem exclusivamente de cor. Campos e controles possuem nomes acessíveis.
- Datas e horários exibidos correspondem ao evento recebido da API, sem deslocamento acidental de dia.
- Links diretos de eventos, confirmação de presença e certificados continuam acessíveis.
- Evidências distinguem uso da API real de cenários com dados simulados.

Adote WCAG 2.2 nível AA como referência de acessibilidade e registre os critérios avaliados, incluindo autenticação acessível. Uma ferramenta automatizada isolada não comprova conformidade. [Referência W3C](https://www.w3.org/WAI/WCAG22/quickref/).

## Fora da entrega inicial

Migração para Next.js, pagamentos, chat, verificação de email e novas regras de gamificação não fazem parte desta etapa. A substituição final do frontend depende de conferir o inventário funcional e a compatibilidade de integração; a implementação antiga pode permanecer apenas no histórico do Git após essa transição.

## Histórico — contrato anterior ao Stitch (substituído em cor e tipografia)

Conforme estabelecido no refinamento da reconstrução:

1. **Personalidade e tom:** Editorial acadêmico contemporâneo — limpo, estruturado e legível como uma publicação científica de ponta. Foco no conteúdo do evento (tema, agenda, horários, local, modalidade) e na utilidade das ações.
2. **Tipografia de títulos e leitura:** Stack de sistema de alta legibilidade (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`). Suporte nativo completo à acentuação do português brasileiro, pesos reais (400 regular, 500 medium, 600 semibold, 700 bold, 900 black), zero CLS e zero requisições externas de fontes que possam degradar com conexão instável.
3. **Paleta semântica:** Azul acadêmico profundo (`#1d4ed8` / `--color-primary-600`) com superfície neutra Slate (`slate-50`, `slate-100` e branco puro). Contraste verificado conforme WCAG 2.2 nível AA (mínimo de 4.5:1 para texto normal e 3:1 para controles e títulos).
4. **Densidade administrativa:** Desktop-first com menu lateral persistente na administração, tabelas contidas com rolagem horizontal restrita ao container e métricas reais com períodos explicados.
5. **Alvos de toque e botões:** Botão `Button` com caixa padronizada, borda de 1px reservada em todas as variantes para evitar saltos visuais, altura mínima de 44px para toque mobile (`h-11`) e alinhamento estável em estados de carregamento.
6. **Iconografia semântica:** Uso exclusivo de SVGs desenhados com precisão e rótulos acessíveis. **Proibição estrita de emojis** em ícones de sistema e navegação.

Registre decisões concluídas e evidências no [plano de reconstrução](docs/PLANO_FRONTEND.md). Use as [skills por etapa](docs/SKILLS_FRONTEND.md) para sustentar as decisões, sem deixar que uma preferência estética de uma skill se sobreponha às necessidades dos usuários.
