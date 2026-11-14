import type { EventoPublico } from './eventoTypes'

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
