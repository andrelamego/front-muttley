# ADR-002 — Identidade Visual Nova, Tokens Semânticos e Acessibilidade

## Estado

Aprovado e adotado para a reconstrução do frontend.

## Contexto

A versão anterior do Muttley utilizava cores institucionais pesadas e CSS disperso com estilos inline e classes utilitárias não padronizadas. O autor decidiu pela liberdade total de identidade visual, priorizando contraste (WCAG 2.2 AA), modernidade, foco nas tarefas dos usuários e consistência entre telas móveis (público/participante) e desktop (administração).

## Decisão

1. **Paleta de Cores Semântica:**
   - **Primária Acadêmica:** Safira/Índigo (`primary: #2563eb`, `primary-hover: #1d4ed8`, `primary-subtle: #eff6ff`) transmitindo credibilidade acadêmica e garantindo contraste superior a 5.5:1 sobre fundos claros.
   - **Superfícies:** Canvas em tom suave (`#f8fafc`), cartões e painéis em branco puro (`#ffffff`), e bordas sutis (`#e2e8f0`).
   - **Tipografia:** Tons de tinta neutros de alto contraste (`ink: #0f172a`, `ink-muted: #475569`), utilizando pilha de fontes do sistema para renderização instantânea e robusta offline.
   - **Feedback Semântico:** Estados de sucesso (`#059669`), alerta (`#d97706`), erro (`#dc2626`) e informação (`#0284c7`).

2. **Centralização de Tokens:**
   - Todos os tokens residem em `src/styles/tokens.css` e são consumidos por utilitários Tailwind e variáveis CSS semânticas. Nenhuma tela define cores hexadecimais soltas no código.

3. **Critérios de IHC e Acessibilidade:**
   - Controles interativos em celular possuem dimensões mínimas de 44x44px.
   - Navegação por teclado evidenciada por `focus-visible:ring-2 focus-visible:ring-offset-2`.
   - Mensagens de erro com `role="alert"` para leitores de tela.
   - Preservação de dados digitados em caso de falha de requisição.

## Consequências

- A identidade anterior é descontinuada em favor de uma interface limpa, sem ruídos decorativos.
- Futuras alterações no tema ou paleta podem ser feitas exclusivamente nos tokens CSS centrais.
