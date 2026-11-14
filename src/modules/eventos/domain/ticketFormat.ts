const MESES = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
]

export interface TicketDateParts {
  dia: string
  mes: string
  horario: string | null
}

/** Partes do canhoto do ingresso. Lê a data como calendário, sem conversão de fuso. */
export const getTicketDateParts = (
  data: string,
  horarioInicio?: string | null
): TicketDateParts => {
  const [, mes, dia] = data.split('-').map(Number)
  let horario: string | null = null
  if (horarioInicio) {
    const [h, m = 0] = horarioInicio.split(':').map(Number)
    horario = m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
  }
  return { dia: String(dia), mes: MESES[mes - 1] ?? '', horario }
}

/** Rótulo legível da modalidade do evento; null quando ausente. */
export const formatModalidade = (modalidade?: string | null): string | null => {
  if (!modalidade) return null
  if (modalidade === 'ONLINE') return 'Online'
  if (modalidade === 'HIBRIDO') return 'Híbrido'
  return 'Presencial'
}
