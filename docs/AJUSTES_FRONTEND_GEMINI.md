# Ajustes do frontend após a reconstrução

Pedido do autor em 04/09/2026. O frontend já foi reconstruído; esta entrega corrige e refina a base modular existente. O backend está sendo corrigido separadamente. Não reiniciar a aplicação do zero nem alterar os repositórios irmãos nesta etapa.

## Leitura e evidências

Leia `AGENTS.md`, `PRODUCT_DESIGN.md`, `docs/ARQUITETURA_FRONTEND.md`, `docs/SKILLS_FRONTEND.md` e o código atual. O README e alguns trechos antigos ainda descrevem uma reconstrução futura; prevalecem o estado real do código e este pedido. Atualize os trechos desatualizados sem apagar o histórico de entregas.

A inspeção do código encontrou:

- `src/modules/auth/ui/LoginPage.tsx`: `returnTo` tem prioridade sobre o perfil da nova sessão, sem validar autorização.
- `src/app/routes/ProtectedRoute.tsx`: o acesso de USER a uma rota ADMIN encaminha ao login e preserva a rota proibida em `state.from`.
- `src/app/layouts/AdminLayout.tsx`: sair chama `logout` enquanto a rota administrativa continua ativa, permitindo que a guarda memorize esse endereço para o próximo login.
- `src/modules/auth/application/AuthContext.tsx`: revisar respostas assíncronas de `/me` e atualização do token no transporte durante troca de contas.
- `src/modules/admin-eventos/ui/AdminEventListPage.tsx`: o modal usa `Promise.all` para os dois QR Codes, escondendo ambos se somente um falhar.
- `src/app/routes/AppRoutes.tsx`: `/` e `/eventos` exibem a mesma listagem; ainda não há landing page dedicada.
- `src/shared/ui/Button.tsx`: tamanhos e variantes existem, mas estilos locais e alturas mínimas podem produzir controles diferentes em contextos equivalentes.
- `src/modules/painel/domain/painelTypes.ts`: conferir a tipagem de `proximosEventos` contra o JSON real. A correção do backend passa a retornar resumos com `disciplina` e `local` como texto ou null, sem entidades/proxies ou participações aninhadas.

## 1. Sessão e navegação — prioridade máxima

Corrigir o fluxo ADMIN → sair → login USER para chegar a `/user/inicio`, sem alerta residual de acesso restrito ou loop. O fluxo inverso deve chegar a `/admin/inicio`.

Criar uma política pequena e testável de destino após login. Uma rota de retorno só pode ser usada quando for interna, reconhecida e permitida para o perfil recém-autenticado. Bloquear destinos externos, `//host`, protocolos, caminhos ambíguos e retornos ao próprio login. Preservar query/hash válidos quando fizerem parte da jornada. Não duplicar listas de permissões em várias páginas: compor a política com a configuração de rotas.

Logout explícito deve limpar sessão, estado e dados privados e navegar com `replace` para um destino público sem registrar a página antiga como intenção do novo usuário. Diferenciar logout voluntário, expiração de sessão e tentativa de acesso proibido. Um USER autenticado que abrir `/admin/...` recebe uma tela de acesso restrito com retorno ao seu painel, sem ser obrigado a autenticar novamente.

Descartar respostas pendentes da sessão anterior, inclusive `/me`, consultas privadas e erros 401 atrasados. O primeiro request após o novo login deve usar o token novo. Os testes devem demonstrar isso; somente limpar `localStorage` não comprova o isolamento. Preservar a proteção ADMIN no backend e nas guardas.

## 2. Integração e QR Codes

Os contratos públicos permanecem:

| Operação | Contrato |
| --- | --- |
| Dashboard administrativo | `GET /api/admin/inicio`, JSON, autenticação ADMIN |
| Lista pública / carrossel | `GET /api/eventos`, array, sem autenticação |
| Detalhe público | `GET /api/eventos/{id}` |
| QR de inscrição | `GET /api/admin/eventos/{id}/qrcode-inscricao`, PNG como anexo |
| QR de presença | `GET /api/admin/eventos/{id}/qrcode-confirmacao`, PNG como anexo |
| Inscrição | `POST /api/eventos/{id}/inscricoes`, JSON conforme DTO existente |
| Conclusão | `POST /api/admin/eventos/{id}/concluir`, multipart com `file` e valores repetidos de `presentes` |

O cliente tem base `/api`: não duplicar esse prefixo. Não acessar o microsserviço de QR diretamente pelo navegador. O backend gera o PNG sob demanda, inclusive para eventos antigos sem URL persistida. Backend e serviço de QR precisam estar recompilados e reiniciados juntos. Consulte o relatório do backend em `../Backend-Muttley/docs/correcoes-integracao-2026-09-04.md`.

No modal, manter estado independente para inscrição e presença: carregando, pronto, erro e tentar novamente. Exibir o que funcionou quando a outra chamada falhar; repetir somente a chamada com falha. HTTP 503 significa indisponibilidade do serviço; 404 significa evento inexistente; 401 e 403 seguem a política de sessão/permissão. Normalizar erros JSON recebidos como Blob e não apresentar SQL, stack traces ou mensagens internas na interface.

Impedir resposta de um evento antigo de aparecer após abrir outro ou fechar o modal. Liberar `URL.createObjectURL` no fechamento, substituição e desmontagem, inclusive quando chamadas terminarem fora de ordem. Garantir foco inicial, contenção de foco, Escape e devolução ao disparador.

## 3. Dashboard administrativo com menu lateral

O painel é uma área de gestão, planejada primeiro para desktop. Implementar o shell administrativo em `src/app/layouts/AdminLayout.tsx`, com menu lateral persistente, item ativo, identificação da conta, ação de sair e área de conteúdo consistente. No celular, usar menu recolhível acessível, com Escape e retorno de foco. Oferecer link para pular ao conteúdo.

O menu deve levar a rotas reais: painel, gestão de eventos, criação de evento e visão pública. Não adicionar cadastros ou relatórios sem tela/contrato implementado. Subrotas de edição e conclusão mantêm Gestão de Eventos como seção ativa.

No dashboard, priorizar próximos eventos e ações de acompanhamento. Usar os campos reais: `eventosAtivos`, `eventosAtivosNaSemana`, `certificadosUltimos30Dias`, `variacaoCertificadosUltimos30Dias`, `proximosEventos`, `certificadosPorEvento` e `medalhasPorParticipante`. Explicar períodos das métricas, preservar o significado das contagens e tratar zero, ausência e erro de modo distinto. Não inventar receita, lotação, presença ou números promocionais.

Listas e tabelas precisam de hierarquia clara, ações contextualizadas e largura útil; evitar grandes cartões vazios. Respeitar as regras de edição, cancelamento e conclusão, com confirmação e prevenção de submissão duplicada.

## 4. Identidade visual e botões

Criar uma direção visual própria para eventos acadêmicos, com caráter editorial, agenda legível e informação bem organizada. Há liberdade para mudar a identidade. Não basta trocar azul por outra cor mantendo uma composição genérica.

Antes de implementar, registrar em `PRODUCT_DESIGN.md` um contrato visual curto: personalidade, hierarquia, tipografia de títulos e leitura, paleta semântica, densidade administrativa e estados. Escolher fontes pela legibilidade em português, acentos, pesos reais e contraste entre títulos e conteúdo. Informar origem/licença, estratégia de carregamento e fallback. Evitar carregar famílias ou pesos sem uso. Não depender exclusivamente da mudança de fonte para diferenciar a interface.

Aplicar tokens de verdade em `src/styles/tokens.css` e nos componentes, substituindo valores avulsos quando afetarem as telas desta entrega. Usar os critérios de `anti-ui-slop`: conteúdo do produto, ações reais, estados completos e inspeção da tela renderizada. Evitar gradientes gratuitos, glassmorphism, blocos promocionais repetidos, emojis e animação ornamental.

Padronizar `Button` e links com aparência de botão por variantes e tamanhos deliberados. Controles equivalentes devem ter a mesma altura, borda, padding, tipografia e dimensão de ícone. Reservar espaço de borda em todas as variantes para não alterar dimensões; loading não deve deslocar a barra de ações. A largura pode acompanhar o texto: não forçar todos os botões a uma largura única. Garantir alvos de toque de pelo menos 44 px nas jornadas mobile e estados de foco/disabled/loading coerentes. Evitar correções isoladas com `!important` ou classes conflitantes em cada página.

## 5. Landing page com carrossel

Implementar landing pública em `/`; manter `/eventos` como catálogo. A landing deve apresentar o Muttley, explicar o fluxo encontrar evento → inscrição → presença → certificado, com CTA principal para explorar eventos e acesso claro ao login. Usar textos em português e funcionalidades existentes. Não criar depoimentos, estatísticas, selos ou integrações fictícias.

O carrossel usa `GET /api/eventos` por meio da interface pública do módulo de eventos. Apresentar um conjunto limitado de eventos reais, em ordem temporal, com tema, data, horário, modalidade/local e link para `/eventos/:id`. Datas de calendário não devem mudar com o fuso. O contrato não fornece imagem de capa: usar composição tipográfica ou recurso local licenciado, sem inventar URLs de imagens.

Preferir navegação manual, sem rotação automática. Oferecer botões anterior/próximo com nomes acessíveis, interação por toque e teclado, indicação compreensível de posição e foco previsível. Respeitar movimento reduzido. Com um evento, omitir controles desnecessários; com nenhum, apresentar estado vazio útil; com erro, mensagem e nova tentativa; com vários, não criar clones focáveis duplicados nem gerar rolagem horizontal da página inteira. A navegação e o CTA principal continuam utilizáveis se a consulta falhar.

Preservar `/eventos/:id/confirmar-presenca` e `/certificados/:codigo`, pois circulam por QR Codes e links já emitidos.

## 6. Modularidade e skills

Manter React + Vite + TypeScript e a arquitetura modular. `app` compõe layouts e rotas; módulos concentram jornadas; `shared/ui` não consulta HTTP nem lê sessão. A landing pode ter seu módulo próprio se houver responsabilidade concreta; consumir eventos por sua interface pública, sem copiar DTOs ou criar um segundo cliente de eventos. Não adicionar um framework de estado ou biblioteca de carrossel sem necessidade demonstrada.

Consultar as skills realmente disponíveis: `api-patterns` para contratos; `anti-ui-slop` para direção e revisão visual; `accessibility-compliance-accessibility-audit` para telas navegáveis; `architecture` e `architect-review` quando mudar limites entre módulos. Ler os arquivos e informar quais serão aplicadas. Ausência de uma skill deve ser registrada; o nome em documentação não comprova instalação nem execução. As decisões explícitas do autor prevalecem sobre preferências estéticas da skill.

## 7. Critérios de aceite e evidências

1. ADMIN → sair → USER; USER → sair → ADMIN; retorno público permitido; retorno proibido/externo; refresh; expiração e resposta tardia da sessão anterior: destinos e dados corretos, sem loops.
2. Dashboard consome resposta real com relacionamentos normalizados, tem sidebar funcional e distingue carregamento, erro, zero e ausência de eventos.
3. QR: ambos funcionam; somente um falha; ambos falham; tentativa individual; fechar/trocar evento com chamadas pendentes. Inspecionar PNG e validar o link decodificado quando o ambiente permitir.
4. Inscrição, presença e conclusão respeitam respostas reais da API; não simular sucesso para encobrir erro do servidor.
5. Landing e carrossel testados com zero, um e vários eventos, falha de rede, teclado, toque e movimento reduzido.
6. Conferir login, landing, catálogo, dashboard, listagem administrativa e modal em 390 px e 1440 px; também testar zoom e textos longos. Registrar capturas e achados reais.
7. Executar `npm test`, `npm run build` e `npm run lint`. Acrescentar testes de componentes ou E2E para troca de sessão, modal e navegação, além de testes puros da política de destino. Não declarar homologação integrada somente porque build e testes unitários passaram.
8. Atualizar plano, design e relatório de verificação com comandos executados, resultados, limitações e pendências. Não marcar tudo como pronto se não foi verificado.

Não alterar o código backend nesta entrega. Se um contrato divergir, registrar endpoint, status, corpo sem dados sensíveis e passos de reprodução. Ao criar commits, separar por responsabilidade e usar português: `fix(autenticacao): ...`, `fix(qrcodes): ...`, `feat(painel): ...`, `feat(inicio): ...`, `style(interface): ...`, `test(frontend): ...`.
