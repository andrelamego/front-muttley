export interface AdminPessoa {
  id: number
  nome: string
  email: string
  telefone?: string
  cpf?: string
  role?: string
}

export interface AdminParticipacaoCertificado {
  tipo?: string
  pessoa?: Pick<AdminPessoa, 'id' | 'nome' | 'email'>
  evento?: { id?: number; tema?: string }
}

export interface AdminCertificado {
  id: number
  dataEmissao?: string
  codigoValidacao?: string
  urlPublica?: string
  caminhoPdf?: string
  participacao?: AdminParticipacaoCertificado
}

export interface AdminEventoPendente {
  id: number
  tema: string
  data?: string
  status?: string
}

export interface AdminCertificatesData {
  certificados: AdminCertificado[]
  ultimosCertificados: AdminCertificado[]
  eventosAguardandoCertificado: AdminEventoPendente[]
}

export interface AdminDisciplina {
  id: number
  nome: string
  descricao?: string
  turno?: string
  professor?: { nome?: string }
}

export interface AdminLocal {
  id: number
  nome: string
  descricao?: string
  capacidade?: number
  endereco?: AdminEndereco
}

export interface AdminPatrocinador {
  id: number
  nome: string
  cnpj?: string
  valorPatrocinio?: number
  email?: string
  telefone?: string
  site?: string
}

export interface AdminEndereco {
  id: number
  estado?: string
  cidade?: string
  bairro?: string
  logradouro?: string
  numero?: string | number
  complemento?: string
}

export interface AdminMedalha {
  id: number
  nome: string
  descricao?: string
  tipo?: string
}

export interface AdminCatalogsData {
  disciplinas: AdminDisciplina[]
  locais: AdminLocal[]
  patrocinadores: AdminPatrocinador[]
  enderecos: AdminEndereco[]
  medalhas: AdminMedalha[]
}

export type AdminCatalogKey = keyof AdminCatalogsData

export const normalizeAdminList = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object' && 'content' in data) {
    const content = (data as { content?: unknown }).content
    return Array.isArray(content) ? (content as T[]) : []
  }
  return []
}

export const formatAdminDate = (value?: string): string => {
  if (!value) return 'Não informada'
  const datePart = value.slice(0, 10)
  const [year, month, day] = datePart.split('-')
  return year && month && day ? `${day}/${month}/${year}` : value
}

export const includesSearch = (
  values: Array<string | number | undefined | null>,
  search: string
): boolean => {
  const term = search.trim().toLocaleLowerCase('pt-BR')
  if (!term) return true
  return values.some((value) =>
    String(value ?? '')
      .toLocaleLowerCase('pt-BR')
      .includes(term)
  )
}
