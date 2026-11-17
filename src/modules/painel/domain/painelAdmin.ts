import type { OcupacaoEvento } from './painelTypes'

export type SituacaoOcupacao = 'LOTADO' | 'QUASE_LOTADO' | 'BAIXA_PROCURA'

/** Dias até a data do evento (YYYY-MM-DD), contando em datas de calendário. */
const diasAte = (data: string, hoje: string) =>
  Math.round(
    (Date.parse(`${data}T00:00:00Z`) - Date.parse(`${hoje}T00:00:00Z`)) /
      86400000
  )

/**
 * O que a coordenação precisa saber de um próximo evento: lotou, está quase,
 * ou está perto da data com pouca gente (hora de divulgar ou trocar de sala).
 */
export const situacaoOcupacao = (
  o: Pick<OcupacaoEvento, 'percentual' | 'data'>,
  hoje: string
): SituacaoOcupacao | null => {
  if (o.percentual === null) return null
  if (o.percentual >= 100) return 'LOTADO'
  if (o.percentual >= 85) return 'QUASE_LOTADO'
  if (o.percentual < 30 && diasAte(o.data, hoje) <= 3) return 'BAIXA_PROCURA'
  return null
}

/** Altura de cada barra de um gráfico pequeno, em %, pelo maior valor da série. */
export const alturas = (valores: number[]) => {
  const maior = Math.max(0, ...valores)
  return valores.map((v) => (maior === 0 ? 0 : (v / maior) * 100))
}
