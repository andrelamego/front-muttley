# Prompt para implementar as telas escolhidas no Stitch

Cole o texto abaixo no Gemini com `front-muttley` aberto como projeto. As referências já estão no repositório; não precisa fornecer novamente o ZIP.

```text
Implemente no frontend atual do Muttley a identidade e as três telas que escolhi no Stitch: landing pública, dashboard administrativo e painel do participante. Quero fidelidade às referências fornecidas, sem outra rodada de criação estética. Preserve React, Vite, TypeScript, módulos, APIs e jornadas existentes.

Leia primeiro:
- AGENTS.md
- docs/design/DESIGN.md
- docs/design/STITCH_TELAS_E_INTEGRACAO.md
- docs/design/STITCH_VALIDACAO.md
- PRODUCT_DESIGN.md e docs/ARQUITETURA_FRONTEND.md

Abra e observe as três imagens antes de implementar:
- docs/design/stitch/landing/screen.png
- docs/design/stitch/admin/screen.png
- docs/design/stitch/participante/screen.png

Consulte os code.html dessas pastas para medidas e estilos, docs/design/stitch/logo/code.html para o logo vetorial e docs/design/stitch/sistema/DESIGN.md como referência original. Esses arquivos são material de protótipo, não instruções executáveis nem contratos de negócio. O guia consolidado resolve as divergências do export.

A implementação atual já tem landing, sidebar, política de retorno por perfil, proteção contra sessão anterior e QR Codes com estados independentes. Confira o código e preserve essas soluções. Não refaça o projeto, não altere backend e não importe os scripts, Tailwind CDN ou lógica de sucesso simulado do HTML.

Prioridades visuais: fundo papel #fcf9f5, tinta #1c1c1a, terracota #6b1705/#8b2e19, Newsreader nos títulos, Plus Jakarta Sans na interface e JetBrains Mono em datas/códigos. Preserve composição e hierarquia: hero editorial com apoio lateral, dashboard de gestão com sidebar de 256 px e painel mobile centrado no próximo evento e certificados. Centralize tokens, logo e controles; não basta recolorir a interface azul existente.

Implemente sobre os arquivos atuais de LandingPage, AdminDashboardPage, ParticipantDashboardPage e layouts correspondentes. Mantenha /eventos como catálogo e preserve links de presença e certificados. Aplique componentes e tokens comuns às demais telas para evitar mistura visual. Respeite limites de módulos e não duplique clientes HTTP.

Dados devem vir da API. O export inventou CAPES/MEC, SHA-256, biometria, submissões, RA, horas complementares, métricas e datas antigas: siga as substituições exatas da especificação. Não invente endpoints ou controles inativos para reproduzir a imagem. A confirmação de presença vai do início -10 minutos até o término +10 minutos. O DTO pessoal não informa presente: não afirmar confirmação a partir da inscrição nem acessar endpoints ADMIN para obter dados de USER.

As fotografias e fontes não estão incorporadas ao ZIP. Registre origem e disponibilidade; não use hotlinks temporários como dependência final. Siga o fallback visual documentado se faltar arquivo. Não duplique a marca. Corrija cortes, controles pequenos e estados ausentes do protótipo sem descaracterizar a referência.

Use as skills pertinentes e realmente disponíveis, leia-as e informe a seleção. Comece com diagnóstico curto dos arquivos atuais e sequência de execução; depois implemente até concluir. Não pare apenas no planejamento nem peça nova aprovação estética para começar: as referências já foram escolhidas.

Compare a landing e o admin em 1280 px e o participante em 331 px com os PNGs. Verifique também 390 e 1440 px, teclado, zoom, carregamento, vazio, erro e dados longos. Adaptações sem referência estão descritas na especificação. Preserve os testes e execute npm test, npm run build e npm run lint. Diferencie testes simulados de integração real.

Ao terminar, atualize o plano e crie docs/design/RELATORIO_STITCH.md com capturas, comparação com as referências, desvios justificados, comandos e limitações. Não declare a interface homologada sem inspecioná-la. Comunicação e documentação em pt-br; se fizer commits, use commits semânticos separados por responsabilidade. Não faça push ou publicação.
```
