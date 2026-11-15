import apiClient from '../../../shared/http/apiClient'
import type {
  EventoPublico,
  InscricaoPublicaInput,
  InscricaoPublicaResultado,
} from '../domain/eventoTypes'

export const getEventosPublicosApi = async (): Promise<EventoPublico[]> => {
  const response = await apiClient.get<
    EventoPublico[] | { content?: EventoPublico[] }
  >('/eventos')
  if (Array.isArray(response.data)) {
    return response.data
  }
  return response.data.content || []
}

export const getEventoPublicoPorIdApi = async (
  id: string | number
): Promise<EventoPublico> => {
  const response = await apiClient.get<EventoPublico>(`/eventos/${id}`)
  return response.data
}

export const criarInscricaoPublicaApi = async (
  eventoId: string | number,
  input: InscricaoPublicaInput
): Promise<InscricaoPublicaResultado> => {
  const response = await apiClient.post<InscricaoPublicaResultado>(
    `/eventos/${eventoId}/inscricoes`,
    input
  )
  return response.data
}

export const confirmarPresencaApi = async (
  eventoId: string | number,
  cpf: string
): Promise<{ message?: string }> => {
  const cleanedCpf = cpf.trim()
  const response = await apiClient.post<{ message?: string }>(
    `/eventos/${eventoId}/confirmar-presenca/${cleanedCpf}`
  )
  return response.data
}

/** Inscrição da pessoa logada neste evento, ou null se ela não está inscrita. */
export const getMinhaInscricaoApi = async (
  eventoId: string | number
): Promise<{ id: number; inscricao: number } | null> => {
  const response =
    await apiClient.get<
      Array<{ id: number; inscricao: number; evento?: { id?: number } | null }>
    >('/me/participacoes')
  const minha = response.data.find(
    (p) => String(p.evento?.id) === String(eventoId)
  )
  return minha ? { id: minha.id, inscricao: minha.inscricao } : null
}

/** A API só aceita antes do início do evento e sem presença registrada. */
export const cancelarInscricaoApi = async (participacaoId: number) => {
  await apiClient.delete(`/participacoes/${participacaoId}`)
}

/** O mínimo das inscrições da pessoa para recomendar eventos e marcar os já inscritos. */
export interface MinhaParticipacao {
  evento: { id: number; data: string; disciplina: string | null } | null
}

export const getMinhasParticipacoesApi = async (): Promise<
  MinhaParticipacao[]
> => {
  const response = await apiClient.get<MinhaParticipacao[]>('/me/participacoes')
  return Array.isArray(response.data) ? response.data : []
}
