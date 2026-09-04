import type { EventoPublico } from './eventoTypes'

/**
 * Calcula o próximo índice do carrossel com ciclo infinito e segurança contra listas vazias ou unitárias.
 */
export const calculateNextIndex = (
  currentIndex: number,
  total: number
): number => {
  if (total <= 1) return 0
  return currentIndex < total - 1 ? currentIndex + 1 : 0
}

/**
 * Calcula o índice anterior do carrossel com ciclo infinito.
 */
export const calculatePrevIndex = (
  currentIndex: number,
  total: number
): number => {
  if (total <= 1) return 0
  return currentIndex > 0 ? currentIndex - 1 : total - 1
}

/**
 * Ordena eventos cronologicamente pela data (YYYY-MM-DD) sem mutação da lista original.
 */
export const sortEventosByDate = (
  eventos: EventoPublico[]
): EventoPublico[] => {
  return [...eventos].sort((a, b) => {
    return (a.data || '').localeCompare(b.data || '')
  })
}

/**
 * Formata data ISO (YYYY-MM-DD) em formato por extenso amigável sem sofrer distorção por fuso horário.
 */
export const formatDateSafe = (dateStr: string): string => {
  if (!dateStr) return '-'
  const parts = dateStr.split('-').map(Number)
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    const d = new Date(parts[0], parts[1] - 1, parts[2])
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }
  return dateStr
}
