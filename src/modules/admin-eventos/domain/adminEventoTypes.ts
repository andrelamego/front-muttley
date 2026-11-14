export type StatusEvento =
  | 'CRIADO'
  | 'EM_ANDAMENTO'
  | 'CANCELADO'
  | 'FINALIZADO'

export type ModalidadeEvento = 'PRESENCIAL' | 'ONLINE' | 'HIBRIDO'

export interface AdminEvento {
  id: number
  tema: string
  descricao: string
  data: string
  horarioInicio: string
  horarioFim: string
  modalidade: ModalidadeEvento
  status: StatusEvento
  disciplinaId: number | null
  patrocinadorId: number | null
  localId: number | null
  disciplina?: { id: number; nome: string } | string | null
  local?: { id: number; nome: string; capacidade?: number } | string | null
  patrocinador?: { id: number; razaoSocial: string } | string | null
  totalInscritos?: number
}

export interface ParticipacaoEventoAdmin {
  id: number
  inscricao: number
  tipo: string
  presente: boolean
  pessoa?: {
    id: number
    nome: string
    email: string
    cpf?: string | null
  } | null
}

export interface SalvarEventoPayload {
  id?: number | null
  tema: string
  descricao: string
  data: string
  horarioInicio: string
  horarioFim: string
  modalidade: ModalidadeEvento
  disciplinaId?: number | null
  patrocinadorId?: number | null
  localId?: number | null
}

export interface ConcluirEventoResponse {
  message: string
  certificadosGerados?: number
  codigosValidacao?: string[]
}

export interface DisciplinaOption {
  id: number
  nome: string
}

export interface LocalOption {
  id: number
  nome: string
  capacidade?: number
}

export interface PatrocinadorOption {
  id: number
  razaoSocial: string
}
