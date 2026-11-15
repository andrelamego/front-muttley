export interface Barra {
  x: number
  largura: number
  /** Barras-guia das pontas, mais compridas, como nos códigos de verdade. */
  guia: boolean
}

/** Gerador pseudoaleatório pequeno (mulberry32): a mesma semente dá a mesma sequência. */
const sorteador = (semente: number) => {
  let a = semente >>> 0 || 1
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Barras decorativas de um ingresso. Não é um código legível por leitor:
 * só imita o desenho, sempre igual para o mesmo número.
 */
export const barrasDoCodigo = (semente: number): Barra[] => {
  const sortear = sorteador(semente)
  const barras: Barra[] = []
  let x = 0
  const por = (largura: number, guia = false, espaco = 1) => {
    barras.push({ x, largura, guia })
    x += largura + espaco
  }
  por(1, true)
  por(1, true, 2)
  const total = 28 + Math.floor(sortear() * 9)
  for (let i = 0; i < total; i += 1)
    por(1 + Math.floor(sortear() * 4), false, 1 + Math.floor(sortear() * 2))
  por(1, true)
  por(1, true, 0)
  return barras
}

/** 304 vira "Nº 000304", como a numeração impressa em ingresso. */
export const formatarNumeroIngresso = (n: number) =>
  `Nº ${String(n).padStart(6, '0')}`
