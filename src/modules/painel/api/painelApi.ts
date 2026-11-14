import apiClient from '../../../shared/http/apiClient'
import type {
  ParticipantDashboardData,
  AdminDashboardData,
  ParticipacaoResumo,
  CertificadoResumo,
} from '../domain/painelTypes'
import { getMinhasConquistasApi } from '../../medalhas'

export const getParticipantDashboardData =
  async (): Promise<ParticipantDashboardData> => {
    const [participacoesRes, certificadosRes, conquistas] = await Promise.all([
      apiClient.get<ParticipacaoResumo[]>('/me/participacoes'),
      apiClient.get<CertificadoResumo[]>('/me/certificados'),
      // Sem as medalhas o painel ainda funciona; o cartão só deixa de mostrar a meta.
      getMinhasConquistasApi().catch(() => null),
    ])

    return {
      participacoes: Array.isArray(participacoesRes.data)
        ? participacoesRes.data
        : [],
      certificados: Array.isArray(certificadosRes.data)
        ? certificadosRes.data
        : [],
      conquistas,
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
    destaquesSemestre: Array.isArray(data.destaquesSemestre)
      ? data.destaquesSemestre
      : [],
  }
}
