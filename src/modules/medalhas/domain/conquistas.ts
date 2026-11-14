// Contrato de GET /api/me/conquistas e as contas de progresso mostradas na tela.
export type Nivel = 'BRONZE' | 'PRATA' | 'OURO'

export interface Trilha {
  /** "geral", "horas" ou "disciplina:<nome>". */
  chave: string
  titulo: string
  metrica: 'PRESENCAS' | 'HORAS'
  valor: number
  nivel: Nivel | null
  proximoNivel: Nivel | null
  proximoMarco: number | null
  /** Marcos de bronze, prata e ouro, nessa ordem. */
  marcos: number[]
}

export interface Especial {
  tipo: 'DIAMANTE' | 'ESPECIALISTA' | 'PALESTRANTE'
  titulo: string
  descricao: string
  semestre: string | null
}

export interface Disputa {
  titulo: string
  semestre: string
  posicao: number
  valor: number
  minimo: number
}

export interface Conquistas {
  trilhas: Trilha[]
  especiais: Especial[]
  disputas: Disputa[]
}

export const NOME_NIVEL: Record<Nivel, string> = {
  BRONZE: 'Bronze',
  PRATA: 'Prata',
  OURO: 'Ouro',
}

export const unidade = (t: Pick<Trilha, 'metrica'>, n: number) =>
  t.metrica === 'HORAS' ? `${n} h` : n === 1 ? '1 presença' : `${n} presenças`

/** "Falta 1 presença", "Faltam 3 presenças", "Faltam 23 h". */
export const faltam = (t: Pick<Trilha, 'metrica'>, n: number) =>
  `${n === 1 ? 'Falta' : 'Faltam'} ${unidade(t, n)}`

/** Disputas que valem destaque: já concorrendo ou a uma presença de entrar. As demais viram um resumo. */
export const separarDisputas = (disputas: Disputa[]) => ({
  principais: disputas.filter((d) => d.minimo - d.valor <= 1),
  outras: disputas.filter((d) => d.minimo - d.valor > 1),
})

/** Fração do caminho entre o marco já alcançado e o próximo (1 no nível máximo). */
export const progresso = (t: Trilha): number => {
  if (t.proximoMarco === null) return 1
  const indice = t.marcos.indexOf(t.proximoMarco)
  const anterior = indice > 0 ? t.marcos[indice - 1] : 0
  return Math.min(
    1,
    Math.max(0, (t.valor - anterior) / (t.proximoMarco - anterior))
  )
}

/** A trilha mais perto de subir de nível: é a meta mostrada no painel. */
export const proximaMeta = (trilhas: Trilha[]): Trilha | null =>
  trilhas
    .filter((t) => t.proximoMarco !== null)
    .reduce<Trilha | null>(
      (melhor, t) => (!melhor || progresso(t) > progresso(melhor) ? t : melhor),
      null
    )

export const totalMedalhas = (c: Conquistas) =>
  c.trilhas.filter((t) => t.nivel !== null).length + c.especiais.length

const LIGACOES = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'para'])

/** Sigla gravada na moeda: "Banco de Dados" → "BD", "Redes" → "RE". */
export const sigla = (nome: string): string => {
  const palavras = nome
    .split(/[\s-]+/)
    .filter((p) => p && !LIGACOES.has(p.toLowerCase()))
  if (palavras.length === 0) return '?'
  if (palavras.length === 1) return palavras[0].slice(0, 2).toUpperCase()
  return (palavras[0][0] + palavras[1][0]).toUpperCase()
}

/** Emblema da moeda: P na participação, h nas horas e a sigla da disciplina. */
export const emblema = (t: Pick<Trilha, 'chave' | 'titulo'>): string =>
  t.chave === 'geral' ? 'P' : t.chave === 'horas' ? 'h' : sigla(t.titulo)
