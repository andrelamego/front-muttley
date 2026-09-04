# Muttley — frontend

Interface do sistema de gestão de eventos acadêmicos e emissão de certificados, desenvolvido como TCC. O objetivo atual é reconstruir o frontend do zero, com nova identidade visual e arquitetura modular, mantendo React, Vite, TypeScript, React Router e Tailwind como base e o backend separado em Spring Boot.

Esta preparação altera o planejamento. O código executável ainda é a versão anterior; a nova implementação não começou. Os comandos e caminhos abaixo descrevem essa base e deverão ser atualizados quando a nova estrutura for criada.

## Documentos do projeto

| Arquivo                                          | Finalidade                                                  |
| ------------------------------------------------ | ----------------------------------------------------------- |
| [AGENTS.md](AGENTS.md)                           | Contexto e instruções de desenvolvimento para agentes       |
| [PRODUCT_DESIGN.md](PRODUCT_DESIGN.md)           | Usuários, jornadas, direção visual e critérios de interface |
| [docs/PLANO_FRONTEND.md](docs/PLANO_FRONTEND.md) | Etapas da reconstrução, pendências e primeiro pedido ao agente |
| [.env.example](.env.example)                     | Configuração pública da API no frontend                     |

Os [requisitos e regras de negócio](../Backend-Muttley/docs/requisitos-e-regras-de-negocio.md) permanecem no repositório do backend. Mantenha os dois repositórios como pastas irmãs para acessar essa referência localmente.

Os documentos [ARQUITETURA_FRONTEND.md](docs/ARQUITETURA_FRONTEND.md) e [SKILLS_FRONTEND.md](docs/SKILLS_FRONTEND.md) detalham os limites entre módulos e o uso de skills em cada etapa. Não há obrigação de reaproveitar a identidade visual ou os componentes atuais.

## Executar localmente

Use Node.js 24 e npm, mantendo as versões de dependências do `package-lock.json`. A versão verificada neste ambiente foi Node 24.12.0.

```powershell
cd C:\Users\andre\Documents\TCC\muttley\front-muttley
npm ci
npm run dev
```

Use o endereço exibido pelo Vite no terminal. O frontend precisa do backend para as operações reais; apenas iniciar o Vite não inicia banco ou microsserviços.

O cliente usa `VITE_API_BASE_URL` ou `/api`. Em desenvolvimento, `vite.config.ts` encaminha `/api` para `http://localhost:8083`, a porta configurada no backend. A configuração padrão já permite esse fluxo. Para alterações locais, use `.env.local`, seguindo `.env.example`; arquivos `*.local` são ignorados pelo Git.

O proxy do Vite descrito acima é de desenvolvimento. Na publicação, configure o encaminhamento de `/api` na hospedagem ou uma URL pública adequada, considerando o CORS do backend. Variáveis `VITE_*` são incorporadas ao frontend e não devem conter segredos.

## Verificar alterações

```powershell
npm test
npm run build
npm run lint
```

Os testes atuais exercitam utilitários de autenticação. Inspeção no navegador e testes E2E são etapas adicionais para validar telas e jornadas. Existem apontamentos históricos de lint; execute o comando para conhecer o estado atual e diferencie erros anteriores de regressões.

O guia da [suíte integrada](../Backend-Muttley/docs/testes-prioritarios-2026-09-03.md) explica como verificar também o backend e os microsserviços.

## Desenvolver com Antigravity CLI

A documentação oficial informa que o CLI reconhece `AGENTS.md` e `GEMINI.md` no diretório ativo. Este projeto concentra suas instruções em `AGENTS.md`, que orienta a leitura dos outros documentos. `PRODUCT_DESIGN.md` é uma referência do projeto, sem depender de reconhecimento automático pelo CLI. [Referência oficial de contexto](https://antigravity.google/docs/cli/gcli-migration/).

Não é necessário duplicar as mesmas instruções em `GEMINI.md`. Regras, skills e integrações adicionais podem ser introduzidas quando existir uma necessidade concreta.

Com o CLI instalado e disponível no terminal:

```powershell
cd C:\Users\andre\Documents\TCC\muttley\front-muttley
agy
```

Siga a configuração e autenticação iniciais do cliente e use o pedido de exemplo do plano. Se `agy` não for reconhecido, consulte o [guia oficial de instalação para Windows](https://antigravity.google/docs/cli/install/) e abra um novo terminal após a instalação.

Na preparação destes arquivos, o comando `agy` não foi localizado no PATH desta sessão. A documentação foi preparada, mas a inicialização e a leitura pelo Antigravity ainda não foram verificadas neste computador.
