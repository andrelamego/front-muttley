import { getTicketDateParts } from '../../eventos/domain/ticketFormat.ts'

const DIA_MS = 24 * 60 * 60 * 1000

/** Frase do topo do início do participante. Compara datas de calendário, sem fuso. */
export const formatProximoEvento = (data: string, hoje: Date): string => {
  const [ano, mes, dia] = data.split('-').map(Number)
  const evento = Date.UTC(ano, mes - 1, dia)
  const base = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  const diff = Math.round((evento - base) / DIA_MS)

  if (diff === 0) return 'Seu próximo evento é hoje'
  if (diff === 1) return 'Seu próximo evento é amanhã'

  const partes = getTicketDateParts(data)
  const quando = `${partes.dia} de ${partes.mes}`
  return diff > 1
    ? `Seu próximo evento é em ${quando}`
    : `Seu último evento foi em ${quando}`
}
