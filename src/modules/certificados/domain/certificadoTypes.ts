export interface EventoResumoCertificado {
  id: number
  tema: string
  dataInicio?: string
  dataFim?: string
  horarioInicio?: string
  horarioFim?: string
  modalidade?: 'ONLINE' | 'PRESENCIAL' | string
  status?: string
  disciplina?: string | null
  local?: string | null
}

export interface CertificadoUsuario {
  id: number
  dataEmissao: string
  assinatura: string | null
  codigoValidacao: string
  urlPublica: string
  caminhoPdf: string
  participacaoId: number
  inscricao: number
  tipoParticipacao: string | null
  evento: EventoResumoCertificado | null
}

export interface ValidacaoCertificadoData {
  certificado: {
    codigoValidacao: string
    dataEmissao: string
    assinatura?: string
    urlPublica: string
    participacao?: {
      tipo?: string
      pessoa?: {
        nome?: string
        email?: string
      }
      evento?: {
        tema?: string
        data?: string
        horarioInicio?: string
        horarioFim?: string
        modalidade?: string
      }
    }
  }
  linkedinUrl?: string
}

/**
 * Gera URL oficial do LinkedIn para adição da certificação com um clique
 */
export function buildLinkedInCertUrl(
  eventName: string,
  codigoValidacao: string,
  dataEmissao?: string
): string {
  let issueYear: number | undefined
  let issueMonth: number | undefined

  if (dataEmissao) {
    const parts = dataEmissao.split('-').map(Number)
    if (parts.length >= 2 && parts[0] && parts[1]) {
      issueYear = parts[0]
      issueMonth = parts[1]
    }
  }

  const certUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/certificados/${codigoValidacao}`
      : `https://muttley.fatec.br/certificados/${codigoValidacao}`

  let url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
    eventName
  )}&organizationName=${encodeURIComponent('FATEC Zona Leste')}&certUrl=${encodeURIComponent(
    certUrl
  )}&certId=${encodeURIComponent(codigoValidacao)}`

  if (issueYear && issueMonth) {
    url += `&issueYear=${issueYear}&issueMonth=${issueMonth}`
  }

  return url
}
