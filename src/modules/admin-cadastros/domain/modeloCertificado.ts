// Modelo visual do certificado (contrato de /admin/certificados/modelo).
export type LeiauteCertificado = 'INGRESSO' | 'CLASSICO'

export interface ModeloCertificado {
  instituicao: string
  titulo: string
  texto: string
  cargoAssinatura: string
  corPrincipal: string
  corDestaque: string
  leiaute: LeiauteCertificado
  /** Base64 sem o prefixo "data:"; null quando não há logo. */
  logoBase64: string | null
  logoMime: string | null
}

export const MARCADORES = [
  { marcador: '{nome}', descricao: 'nome do participante' },
  { marcador: '{tipo}', descricao: 'participante, palestrante…' },
  { marcador: '{evento}', descricao: 'tema do evento' },
  { marcador: '{data}', descricao: 'data por extenso' },
  { marcador: '{carga}', descricao: 'carga horária' },
] as const

export const LIMITES = {
  instituicao: 120,
  titulo: 80,
  texto: 600,
  cargoAssinatura: 200,
}
export const LOGO_MAX_BYTES = 512 * 1024

const HEX = /^#[0-9a-fA-F]{6}$/

export const validarModelo = (m: ModeloCertificado): Record<string, string> => {
  const erros: Record<string, string> = {}
  const obrigatorio: Array<[keyof typeof LIMITES, string]> = [
    ['instituicao', 'Informe o nome da instituição.'],
    ['titulo', 'Informe o título.'],
    ['texto', 'Escreva o texto do certificado.'],
    ['cargoAssinatura', 'Informe o cargo de quem assina.'],
  ]
  for (const [campo, mensagem] of obrigatorio) {
    const valor = m[campo].trim()
    if (!valor) erros[campo] = mensagem
    else if (valor.length > LIMITES[campo])
      erros[campo] = `Use até ${LIMITES[campo]} caracteres.`
  }
  if (!HEX.test(m.corPrincipal)) erros.corPrincipal = 'Use o formato #rrggbb.'
  if (!HEX.test(m.corDestaque)) erros.corDestaque = 'Use o formato #rrggbb.'
  return erros
}

/** Insere o marcador na posição do cursor e devolve o texto e a nova posição. */
export const inserirMarcador = (
  texto: string,
  inicio: number,
  fim: number,
  marcador: string
): { texto: string; cursor: number } => ({
  texto: texto.slice(0, inicio) + marcador + texto.slice(fim),
  cursor: inicio + marcador.length,
})

/** Marcadores escritos errado (ex.: {Nome}, {evnto}) não são trocados no certificado. */
export const marcadoresDesconhecidos = (texto: string): string[] => {
  const validos = new Set<string>(MARCADORES.map((m) => m.marcador))
  return [...new Set(texto.match(/\{[^{}\s]*\}/g) ?? [])].filter(
    (m) => !validos.has(m)
  )
}
