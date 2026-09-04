import apiClient from '../../../shared/http/apiClient'
import type {
  AdminCatalogsData,
  AdminCertificatesData,
  AdminCertificado,
  AdminDisciplina,
  AdminEndereco,
  AdminEventoPendente,
  AdminLocal,
  AdminMedalha,
  AdminPatrocinador,
  AdminPessoa,
} from '../domain/adminCatalogTypes'
import { normalizeAdminList } from '../domain/adminCatalogTypes'

export async function getAdminCertificatesApi(): Promise<AdminCertificatesData> {
  const response = await apiClient.get<Partial<AdminCertificatesData>>(
    '/admin/certificados'
  )
  const data = response.data || {}
  return {
    certificados: normalizeAdminList<AdminCertificado>(data.certificados),
    ultimosCertificados: normalizeAdminList<AdminCertificado>(
      data.ultimosCertificados
    ),
    eventosAguardandoCertificado: normalizeAdminList<AdminEventoPendente>(
      data.eventosAguardandoCertificado
    ),
  }
}

export async function getAdminPeopleApi(): Promise<AdminPessoa[]> {
  const response = await apiClient.get<unknown>('/admin/pessoas')
  return normalizeAdminList<AdminPessoa>(response.data)
}

export async function getAdminCatalogsApi(): Promise<AdminCatalogsData> {
  const [disciplinas, locais, patrocinadores, enderecos, medalhas] =
    await Promise.all([
      apiClient.get<unknown>('/admin/disciplinas'),
      apiClient.get<unknown>('/admin/locais'),
      apiClient.get<unknown>('/admin/patrocinadores'),
      apiClient.get<unknown>('/admin/enderecos'),
      apiClient.get<unknown>('/admin/medalhas'),
    ])

  return {
    disciplinas: normalizeAdminList<AdminDisciplina>(disciplinas.data),
    locais: normalizeAdminList<AdminLocal>(locais.data),
    patrocinadores: normalizeAdminList<AdminPatrocinador>(patrocinadores.data),
    enderecos: normalizeAdminList<AdminEndereco>(enderecos.data),
    medalhas: normalizeAdminList<AdminMedalha>(medalhas.data),
  }
}
