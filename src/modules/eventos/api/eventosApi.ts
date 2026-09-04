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
