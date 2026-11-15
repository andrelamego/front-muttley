import type { Conquistas, Especial, Trilha } from './conquistas'

/** Uma medalha que a pessoa ainda não viu: um nível de trilha ou uma especial. */
export type MedalhaNova =
  | { tipo: 'trilha'; chave: string; trilha: Trilha }
  | { tipo: 'especial'; chave: string; especial: Especial }

/**
 * Medalhas conquistadas, cada nível de trilha separado: subir de bronze para
 * prata é uma medalha nova, não a mesma.
 */
export const medalhasConquistadas = (c: Conquistas): MedalhaNova[] => [
  ...c.especiais.map((especial) => ({
    tipo: 'especial' as const,
    chave: `especial:${especial.tipo}:${especial.titulo}`,
    especial,
  })),
  ...c.trilhas
    .filter((t) => t.nivel)
    .map((trilha) => ({
      tipo: 'trilha' as const,
      chave: `trilha:${trilha.chave}:${trilha.nivel}`,
      trilha,
    })),
]

/**
 * O que revelar agora. Sem registro anterior (primeira visita ou outro
 * aparelho), nada: revelar o histórico inteiro de uma vez seria só barulho.
 */
export const medalhasNovas = (
  conquistadas: MedalhaNova[],
  vistas: string[] | null
): MedalhaNova[] =>
  vistas === null ? [] : conquistadas.filter((m) => !vistas.includes(m.chave))
