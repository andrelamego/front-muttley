import apiClient from '../../../shared/http/apiClient'
import type {
  CertificadoUsuario,
  ValidacaoCertificadoData,
} from '../domain/certificadoTypes'

export async function getMeCertificadosApi(): Promise<CertificadoUsuario[]> {
  const response = await apiClient.get<CertificadoUsuario[]>('/me/certificados')
  return response.data
}

export async function getCertificadoPublicoApi(
  codigo: string
): Promise<ValidacaoCertificadoData> {
  const response = await apiClient.get<ValidacaoCertificadoData>(
    `/certificados/${encodeURIComponent(codigo)}`
  )
  return response.data
}

export async function downloadCertificadoPdfApi(codigo: string): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    `/certificados/${encodeURIComponent(codigo)}/download`,
    {
      responseType: 'blob',
    }
  )
  return response.data
}
