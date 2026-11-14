# Arquitetura do novo frontend

Diretriz da base modular já implementada. A árvore abaixo descreve responsabilidades e possibilidades, não uma obrigação de criar cada pasta. A entrega atual aplica o [visual Stitch](design/DESIGN.md), preservando os limites existentes. Referências: [plano](PLANO_FRONTEND.md) e [ADR inicial](decisoes/001-frontend-modular.md).

## Objetivo

Construir uma aplicação única, organizada em módulos por funcionalidade, com baixo acoplamento e responsabilidades explícitas. Uma troca de componente, formato de resposta ou ferramenta de transporte deve ter impacto limitado. A arquitetura não exige microfrontends, múltiplos projetos ou um framework de injeção de dependência.

## Estrutura proposta

```text
src/
  app/                    # composição, rotas, providers e layouts por perfil
  modules/
    auth/
    eventos/
    participacoes/
    certificados/
    medalhas/
    painel/
  shared/
    ui/                   # componentes visuais sem regras de negócio
    http/                 # transporte, configuração e normalização de erros
    config/               # configuração pública validada
    lib/                  # utilitários realmente compartilhados
  styles/                 # tokens semânticos e estilos globais essenciais
tests/
  e2e/                    # jornadas do usuário
```

Cadastros administrativos adicionais entram como módulos conforme o inventário. Não criar todas as pastas vazias antecipadamente.

Dentro de um módulo, separar conforme a necessidade:

```text
eventos/
  domain/                 # modelos e transformações puras de apresentação
  api/                    # DTOs, chamadas do domínio e mapeamento das respostas
  application/            # operações e coordenação de consultas/mutações
  ui/                     # componentes e hooks de interface do módulo
  index.ts                # interface pública deliberada
```

Essa estrutura expressa responsabilidades. Uma funcionalidade simples pode começar com poucos arquivos, sem criar uma classe ou camada vazia para cada pasta. Testes unitários e de componentes podem ficar próximos ao código correspondente.

## Regras de dependência

1. `app` compõe módulos, layout e infraestrutura compartilhada.
2. Um módulo não importa `app`. Comunicação entre módulos usa apenas interfaces públicas, com dependências explícitas e sem ciclos; composições que unem vários domínios ficam preferencialmente em `app`.
3. `shared` não importa módulos nem páginas. Um componente compartilhado não consulta a API nem acessa a sessão por conta própria.
4. `domain` é TypeScript puro: não importa React, roteador, Axios, DOM ou armazenamento do navegador. A autoridade das regras de negócio continua no backend.
5. Detalhes de DTO, URL, status HTTP e conversão de respostas ficam na fronteira `api`. A interface recebe modelos próprios quando a separação trouxer proteção real contra mudanças do contrato.
6. Dependências externas são substituíveis em testes por funções ou interfaces pequenas. Não usar um contêiner de injeção ou um repositório genérico para todos os recursos sem necessidade comprovada.

**Exemplo:** mudar o formato de data recebido de eventos deve exigir ajuste do mapeador e seus testes, preservando o formato usado pelos componentes. Trocar o componente de seleção de data deve preservar as operações de inscrição e os contratos da API.

## Fronteiras importantes

| Responsabilidade                    | Local                             | Limite                                                                             |
| ----------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------- |
| Login, identidade e ciclo da sessão | Módulo auth                       | Componentes visuais não leem token diretamente de localStorage                     |
| Transporte HTTP                     | shared/http                       | Recebe credenciais e callbacks pela composição; não importa auth, evitando ciclo   |
| Endpoints e DTOs de eventos         | modules/eventos/api               | DTO externo não se espalha pelos componentes                                       |
| Consulta e atualização de dados     | Operações do módulo               | Cache e invalidação explícitos, sem copiar dados do servidor para múltiplas stores |
| Formulários e diálogos              | UI do módulo                      | Estado local até haver necessidade concreta de compartilhamento                    |
| Rotas e layouts por perfil          | app                               | Regras de acesso do cliente não substituem autorização do servidor                 |
| Métricas e prioridades do painel    | Módulo painel e composição em app | Fontes e períodos definidos; sem importar arquivos internos dos demais módulos     |
| Cores e componentes básicos         | styles e shared/ui                | A identidade visual pode mudar sem alterar regras e consultas                      |

## Contratos e tratamento de erros

- Levantar métodos, caminhos, campos obrigatórios, enumerações, paginação, erros e uploads antes de reimplementar integrações.
- Conferir os DTOs e controllers do backend; não tomar nomes do legado como prova suficiente do contrato atual.
- Normalizar falhas preservando status, mensagem e erros de campos. Tratar respostas como `erro`/`erros` conforme forem fornecidas pela API, além dos outros formatos efetivamente usados.
- Mapear dados inválidos na fronteira e explicitar a falha. Não substituir resposta ausente por métricas ou sucesso fictício.
- Preservar URLs externas emitidas ou criar redirecionamentos testados. Navegação interna pode ser redesenhada.
- Decidir como armazenar e renovar a sessão com base no contrato real. Não prometer refresh token, cookies de sessão ou recuperação de senha sem suporte implementado.

## Fundação de qualidade

Na criação da nova base, selecionar e configurar ferramentas compatíveis para testes unitários/de componentes, E2E, validação de tipos e lint. Registrar o motivo das escolhas; este planejamento não instala dependências nem presume que essas ferramentas já estejam configuradas.

- Impedir imports dos arquivos internos de outro módulo e de `modules` dentro de `shared` por regras de lint de caminhos. Acrescentar detecção de ciclos e executar na verificação do projeto.
- Testar conversões e lógica de apresentação sem navegador quando possível.
- Testar componentes pelos comportamentos percebidos pelo usuário, com a rede simulada na fronteira, evitando testes presos à estrutura interna.
- Conferir contratos de integração, erros e permissões e executar E2E das jornadas críticas com ambiente de teste conhecido.
- Na primeira jornada vertical, demonstrar que a UI pode ser testada sem servidor real e que a integração com o backend continua verificável separadamente.
- Manter build, tipos, lint e testes da nova base sem falhas desde o primeiro incremento; não herdar os erros históricos de lint como exceções permanentes.

## Revisão de modularidade por entrega

Responder na revisão:

1. Qual responsabilidade foi acrescentada e em qual módulo ela pertence?
2. A alteração introduziu import de detalhe interno, ciclo ou dependência de infraestrutura na UI genérica?
3. Uma mudança no contrato externo fica localizada em qual adaptador?
4. Os testes demonstram comportamento útil e isolamento das fronteiras?
5. Há abstração criada apenas para um cenário hipotético?

Registrar decisões relevantes em `docs/decisoes/` com contexto, alternativas, custos, escolha e gatilho de revisão. A estrutura deve poder evoluir por refatorações locais, sem a promessa de eliminar toda mudança futura.
