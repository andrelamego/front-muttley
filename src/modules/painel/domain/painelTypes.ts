export interface EventoResumo {
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
}

export interface ParticipacaoResumo {
  id: number
  inscricao: number
  tipo: string | null
  evento: EventoResumo | null
}

export interface CertificadoResumo {
  id: number
  dataEmissao: string
  assinatura: string | null
  codigoValidacao: string
  urlPublica: string
  caminhoPdf: string
  inscricao: number
  tipoParticipacao: string | null
  evento: EventoResumo | null
}

export interface MedalhaResumo {
  id: number
  nome: string
  descricao: string | null
  tipo: 'BRONZE' | 'PRATA' | 'OURO'
  inscricao: number
  evento: EventoResumo | null
}

export interface ParticipantDashboardData {
  participacoes: ParticipacaoResumo[]
  certificados: CertificadoResumo[]
  medalhas: MedalhaResumo[]
}

export interface BarraEstatistica {
  rotulo: string
  total: number
  percentual: number
}

export interface AdminDashboardData {
  eventosAtivos: number
  eventosAtivosNaSemana: number
  certificadosUltimos30Dias: number
  variacaoCertificadosUltimos30Dias: number
  proximosEventos: EventoResumo[]
  certificadosPorEvento: BarraEstatistica[]
  medalhasPorParticipante: BarraEstatistica[]
}
