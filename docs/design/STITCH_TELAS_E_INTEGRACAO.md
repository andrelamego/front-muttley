# Telas do Stitch — implementação e contratos do Muttley

Escopo: adaptar o frontend atual às referências fornecidas. As decisões de marca estão em [DESIGN.md](DESIGN.md). Não alterar backend, rotas públicas emitidas, permissões ou regras de negócio para imitar o protótipo.

## Estado do código observado

A reconstrução e uma rodada de ajustes já existem em `src/app`, `src/modules` e `src/shared`. Foram encontrados `LandingPage`, sidebar administrativa, política de destino pós-login, proteção contra respostas de sessão anterior e tratamento independente de QR Codes. Reaproveitar e verificar essas implementações; não repetir o plano antigo como se estivessem ausentes. Esta inspeção foi de código e dos PNGs do Stitch, sem homologação do aplicativo no navegador.

| Referência | Rota existente | Arquivos principais |
| --- | --- | --- |
| Landing | `/` | `src/modules/eventos/ui/LandingPage.tsx`, `src/app/layouts/PublicLayout.tsx` |
| Admin | `/admin/inicio` | `src/modules/painel/ui/AdminDashboardPage.tsx`, `src/app/layouts/AdminLayout.tsx` |
| Participante | `/user/inicio` | `src/modules/painel/ui/ParticipantDashboardPage.tsx`, `src/app/layouts/ParticipantLayout.tsx` |
| Identidade comum | Todas as rotas vivas | `src/styles/tokens.css`, `src/shared/ui`, estilos globais e componentes dos módulos |

## 1. Landing pública

**Referência fornecida:** [1280 × 2643](stitch/landing/screen.png), [HTML](stitch/landing/code.html). A versão mobile abaixo é uma adaptação proposta, sem captura original equivalente.

### Composição

1. Cabeçalho horizontal de 64 px: logo único, navegação e acesso à conta. Usar Início, Eventos, Como funciona e Entrar. Se autenticado, apresentar “Meu painel” com destino por perfil. Retirar Anais & Publicações, avatar fictício e duplicidade de CTAs para autenticação.
2. Hero em duas colunas no desktop: texto editorial em aproximadamente dois terços e painel/foto de apoio em um terço. Preservar a grande Newsreader e o destaque itálico terracota em “conhecimento”. Manter “Explorar eventos” e uma ação secundária para a seção “Como funciona”.
3. Faixa compacta abaixo do hero com três capacidades reais, ocupando o papel visual dos selos fictícios: “Inscrição em eventos”, “Confirmação de presença” e “Consulta de certificados”. Sem números ou credenciais regulatórias.
4. Próximos eventos: cabeçalho editorial com controles de carrossel à direita; três cartões em desktop, dois em tablet e um em mobile, conforme espaço disponível. Dia grande, mês/ano em mono, modalidade, tema, descrição e rodapé de metadados/ação.
5. Como funciona: quatro blocos numerados com encontrar, inscrever-se, confirmar presença e acessar certificado. Preservar agrupamento, espaçamento e contraste de superfícies.
6. Organização: texto e benefícios reais ao lado de representação ilustrativa de certificado. Se houver mock de certificado, marcar “Exemplo ilustrativo”, sem pessoa real, hash, QR funcional fictício ou alegação de assinatura criptográfica. Benefícios: organizar eventos, acompanhar inscrições/presenças, emitir certificados após conclusão. CTA leva a `/login` ou `/admin/inicio` somente quando o perfil permitir.
7. Rodapé com navegação real. Preservar acesso público à consulta de certificados existente. Ano atual obtido pelo aplicativo, sem datas fixas de 2024/2025.

Texto proposto para o hero: “Encontre seu próximo encontro com o conhecimento.” Descrição: “Descubra eventos acadêmicos, acompanhe suas participações e acesse seus certificados em um só lugar.” Usar “Próximos eventos” como título da agenda, sem “calendário homologado”.

### Dados e comportamento

Fonte: `getEventosPublicosApi`, que usa `GET /api/eventos`. O contrato fornece `id`, `tema`, `descricao`, `data`, `horarioInicio`, `horarioFim`, `modalidade`, `status`, `disciplina`, `local` e `inscricoesEncerradas`.

Não há capa, carga horária acadêmica, palestrante, lotação numérica ou chancela pública nesse DTO. Mostrar somente campos recebidos e rótulos da aplicação. Não calcular horas complementares como se fossem iguais à duração do evento. Descrições podem ocupar duas/três linhas nos cartões; nome completo permanece acessível nos detalhes.

“Ver evento” leva a `/eventos/{id}`. Datas devem vir da API, com leitura de `YYYY-MM-DD` como data de calendário. `inscricoesEncerradas` prevalece na disponibilidade; o catálogo não garante reserva de vaga.

Carrossel usa o componente/lógica existente como ponto de partida. Página/posição e controles devem depender do número real de itens e do tamanho visível, não do `totalPages = 2` chumbado no script exportado. Sem autoplay; teclado, toque e movimento reduzido; ao mudar largura, corrigir índice fora do intervalo. Um item não precisa de setas; zero itens recebe estado vazio com navegação útil; erro permite nova tentativa sem substituir por eventos fictícios.

### Adaptação mobile proposta

Margens de 16 px, hero de uma coluna, título fluido entre 32 e 36 px se necessário e CTAs empilhados. Painel de apoio depois do texto, sem empurrar o acesso aos eventos excessivamente para baixo. Faixa de capacidades quebra em linhas; quatro etapas empilham. Cabeçalho recolhe links em menu com foco e Escape. Não ocultar a barra de rolagem global como faz o export.

## 2. Dashboard administrativo

**Referência fornecida:** [1280 × 2131](stitch/admin/screen.png), [HTML](stitch/admin/code.html). A adaptação mobile não foi fornecida.

### Composição

Sidebar de 256 px em superfície papel mais escura, item ativo em terracota, logo acima e conta/sair abaixo. Cabeçalho de 64 px e área principal com padding de 24–32 px. A versão original duplica a marca no cabeçalho; usar o espaço para identificação/contexto, sem duplicação.

Ordem dos blocos: título “Painel de gestão” com Criar evento; pendências de conclusão quando comprovadas; três indicadores; agenda próxima; tabela resumida de eventos. Preservar agrupamento, superfícies e números editoriais. Não reproduzir o corte de conteúdo no terceiro indicador da captura: texto e números devem caber ou quebrar de forma planejada.

Menu real: Painel, Eventos, Criar evento e Ver página pública. Preservar navegação existente e estado ativo em subrotas. Não criar páginas vazias para Submissões, Relatório Geral ou Certificados administrativos só porque aparecem na referência. Não confundir certificados pessoais em `/user/certificados` com uma área global de administração.

### Dados e ações

`GET /api/admin/inicio` fornece:

| Elemento | Dado real | Limite |
| --- | --- | --- |
| Eventos ativos | `eventosAtivos` | Não inventar variação “+2 nesta semana” |
| Agenda próxima | `eventosAtivosNaSemana` | Período atual do backend: hoje até hoje + 7 dias, limites inclusivos; explicar período sem redefinir a consulta |
| Certificados | `certificadosUltimos30Dias` | Exibir período; não é “certificados homologados” |
| Variação dos certificados | `variacaoCertificadosUltimos30Dias` | Somente esta variação é fornecida; não acrescentar precisão ou significado não suportado |
| Próximos eventos | `proximosEventos` | Lista limitada pelo servidor, até oito; não representa todo o catálogo |
| Gráficos já existentes | `certificadosPorEvento`, `medalhasPorParticipante` | Preservar acesso se existentes; podem ser seções secundárias, sem comprometer a agenda |

O resumo de evento traz `disciplina` e `local` como texto/null. Não usar `.nome` nessas propriedades. Não substituir erro ou campo inválido de métrica por zero silenciosamente.

A lista completa usa `GET /api/admin/eventos` com paginação do backend. O helper atual `getAdminEventosApi` pede até 1000 itens e descarta metadados: não usar o tamanho desse array para afirmar total global. Para tabela com paginação, adaptar o contrato no módulo `admin-eventos` para preservar `content`, total e página reais; compor pelo `index.ts` público. Alternativa menor: lista explicitamente resumida e link “Ver todos os eventos”.

O endpoint atual filtra estados visíveis e pode não retornar cancelados. Não desenhar uma linha fictícia de evento cancelado para copiar a captura nem criar um filtro que promete registros excluídos pelo backend. Registrar essa limitação; o novo visual não depende de alterar a API.

Pendência: usar eventos reais EM_ANDAMENTO já encerrados pela data/hora. Se a fonte for uma lista limitada, o rótulo deve ser “Pendências nesta lista”, sem afirmar total global. “Revisar conclusão” leva a `/admin/eventos/{id}/concluir`; não concluir nem emitir diretamente pelo banner. Não usar “Descartar inconsistências” ou “Homologar” sem operação correspondente.

Agenda e tabela mostram dados disponíveis. A referência contém ocupação, nomes de palestrantes, biometria e códigos internos que o resumo não fornece. Retirar esses trechos ou usar os dados reais de detalhe somente quando a jornada já os carrega. Não disparar uma consulta de participantes por cartão apenas para preencher a arte. Barra sem numerador/denominador real não deve parecer um progresso medido.

“Criar evento” → `/admin/eventos/novo`; editar/concluir seguem as rotas existentes e as permissões/estados reais. Conclusão exige revisão, assinatura JPG/PNG e confirmação; nunca utilizar um botão da arte como sucesso automático. QR Codes continuam nas jornadas já implementadas, com os dois carregamentos e erros independentes.

### Adaptação mobile proposta

Sidebar vira drawer abaixo do espaço necessário para conteúdo (referência inicial 1024 px). Indicadores passam para uma coluna ou duas quando couberem; ações do título quebram linha. Agenda é lista vertical. Tabela pode ter rolagem contida com cabeçalhos, ou linhas convertidas em cartões mantendo rótulos e ações. Nenhuma rolagem horizontal da página inteira. Drawer e header não cobrem o conteúdo focado.

## 3. Painel do participante

**Referência fornecida:** [331 × 1600](stitch/participante/screen.png), [HTML](stitch/participante/code.html). A largura de 331 px é evidência do export; validar também 360/390 px. Desktop é adaptação proposta.

### Composição

Cabeçalho compacto com marca única e identificação do painel. Saudação serifada, resumo da agenda, navegação curta, evento mais relevante com ação de presença, próximos compromissos, certificados recentes e área da conta.

O protótipo repete navegação no cabeçalho, abas e barra inferior. Consolidar em um único mecanismo principal por viewport. No mobile, usar barra inferior Painel, Eventos e Certificados; preservar acesso a Medalhas e à conta por destino real. “Perfil” não deve apontar para rota inexistente: pode levar à seção da conta via âncora ou não aparecer. No desktop, a navegação pode ser superior/lateral conforme o layout existente, com a mesma identidade e sem barra inferior redundante.

Evento prioritário em superfície branca, data/modalidade em metadados e CTA de presença largo. Próximos compromissos em lista; certificados com código real, Copiar, Baixar PDF e Ver todos. Preservar LinkedIn e demais ações reais já disponíveis na página de certificados. Conta com nome/email reais e Sair; iniciais derivadas do nome, sem avatar/curso/RA inventados.

### Dados e limitações relevantes

| Bloco | Fonte | Observação |
| --- | --- | --- |
| Nome/email/CPF/perfil | Sessão e `/api/me` | Sem RA, graduação ou matrícula no DTO atual |
| Compromissos | `/api/me/participacoes` | Tem `id`, `inscricao`, `tipo`, `evento`; **não tem `presente`** |
| Certificados | `/api/me/certificados` | Usar `codigoValidacao`, `dataEmissao` e evento reais; não chamar código de hash |
| Medalhas | `/api/me/medalhas` | Preservar funcionalidade existente |
| Presença | `POST /api/eventos/{id}/confirmar-presenca/{cpf}` | Usar adaptador existente e resultado do servidor |
| PDF | `GET /api/certificados/{codigo}/download` | Download binário pelo cliente existente; não abrir `caminhoPdf` local do servidor |
| Validação | `/certificados/{codigo}` no frontend | Não criar `/valida/{hash}` do protótipo |

Selecionar o evento relevante por data/hora, privilegiando aquele cuja janela de presença está aberta; depois o próximo compromisso futuro. Não apresentar eventos antigos EM_ANDAMENTO como o próximo compromisso só por esse status. Cancelados/finalizados não permitem presença. Não somar todos os registros e afirmar que são “agendados para hoje”.

A janela correta é do início − 10 minutos ao **término + 10 minutos**, inclusive. O admin exportado diz incorretamente “10 minutos após o início”; corrigir. Para 19:00–21:30, a janela é 18:50–21:40. Inscrição só antes do início e enquanto houver vaga; tolerância de presença não amplia inscrição.

Sem `presente` no DTO pessoal, não inferir confirmação pela inscrição, horário ou badge. Após sucesso real, exibir feedback da ação nesta sessão. Ao recarregar, não afirmar confirmação persistida sem fonte que a informe. Manter o fluxo existente de confirmação/checagem, explicar a resposta de presença já registrada e documentar uma eventual necessidade futura de campo no backend. **Não consultar endpoint ADMIN com credenciais USER para contornar essa ausência.**

O script do HTML muda o texto para “Presença Registrada com Sucesso” sem rede. Não transplantar esse comportamento. Falha de rede, 404, fora da janela, conflito e presença já confirmada precisam de mensagens específicas; distinguir conflitos conforme a resposta recebida, sem tratar qualquer 409 como sucesso.

Métricas pequenas devem ser calculadas a partir de dados próprios válidos. O contrato não fornece horas complementares oficiais, link de sala virtual ou foto do evento: omitir essas afirmações. Eventos online podem informar modalidade e local textual, sem inventar transmissão embutida.

### Adaptação desktop proposta

Conteúdo máximo de 1216 px, saudação acima, grade principal aproximadamente 2:1: próximo evento e compromissos à esquerda, certificados recentes e conta à direita. Expandir conteúdo legível, sem simplesmente esticar o card de 331 px. Respeitar a ordem semântica no DOM quando empilhar. Navegação e Sair permanecem acessíveis.

## 4. Correções obrigatórias do conteúdo demonstrativo

| No export | Na implementação |
| --- | --- |
| CAPES/MEC, CNPq, conformidade institucional, calendário homologado | Descrever capacidades reais sem chancela ou vínculo inventado |
| SHA-256, assinatura imutável, registro perene, validação criptográfica | “Código de validação” e consulta pública existentes |
| Biometria, georreferenciamento, QR dinâmico | Confirmação de presença por link/QR do evento, conforme implementação |
| Emissão instantânea/garantida | Certificado disponível conforme conclusão/emissão real |
| Submissões, DOI, anais, relatórios, credenciamento institucional | Omitir navegação e ações sem implementação |
| Camila, professor administrador, RA, 142 presenças, 1.420 certificados | Dados da sessão/API; cenários de teste identificados como simulados |
| Carga horária auditada ou horas complementares | Omitir se não há dado oficial no contrato |
| Ano e agenda de 2024/2025 | Datas da API, ano de rodapé atual |
| “WCAG AAA” no DESIGN original | Critérios efetivamente avaliados e resultado registrado |

Preservar a hierarquia dos blocos substituindo textos quando possível. Não acrescentar uma página nova para justificar conteúdo inventado pelo export.

## 5. Limites entre módulos e preservação funcional

Layouts e navegação pertencem a `app`; dados de eventos ao módulo `eventos`; operações administrativas a `admin-eventos`; composição dos painéis a `painel`; componentes visuais genéricos a `shared/ui`. Transporte continua em `shared/http`, sem importar sessão ou módulos. Usar interfaces públicas deliberadas; não mover tudo para um componente gigante ou duplicar clientes HTTP.

Login, catálogo, detalhes, certificados, medalhas e formulários recebem os tokens e componentes comuns para não ficarem com a identidade azul antiga. Não precisam de novos layouts inventados em escala; preservar jornadas e mudar somente o necessário para coerência visual.

Preservar `loginDestinationPolicy`, proteção ADMIN, limpeza de sessão, descarte de respostas antigas, modais acessíveis, QR com falha parcial, upload de assinatura e rotas já emitidas. Os erros descritos nos prompts anteriores são regressões a testar, não autorização para remover essas soluções.

O backend é apenas referência de contratos nesta entrega. Se necessário ajuste novo, registrar endpoint, comportamento, impacto e reprodução; concluir as partes não dependentes e não mudar servidor ou massa de dados como atalho.
