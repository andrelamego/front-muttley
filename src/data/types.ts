export interface Endereco {
  id: string
  logradouro: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  complemento?: string
}

export interface Local {
  id: string
  nome: string
  descricao: string
  capacidade: number
  enderecoId: string
  endereco?: Endereco | null
}

export interface Aluno {
  id: string
  pessoaId: string
  matricula: string
  instituicao: string
}

export interface Professor {
  id: string
  pessoaId: string
  areaFormacao: string
  titulacao: string
}

export interface Palestrante {
  id: string
  pessoaId: string
  empresaAtual: string
  cargo: string
  resumoProfissional: string
}

export interface Organizador {
  id: string
  pessoaId: string
  instituicao: string
  cargo: string
}

export interface Colaborador {
  id: string
  pessoaId: string
  funcao: string
  disponibilidade: string
  tipo: string
}

export interface Pessoa {
  id: string
  nome: string
  email: string
  telefone: string
  cpf: string
  senha?: string | null
  role: 'ADMIN' | 'USER'
  aluno?: Aluno | null
  professor?: Professor | null
  palestrante?: Palestrante | null
  organizador?: Organizador | null
  colaborador?: Colaborador | null
}

export interface Disciplina {
  id: string
  nome: string
  descricao: string
  turno: TurnoDisciplina
  professorId: string
  professor?: Professor | null
}

export interface Patrocinador {
  id: string
  nome: string
  site?: string
}

export type StatusEvento =
  | 'CRIADO'
  | 'EM_ANDAMENTO'
  | 'FINALIZADO'
  | 'CANCELADO'
export type ModalidadeEvento = 'PRESENCIAL' | 'ONLINE' | 'HIBRIDO'
export type TurnoDisciplina = 'MATUTINO' | 'VESPERTINO' | 'NOTURNO' | 'INTEGRAL'
export type TipoParticipacao =
  | 'Aluno'
  | 'Professor'
  | 'Palestrante'
  | 'Organizador'
  | 'Colaborador'
export type TipoMedalha = 'BRONZE' | 'PRATA' | 'OURO'

export interface ParticipanteEvento {
  id?: string
  inscricao: string
  pessoaId: string
  tipo: TipoParticipacao
}

export interface Evento {
  id: string
  tema: string
  data: string
  horarioInicio: string
  horarioFim: string
  modalidade: ModalidadeEvento
  disciplinaId?: string
  patrocinadorId?: string
  localId?: string
  descricao: string
  status: StatusEvento
  qrCodeInscricaoUrl?: string
  qrCodeConfirmacaoUrl?: string
  disciplina?: Disciplina | null
  patrocinador?: Patrocinador | null
  local?: Local | null
  participacoes?: ParticipanteEvento[]
}

export interface EventoPublicoResponse {
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

export interface InscricaoPublicaRequest {
  nomeCompleto: string
  cpf: string
  email: string
}

export interface InscricaoPublicaResponse {
  message: string
  participacaoId: number
  inscricao: number
}

export interface MeResponse {
  id: number
  nome: string
  email: string
  telefone: string | null
  cpf: string | null
  role: 'ADMIN' | 'USER' | null
}

export interface EventoResumoUsuarioResponse {
  id: number
  tema: string
  descricao: string | null
  data: string
  horarioInicio: string
  horarioFim: string
  modalidade: 'ONLINE' | 'PRESENCIAL'
  status: 'CRIADO' | 'EM_ANDAMENTO' | 'CANCELADO' | 'FINALIZADO'
  disciplina: string | null
  local: string | null
}

export interface CertificadoUsuarioResponse {
  id: number
  dataEmissao: string
  assinatura: string | null
  codigoValidacao: string
  urlPublica: string
  caminhoPdf: string
  participacaoId: number
  inscricao: number
  tipoParticipacao: string | null
  evento: EventoResumoUsuarioResponse | null
}

export interface MedalhaUsuarioResponse {
  id: number
  nome: string
  descricao: string | null
  tipo: TipoMedalha
  participacaoId: number
  inscricao: number
  tipoParticipacao: string | null
  evento: EventoResumoUsuarioResponse | null
}

export interface ParticipacaoUsuarioResponse {
  id: number
  inscricao: number
  tipo: string | null
  evento: EventoResumoUsuarioResponse | null
}

export interface ParticipacaoComEventoResponse {
  id: number
  inscricao: number
  tipo: string | null
  pessoa: {
    id: number
    nome: string
    email: string
    cpf: string | null
  } | null
  evento: EventoResumoUsuarioResponse | null
}

export interface Participacao {
  id: string
  eventoId: string
  pessoaId: string
  inscricao: string
  tipo: TipoParticipacao
  presente: boolean
  pessoa?: Pessoa | null
  evento?: EventoResumoUsuarioResponse | null
}

export interface Certificado {
  id: string
  participacaoId: string
  dataEmissao: string
  assinatura: string
  codigoValidacao: string
  urlPublica: string
  caminhoPdf?: string
  participacao?: Participacao | null
}

export interface Medalha {
  id: string
  nome: string
  descricao: string
  tipo: TipoMedalha
  participacaoId: string
}

export type Address = Endereco
export type Person = Pessoa
export type Student = Aluno
export type Speaker = Palestrante
export type Organizer = Organizador
export type Collaborator = Colaborador
export type Discipline = Disciplina
export type Sponsor = Patrocinador
export type EventStatus = StatusEvento
export type EventModality = ModalidadeEvento
export type Event = Evento
export type PublicEvent = EventoPublicoResponse
export type Participation = Participacao
export type Certificate = Certificado
export type Medal = Medalha
