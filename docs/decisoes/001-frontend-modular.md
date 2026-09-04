# ADR-001 — Frontend modular em uma única aplicação

## Estado

Proposta de implementação para a reconstrução. Modularidade e liberdade de identidade visual são requisitos definidos pelo autor; a organização detalhada abaixo ainda será verificada na fundação técnica.

## Contexto

O autor quer reconstruir o frontend para começar com fundamentos consistentes, incluindo login simples, dashboards orientados a tarefas, mobile-first para participantes e administração desktop. O backend e seus contratos já existem. A aplicação anterior concentra responsabilidades em formulários e na camada de acesso a dados.

## Alternativas consideradas

| Opção                                               | Benefício                                           | Custo ou limite                                                                                |
| --------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Pastas genéricas de páginas, serviços e componentes | Início simples                                      | Limites de funcionalidades pouco explícitos; risco de serviços centrais crescerem sem controle |
| Aplicação única com módulos e interfaces públicas   | Entrega e implantação simples; mudanças localizadas | Exige disciplina de dependências, mapeamento dos contratos e testes                            |
| Microfrontends                                      | Autonomia de implantação por equipe                 | Complexidade de composição, sessão e operação sem necessidade demonstrada no TCC               |

## Decisão proposta

Uma aplicação React + Vite + TypeScript, organizada por módulos funcionais, composta em `app`, com infraestrutura e componentes visuais realmente compartilhados. Regras de dependência e estratégia de verificação estão em [ARQUITETURA_FRONTEND.md](../ARQUITETURA_FRONTEND.md).

Reconstruir o frontend em branch ou worktree preservando a versão anterior no Git. A identidade visual e o código antigo não precisam ser reutilizados. Não reconstruir o backend nem migrar framework sem um motivo específico de produto.

## Consequências e custos aceitos

- Contratos externos ficam na fronteira da integração; componentes recebem modelos estáveis quando esse mapeamento for útil.
- Testes de módulos podem substituir a infraestrutura sem abrir todo o sistema.
- Há custo inicial de documentar dependências e configurar lint/testes; ele limita o crescimento de acoplamento oculto.
- A reconstrução cria risco de perder funcionalidades: mitigar com inventário, testes de contratos e conferência das jornadas antes da transição.
- Evitar abstrações vazias, classes de repositório para cada chamada simples e duplicação de tipos sem benefício concreto.

## Gatilhos de revisão

Reavaliar se surgirem necessidades verificadas de renderização no servidor, divulgação pública com requisitos específicos, equipes com implantação independente ou limitações medidas da base adotada. Mudanças de cor, componentes, endpoints ou formulários devem ser tratadas primeiro como alterações locais, não como motivo automático para nova reescrita.
