import apiClient from '../../../shared/http/apiClient'
import type {
  AdminEvento,
  ParticipacaoEventoAdmin,
  SalvarEventoPayload,
  ConcluirEventoResponse,
  DisciplinaOption,
  LocalOption,
  PatrocinadorOption,
} from '../domain/adminEventoTypes'

interface PageContent<T> {
  content?: T[]
}

export async function getAdminEventosApi(): Promise<AdminEvento[]> {
  const response = await apiClient.get<
    AdminEvento[] | PageContent<AdminEvento>
  >('/admin/eventos', {
    params: { tamanho: 1000, ordenar: 'data' },
  })

  const data = response.data
  if (Array.isArray(data)) {
    return data
  }
  return data.content || []
}

export async function getAdminEventoByIdApi(
  id: number | string
): Promise<AdminEvento> {
  const response = await apiClient.get<AdminEvento>(`/admin/eventos/${id}`)
  return response.data
}

export async function salvarAdminEventoApi(
  payload: SalvarEventoPayload
): Promise<{ id: number; message?: string }> {
  const eventoData = {
    tema: payload.tema,
    descricao: payload.descricao || '-',
    data: payload.data,
    horarioInicio: payload.horarioInicio,
    horarioFim: payload.horarioFim,
    modalidade: payload.modalidade,
    disciplinaId: payload.disciplinaId ? Number(payload.disciplinaId) : null,
    patrocinadorId: payload.patrocinadorId
      ? Number(payload.patrocinadorId)
      : null,
    localId: payload.localId ? Number(payload.localId) : null,
  }

  const body = {
    evento: eventoData,
    participacoes: [],
  }

  if (payload.id) {
    const response = await apiClient.put<{ id: number; message?: string }>(
      `/admin/eventos/${payload.id}`,
      body
    )
    return { id: Number(payload.id), message: response.data?.message }
  } else {
    const response = await apiClient.post<{ id: number; message?: string }>(
      '/admin/eventos',
      body
    )
    return {
      id: Number(response.data?.id || 0),
      message: response.data?.message,
    }
  }
}

export async function cancelarAdminEventoApi(
  id: number | string
): Promise<void> {
  await apiClient.delete(`/admin/eventos/${id}`)
}

export async function getEventParticipationsApi(
  id: number | string
): Promise<ParticipacaoEventoAdmin[]> {
  const response = await apiClient.get<
    { participacoes?: ParticipacaoEventoAdmin[] } | ParticipacaoEventoAdmin[]
  >(`/admin/eventos/${id}/participacoes`)

  if (Array.isArray(response.data)) {
    return response.data
  }
  return response.data.participacoes || []
}

export async function concluirEventoApi(
  id: number | string,
  presentes: number[],
  file?: File | null
): Promise<ConcluirEventoResponse> {
  if (file) {
    const formData = new FormData()
    presentes.forEach((pId) => formData.append('presentes', pId.toString()))
    formData.append('file', file)

    const response = await apiClient.post<ConcluirEventoResponse>(
      `/admin/eventos/${id}/concluir`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  } else {
    const response = await apiClient.post<ConcluirEventoResponse>(
      `/admin/eventos/${id}/concluir`,
      presentes
    )
    return response.data
  }
}

export async function getEventQrCodeInscricaoBlobApi(
  id: number | string
): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    `/admin/eventos/${id}/qrcode-inscricao`,
    {
      responseType: 'blob',
    }
  )
  return response.data
}

export async function getEventQrCodeConfirmacaoBlobApi(
  id: number | string
): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    `/admin/eventos/${id}/qrcode-confirmacao`,
    {
      responseType: 'blob',
    }
  )
  return response.data
}

export async function getAuxiliaresEventoApi(): Promise<{
  locais: LocalOption[]
  disciplinas: DisciplinaOption[]
  patrocinadores: PatrocinadorOption[]
}> {
  const [locaisRes, discRes, patrocRes] = await Promise.allSettled([
    apiClient.get<LocalOption[]>('/admin/locais'),
    apiClient.get<DisciplinaOption[]>('/admin/disciplinas'),
    apiClient.get<PatrocinadorOption[]>('/admin/patrocinadores'),
  ])

  const locais = locaisRes.status === 'fulfilled' ? locaisRes.value.data : []
  const disciplinas = discRes.status === 'fulfilled' ? discRes.value.data : []
  const patrocinadores =
    patrocRes.status === 'fulfilled' ? patrocRes.value.data : []

  return { locais, disciplinas, patrocinadores }
}

export { parseBlobErrorMessage } from '../domain/qrCodeErrorUtils'
