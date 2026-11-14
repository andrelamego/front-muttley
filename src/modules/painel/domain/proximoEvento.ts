import { getTicketDateParts } from '../../eventos/domain/ticketFormat.ts'
import {
  isWithinPresenceWindow,
  parseEventDateTime,
} from '../../eventos/domain/presenceWindow.ts'
import type { ParticipacaoResumo } from './painelTypes.ts'

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

export interface EventoDestaque {
  destaque: ParticipacaoResumo | undefined
  /** true quando nenhum evento está por vir e o destaque é o mais recente já realizado */
  passado: boolean
  /** Só eventos futuros, depois do destaque, em ordem de data */
  depois: ParticipacaoResumo[]
}

/** Escolhe o evento do topo: presença aberta, senão o próximo futuro, senão o último já realizado. */
export const selecionarEventoDestaque = (
  participacoes: ParticipacaoResumo[],
  agora: Date
): EventoDestaque => {
  const chave = (p: ParticipacaoResumo) =>
    `${p.evento?.data ?? ''}T${p.evento?.horarioInicio ?? ''}`
  const validas = participacoes
    .filter((p) => p.evento && p.evento.status !== 'CANCELADO')
    .sort((a, b) => chave(a).localeCompare(chave(b)))

  const aberta = validas.find((p) =>
    isWithinPresenceWindow(
      p.evento?.data,
      p.evento?.horarioInicio,
      p.evento?.horarioFim,
      agora
    )
  )
  const futuras = validas.filter((p) => {
    const fim = parseEventDateTime(p.evento?.data, p.evento?.horarioFim)
    return fim ? fim >= agora : true
  })

  const destaque = aberta ?? futuras[0] ?? validas[validas.length - 1]
  return {
    destaque,
    passado: Boolean(destaque) && !aberta && futuras.length === 0,
    depois: futuras.filter((p) => p !== destaque),
  }
}
