export type TipoMedalha = 'BRONZE' | 'PRATA' | 'OURO'

export interface EventoResumoMedalha {
  id: number
  tema: string
  dataInicio?: string
  dataFim?: string
  modalidade?: string
  status?: string
}

export interface MedalhaUsuario {
  id: number
  nome: string
  descricao: string | null
  tipo: TipoMedalha
  participacaoId: number
  inscricao: number
  tipoParticipacao: string | null
  evento: EventoResumoMedalha | null
}
