// Mock Database for Muttley Frontend
// Persists in localStorage to simulate backend behavior

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
  professorId: string; // Refers to Professor.id
}

export interface Sponsor {
  id: string;
  nome: string;
  site?: string;
}

export interface Event {
  id: string;
  tema: string;
  data: string; // YYYY-MM-DD
  horarioInicio: string; // HH:MM
  horarioFim: string; // HH:MM
  modalidade: 'PRESENCIAL' | 'ONLINE' | 'HIBRIDO';
  disciplinaId?: string;
  patrocinadorId?: string;
  localId?: string;
  descricao: string;
  status: 'EM_ANDAMENTO' | 'FINALIZADO' | 'CANCELADO';
  qrCodeUrl?: string;
}

export interface Participation {
  id: string;
  eventoId: string;
  pessoaId: string;
  inscricao: string; // numeric code
  tipo: 'Aluno' | 'Professor' | 'Palestrante' | 'Organizador' | 'Colaborador';
  presente: boolean;
}

export interface Certificate {
  id: string;
  participacaoId: string;
  dataEmissao: string; // YYYY-MM-DD
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

// Initial Data Helper
const INITIAL_ADDRESSES: Address[] = [
  { id: 'addr-1', logradouro: 'Av. Águia de Haia', numero: '2683', bairro: 'Cidade Antônio Estêvão de Carvalho', cidade: 'São Paulo', estado: 'SP', complemento: 'FATEC Zona Leste' },
  { id: 'addr-2', logradouro: 'Rua das Flores', numero: '120', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP' },
];

const INITIAL_LOCAIS: Local[] = [
  { id: 'loc-1', nome: 'Auditório Principal', descricao: 'Espaço climatizado para palestras e painéis', capacidade: 120, enderecoId: 'addr-1' },
  { id: 'loc-2', nome: 'Laboratório 3', descricao: 'Laboratório de informática de alta performance', capacidade: 40, enderecoId: 'addr-1' },
];

const INITIAL_PEOPLE: Person[] = [
  { id: 'usr-1', nome: 'Luciano de Souza', email: 'luciano.souza@fatec.sp.gov.br', telefone: '(11) 98765-4321', cpf: '123.456.789-00', senha: '123', role: 'ADMIN' },
  { id: 'usr-2', nome: 'Ana Paula Costa', email: 'ana.costa@fatec.sp.gov.br', telefone: '(11) 91234-5678', cpf: '111.222.333-44', senha: '123', role: 'USER' },
  { id: 'usr-3', nome: 'Gabriel Silva Rodrigues', email: 'gabriel.rodrigues@fatec.sp.gov.br', telefone: '(11) 97777-6666', cpf: '222.333.444-55', senha: '123', role: 'USER' },
  { id: 'usr-4', nome: 'Prof. Carlos Alberto', email: 'carlos.alberto@fatec.sp.gov.br', telefone: '(11) 98888-8888', cpf: '333.444.555-66', senha: '123', role: 'USER' },
  { id: 'usr-5', nome: 'Beatriz Martinez', email: 'beatriz.m@inovatech.com', telefone: '(11) 99999-1111', cpf: '444.555.666-77', senha: '123', role: 'USER' },
  { id: 'usr-6', nome: 'Dra. Sandra Regina', email: 'sandra.regina@fatec.sp.gov.br', telefone: '(11) 95555-4444', cpf: '555.666.777-88', senha: '123', role: 'USER' },
  { id: 'usr-7', nome: 'Marcos Vinicius', email: 'marcos.vini@fatec.sp.gov.br', telefone: '(11) 96666-5555', cpf: '666.777.888-99', senha: '123', role: 'USER' },
  { id: 'usr-8', nome: 'Felipe Lima', email: 'felipe.lima@fatec.sp.gov.br', telefone: '(11) 95555-2222', cpf: '777.888.999-00', senha: '123', role: 'USER' },
  { id: 'usr-9', nome: 'Mariana Costa', email: 'mariana.costa@fatec.sp.gov.br', telefone: '(11) 94444-3333', cpf: '888.999.000-11', senha: '123', role: 'USER' },
  { id: 'usr-10', nome: 'Prof. Reinaldo Silva', email: 'reinaldo.silva@fatec.sp.gov.br', telefone: '(11) 92222-1111', cpf: '999.000.111-22', senha: '123', role: 'USER' },
  { id: 'usr-11', nome: 'Guilherme Azevedo', email: 'g.azevedo@gmail.com', telefone: '(11) 91111-0000', cpf: '123.123.123-12', senha: '123', role: 'USER' },
  { id: 'usr-12', nome: 'Patricia Cruz', email: 'patricia.cruz@fatec.sp.gov.br', telefone: '(11) 90000-9999', cpf: '321.321.321-32', senha: '123', role: 'USER' },
];

const INITIAL_STUDENTS: Student[] = [
  { id: 'std-1', pessoaId: 'usr-2', matricula: '2026001', instituicao: 'FATEC Zona Leste' },
  { id: 'std-2', pessoaId: 'usr-3', matricula: '2026002', instituicao: 'FATEC Zona Leste' },
  { id: 'std-3', pessoaId: 'usr-8', matricula: '2026003', instituicao: 'FATEC Zona Leste' },
  { id: 'std-4', pessoaId: 'usr-9', matricula: '2026004', instituicao: 'FATEC Zona Leste' },
];

const INITIAL_PROFESSORS: Professor[] = [
  { id: 'prf-1', pessoaId: 'usr-4', areaFormacao: 'Engenharia de Software', titulacao: 'Mestre' },
  { id: 'prf-2', pessoaId: 'usr-10', areaFormacao: 'Banco de Dados', titulacao: 'Doutor' },
];

const INITIAL_SPEAKERS: Speaker[] = [
  { id: 'spk-1', pessoaId: 'usr-5', empresaAtual: 'InovaTech Solutions', cargo: 'Tech Lead Security', resumoProfissional: 'Especialista em segurança cibernética com mais de 10 anos de experiência.' },
  { id: 'spk-2', pessoaId: 'usr-11', empresaAtual: 'Google Cloud', cargo: 'Solutions Architect', resumoProfissional: 'Especialista em computação em nuvem e arquiteturas distribuídas escaláveis.' },
];

const INITIAL_ORGANIZERS: Organizer[] = [
  { id: 'org-1', pessoaId: 'usr-6', instituicao: 'FATEC Zona Leste', cargo: 'Coordenadora de Curso' },
];

const INITIAL_COLABORADORES: Collaborator[] = [
  { id: 'col-1', pessoaId: 'usr-7', funcao: 'Apoio logístico e credenciamento', disponibilidade: 'Noite', tipo: 'Voluntário' },
  { id: 'col-2', pessoaId: 'usr-12', funcao: 'Recepção e confecção de crachás', disponibilidade: 'Matutino', tipo: 'Voluntário' },
];

const INITIAL_SPONSORS: Sponsor[] = [
  { id: 'spn-1', nome: 'InovaTech', site: 'https://inovatech.com' },
  { id: 'spn-2', nome: 'FATEC ZL Labs', site: 'https://fateczl.edu.br' },
  { id: 'spn-3', nome: 'GitHub', site: 'https://github.com' },
  { id: 'spn-4', nome: 'Google Cloud', site: 'https://cloud.google.com' },
];

const INITIAL_DISCIPLINES: Discipline[] = [
  { id: 'disc-1', nome: 'Laboratório de Engenharia de Software', descricao: 'Práticas modernas de desenvolvimento ágil e engenharia de software.', turno: 'Noturno', professorId: 'prf-1' },
  { id: 'disc-2', nome: 'Segurança de Sistemas', descricao: 'Criptografia, análise de vulnerabilidades e segurança cibernética corporativa.', turno: 'Noturno', professorId: 'prf-1' },
  { id: 'disc-3', nome: 'Administração de Banco de Dados', descricao: 'Modelagem, tuning, otimização de queries e bancos distribuídos.', turno: 'Noturno', professorId: 'prf-2' },
  { id: 'disc-4', nome: 'Arquitetura de Nuvem', descricao: 'Provisionamento de infraestrutura serverless e contêineres.', turno: 'Matutino', professorId: 'prf-2' },
];

const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt-1',
    tema: 'Inteligência Cibernética em Tempos de Guerra Híbrida',
    data: '2026-03-30',
    horarioInicio: '19:00',
    horarioFim: '21:00',
    modalidade: 'PRESENCIAL',
    disciplinaId: 'disc-2',
    patrocinadorId: 'spn-1',
    localId: 'loc-1',
    descricao: 'Palestra técnica abordando os aspectos da cibersegurança nos conflitos globais geopolíticos e defesa em rede.',
    status: 'FINALIZADO',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=muttley-evt-1',
  },
  {
    id: 'evt-2',
    tema: 'Workshop DevOps: CI/CD com GitHub Actions e Docker',
    data: '2026-05-30',
    horarioInicio: '08:00',
    horarioFim: '12:00',
    modalidade: 'PRESENCIAL',
    disciplinaId: 'disc-1',
    patrocinadorId: 'spn-2',
    localId: 'loc-2',
    descricao: 'Hands-on focado em criar pipelines modernas de automação e contêineres.',
    status: 'EM_ANDAMENTO',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=muttley-evt-2',
  },
  {
    id: 'evt-3',
    tema: 'Simpósio de Inteligência Artificial e Modelos de Linguagem',
    data: '2026-06-15',
    horarioInicio: '19:30',
    horarioFim: '22:00',
    modalidade: 'HIBRIDO',
    disciplinaId: 'disc-1',
    patrocinadorId: 'spn-1',
    localId: 'loc-1',
    descricao: 'Grande simpósio discutindo as fronteiras dos LLMs e agentes cognitivos.',
    status: 'EM_ANDAMENTO',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=muttley-evt-3',
  },
  {
    id: 'evt-4',
    tema: 'Palestra: Tendências de Bancos de Dados NoSQL e NewSQL',
    data: '2026-04-10',
    horarioInicio: '19:00',
    horarioFim: '20:30',
    modalidade: 'HIBRIDO',
    disciplinaId: 'disc-3',
    patrocinadorId: 'spn-1',
    localId: 'loc-1',
    descricao: 'Uma visão aprofundada nos modernos motores de persistência distribuída.',
    status: 'FINALIZADO',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=muttley-evt-4',
  },
  {
    id: 'evt-5',
    tema: 'Workshop: Cloud Migration com GCP e Kubernetes',
    data: '2026-05-15',
    horarioInicio: '09:00',
    horarioFim: '13:00',
    modalidade: 'PRESENCIAL',
    disciplinaId: 'disc-4',
    patrocinadorId: 'spn-4',
    localId: 'loc-2',
    descricao: 'Migração prática de uma aplicação Java Spring para o Google Kubernetes Engine.',
    status: 'FINALIZADO',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=muttley-evt-5',
  },
  {
    id: 'evt-6',
    tema: 'Hackathon FATEC ZL 2026',
    data: '2026-07-04',
    horarioInicio: '08:00',
    horarioFim: '22:00',
    modalidade: 'PRESENCIAL',
    disciplinaId: 'disc-1',
    patrocinadorId: 'spn-3',
    localId: 'loc-1',
    descricao: 'Grande maratona de programação voltada a resolver desafios de mobilidade urbana na Zona Leste.',
    status: 'EM_ANDAMENTO',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=muttley-evt-6',
  },
];

const INITIAL_PARTICIPATIONS: Participation[] = [
  { id: 'part-1', eventoId: 'evt-1', pessoaId: 'usr-3', inscricao: '1001', tipo: 'Aluno', presente: true },
  { id: 'part-2', eventoId: 'evt-1', pessoaId: 'usr-5', inscricao: '1002', tipo: 'Palestrante', presente: true },
  { id: 'part-3', eventoId: 'evt-1', pessoaId: 'usr-4', inscricao: '1003', tipo: 'Professor', presente: true },
  { id: 'part-4', eventoId: 'evt-2', pessoaId: 'usr-2', inscricao: '2001', tipo: 'Aluno', presente: false },
  { id: 'part-5', eventoId: 'evt-2', pessoaId: 'usr-3', inscricao: '2002', tipo: 'Aluno', presente: false },
  { id: 'part-6', eventoId: 'evt-3', pessoaId: 'usr-2', inscricao: '3001', tipo: 'Aluno', presente: false },
  { id: 'part-7', eventoId: 'evt-4', pessoaId: 'usr-2', inscricao: '4001', tipo: 'Aluno', presente: true },
  { id: 'part-8', eventoId: 'evt-4', pessoaId: 'usr-3', inscricao: '4002', tipo: 'Aluno', presente: true },
  { id: 'part-9', eventoId: 'evt-5', pessoaId: 'usr-8', inscricao: '5001', tipo: 'Aluno', presente: true },
  { id: 'part-10', eventoId: 'evt-5', pessoaId: 'usr-9', inscricao: '5002', tipo: 'Aluno', presente: true },
  { id: 'part-11', eventoId: 'evt-5', pessoaId: 'usr-11', inscricao: '5003', tipo: 'Palestrante', presente: true },
  { id: 'part-12', eventoId: 'evt-6', pessoaId: 'usr-2', inscricao: '6001', tipo: 'Aluno', presente: false },
  { id: 'part-13', eventoId: 'evt-6', pessoaId: 'usr-3', inscricao: '6002', tipo: 'Aluno', presente: false },
  { id: 'part-14', eventoId: 'evt-6', pessoaId: 'usr-8', inscricao: '6003', tipo: 'Aluno', presente: false },
  { id: 'part-15', eventoId: 'evt-6', pessoaId: 'usr-9', inscricao: '6004', tipo: 'Aluno', presente: false },
];

const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-1',
    participacaoId: 'part-1',
    dataEmissao: '2026-03-30',
    assinatura: 'Luciano_de_Souza_ADSFatecZL',
    codigoValidacao: 'MUTE-928A-817B',
    urlPublica: '/certificados/MUTE-928A-817B',
  },
  {
    id: 'cert-2',
    participacaoId: 'part-2',
    dataEmissao: '2026-03-30',
    assinatura: 'Sandra_Regina_CoordADSFatecZL',
    codigoValidacao: 'MUTE-118F-992D',
    urlPublica: '/certificados/MUTE-118F-992D',
  },
  {
    id: 'cert-3',
    participacaoId: 'part-7',
    dataEmissao: '2026-04-10',
    assinatura: 'Luciano_de_Souza_ADSFatecZL',
    codigoValidacao: 'MUTE-4567-EFGH',
    urlPublica: '/certificados/MUTE-4567-EFGH',
  },
  {
    id: 'cert-4',
    participacaoId: 'part-8',
    dataEmissao: '2026-04-10',
    assinatura: 'Luciano_de_Souza_ADSFatecZL',
    codigoValidacao: 'MUTE-8901-IJKL',
    urlPublica: '/certificados/MUTE-8901-IJKL',
  },
  {
    id: 'cert-5',
    participacaoId: 'part-9',
    dataEmissao: '2026-05-15',
    assinatura: 'Luciano_de_Souza_ADSFatecZL',
    codigoValidacao: 'MUTE-2345-MNOP',
    urlPublica: '/certificados/MUTE-2345-MNOP',
  },
  {
    id: 'cert-6',
    participacaoId: 'part-10',
    dataEmissao: '2026-05-15',
    assinatura: 'Luciano_de_Souza_ADSFatecZL',
    codigoValidacao: 'MUTE-6789-QRST',
    urlPublica: '/certificados/MUTE-6789-QRST',
  },
  {
    id: 'cert-7',
    participacaoId: 'part-11',
    dataEmissao: '2026-05-15',
    assinatura: 'Sandra_Regina_CoordADSFatecZL',
    codigoValidacao: 'MUTE-9999-ABCD',
    urlPublica: '/certificados/MUTE-9999-ABCD',
  },
];

const INITIAL_MEDALS: Medal[] = [
  { id: 'med-1', nome: 'Destaque Cybersecurity', descricao: 'Medalha de ouro concedida por demonstrar alta excelência técnica no evento de Inteligência Cibernética.', participacaoId: 'part-1' },
  { id: 'med-2', nome: 'Melhor Solution Architect', descricao: 'Medalha concedida pela Google Cloud por excelente desempenho arquitetural no workshop Cloud Migration.', participacaoId: 'part-9' },
  { id: 'med-3', nome: 'Destaque Banco de Dados', descricao: 'Medalha concedida por melhor projeto de modelagem NewSQL no simpósio de Bancos de Dados.', participacaoId: 'part-8' },
  { id: 'med-4', nome: 'Destaque Modelagem NoSQL', descricao: 'Concedida por excelente participação e resolução prática de desafios de modelagem e persistência de dados distribuídos.', participacaoId: 'part-7' },
];

// Helper database manager class
class MockDatabase {
  constructor() {
    const version = localStorage.getItem('muttley_db_version');
    if (version !== 'v3') {
      // Clear old muttley keys
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('muttley_')) {
          localStorage.removeItem(key);
        }
      }
      localStorage.setItem('muttley_db_version', 'v3');
    }
  }

  private get<T>(key: string, initial: T[]): T[] {
    const data = localStorage.getItem(`muttley_${key}`);
    if (!data) {
      localStorage.setItem(`muttley_${key}`, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  }

  private save<T>(key: string, data: T[]): void {
    localStorage.setItem(`muttley_${key}`, JSON.stringify(data));
  }

  // Addresses
  getAddresses(): Address[] { return this.get('addresses', INITIAL_ADDRESSES); }
  saveAddresses(data: Address[]) { this.save('addresses', data); }

  // Locais
  getLocais(): Local[] { return this.get('locais', INITIAL_LOCAIS); }
  saveLocais(data: Local[]) { this.save('locais', data); }

  // People
  getPeople(): Person[] { return this.get('people', INITIAL_PEOPLE); }
  savePeople(data: Person[]) { this.save('people', data); }

  // Students
  getStudents(): Student[] { return this.get('students', INITIAL_STUDENTS); }
  saveStudents(data: Student[]) { this.save('students', data); }

  // Professors
  getProfessors(): Professor[] { return this.get('professors', INITIAL_PROFESSORS); }
  saveProfessors(data: Professor[]) { this.save('professors', data); }

  // Speakers
  getSpeakers(): Speaker[] { return this.get('speakers', INITIAL_SPEAKERS); }
  saveSpeakers(data: Speaker[]) { this.save('speakers', data); }

  // Organizers
  getOrganizers(): Organizer[] { return this.get('organizers', INITIAL_ORGANIZERS); }
  saveOrganizers(data: Organizer[]) { this.save('organizers', data); }

  // Collaborators
  getCollaborators(): Collaborator[] { return this.get('collaborators', INITIAL_COLABORADORES); }
  saveCollaborators(data: Collaborator[]) { this.save('collaborators', data); }

  // Sponsors
  getSponsors(): Sponsor[] { return this.get('sponsors', INITIAL_SPONSORS); }
  saveSponsors(data: Sponsor[]) { this.save('sponsors', data); }

  // Disciplines
  getDisciplines(): Discipline[] { return this.get('disciplines', INITIAL_DISCIPLINES); }
  saveDisciplines(data: Discipline[]) { this.save('disciplines', data); }

  // Events
  getEvents(): Event[] { return this.get('events', INITIAL_EVENTS); }
  saveEvents(data: Event[]) { this.save('events', data); }

  // Participations
  getParticipations(): Participation[] { return this.get('participations', INITIAL_PARTICIPATIONS); }
  saveParticipations(data: Participation[]) { this.save('participations', data); }

  // Certificates
  getCertificates(): Certificate[] { return this.get('certificates', INITIAL_CERTIFICATES); }
  saveCertificates(data: Certificate[]) { this.save('certificates', data); }

  // Medals
  getMedals(): Medal[] { return this.get('medals', INITIAL_MEDALS); }
  saveMedals(data: Medal[]) { this.save('medals', data); }

  // Current Logged User (Admin)
  getLoggedUser(): Person | null {
    const user = localStorage.getItem('muttley_logged_user');
    if (!user) {
      // Default to Luciano (Admin) for instant dashboard review
      const luciano = this.getPeople().find(p => p.role === 'ADMIN');
      if (luciano) {
        this.setLoggedUser(luciano);
        return luciano;
      }
      return null;
    }
    return JSON.parse(user);
  }
  setLoggedUser(user: Person | null) {
    if (user) {
      localStorage.setItem('muttley_logged_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('muttley_logged_user');
    }
  }
}

export const db = new MockDatabase();
export default db;
