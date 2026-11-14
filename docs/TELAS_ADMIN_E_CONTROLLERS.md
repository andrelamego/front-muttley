# Telas administrativas e contratos do backend

As novas áreas de gestão consomem apenas endpoints já expostos pelo backend.

| Tela | Rota do frontend | Endpoints usados |
| --- | --- | --- |
| Certificados | `/admin/certificados` | `GET /api/admin/certificados` |
| Pessoas | `/admin/pessoas` | `GET /api/admin/pessoas` |
| Cadastros institucionais | `/admin/cadastros` | `GET /api/admin/disciplinas`, `locais`, `patrocinadores`, `enderecos` e `medalhas` |

A tela de certificados mostra o acervo, os últimos emitidos e eventos aguardando emissão. A de pessoas funciona como diretório com busca e filtro por perfil. A central de cadastros reúne consultas segmentadas para os dados auxiliares usados na gestão de eventos.

As operações de criação, edição e exclusão desses cadastros continuam fora deste incremento. Elas devem ser adicionadas em formulários próprios quando o fluxo de autorização e as validações de cada controller estiverem consolidados.
