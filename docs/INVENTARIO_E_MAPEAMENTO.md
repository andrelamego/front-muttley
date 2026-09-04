# Inventário de Funcionalidades, Contratos e Mapa de Telas

Documento gerado em 04/09/2026 na etapa 0 e 1 da reconstrução do frontend do Muttley. Este inventário reflete os contratos reais verificados no código e na documentação do backend (`../Backend-Muttley`), sem inventar funcionalidades ou endpoints.

---

## 1. Inventário de Endpoints da API

### 1.1 Autenticação e Conta (`/api/auth` e `/api/me`)

| Método | Endpoint | Permissão | Entrada | Resposta Sucesso | Tratamento de Erro |
|---|---|---|---|---|---|
| `POST` | `/api/auth/login` | PermitAll | `{ email, senha }` | `200 OK`: `{ accessToken, tokenType, expiresIn, usuario: { id, nome, email, role } }` | `401`: credenciais inválidas; `400`: campos em branco |
| `POST` | `/api/auth/register` | PermitAll | `AtualizacaoPessoa` (nome, email, telefone, cpf, senha, perfis) | `201 Created`: `UsuarioResponse` (primeiro vira `ADMIN`, demais `USER`) | `409`: email já cadastrado; `400`: dados inválidos |
| `PUT` | `/api/auth/register` | PermitAll | `AtualizacaoPessoa` | `200 OK`: `UsuarioResponse` (completar cadastro de pré-inscrito) | `409`: cadastro já finalizado; `404`: email não localizado |
| `GET` | `/api/me` | Autenticado | Nenhuma | `200 OK`: `{ id, nome, email, telefone, cpf, role }` | `401`: não autenticado; `404`: não localizado |
| `GET` | `/api/me/participacoes` | Autenticado | Nenhuma | `200 OK`: `ParticipacaoUsuarioResponse[]` | `401`: token inválido/expirado |
| `GET` | `/api/me/certificados` | Autenticado | Nenhuma | `200 OK`: `CertificadoUsuarioResponse[]` | `401`: token inválido/expirado |
| `GET` | `/api/me/medalhas` | Autenticado | Nenhuma | `200 OK`: `MedalhaUsuarioResponse[]` | `401`: token inválido/expirado |

### 1.2 Eventos Públicos e Inscrições (`/api/eventos`)

| Método | Endpoint | Permissão | Entrada | Resposta Sucesso | Tratamento de Erro |
|---|---|---|---|---|---|
| `GET` | `/api/eventos` | PermitAll | Query params opcionais | `200 OK`: `EventoPublicoResponse[]` (apenas eventos `CRIADO` aparecem para inscrição) | `500`: falha no servidor |
| `GET` | `/api/eventos/{id}` | PermitAll | Path `id` | `200 OK`: `EventoPublicoResponse` | `404`: evento não encontrado |
| `POST` | `/api/eventos/{id}/inscricoes` | PermitAll | `{ nomeCompleto, cpf, email }` | `200 OK` / `201`: `{ message, participacaoId, inscricao }` | `400`: evento já iniciado; `409`: lotado ou pessoa duplicada |
| `POST` | `/api/eventos/{eventoId}/confirmar-presenca/{cpf}` | PermitAll | Path `eventoId`, `cpf` | `200 OK`: confirma presença e gera medalha bronze | `400`: fora da janela [-10m, +10m]; `409`: presença já registrada; `404`: pessoa/evento não encontrado |

### 1.3 Certificados Públicos (`/api/certificados`)

| Método | Endpoint | Permissão | Entrada | Resposta Sucesso | Tratamento de Erro |
|---|---|---|---|---|---|
| `GET` | `/api/certificados/{codigo}` | PermitAll | Path `codigo` (UUID) | `200 OK`: `{ certificado, linkedinUrl }` | `404`: código inexistente |
| `GET` | `/api/certificados/{codigo}/preview` | PermitAll | Path `codigo` | `200 OK`: PDF stream (`inline`) | `404`: código inexistente |
| `GET` | `/api/certificados/{codigo}/download` | PermitAll | Path `codigo` | `200 OK`: PDF stream (`attachment`) | `404`: código inexistente |

### 1.4 Painel e Recursos Administrativos (`/api/admin/**`)

| Método | Endpoint | Permissão | Entrada | Resposta Sucesso |
|---|---|---|---|---|
| `GET` | `/api/admin/inicio` | `ROLE_ADMIN` | Nenhuma | `200 OK`: estatísticas reais (próximos eventos, certificados últimos 30 dias, variação %, eventos ativos na semana, rankings) |
| `GET` | `/api/admin/eventos` | `ROLE_ADMIN` | `tamanho`, `ordenar`, `pagina` | `200 OK`: Page com lista de eventos administrativos |
| `GET` | `/api/admin/eventos/{id}` | `ROLE_ADMIN` | Path `id` | `200 OK`: detalhes completos do evento |
| `POST` | `/api/admin/eventos` | `ROLE_ADMIN` | Payload do evento | `200 OK`: `{ id, message }` |
| `PUT` | `/api/admin/eventos/{id}` | `ROLE_ADMIN` | Payload do evento | `200 OK`: `{ id, message }` (bloqueado se cancelado/finalizado) |
| `DELETE` | `/api/admin/eventos/{id}` | `ROLE_ADMIN` | Path `id` | `200 OK`: cancela evento (dispara notificação Kafka) |
| `GET` | `/api/admin/eventos/{id}/participacoes` | `ROLE_ADMIN` | Path `id` | `200 OK`: participações do evento para conferência de presença |
| `POST` | `/api/admin/eventos/{id}/concluir` | `ROLE_ADMIN` | `multipart/form-data`: `file` (imagem da assinatura PNG/JPEG) e `presentes` (lista de IDs) | `200 OK`: `{ message, certificadosGerados, codigosValidacao }` |
| `GET` | `/api/admin/eventos/{id}/qrcode-inscricao` | `ROLE_ADMIN` | Path `id` | `200 OK`: imagem PNG do QR code de inscrição |
| `GET` | `/api/admin/eventos/{id}/qrcode-confirmacao` | `ROLE_ADMIN` | Path `id` | `200 OK`: imagem PNG do QR code de presença |
| `GET` | `/api/admin/certificados` | `ROLE_ADMIN` | Nenhuma | `200 OK`: lista administrativa de certificados |
| `POST` | `/api/admin/certificados/evento/{id}/upload-assinatura` | `ROLE_ADMIN` | `multipart/form-data`: `file` (imagem PNG/JPEG) | `200 OK`: assinatura vinculada ao evento |
| `CRUD` | `/api/admin/medalhas/**` | `ROLE_ADMIN` | Payload medalha | Gestão de medalhas |
| `CRUD` | `/api/admin/locais/**`, `/enderecos/**`, `/disciplinas/**`, `/pessoas/**` | `ROLE_ADMIN` | DTOs de cadastro | Gestão de cadastros auxiliares |

---

## 2. Padrões de Erro e Tratamento HTTP

A API backend retorna erros padronizados via `GlobalExceptionHandler`:
1. **Erros de Validação (`400 Bad Request`):**
   ```json
   {
     "erros": [
       "email: Email e obrigatorio",
       "senha: Senha e obrigatoria"
     ]
   }
   ```
2. **Erros de Negócio e Conflitos (`400 Bad Request`, `409 Conflict`, `404 Not Found`):**
   ```json
   {
     "erro": "Inscrições encerradas: capacidade máxima atingida."
   }
   ```
3. **Erros de Autenticação (`401 Unauthorized`):**
   ```json
   {
     "message": "Email ou senha invalidos"
   }
   ```
4. **Erros de Acesso (`403 Forbidden`):**
   Retornado pelo filtro Spring Security quando um `USER` tenta acessar `/api/admin/**`.

---

## 3. Rotas Públicas e Links Externos Preservados

| Rota Frontend | Finalidade | Preservação |
|---|---|---|
| `/` | Lista pública de eventos | Preservada |
| `/eventos` | Lista pública de eventos com filtros | Preservada |
| `/eventos/:id` | Detalhes públicos do evento e formulário de inscrição | Preservada |
| `/eventos/:id/confirmar-presenca` | Tela de confirmação rápida de presença (via link/QR Code) | Preservada |
| `/certificados/:codigo` | Validação pública de certificado e download de PDF | Preservada |
| `/login` | Autenticação por email e senha | Preservada |
| `/register` | Cadastro de novo usuário | Preservada |

---

## 4. Mapa de Navegação e Composição das 3 Telas de Referência

### Tela 1: Login em Celular (Mobile-First, 360px - 390px)
- **Ação Principal:** Botão "Entrar" com largura total (mínimo 44px de altura para toque).
- **Informações Essenciais:** Identificação do sistema (Muttley), campos de Email e Senha com rótulos visíveis, botão para alternar visibilidade da senha (mostrar/ocultar), atalho para criar conta.
- **Estados Alternativos:**
  - *Carregando:* Botão exibe spinner e texto "Entrando...", inputs desabilitados para evitar duplo clique.
  - *Credenciais Inválidas:* Alerta em destaque com mensagem clara de erro ("Email ou senha incorretos"), foco preservado no campo.
  - *Sessão Expirada:* Notificação amigável ("Sua sessão expirou. Faça login novamente para continuar.") vinda de redirecionamento.
  - *Acesso Negado:* Caso venha redirecionado de tentativa de acesso sem permissão.
- **IHC & Acessibilidade:**
  - `autoComplete="email"` e `autoComplete="current-password"` para suporte nativo a preenchimento automático de credenciais.
  - Rótulos `<label htmlFor="...">` explícitos com texto visível.
  - Mensagens de erro com `role="alert"` e contraste mínimo 4.5:1.
  - Foco visível com anel de foco destacado em navegação por teclado (`focus-visible:ring-2`).

### Tela 2: Início do Participante em Celular (`/user/inicio` - 360px - 390px)
- **Ação Principal:** Cartão do Próximo Evento com botão de ação direta: "Confirmar Presença" (se dentro da janela de horário) ou "Ver Detalhes do Evento".
- **Informações Essenciais:** Saudação ao participante com seu nome, resumo das inscrições ativas, badges de status de presença, atalhos rápidos para Certificados e Medalhas conquistadas.
- **Estados Alternativos:**
  - *Carregando:* Skeletons dos cartões mantendo o layout estável.
  - *Vazio:* Ilustração/mensagem acolhedora ("Você ainda não possui inscrições ativas") com botão "Explorar Eventos Disponíveis".
  - *Erro na API:* Mensagem amigável com botão "Tentar novamente".
- **IHC & Acessibilidade:**
  - Informação mais urgente no topo (próximo evento com data e horário em destaque).
  - Áreas de toque adequadas para polegar no celular.
  - Descoberta pública de eventos acessível a qualquer momento pelo menu/cabeçalho sem forçar logout.

### Tela 3: Dashboard Administrativo em Desktop (`/admin/inicio` - 1366px - 1440px)
- **Ação Principal:** Barra de ações no topo com botão destacado "Criar Novo Evento" e atalhos operacionais rápidos.
- **Informações Essenciais:**
  - Grid de indicadores reais da API: Eventos Ativos, Eventos nos Próximos 7 Dias, Certificados Emitidos (com badge de variação percentual dos últimos 30 dias).
  - Tabela/Lista dos Próximos Eventos ordenados por início, com status, modalidade e botões de ação ("Gerenciar", "Concluir").
  - Painéis de desempenho: Gráfico de barras estatísticas de Certificados por Evento e Medalhas por Participante (usando dados reais calculados pelo backend).
- **Estados Alternativos:**
  - *Carregando:* Indicadores com placeholder e estado de carregamento sutil.
  - *Sem eventos:* Estado vazio claro com instrução sobre como cadastrar o primeiro evento.
  - *Falha de comunicação:* Alerta persistente no topo da área de conteúdo permitindo retentativa.
- **IHC & Acessibilidade:**
  - Densidade de informação adequada para desktop sem poluição visual.
  - Navegação por teclado completa na tabela e controles.
  - Rótulos explicativos em todas as métricas (período considerado: últimos 30 dias).
  - Adaptação responsiva fluida para tablets e telas menores (tabela com rolagem horizontal contida e cards empilhados).
