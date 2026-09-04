# Instruções para agentes — frontend do Muttley

## Contexto e leitura inicial

O Muttley é um TCC de gestão de eventos acadêmicos e emissão de certificados. O objetivo atual é reconstruir o frontend do zero em React + Vite + TypeScript, com nova arquitetura de interface e liberdade total de identidade visual. A implementação anterior serve como referência de funcionalidades e contratos, não como modelo de componentes ou aparência.

Antes de trabalhar, leia:

1. [README.md](README.md): execução e configuração local.
2. [PRODUCT_DESIGN.md](PRODUCT_DESIGN.md): usuários, jornadas e critérios de interface.
3. [docs/PLANO_FRONTEND.md](docs/PLANO_FRONTEND.md): etapas e estado do trabalho.
4. [docs/ARQUITETURA_FRONTEND.md](docs/ARQUITETURA_FRONTEND.md): módulos, contratos e limites de dependência.
5. [docs/SKILLS_FRONTEND.md](docs/SKILLS_FRONTEND.md): skills por etapa, entregáveis e verificação de disponibilidade.

Para regras de negócio e integração, consulte os arquivos do repositório irmão:

- [Requisitos e regras](../Backend-Muttley/docs/requisitos-e-regras-de-negocio.md).
- [Guia de testes](../Backend-Muttley/docs/guia-de-testes.md).
- [Matriz de rastreabilidade](../Backend-Muttley/docs/matriz-requisitos-testes.csv).

Se esses arquivos não estiverem disponíveis no checkout, registre a ausência e use os contratos observados no código. Não invente endpoints nem trate uma proposta visual como uma regra de negócio aprovada. Instruções explícitas do usuário têm precedência sobre estes documentos.

## Arquitetura e escopo

- Mantenha React, Vite, TypeScript, React Router e Tailwind nesta etapa. Uma troca de framework exige uma decisão específica de escopo.
- O backend Spring Boot é responsável pela autorização e pelas regras de negócio. Guardas e botões do frontend complementam a experiência, sem substituir as verificações da API.
- Construa uma base nova por jornadas completas. Não há obrigação de manter cores, fontes, CSS, layouts, navegação interna ou componentes antigos.
- Organize funcionalidades em módulos com interfaces públicas e dependências sem ciclos. Separação em pastas, sozinha, não comprova desacoplamento.
- Componentes visuais genéricos não fazem consultas HTTP nem conhecem regras de eventos. Contratos externos, sessão, transporte HTTP e apresentação têm responsabilidades distintas.
- `src/data/mockDb.ts` e `src/services/apiClient.ts` são referências do legado para levantar contratos e comportamentos reais. A nova implementação deve distribuir essas responsabilidades conforme a arquitetura proposta, sem copiar um serviço central de todos os domínios.
- Preserve o acesso aos links públicos já emitidos por compatibilidade ou redirecionamento explícito; documente mudanças de contratos necessárias antes de integrá-las.
- Crie abstrações e dependências somente quando houver uso concreto na tarefa.

## Convenções

- Escreva textos da interface, explicações e documentação em português brasileiro.
- Preserve os nomes dos campos dos contratos da API. Use tipos explícitos para entradas e respostas; evite introduzir `any` para contornar erros.
- Declare imports no topo do arquivo. Em eventual alteração Java, use imports também para anotações e tipos, sem pacotes completos no corpo da classe.
- Use componentes semânticos, rótulos visíveis, foco perceptível e navegação por teclado.
- Centralize cores, espaçamentos e tipografia em tokens; siga a direção descrita em `PRODUCT_DESIGN.md`.
- Desenvolva as áreas pública e do participante com mobile-first. Planeje administração e seu dashboard primeiro para desktop, mantendo adaptação utilizável em telas menores.
- Priorize login simples, dashboards orientados a tarefas e navegação previsível. Aplique IHC e valide a usabilidade; aparência moderna não substitui clareza.
- Trate datas sem horário como datas de calendário, evitando conversões de fuso que alterem o dia do evento.
- Diferencie carregamento, erro, ausência de resultados e sucesso. Dados fictícios devem estar identificados e isolados dos fluxos reais.

## Fluxo de trabalho e validação

1. Confira o estado do Git e leia os arquivos que serão alterados, preservando trabalho existente.
2. Identifique a jornada e os critérios de aceite da tarefa. Para mudanças visuais, indique quais telas e estados serão atendidos.
   Selecione as skills pertinentes conforme `docs/SKILLS_FRONTEND.md`, leia as instruções realmente disponíveis e anuncie a aplicação. Uma skill citada no plano não deve ser declarada executada ou instalada sem verificação.
3. Implemente uma etapa verificável. Atualize o plano quando houver avanço comprovado ou mudança de decisão.
4. Execute os comandos pertinentes: `npm test`, `npm run build` e `npm run lint`. Relate falhas preexistentes e novas separadamente, sem desativar regras para obter aprovação artificial.
5. Em mudanças de interface, confira a tela no navegador, em celular e desktop, incluindo teclado, mensagens e estados alternativos. Se não puder verificar, registre a limitação.
6. Acrescente testes de comportamento quando houver lógica ou regressão relevante. Os testes atuais de autenticação não comprovam toda a interface nem o fluxo integrado.
7. Informe arquivos alterados, resultado dos comandos e pendências reais. Registre falhas da API como falhas, sem substituí-las por sucesso simulado.

Na base nova, configure validação de tipos, lint, testes e limites de imports desde o início. Use testes nos limites dos módulos e nos fluxos do usuário. Não crie camadas, interfaces ou dependências apenas para preencher um diagrama. Registre decisões relevantes e seus custos nos ADRs.

## Configuração e Git

- Use `.env.example` como referência e `.env.local` para configuração local. Variáveis `VITE_*` são públicas no bundle; não coloque senhas, tokens privados ou credenciais nelas.
- Preserve os repositórios irmãos e seus dados ao trabalhar no frontend. Configure serviços reais somente quando fizer parte da tarefa.
- Ao criar commits, separe correções, funcionalidades, testes e documentação. Use `tipo(escopo): descrição`, com escopo e descrição em português, por exemplo `feat(eventos): melhorar a navegação da lista pública`.
- Preserve o histórico existente e as preferências de Git já estabelecidas pelo usuário.
- Antes de substituir o frontend, registre um checkpoint recuperável, incluindo alterações pendentes, e desenvolva em branch ou worktree própria. Não exclua a pasta do repositório, `.git`, documentação, dados ou os repositórios irmãos como forma de recomeçar. Arquivos ignorados pelo Git precisam de preservação própria quando forem necessários.
