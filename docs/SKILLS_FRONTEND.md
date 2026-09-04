# Skills para a reconstrução do Muttley

## Como usar

Skills são instruções de trabalho, não dependências do aplicativo. **Usar as pertinentes em cada etapa é parte do plano**, com leitura prévia, objetivo e entregável registrados. A quantidade de skills ativadas não é uma medida de qualidade.

Os arquivos das skills abaixo foram consultados nesta máquina ao preparar o plano. Isso não comprova que estejam instaladas ou sendo carregadas pelo Antigravity CLI. Antes do uso, verificar o catálogo e ler o `SKILL.md` realmente disponível. Se uma skill faltar, registrar a limitação e aplicar os critérios documentados do projeto, sem alegar execução da skill.

## Seleção por responsabilidade

| Skill                                            | Quando aplicar                                                                          | Entrega esperada                                                                                                 |
| ------------------------------------------------ | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **architecture**                                 | Fundação e decisões que alterem limites ou dependências                                 | Mapa de módulos, alternativas e ADR com custos e gatilho de revisão                                              |
| **anti-ui-slop**                                 | Jornadas, wireframes, sistema visual e implementação de telas                           | Interface específica das tarefas do Muttley, com hierarquia, estados, responsividade e inspeção visual           |
| **api-patterns**                                 | Levantamento e adaptação dos contratos da API                                           | Contratos tipados, erros, paginação e autenticação mapeados; testes dos adaptadores                              |
| **accessibility-compliance-accessibility-audit** | Revisão de protótipos e telas navegáveis, especialmente login, formulários e dashboards | Auditoria por jornada com teclado, foco, contraste e tecnologias assistivas; achados e verificação das correções |
| **architect-review**                             | Revisão da fundação e de alterações significativas de arquitetura                       | Avaliação de acoplamento, ciclos, responsabilidades e riscos, com evidências de testes                           |

### Limites específicos desta reformulação

- A orientação de `anti-ui-slop` para reaproveitar a identidade visual existente foi substituída pela decisão explícita do autor: criar uma identidade nova. Seus critérios de relevância, estados e inspeção continuam úteis.
- `api-patterns` deve partir da API Spring Boot existente; não implica migrar para GraphQL, mudar o backend ou inventar novos endpoints.
- `architecture` e `architect-review` não justificam adicionar microfrontends, mensageria no browser ou camadas genéricas. O objetivo é uma aplicação modular proporcional ao TCC.
- A auditoria de acessibilidade exige evidências de telas ou protótipos avaliáveis. Citar a skill não equivale a realizar uma auditoria.
- `antigravity-design-expert` foi inspecionada e não foi selecionada como obrigatória: seu foco em 3D, glassmorphism e movimento intenso não corresponde a um requisito do Muttley. O nome da skill não significa que seja necessária para usar o CLI.
- `antigravity-workflows` não é requisito desta execução. O plano do projeto já define a sequência, sem depender dos playbooks ausentes na cópia local consultada.

## Sequência prática

1. **Antes do código:** architecture para revisar módulos; anti-ui-slop para tarefas, navegação e wireframes. Identificar critérios de IHC e acessibilidade desde essa etapa.
2. **Na fundação:** architecture para validar as decisões e api-patterns para os contratos; estabelecer a estratégia de testes e as regras de importação.
3. **Em cada jornada:** aplicar anti-ui-slop ao desenho e api-patterns quando houver integração nova ou alterada. Conferir os comportamentos da UI e os limites entre módulos.
4. **Na revisão:** auditoria de acessibilidade nas telas e architect-review quando houver impacto arquitetural. Executar testes e inspeção, sem substituir verificação por parecer textual.

Revisões pequenas e locais não precisam ativar todas as skills. Antes de aplicar uma, informar qual problema ela ajuda a resolver. Ao final, registrar a skill efetivamente usada, o artefato, a verificação realizada e os limites do resultado.

## Disponibilidade no Antigravity

A documentação do CLI indica `.agents/skills/` para skills locais ao projeto. Referenciar uma skill neste documento ou em `AGENTS.md` não a instala. Se for disponibilizá-la no projeto, incluir a skill completa e os recursos referenciados, conferindo origem e instruções; não copiar apenas o nome ou um resumo como se fosse a skill original. [Referência oficial](https://antigravity.google/docs/cli/gcli-migration/).

Estado atual: seleção documentada e fontes locais consultadas; instalação e reconhecimento no Antigravity ainda não verificados. Nenhuma configuração global foi alterada nesta preparação.

## Skills não substituem critérios de aceite

A entrega precisa de evidências de navegação, estados, responsividade, contratos e testes. Não afirmar que a arquitetura está desacoplada apenas porque há pastas separadas; demonstrar os limites por imports controlados, ausência de ciclos e testes das fronteiras. Não afirmar conformidade de acessibilidade ou aprovação de usuários sem a avaliação correspondente.
