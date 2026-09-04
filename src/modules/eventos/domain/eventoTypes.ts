export interface EventoPublico {
  id: number
  tema: string
  descricao: string | null
  data: string
  horarioInicio: string
  horarioFim: string
  modalidade: string
  status: string
  disciplina: string | null
  local: string | null
  inscricoesEncerradas: boolean
}

export interface InscricaoPublicaInput {
  nomeCompleto: string
  cpf: string
  email: string
}

export interface InscricaoPublicaResultado {
  message: string
  participacaoId: number
  inscricao: number
}
