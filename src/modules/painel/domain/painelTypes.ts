import type { Conquistas } from '../../medalhas'
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

export interface ParticipantDashboardData {
  participacoes: ParticipacaoResumo[]
  certificados: CertificadoResumo[]
  conquistas: Conquistas | null
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
  /** Quem mais teve presenças no semestre em andamento. */
  destaquesSemestre: { nome: string; presencas: number }[]
  hoje: EventoHoje[]
  semestre: IndicadoresSemestre | null
  semestreAnterior: IndicadoresSemestre | null
  ocupacao: OcupacaoEvento[]
  presencaRecentes: PresencaEvento[]
  serieMensal: MesPainel[]
  porDisciplina: PresencaDisciplina[]
  /** Inscritos pela página pública que ainda não criaram senha. */
  pessoasSemConta: number
}

export interface EventoHoje {
  id: number
  tema: string
  horarioInicio: string
  horarioFim: string
  status: string
  inscritos: number
  presentes: number
}

export interface IndicadoresSemestre {
  /** "2026/2" */
  semestre: string
  eventosRealizados: number
  inscricoes: number
  presentes: number
  /** Presentes sobre inscritos dos eventos já concluídos, em %. */
  taxaPresenca: number
  certificados: number
}

export interface OcupacaoEvento {
  id: number
  tema: string
  data: string
  horarioInicio: string
  inscritos: number
  capacidade: number | null
  /** Inscritos sobre a capacidade, em %; nulo quando o local não tem capacidade. */
  percentual: number | null
}

export interface PresencaEvento {
  id: number
  tema: string
  data: string
  inscritos: number
  presentes: number
  taxa: number
}

export interface MesPainel {
  /** "2026-11" */
  mes: string
  /** "nov" */
  rotulo: string
  presencas: number
  certificados: number
}

export interface PresencaDisciplina {
  disciplina: string
  eventos: number
  presentes: number
}
