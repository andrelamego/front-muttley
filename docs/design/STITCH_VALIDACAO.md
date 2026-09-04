# Implementação e verificação do visual Stitch

## Sequência de execução

1. Ler `AGENTS.md`, [guia visual](DESIGN.md), [telas e contratos](STITCH_TELAS_E_INTEGRACAO.md); abrir os três PNGs e consultar os HTMLs sem executar seus scripts. Conferir Git e preservar alterações do autor.
2. Mapear tokens/classes usados no código vivo; registrar quais componentes serão alterados. Não criar uma segunda aplicação nem introduzir Next.js, Tailwind por CDN ou scripts globais do protótipo.
3. Aplicar famílias tipográficas, cores, espaçamento, logo e componentes básicos. Verificar uma amostra de título, corpo, data, botão, campo, badge e tabela em tela. Aparência da base precisa corresponder ao Stitch antes de expandir.
4. Implementar a landing sobre a jornada e o carrossel existentes, conferindo a captura desktop e a adaptação mobile.
5. Adaptar dashboard/sidebar e painel do participante, integrando dados reais e removendo apenas conteúdo fictício conforme a especificação.
6. Conferir as demais rotas vivas para impedir mistura de identidades e regressões por componentes comuns.
7. Testar fluxos, inspecionar renderização, registrar evidências e corrigir diferenças observáveis. Atualizar plano e relatório; não parar após trocar a paleta.

## Skills por necessidade

- `anti-ui-slop`: comparar composição e identidade com o produto e as referências escolhidas.
- `api-patterns`: conferir contratos e erros quando adaptar consultas ou ações.
- `accessibility-compliance-accessibility-audit`: avaliar a implementação navegável, incluindo foco, contraste e teclado.
- `architecture`/`architect-review`: somente quando alterar fronteiras ou composição entre módulos.

Ler os arquivos realmente disponíveis e anunciar a aplicação. Não instalar ferramentas nem alegar uso de skill pelo simples fato de estar citada. Se indisponível, registrar e seguir os critérios destes documentos. Na preparação atual, foi aplicada `anti-ui-slop` à análise e ao contrato visual; não foi realizada auditoria completa de acessibilidade.

## Matriz de verificação visual

| Tela | Largura de comparação com referência | Adaptações a verificar |
| --- | --- | --- |
| Landing | 1280 px | 390 e 1440 px; 768 px para quebra do carrossel |
| Admin | 1280 px | 1440 px, 768 px e 390 px com drawer |
| Participante | 331 px | 360/390 px e 1440 px |
| Login, catálogo, detalhe, certificados, medalhas, formulário e conclusão | Sem referência fornecida | 390 e 1440 px; tokens e componentes coerentes |

Comparar a imagem completa e detalhes de título, controles e navegação. Usar conteúdo de teste controlado para isolar diferenças visuais; em outra verificação, confirmar integração real. Não usar dados pessoais reais nas capturas compartilhadas.

Critérios: nenhuma sobreposição/corte; logo único; fontes corretas carregadas e fallback utilizável; foco visível; bom contraste; zoom 200%; textos longos; números de indicadores grandes; scroll contido em tabelas; navegação fixa não cobre rodapé ou foco; `safe-area-inset-bottom` quando houver barra inferior.

Capturas de erro/vazio/carregamento não foram fornecidas: implementar usando os mesmos componentes e registrar como adaptação. O export não serve como evidência de acessibilidade ou fidelidade do aplicativo implementado.

## Casos funcionais prioritários

- Landing: zero, um e vários eventos; falha e nova tentativa; teclado/toque; mudança de largura com carrossel em página posterior; ausência de autoplay; data sem deslocamento de dia.
- Admin: métricas zero versus erro; dados incompletos; lista limitada versus total real; ausência de pendências; criar, gerenciar e revisar conclusão em rotas válidas; nenhuma ação fictícia de relatório/submissão.
- Participante: sem inscrições/certificados; evento em janela versus futuro ou encerrado; dados sem `presente`; sucesso, conflito e erro ao confirmar; código real copiado; PDF baixado; serviços parciais indisponíveis.
- Autenticação: ADMIN → sair → USER e inverso; resposta tardia da sessão anterior; rota ADMIN negada sem loop; login preserva retorno permitido.
- QR: uma imagem falha e a outra aparece; nova tentativa individual; fechar modal ou trocar evento antes da resposta; recursos liberados e foco devolvido.
- Conclusão: assinatura obrigatória e válida, proteção contra duplo envio, mensagem real de erro, emissão reconhecida somente após resposta. Não concluir eventos reais para testar aparência; usar base de teste.
- Navegação: eventos, confirmação de presença e certificados por link direto continuam funcionando. As funções de medalhas e compartilhamento existentes continuam acessíveis.

Preservar os testes existentes em `tests/` (autenticação, destino, sessão, erros HTTP/Blob, carrossel, certificados e administração). Acrescentar testes de comportamento quando alterar lógica. Testes de componentes/E2E podem precisar de configuração: conferir dependências antes de escolher ferramentas e não declarar que estão disponíveis sem verificar.

## Comandos e evidências

Na implementação, executar `npm test`, `npm run build` e `npm run lint`. Não desativar regras ou excluir arquivos vivos para obter aprovação. Registrar comando, resultado e limitações. Esses comandos não foram repetidos na preparação documental, que não altera `src`, dependências nem código executável.

Depois da implementação, criar `docs/design/RELATORIO_STITCH.md` com:

1. Telas e componentes alterados.
2. Tabela referência → resultado → diferença justificada, com links para capturas locais.
3. Larguras, estados e navegação por teclado verificados.
4. Origem das fontes/imagens usadas e eventual substituição por falta de arquivo.
5. Resultados reais de testes/build/lint; separação entre mocks e API real.
6. Pendências funcionais/visuais e limitações de contrato.

Entrega concluída exige telas implementadas e inspecionadas, não apenas documentação, build ou uma lista de pastas. Se a API estiver indisponível, entregar a parte verificável e identificar as jornadas ainda sem validação integrada.
