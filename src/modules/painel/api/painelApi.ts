import apiClient from '../../../shared/http/apiClient'
import type {
  ParticipantDashboardData,
  AdminDashboardData,
  ParticipacaoResumo,
  CertificadoResumo,
  MedalhaResumo,
} from '../domain/painelTypes'

export const getParticipantDashboardData =
  async (): Promise<ParticipantDashboardData> => {
    const [participacoesRes, certificadosRes, medalhasRes] = await Promise.all([
      apiClient.get<ParticipacaoResumo[]>('/me/participacoes'),
      apiClient.get<CertificadoResumo[]>('/me/certificados'),
      apiClient.get<MedalhaResumo[]>('/me/medalhas'),
    ])

    return {
      participacoes: Array.isArray(participacoesRes.data)
        ? participacoesRes.data
        : [],
      certificados: Array.isArray(certificadosRes.data)
        ? certificadosRes.data
        : [],
      medalhas: Array.isArray(medalhasRes.data) ? medalhasRes.data : [],
    }
  }

export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
  const response = await apiClient.get<AdminDashboardData>('/admin/inicio')
  const data = response.data

  return {
    eventosAtivos: Number(data.eventosAtivos || 0),
    eventosAtivosNaSemana: Number(data.eventosAtivosNaSemana || 0),
    certificadosUltimos30Dias: Number(data.certificadosUltimos30Dias || 0),
    variacaoCertificadosUltimos30Dias: Number(
      data.variacaoCertificadosUltimos30Dias || 0
    ),
    proximosEventos: Array.isArray(data.proximosEventos)
      ? data.proximosEventos
      : [],
    certificadosPorEvento: Array.isArray(data.certificadosPorEvento)
      ? data.certificadosPorEvento
      : [],
    medalhasPorParticipante: Array.isArray(data.medalhasPorParticipante)
      ? data.medalhasPorParticipante
      : [],
  }
}
