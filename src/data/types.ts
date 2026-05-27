export interface Address {
  id: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento?: string;
}

export interface Local {
  id: string;
  nome: string;
  descricao: string;
  capacidade: number;
  enderecoId: string;
}

export interface Person {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  senha?: string;
  role: 'ADMIN' | 'USER';
}

export interface Student {
  id: string;
  pessoaId: string;
  matricula: string;
  instituicao: string;
}

export interface Professor {
  id: string;
  pessoaId: string;
  areaFormacao: string;
  titulacao: string;
}

export interface Speaker {
  id: string;
  pessoaId: string;
  empresaAtual: string;
  cargo: string;
  resumoProfissional: string;
}

export interface Organizer {
  id: string;
  pessoaId: string;
  instituicao: string;
  cargo: string;
}

export interface Collaborator {
  id: string;
  pessoaId: string;
  funcao: string;
  disponibilidade: string;
  tipo: string;
}

export interface Discipline {
  id: string;
  nome: string;
  descricao: string;
  turno: string;
  professorId: string;
}

export interface Sponsor {
  id: string;
  nome: string;
  site?: string;
}

export type EventStatus = 'EM_ANDAMENTO' | 'FINALIZADO' | 'CANCELADO';
export type EventModality = 'PRESENCIAL' | 'ONLINE' | 'HIBRIDO';

export interface Event {
  id: string;
  tema: string;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  modalidade: EventModality;
  disciplinaId?: string;
  patrocinadorId?: string;
  localId?: string;
  descricao: string;
  status: EventStatus;
  qrCodeUrl?: string;
}

export interface Participation {
  id: string;
  eventoId: string;
  pessoaId: string;
  inscricao: string;
  tipo: 'Aluno' | 'Professor' | 'Palestrante' | 'Organizador' | 'Colaborador';
  presente: boolean;
}

export interface Certificate {
  id: string;
  participacaoId: string;
  dataEmissao: string;
  assinatura: string;
  codigoValidacao: string;
  urlPublica: string;
}

export interface Medal {
  id: string;
  nome: string;
  descricao: string;
  participacaoId: string;
}
