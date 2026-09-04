# Prompt para o Gemini

Copie o texto abaixo no Gemini, com `front-muttley` como diretório de trabalho:

```text
Você vai corrigir e refinar o frontend existente do Muttley, meu TCC de gestão de eventos e certificados. A reconstrução inicial terminou. Preserve a arquitetura modular atual e implemente esta entrega; não recomece o projeto nem altere o backend.

Leia AGENTS.md e docs/AJUSTES_FRONTEND_GEMINI.md integralmente. Leia também PRODUCT_DESIGN.md, docs/ARQUITETURA_FRONTEND.md, docs/SKILLS_FRONTEND.md e o relatório ../Backend-Muttley/docs/correcoes-integracao-2026-09-04.md. Confira Git e código real antes de alterar arquivos; alguns documentos antigos ainda descrevem uma reconstrução futura.

Prioridades:
1. Corrigir ADMIN → sair → login USER, impedindo retorno à rota administrativa da sessão anterior, loops e dados privados residuais. Tratar respostas assíncronas atrasadas e testar as duas direções de troca de conta.
2. Ajustar os adaptadores do painel aos contratos reais e dar estados independentes aos dois QR Codes, com erro e nova tentativa individual.
3. Transformar o admin em dashboard de gestão com menu lateral desktop e navegação acessível no celular.
4. Criar identidade visual própria, tipografia deliberada e tokens efetivamente usados. Padronizar dimensões de botões equivalentes sem espalhar correções locais.
5. Criar uma landing promocional em / com carrossel acessível de eventos reais, preservando /eventos como catálogo e todos os links públicos de presença e certificados.

Use somente as skills pertinentes, disponíveis e lidas; informe a seleção. Aplique IHC, UX, acessibilidade e os limites entre app, módulos e shared. Não invente métricas, endpoints, depoimentos ou sucesso de integração. Não troque React/Vite por Next. Não remova permissões para contornar falhas.

Comece pelo diagnóstico breve e um plano de execução, depois implemente sem parar na proposta. Registre a direção visual antes de codificar as telas. Os critérios e contratos obrigatórios estão em docs/AJUSTES_FRONTEND_GEMINI.md.

Valide com testes de comportamento, npm test, npm run build, npm run lint e inspeção no navegador em celular e desktop, incluindo teclado e estados alternativos. Diferencie teste simulado de integração real. Se serviços não estiverem disponíveis, conclua o que puder e documente exatamente o que faltou verificar. Os novos QR Codes requerem backend e microsserviço de QR recompilados e reiniciados.

Ao terminar, atualize os documentos de produto/plano e entregue um relatório curto com alterações, verificações e limitações. Toda a comunicação e documentação devem ser em pt-br. Se criar commits, use commits semânticos em português, separados por responsabilidade. Não faça push ou publicação nesta tarefa.
```
