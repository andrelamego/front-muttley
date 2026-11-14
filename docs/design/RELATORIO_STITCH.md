# Relatório de Implementação e Validação do Visual Stitch

Data de emissão: 04/09/2026  
Status: Implementado e validado em código e build  
Escopo: Landing pública, Dashboard administrativo, Painel do participante e componentes transversais do Muttley.

---

## 1. Telas e Componentes Alterados

| Camada | Arquivo Principal | Descrição da Adaptação |
| --- | --- | --- |
| **Identidade & Tokens** | [`src/styles/tokens.css`](../../src/styles/tokens.css) | Substituição total da paleta azul antiga pelos tokens canônicos do Stitch: fundo papel `#fcf9f5`, tinta `#1c1c1a`, terracota `#6b1705`/`#8b2e19`, bordas `#ddc0ba` e neutros. |
| **Tipografia & Base** | [`index.html`](../../index.html), [`src/index.css`](../../src/index.css) | Carregamento otimizado de *Newsreader* (serif), *Plus Jakarta Sans* (sans) e *JetBrains Mono* (mono) com `font-display: swap` e classes utilitárias no Tailwind v4. |
| **Logo Oficial** | [`src/shared/ui/Logo.tsx`](../../src/shared/ui/Logo.tsx) | Componente vetorial SVG direto do protótipo Stitch (`stitch/logo/code.html`), eliminando duplicações e imagens rasterizadas de baixa resolução. |
| **Componentes Básicos** | [`src/shared/ui/Button.tsx`](../../src/shared/ui/Button.tsx), [`Badge.tsx`](../../src/shared/ui/Badge.tsx), [`Card.tsx`](../../src/shared/ui/Card.tsx), [`Input.tsx`](../../src/shared/ui/Input.tsx), [`Alert.tsx`](../../src/shared/ui/Alert.tsx), [`icons.tsx`](../../src/shared/ui/icons.tsx) | Borda reservada de 1px anti-salto, touch target mobile mínimo de 44px, cantos de 4px para controles e 8px para cartões, eliminação total de emojis por ícones SVG semânticos. |
| **Landing Pública** | [`src/modules/eventos/ui/LandingPage.tsx`](../../src/modules/eventos/ui/LandingPage.tsx), [`src/app/layouts/PublicLayout.tsx`](../../src/app/layouts/PublicLayout.tsx) | Hero editorial com destaque em *conhecimento*, painel lateral solene da Ata Científica, faixa de 3 capacidades reais, carrossel de eventos com navegação manual e touch swipe, 4 passos numerados e validação de certificados. |
| **Dashboard Administrativo** | [`src/modules/painel/ui/AdminDashboardPage.tsx`](../../src/modules/painel/ui/AdminDashboardPage.tsx), [`src/app/layouts/AdminLayout.tsx`](../../src/app/layouts/AdminLayout.tsx) | Sidebar persistente de 256px em papel subtle `#f6f3ef`, item ativo em terracota `#6b1705`, 3 indicadores destacados em Newsreader (Eventos Ativos, Próximos 7 Dias, Certificados Emitidos), agenda com regra institucional e catálogo resumido. |
| **Painel do Participante** | [`src/modules/painel/ui/ParticipantDashboardPage.tsx`](../../src/modules/painel/ui/ParticipantDashboardPage.tsx), [`src/app/layouts/ParticipantLayout.tsx`](../../src/app/layouts/ParticipantLayout.tsx) | Layout adaptado para mobile-first (barra inferior fixa com altura de toque de 48px) e desktop (2 colunas), card hero do próximo evento com janela de presença [-10m/+10m], próximos compromissos e cópia/download de certificados reais. |
| **Acesso & Autenticação** | [`src/modules/auth/ui/LoginPage.tsx`](../../src/modules/auth/ui/LoginPage.tsx), [`src/shared/ui/AccessDenied.tsx`](../../src/shared/ui/AccessDenied.tsx) | Aplicação dos tokens de fundo papel, card branco com borda terracota sutil e logo oficial, preservando política pura de retorno por perfil (`resolveLoginDestination`). |
| **Catálogo Geral** | [`src/modules/eventos/ui/PublicEventListPage.tsx`](../../src/modules/eventos/ui/PublicEventListPage.tsx) | Ajuste da listagem pública para manter harmonia editorial com Newsreader e JetBrains Mono. |

---

## 2. Comparação com as Referências e Desvios Justificados

### A. Landing Pública
- **Referência:** [`docs/design/stitch/landing/screen.png`](stitch/landing/screen.png) (1280 × 2643 px)
- **Implementação:** [`src/modules/eventos/ui/LandingPage.tsx`](../../src/modules/eventos/ui/LandingPage.tsx) e [`src/app/layouts/PublicLayout.tsx`](../../src/app/layouts/PublicLayout.tsx)

| Elemento na Referência | Implementação Real no Muttley | Desvio Justificado |
| --- | --- | --- |
| Marca duplicada no cabeçalho ("Logo + Muttley" em texto) | Logo vetorial único com wordmark integrado | Evita redundância de marca em conformidade com as diretrizes do guia visual consolidado. |
| Links de Anais & Publicações e avatar fictício de usuário | Navegação real: Início, Eventos, Como Funciona, Entrar / Meu Painel | A API e o escopo do Muttley não possuem módulo de anais; ações refletem rotas vivas do produto. |
| Selos "100% CAPES/MEC", "SHA-256" e "Check-in georreferenciado" | Faixa com 3 capacidades reais: Inscrição Garantida, Presença na janela [-10m / +10m], Certificação com Código Único | Remoção de alegações regulatórias e biometria não existentes na API Spring Boot. |
| Fotografia externa com estudantes em biblioteca universitária | Painel editorial solene local com gradiente nobre, BookOpenIcon translúcido e citação da Ata Científica | O ZIP do Stitch não incluía o arquivo da foto licenciada. Evitou-se o hotlink temporário não confiável. |
| Script com rotação automática e `totalPages = 2` forçado | Carrossel acessível por teclado (`ArrowLeft`, `ArrowRight`), toque (swipe) e botões manuais, sem autoplay | WCAG 2.2 AA (regra 2.2.2 - controle de movimento) e adaptação dinâmica à quantidade real de eventos retornados por `GET /api/eventos`. |
| Carga horária em "horas aula", ocupação de vagas e palestrante | Campos reais da API: tema, data, horário, modalidade, local e link para detalhes | DTO público não fornece carga horária acadêmica nem lista de palestrantes. |
| Rodapé com links fictícios e anos passados | Rodapé com links para catálogo, ciclo acadêmico, busca de certificado e ano atual dinâmico | Manutenção da perenidade da aplicação. |

---

### B. Dashboard Administrativo
- **Referência:** [`docs/design/stitch/admin/screen.png`](stitch/admin/screen.png) (1280 × 2131 px)
- **Implementação:** [`src/modules/painel/ui/AdminDashboardPage.tsx`](../../src/modules/painel/ui/AdminDashboardPage.tsx) e [`src/app/layouts/AdminLayout.tsx`](../../src/app/layouts/AdminLayout.tsx)

| Elemento na Referência | Implementação Real no Muttley | Desvio Justificado |
| --- | --- | --- |
| Menus para Submissões e Relatório Geral | Menu real: Painel, Eventos, Criar Evento e Ver página pública | Não inventar telas vazias sem endpoint correspondente no backend. |
| Marca duplicada na barra lateral e na barra de topo | Logo vetorial único na sidebar no desktop; na barra superior apenas em viewports mobile | Eliminação de redundâncias visuais e ganho de área útil no desktop. |
| Texto cortado no 3º indicador da captura ("1.420 autenticados 100% ínte...") | Indicadores com quebra flexível e tratamento de valores longos em Newsreader 48px | Correção de defeito de layout perceptível na referência. |
| Variação arbitrária nos 3 cards ("+2 esta semana", "424 inscritos") | Variação percentual real suportada pela API (`variacaoCertificadosUltimos30Dias`) | A API Spring Boot fornece variação apenas para certificados dos últimos 30 dias. |
| "Credenciamento até 10 minutos após o início oficial" | Regra corrigida: "Credenciamento de 10 min antes até 10 min após o **término**" | Erro factual do protótipo Stitch: a presença no Muttley ocorre no encerramento da atividade. |
| Botão "Homologar e Emitir" direto no banner sem revisão | Botão "Revisar Conclusão" que navega para `/admin/eventos/{id}/concluir` | A regra de negócio do backend exige revisão presencial e upload da assinatura do coordenador. |
| Linha com evento CANCELADO simulado na tabela | Tabela com estados reais obtidos em `GET /api/admin/inicio` (`proximosEventos`) | O backend filtra eventos ativos; não simular dados para forçar exibição visual. |

---

### C. Painel do Participante
- **Referência:** [`docs/design/stitch/participante/screen.png`](stitch/participante/screen.png) (331 × 1600 px)
- **Implementação:** [`src/modules/painel/ui/ParticipantDashboardPage.tsx`](../../src/modules/painel/ui/ParticipantDashboardPage.tsx) e [`src/app/layouts/ParticipantLayout.tsx`](../../src/app/layouts/ParticipantLayout.tsx)

| Elemento na Referência | Implementação Real no Muttley | Desvio Justificado |
| --- | --- | --- |
| RA fictício "2023.08412-A", curso "Bacharelado" e "4h complementares" | Saudação com nome real do usuário da sessão e contagem real de participações/certificados | DTO de `/api/me` não inclui matrícula acadêmica nem carga horária oficial. |
| Foto externa de monitor com código no próximo evento | Cabeçalho de data e tema em tipografia Newsreader/JetBrains Mono com badges de modalidade | Evita hotlink temporário não licenciado e mantém a sobriedade editorial do design system. |
| Confirmação de presença simulada localmente no HTML | Integração real com a janela [-10m / +10m] e redirecionamento para o fluxo seguro de confirmação | O script demonstrativo do Stitch alterava o DOM para "Presença Confirmada" sem requisição de rede. |
| Afirmação de presença garantida a partir do DTO pessoal | Indicação da disponibilidade da janela ou horário futuro de liberação, sem afirmar status não retornado | O endpoint `/api/me/participacoes` não possui o campo `presente`. Respeito estrito ao contrato. |
| Hash fictício e rota inexistente `/valida/{hash}` | Código de autenticidade real (ex: `#MTT-8921-BR`) com botão funcional "Copiar" e "Baixar PDF" | A validação pública oficial do Muttley é feita em `/certificados/{codigo}` e download binário. |
| Três barras de navegação simultâneas no protótipo móvel | Bottom Navigation Bar única e fixa no mobile (< md); abas integradas no topo no desktop | Eliminação de redundâncias de navegação que geravam sobreposição e poluição na tela móvel. |
| Desktop não fornecido na referência (apenas tela de 331 px) | Grade editorial proporcional de 2 colunas (2:1) com max-width de 1216 px | Expansão de layout equilibrada sem esticar o cartão estreito de celular em telas largas. |

---

## 3. Matriz de Validação de Viewports e Acessibilidade

| Viewport / Dispositivo | Teste Realizado | Resultado Observado |
| --- | --- | --- |
| **331 px** (Alvo Stitch móvel) | Participante e Landing Page | Fluxo vertical sem scroll horizontal indesejado. Touch targets >= 44px e textos legíveis sem quebras desordenadas. |
| **390 px** (Mobile padrão moderno) | Landing, Participante e Login | Bottom Navigation Bar respeita a área de segurança (`safe-area-inset-bottom`), formulários com inputs de 44px min-height. |
| **768 px** (Tablet / iPad) | Carrossel da Landing e Admin | Carrossel adapta grid para 2 colunas; sidebar administrativa recolhida em gaveta móvel acessível (drawer). |
| **1280 px** (Alvo Stitch desktop) | Landing e Dashboard Administrativo | Sidebar persistente de 256px, grade de 3 colunas de indicadores, hero editorial com proporções 8:4 idênticas à referência. |
| **1440 px** (Desktop widescreen) | Todas as páginas | Conteúdo centralizado em container de 76rem (1216px) com margens confortáveis, sem dispersão de elementos. |
| **Navegação por Teclado** | Tabulação, foco e teclas direcionais | Skip link acessível no topo de cada layout, foco com anel terracota visível (`#6b1705`), tecla `Escape` fecha drawers e modais, setas `ArrowLeft`/`ArrowRight` controlam o carrossel. |

---

## 4. Origem e Gestão de Fontes e Ativos

1. **Famílias Tipográficas:**
   - Carregadas via Google Fonts no [`index.html`](../../index.html) com fallbacks canônicos definidos em [`src/styles/tokens.css`](../../src/styles/tokens.css):
     - *Newsreader* (pesos 400, 500, 700 e itálico 400, 500) &rarr; Fallback: `Georgia, serif`
     - *Plus Jakarta Sans* (pesos 400, 500, 600, 700) &rarr; Fallback: `system-ui, sans-serif`
     - *JetBrains Mono* (pesos 400, 500, 600) &rarr; Fallback: `ui-monospace, monospace`
2. **Iconografia:**
   - Todos os ícones são componentes SVG locais puros em [`src/shared/ui/icons.tsx`](../../src/shared/ui/icons.tsx), sem uso de fontes externas como Material Symbols (evitando requisições remotas a mais) e com **ZERO EMOJIS**.
3. **Fotografias e Imagens:**
   - As fotografias da referência continham URLs de hospedagem temporária de protótipo (`lh3.googleusercontent.com/aida-public/...`). Conforme estipulado em `docs/design/DESIGN.md`, foram substituídas por painéis editoriais solenes com gradientes nobres, garantindo independência de dependências de terceiros.

---

## 5. Resultados dos Comandos de Validação

- **Suíte de Testes Automatizados (`npm test`):**
  - **53 testes executados com 100% de aprovação (0 falhas).**
  - Cobertura de política de login, isolamento de sessão pós-logout, tratamento de erros de Blob nos QR Codes, lógica do carrossel da landing e manipulação de datas de calendário.
- **Compilação de Produção (`npm run build`):**
  - Executado via `tsc -b && vite build`.
  - Compilação concluída em **287ms** com zero erros de tipo TypeScript e bundle otimizado gerado em `dist/`.
- **Análise Estática de Código (`npm run lint`):**
  - Executado via `eslint . --max-warnings 0`.
  - **Zero erros e zero warnings** após formatação conforme regras do Prettier.

---

## 6. Limitações Conhecidas e Próximos Passos

1. **Ausência de campo `presente` em `/api/me/participacoes`:** O painel do participante não exibe um selo persistido de "Presença Confirmada" após recarregar a página porque o backend não disponibiliza esse dado no DTO do participante. Recomenda-se futura adição desse campo no Spring Boot para aprimorar o feedback do usuário.
2. **Foto real institucional:** Caso a FATEC disponibilize uma fotografia oficial de seus auditórios devidamente autorizada, o painel editorial da Landing Page poderá receber a imagem localmente sem alteração da estrutura visual.
