// Regras de apoio do formulário de evento: atalhos, avisos e cópia. A API confere tudo de novo.
import {
  formatHora,
  getPresenceWindow,
  parseEventDateTime,
} from '../../eventos/domain/presenceWindow.ts'
import type { AdminEvento, ModalidadeEvento } from './adminEventoTypes.ts'

export interface ValoresEvento {
  tema: string
  descricao: string
  data: string
  horarioInicio: string
  horarioFim: string
  modalidade: ModalidadeEvento
  localId: string
  disciplinaId: string
  patrocinadorId: string
}

export const ATALHOS_PERIODO = [
  { rotulo: 'Manhã', inicio: '09:00', fim: '11:00' },
  { rotulo: 'Tarde', inicio: '14:00', fim: '16:00' },
  { rotulo: 'Noite', inicio: '19:00', fim: '21:30' },
] as const

export const DURACOES = [
  { rotulo: '1 h', minutos: 60 },
  { rotulo: '2 h', minutos: 120 },
  { rotulo: '3 h', minutos: 180 },
] as const

const doisDigitos = (n: number) => String(n).padStart(2, '0')

/** "19:00" + 150 min → "21:30"; null se passar da meia-noite (o evento acontece num dia só). */
export const somarMinutos = (hhmm: string, minutos: number): string | null => {
  const [h, m] = hhmm.split(':').map(Number)
  if (!Number.isInteger(h) || !Number.isInteger(m)) return null
  const total = h * 60 + m + minutos
  if (total >= 24 * 60) return null
  return `${doisDigitos(Math.floor(total / 60))}:${doisDigitos(total % 60)}`
}

/** Próximo dia de segunda a sexta depois de hoje, em AAAA-MM-DD. */
export const proximoDiaUtil = (hoje: Date): string => {
  const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1)
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`
}

/** Id de uma relação que a API pode mandar como id solto ou como objeto. */
export const idDe = (
  id?: number | null,
  objeto?: { id?: number } | string | null
): string => {
  if (id) return String(id)
  if (objeto && typeof objeto === 'object' && objeto.id)
    return String(objeto.id)
  return ''
}

/** Mensagem por campo, alinhada às exigências da API (todos obrigatórios, data não no passado). */
export const validarEvento = (
  v: ValoresEvento,
  hoje: Date
): Partial<Record<keyof ValoresEvento, string>> => {
  const erros: Partial<Record<keyof ValoresEvento, string>> = {}
  if (!v.tema.trim()) erros.tema = 'Dê um tema ao evento.'
  if (!v.disciplinaId) erros.disciplinaId = 'Escolha a disciplina.'
  if (!v.data) erros.data = 'Escolha a data.'
  else {
    const dia = parseEventDateTime(v.data, '00:00')
    const inicioDeHoje = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate()
    )
    if (dia && dia < inicioDeHoje) erros.data = 'A data já passou.'
  }
  if (!v.horarioInicio) erros.horarioInicio = 'Informe o início.'
  if (!v.horarioFim) erros.horarioFim = 'Informe o término.'
  else if (v.horarioInicio && v.horarioFim <= v.horarioInicio)
    erros.horarioFim = 'O término precisa ser depois do início.'
  if (!v.localId) erros.localId = 'Escolha o local; as vagas vêm dele.'
  if (!v.patrocinadorId) erros.patrocinadorId = 'Escolha o patrocinador.'
  return erros
}

/** O que cada escolha significa para quem vai participar. */
export const consequencias = (
  v: Pick<ValoresEvento, 'data' | 'horarioInicio' | 'horarioFim'>
): { presenca: string; inscricoes: string } | null => {
  const janela = getPresenceWindow(v.data, v.horarioInicio, v.horarioFim)
  const inicio = parseEventDateTime(v.data, v.horarioInicio)
  if (!janela || !inicio || v.horarioFim <= v.horarioInicio) return null
  const dia = `${doisDigitos(inicio.getDate())}/${doisDigitos(inicio.getMonth() + 1)}`
  return {
    presenca: `A presença fica liberada das ${formatHora(janela.abre)} às ${formatHora(janela.fecha)}.`,
    inscricoes: `As inscrições ficam abertas até o início, às ${formatHora(inicio)} de ${dia}.`,
  }
}

/** Eventos no mesmo local e dia com horário sobreposto (ignora cancelados e o próprio evento). */
export const conflitos = (
  eventos: AdminEvento[],
  v: Pick<ValoresEvento, 'data' | 'horarioInicio' | 'horarioFim' | 'localId'>,
  idAtual?: number
): AdminEvento[] => {
  if (!v.data || !v.horarioInicio || !v.horarioFim || !v.localId) return []
  return eventos.filter(
    (e) =>
      e.id !== idAtual &&
      e.status !== 'CANCELADO' &&
      e.data === v.data &&
      idDe(e.localId, e.local) === v.localId &&
      e.horarioInicio.slice(0, 5) < v.horarioFim &&
      v.horarioInicio < e.horarioFim.slice(0, 5)
  )
}

/** Valores de um evento anterior para reaproveitar; a data fica para ser escolhida de novo. */
export const copiarDe = (e: AdminEvento): Omit<ValoresEvento, 'data'> => ({
  tema: e.tema ?? '',
  descricao: e.descricao && e.descricao !== '-' ? e.descricao : '',
  horarioInicio: (e.horarioInicio ?? '').slice(0, 5),
  horarioFim: (e.horarioFim ?? '').slice(0, 5),
  modalidade: e.modalidade ?? 'PRESENCIAL',
  localId: idDe(e.localId, e.local),
  disciplinaId: idDe(e.disciplinaId, e.disciplina),
  patrocinadorId: idDe(e.patrocinadorId, e.patrocinador),
})
