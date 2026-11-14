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
import type { TipoCadastro } from '../domain/formularios'
import type { ModeloCertificado } from '../domain/modeloCertificado'

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

type Payload = Record<string, string | number | null>

/** Edita os dados de uma pessoa; sem senha no corpo, a API mantém a atual. */
export async function atualizarPessoaApi(id: number, dados: Payload) {
  await apiClient.put(`/admin/pessoas/${id}`, dados)
}

export async function excluirPessoaApi(id: number) {
  await apiClient.delete(`/admin/pessoas/${id}`)
}

/** Cria (id null) ou atualiza um registro de disciplinas, locais, patrocinadores ou endereços. */
export async function salvarCadastroApi(
  tipo: TipoCadastro,
  id: number | null,
  dados: Payload
) {
  if (id === null) await apiClient.post(`/admin/${tipo}`, dados)
  else await apiClient.put(`/admin/${tipo}/${id}`, dados)
}

export async function excluirCadastroApi(tipo: TipoCadastro, id: number) {
  await apiClient.delete(`/admin/${tipo}/${id}`)
}

export async function getProfessoresApi(): Promise<
  Array<{ id: number; nome: string }>
> {
  const response = await apiClient.get<unknown>('/admin/professores')
  return normalizeAdminList<{ id: number; pessoa?: { nome?: string } }>(
    response.data
  ).map((p) => ({ id: p.id, nome: p.pessoa?.nome ?? `Professor #${p.id}` }))
}

export async function getModeloCertificadoApi(): Promise<ModeloCertificado> {
  const response = await apiClient.get<ModeloCertificado>(
    '/admin/certificados/modelo'
  )
  return response.data
}

export async function salvarModeloCertificadoApi(
  modelo: ModeloCertificado
): Promise<ModeloCertificado> {
  const response = await apiClient.put<ModeloCertificado>(
    '/admin/certificados/modelo',
    modelo
  )
  return response.data
}

/** HTML do certificado com dados de exemplo, montado pelo mesmo template do PDF. */
export async function previaModeloCertificadoApi(
  modelo: ModeloCertificado,
  signal?: AbortSignal
): Promise<string> {
  const response = await apiClient.post<string>(
    '/admin/certificados/modelo/previa',
    modelo,
    { responseType: 'text', signal }
  )
  return response.data
}
