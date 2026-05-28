import apiClient from '../services/apiClient';
import type {
  Aluno,
  Certificado,
  Colaborador,
  Disciplina,
  Endereco,
  Evento,
  Local,
  Medalha,
  Organizador,
  Participacao,
  Patrocinador,
  Palestrante,
  Pessoa,
  Professor,
} from './types';

type Entity = Record<string, any>;

const toId = (value: unknown) => (value === null || value === undefined ? '' : String(value));
const entityId = (value: Entity | null | undefined, nestedKey?: string) =>
  toId(nestedKey ? value?.[nestedKey]?.id : value?.id);

const pageContent = <T>(data: T[] | { content?: T[] }) => (Array.isArray(data) ? data : data.content || []);

const normalizePerson = (person: Entity): Pessoa => ({
  id: toId(person.id),
  nome: person.nome || '',
  email: person.email || '',
  telefone: person.telefone || '',
  cpf: person.cpf || '',
  senha: person.senha,
  role: person.cpf === '123.456.789-00' ? 'ADMIN' : 'USER',
  aluno: person.aluno ? normalizeProfile<Aluno>(person.aluno, {
    matricula: person.aluno.matricula || '',
    instituicao: person.aluno.instituicao || '',
  }) : null,
  professor: person.professor ? normalizeProfile<Professor>(person.professor, {
    areaFormacao: person.professor.areaFormacao || '',
    titulacao: person.professor.titulacao || '',
  }) : null,
  palestrante: person.palestrante ? normalizeProfile<Palestrante>(person.palestrante, {
    empresaAtual: person.palestrante.empresaAtual || '',
    cargo: person.palestrante.cargo || '',
    resumoProfissional: person.palestrante.resumoProfissional || '',
  }) : null,
  organizador: person.organizador ? normalizeProfile<Organizador>(person.organizador, {
    instituicao: person.organizador.instituicao || '',
    cargo: person.organizador.cargo || '',
  }) : null,
  colaborador: person.colaborador ? normalizeProfile<Colaborador>(person.colaborador, {
    funcao: person.colaborador.funcao || '',
    disponibilidade: person.colaborador.disponibilidade || '',
    tipo: person.colaborador.tipo || '',
  }) : null,
});

const normalizeAddress = (address: Entity): Endereco => ({
  id: toId(address.id),
  estado: address.estado || '',
  cidade: address.cidade || '',
  bairro: address.bairro || '',
  logradouro: address.logradouro || '',
  numero: toId(address.numero),
  complemento: address.complemento || '',
});

const normalizeLocal = (local: Entity): Local => ({
  id: toId(local.id),
  nome: local.nome || '',
  descricao: local.descricao || '',
  capacidade: Number(local.capacidade || 0),
  enderecoId: entityId(local, 'endereco') || toId(local.enderecoId),
});

const normalizeDiscipline = (discipline: Entity): Disciplina => ({
  id: toId(discipline.id),
  nome: discipline.nome || '',
  descricao: discipline.descricao || '',
  turno: discipline.turno || '',
  professorId: entityId(discipline, 'professor') || toId(discipline.id_professor ?? discipline.professorId),
});

const normalizeSponsor = (sponsor: Entity): Patrocinador => ({
  id: toId(sponsor.id),
  nome: sponsor.nome || '',
  site: sponsor.site || '',
});

const normalizeEvent = (event: Entity): Evento => ({
  id: toId(event.id),
  tema: event.tema || '',
  data: event.data || '',
  horarioInicio: event.horarioInicio || '',
  horarioFim: event.horarioFim || '',
  modalidade: event.modalidade || 'PRESENCIAL',
  disciplinaId: entityId(event, 'disciplina') || toId(event.disciplinaId),
  patrocinadorId: entityId(event, 'patrocinador') || toId(event.patrocinadorId),
  localId: entityId(event, 'local') || toId(event.localId),
  descricao: event.descricao || '',
  status: event.status || 'CRIADO',
  qrCodeUrl: event.qrCodeUrl || '',
});

const normalizeParticipation = (participation: Entity): Participacao => ({
  id: toId(participation.id),
  eventoId: entityId(participation, 'evento') || toId(participation.eventoId),
  pessoaId: entityId(participation, 'pessoa') || toId(participation.pessoaId),
  inscricao: toId(participation.inscricao),
  tipo: participation.tipo || 'Aluno',
  presente: Boolean(participation.presente ?? participation.certificado),
  pessoa: participation.pessoa ? normalizePerson(participation.pessoa) : null,
});

const normalizeCertificate = (certificate: Entity): Certificado => ({
  id: toId(certificate.id),
  participacaoId: entityId(certificate, 'participacao') || toId(certificate.participacaoId),
  dataEmissao: certificate.dataEmissao || '',
  assinatura: certificate.assinatura || 'Coordenacao FATEC',
  codigoValidacao: certificate.codigoValidacao || '',
  urlPublica: certificate.urlPublica || `/certificados/${certificate.codigoValidacao || ''}`,
});

const normalizeMedal = (medal: Entity): Medalha => ({
  id: toId(medal.id),
  nome: medal.nome || '',
  descricao: medal.descricao || '',
  participacaoId: entityId(medal, 'participacao') || toId(medal.participacaoId),
});

const normalizeProfile = <T extends { pessoaId: string }>(item: Entity, extra: Omit<T, 'id' | 'pessoaId'>): T => ({
  id: toId(item.id),
  pessoaId: entityId(item, 'pessoa') || toId(item.pessoaId),
  ...extra,
} as unknown as T);

class ApiDatabase {
  getLoggedUser(): Pessoa | null {
    const usuario = localStorage.getItem('usuario');
    const role = localStorage.getItem('role') as Pessoa['role'] | null;

    if (usuario) {
      const parsed = JSON.parse(usuario);
      if (typeof parsed === 'string') {
        return {
          id: '',
          nome: parsed,
          email: '',
          telefone: '',
          cpf: '',
          senha: null,
          role: role || 'USER',
        };
      }

      return {
        id: toId(parsed.id),
        nome: parsed.nome || parsed.name || parsed.email || 'Usuário',
        email: parsed.email || '',
        telefone: parsed.telefone || '',
        cpf: parsed.cpf || '',
        senha: null,
        role: (parsed.role || role || 'USER') as Pessoa['role'],
      };
    }

    const legacyUser = localStorage.getItem('muttley_logged_user');
    return legacyUser ? JSON.parse(legacyUser) : null;
  }

  setLoggedUser(user: Pessoa | null) {
    if (user) {
      localStorage.setItem('usuario', JSON.stringify(user));
      localStorage.setItem('role', user.role);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('usuario');
      localStorage.removeItem('muttley_logged_user');
    }
  }

  async getAddresses(): Promise<Endereco[]> {
    const response = await apiClient.get('/admin/enderecos');
    return response.data.map(normalizeAddress);
  }

  async saveAddress(address: Partial<Endereco>): Promise<void> {
    const payload = {
      id: address.id ? Number(address.id) : null,
      estado: address.estado,
      cidade: address.cidade,
      bairro: address.bairro,
      logradouro: address.logradouro,
      numero: Number(address.numero || 0),
      complemento: address.complemento || '-',
    };

    if (address.id) {
      await apiClient.put(`/admin/enderecos/${address.id}`, payload);
    } else {
      await apiClient.post('/admin/enderecos', payload);
    }
  }

  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete(`/admin/enderecos/${id}`);
  }

  async getLocais(): Promise<Local[]> {
    const response = await apiClient.get('/admin/locais');
    return response.data.map(normalizeLocal);
  }

  async saveLocal(local: Partial<Local>): Promise<void> {
    const payload = {
      id: local.id ? Number(local.id) : null,
      nome: local.nome,
      descricao: local.descricao || '-',
      capacidade: Number(local.capacidade || 0),
      enderecoId: Number(local.enderecoId),
    };

    if (local.id) {
      await apiClient.put(`/admin/locais/${local.id}`, payload);
    } else {
      await apiClient.post('/admin/locais', payload);
    }
  }

  async deleteLocal(id: string): Promise<void> {
    await apiClient.delete(`/admin/locais/${id}`);
  }

  async getPeople(): Promise<Pessoa[]> {
    const response = await apiClient.get('/admin/pessoas');
    return response.data.map(normalizePerson);
  }

  async getStudents(): Promise<Aluno[]> {
    const response = await apiClient.get('/admin/alunos');
    return response.data.map((item: Entity) =>
      normalizeProfile<Aluno>(item, {
        matricula: item.matricula || '',
        instituicao: item.instituicao || '',
      }),
    );
  }

  async getProfessors(): Promise<Professor[]> {
    const response = await apiClient.get('/admin/professores');
    return response.data.map((item: Entity) =>
      normalizeProfile<Professor>(item, {
        areaFormacao: item.areaFormacao || '',
        titulacao: item.titulacao || '',
      }),
    );
  }

  async getSpeakers(): Promise<Palestrante[]> {
    const response = await apiClient.get('/admin/palestrantes');
    return response.data.map((item: Entity) =>
      normalizeProfile<Palestrante>(item, {
        empresaAtual: item.empresaAtual || '',
        cargo: item.cargo || '',
        resumoProfissional: item.resumoProfissional || '',
      }),
    );
  }

  async getOrganizers(): Promise<Organizador[]> {
    const response = await apiClient.get('/admin/organizadores');
    return response.data.map((item: Entity) =>
      normalizeProfile<Organizador>(item, {
        instituicao: item.instituicao || '',
        cargo: item.cargo || '',
      }),
    );
  }

  async getCollaborators(): Promise<Colaborador[]> {
    const response = await apiClient.get('/admin/colaboradores');
    return response.data.map((item: Entity) =>
      normalizeProfile<Colaborador>(item, {
        funcao: item.funcao || '',
        disponibilidade: item.disponibilidade || '',
        tipo: item.tipo || '',
      }),
    );
  }

  async getSponsors(): Promise<Patrocinador[]> {
    const response = await apiClient.get('/admin/patrocinadores');
    return response.data.map(normalizeSponsor);
  }

  async getDisciplines(): Promise<Disciplina[]> {
    const response = await apiClient.get('/admin/disciplinas');
    return response.data.map(normalizeDiscipline);
  }

  async saveDiscipline(discipline: Partial<Disciplina>): Promise<void> {
    const payload = {
      id: discipline.id ? Number(discipline.id) : null,
      nome: discipline.nome,
      descricao: discipline.descricao || '-',
      turno: discipline.turno,
      id_professor: discipline.professorId ? Number(discipline.professorId) : null,
    };

    if (discipline.id) {
      await apiClient.put(`/admin/disciplinas/${discipline.id}`, payload);
    } else {
      await apiClient.post('/admin/disciplinas', payload);
    }
  }

  async deleteDiscipline(id: string): Promise<void> {
    await apiClient.delete(`/admin/disciplinas/${id}`);
  }

  async getEvents(): Promise<Evento[]> {
    const response = await apiClient.get('/admin/eventos', {
      params: { tamanho: 1000, ordenar: 'data' },
    });
    return pageContent<Entity>(response.data).map(normalizeEvent);
  }

  async getEventById(id: string): Promise<Evento | null> {
    const response = await apiClient.get(`/admin/eventos/${id}`);
    return normalizeEvent(response.data);
  }

  async saveEvent(event: Partial<Evento>): Promise<void> {
    const payload = {
      id: event.id ? Number(event.id) : null,
      tema: event.tema,
      descricao: event.descricao || '-',
      data: event.data,
      horarioInicio: event.horarioInicio,
      horarioFim: event.horarioFim,
      modalidade: event.modalidade === 'HIBRIDO' ? 'ONLINE' : event.modalidade,
      disciplinaId: event.disciplinaId ? Number(event.disciplinaId) : null,
      patrocinadorId: event.patrocinadorId ? Number(event.patrocinadorId) : null,
      localId: event.localId ? Number(event.localId) : null,
    };

    if (event.id) {
      await apiClient.put(`/admin/eventos/${event.id}`, payload);
    } else {
      await apiClient.post('/admin/eventos', payload);
    }
  }

  async cancelEvent(id: string): Promise<void> {
    await apiClient.delete(`/admin/eventos/${id}`);
  }

  async getParticipations(): Promise<Participacao[]> {
    const response = await apiClient.get('/participacoes');
    return response.data.map(normalizeParticipation);
  }

  async getEventParticipations(id: string): Promise<Participacao[]> {
    const response = await apiClient.get(`/admin/eventos/${id}/participacoes`);
    return (response.data.participacoes || []).map(normalizeParticipation);
  }

  async saveParticipation(participation: Partial<Participacao>): Promise<void> {
    const existing = await this.getParticipations();
    const nextInscricao = Math.max(1000, ...existing.map((item) => Number(item.inscricao) || 0)) + 1;
    const payload = {
      id: participation.id ? Number(participation.id) : null,
      inscricao: participation.inscricao ? Number(participation.inscricao) : nextInscricao,
      tipo: participation.tipo || 'Aluno',
      pessoaId: Number(participation.pessoaId),
      eventoId: Number(participation.eventoId),
    };

    if (participation.id) {
      await apiClient.put(`/participacoes/${participation.id}`, payload);
    } else {
      await apiClient.post('/participacoes', payload);
    }
  }

  async concludeEvent(eventId: string, presentes: string[]): Promise<{
    message: string;
    certificadosGerados: number;
    codigosValidacao: string[];
  }> {
    const response = await apiClient.post(
      `/admin/eventos/${eventId}/concluir`,
      presentes.map((id) => Number(id)),
    );
    return response.data;
  }

  async getCertificates(): Promise<Certificado[]> {
    const response = await apiClient.get('/admin/certificados');
    return (response.data.certificados || []).map(normalizeCertificate);
  }

  async getCertificateByCode(code: string): Promise<{
    certificado: Certificado;
    linkedinUrl: string;
    raw: Entity;
  }> {
    const response = await apiClient.get(`/certificados/${code}`);
    const raw = response.data.certificado;
    return {
      certificado: normalizeCertificate(raw),
      linkedinUrl: response.data.linkedinUrl || '',
      raw,
    };
  }

  async getMedals(): Promise<Medalha[]> {
    const response = await apiClient.get('/admin/medalhas');
    return response.data.map(normalizeMedal);
  }

  async saveMedal(medal: Partial<Medalha>): Promise<void> {
    const payload = {
      id: medal.id ? Number(medal.id) : null,
      nome: medal.nome,
      descricao: medal.descricao,
      participacaoId: Number(medal.participacaoId),
    };

    if (medal.id) {
      await apiClient.put(`/admin/medalhas/${medal.id}`, payload);
    } else {
      await apiClient.post('/admin/medalhas', payload);
    }
  }

  async deleteMedal(id: string): Promise<void> {
    await apiClient.delete(`/admin/medalhas/${id}`);
  }
}

export const db = new ApiDatabase();
export default db;
