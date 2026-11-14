export type Direcao = 'asc' | 'desc'

const comparador = new Intl.Collator('pt-BR', {
  sensitivity: 'base',
  numeric: true,
})

/** Cópia ordenada por uma coluna de texto; valores vazios ficam sempre no fim. */
export const ordenarPor = <T, K extends keyof T>(
  linhas: readonly T[],
  coluna: K,
  direcao: Direcao
): T[] =>
  [...linhas].sort((a, b) => {
    const va = a[coluna]
    const vb = b[coluna]
    const vazioA = va === null || va === undefined || va === ''
    const vazioB = vb === null || vb === undefined || vb === ''
    if (vazioA || vazioB) return Number(vazioA) - Number(vazioB)
    const r = comparador.compare(String(va), String(vb))
    return direcao === 'asc' ? r : -r
  })

export interface Pagina<T> {
  itens: T[]
  /** Página efetiva (1..totalPaginas), ajustada quando o filtro reduz a lista. */
  pagina: number
  totalPaginas: number
}

export const paginar = <T>(
  linhas: readonly T[],
  pagina: number,
  porPagina: number
): Pagina<T> => {
  const totalPaginas = Math.max(1, Math.ceil(linhas.length / porPagina))
  const atual = Math.min(Math.max(1, pagina), totalPaginas)
  const inicio = (atual - 1) * porPagina
  return {
    itens: linhas.slice(inicio, inicio + porPagina),
    pagina: atual,
    totalPaginas,
  }
}
