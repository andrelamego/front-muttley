import {
  formatHora,
  type PresenceWindow,
} from '../../eventos/domain/presenceWindow.ts'
import type { StatusEvento } from './adminEventoTypes.ts'

export type FasePresenca = 'antes' | 'aberta' | 'encerrada' | 'indisponivel'

/** O que o telão diz sobre a presença neste instante. */
export const situacaoPresenca = (
  janela: PresenceWindow | null,
  status: StatusEvento,
  agora: Date
): { fase: FasePresenca; texto: string } => {
  if (status === 'CANCELADO')
    return { fase: 'indisponivel', texto: 'Evento cancelado' }
  if (status === 'FINALIZADO')
    return { fase: 'encerrada', texto: 'Evento encerrado' }
  if (!janela)
    return { fase: 'indisponivel', texto: 'Horário do evento não informado' }
  if (agora < janela.abre)
    return {
      fase: 'antes',
      texto: `Presença abre às ${formatHora(janela.abre)}`,
    }
  if (agora > janela.fecha)
    return {
      fase: 'encerrada',
      texto: `Presença encerrada às ${formatHora(janela.fecha)}`,
    }
  return {
    fase: 'aberta',
    texto: `Presença aberta até ${formatHora(janela.fecha)}`,
  }
}
