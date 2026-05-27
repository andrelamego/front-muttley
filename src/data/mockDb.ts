import apiClient from '../services/apiClient';
import type {
  Address,
  Certificate,
  Collaborator,
  Discipline,
  Event,
  Local,
  Medal,
  Organizer,
  Participation,
  Person,
  Professor,
  Speaker,
  Sponsor,
  Student,
} from './types';

type Entity = Record<string, any>;

const toId = (value: unknown) => (value === null || value === undefined ? '' : String(value));
const entityId = (value: Entity | null | undefined, nestedKey?: string) =>
  toId(value?.id ?? (nestedKey ? value?.[nestedKey]?.id : undefined));

const pageContent = <T>(data: T[] | { content?: T[] }) => (Array.isArray(data) ? data : data.content || []);

const normalizePerson = (person: Entity): Person => ({
  id: toId(person.id),
  nome: person.nome || '',
  email: person.email || '',
  telefone: person.telefone || '',
  cpf: person.cpf || '',
  senha: person.senha,
  role: person.cpf === '123.456.789-00' ? 'ADMIN' : 'USER',
});

const normalizeAddress = (address: Entity): Address => ({
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

const normalizeDiscipline = (discipline: Entity): Discipline => ({
  id: toId(discipline.id),
  nome: discipline.nome || '',
  descricao: discipline.descricao || '',
  turno: discipline.turno || '',
  professorId: entityId(discipline, 'professor') || toId(discipline.id_professor ?? discipline.professorId),
});

const normalizeSponsor = (sponsor: Entity): Sponsor => ({
  id: toId(sponsor.id),
  nome: sponsor.nome || '',
  site: sponsor.site || '',
});

const normalizeEvent = (event: Entity): Event => ({
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
  status: event.status === 'CRIADO' ? 'EM_ANDAMENTO' : event.status || 'EM_ANDAMENTO',
  qrCodeUrl: event.qrCodeUrl || '',
});

const normalizeParticipation = (participation: Entity): Participation => ({
  id: toId(participation.id),
  eventoId: entityId(participation, 'evento') || toId(participation.eventoId),
  pessoaId: entityId(participation, 'pessoa') || toId(participation.pessoaId),
  inscricao: toId(participation.inscricao),
  tipo: participation.tipo || 'Aluno',
  presente: Boolean(participation.presente ?? participation.certificado),
});

const normalizeCertificate = (certificate: Entity): Certificate => ({
  id: toId(certificate.id),
  participacaoId: entityId(certificate, 'participacao') || toId(certificate.participacaoId),
  dataEmissao: certificate.dataEmissao || '',
  assinatura: certificate.assinatura || 'Coordenacao FATEC',
  codigoValidacao: certificate.codigoValidacao || '',
  urlPublica: certificate.urlPublica || `/certificados/${certificate.codigoValidacao || ''}`,
});

const normalizeMedal = (medal: Entity): Medal => ({
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
  getLoggedUser(): Person | null {
    const user = localStorage.getItem('muttley_logged_user');
    return user ? JSON.parse(user) : null;
  }

  setLoggedUser(user: Person | null) {
    if (user) {
      localStorage.setItem('muttley_logged_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('muttley_logged_user');
    }
  }

  async getAddresses(): Promise<Address[]> {
    const response = await apiClient.get('/admin/enderecos');
    return response.data.map(normalizeAddress);
  }

  async saveAddress(address: Partial<Address>): Promise<void> {
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

  async getPeople(): Promise<Person[]> {
    const response = await apiClient.get('/admin/pessoas');
    return response.data.map(normalizePerson);
  }

  async getStudents(): Promise<Student[]> {
    const response = await apiClient.get('/admin/alunos');
    return response.data.map((item: Entity) =>
      normalizeProfile<Student>(item, {
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

  async getSpeakers(): Promise<Speaker[]> {
    const response = await apiClient.get('/admin/palestrantes');
    return response.data.map((item: Entity) =>
      normalizeProfile<Speaker>(item, {
        empresaAtual: item.empresaAtual || '',
        cargo: item.cargo || '',
        resumoProfissional: item.resumoProfissional || '',
      }),
    );
  }

  async getOrganizers(): Promise<Organizer[]> {
    const response = await apiClient.get('/admin/organizadores');
    return response.data.map((item: Entity) =>
      normalizeProfile<Organizer>(item, {
        instituicao: item.instituicao || '',
        cargo: item.cargo || '',
      }),
    );
  }

  async getCollaborators(): Promise<Collaborator[]> {
    const response = await apiClient.get('/admin/colaboradores');
    return response.data.map((item: Entity) =>
      normalizeProfile<Collaborator>(item, {
        funcao: item.funcao || '',
        disponibilidade: item.disponibilidade || '',
        tipo: item.tipo || '',
      }),
    );
  }

  async getSponsors(): Promise<Sponsor[]> {
    const response = await apiClient.get('/admin/patrocinadores');
    return response.data.map(normalizeSponsor);
  }

  async getDisciplines(): Promise<Discipline[]> {
    const response = await apiClient.get('/admin/disciplinas');
    return response.data.map(normalizeDiscipline);
  }

  async saveDiscipline(discipline: Partial<Discipline>): Promise<void> {
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

  async getEvents(): Promise<Event[]> {
    const response = await apiClient.get('/admin/eventos', {
      params: { tamanho: 1000, ordenar: 'data' },
    });
    return pageContent<Entity>(response.data).map(normalizeEvent);
  }

  async getEventById(id: string): Promise<Event | null> {
    const response = await apiClient.get(`/admin/eventos/${id}`);
    return normalizeEvent(response.data);
  }

  async saveEvent(event: Partial<Event>): Promise<void> {
    const payload = {
      id: event.id ? Number(event.id) : null,
      tema: event.tema,
      descricao: event.descricao || '-',
      data: event.data,
      horarioInicio: event.horarioInicio,
      horarioFim: event.horarioFim,
      modalidade: event.modalidade === 'HIBRIDO' ? 'ONLINE' : event.modalidade,
      status: event.status,
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

  async getParticipations(): Promise<Participation[]> {
    const response = await apiClient.get('/participacoes');
    return response.data.map(normalizeParticipation);
  }

  async getEventParticipations(id: string): Promise<Participation[]> {
    const response = await apiClient.get(`/admin/eventos/${id}/participacoes`);
    return (response.data.participacoes || []).map(normalizeParticipation);
  }

  async saveParticipation(participation: Partial<Participation>): Promise<void> {
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

  async concludeEvent(eventId: string, presentes: string[]): Promise<void> {
    await apiClient.post(
      `/admin/eventos/${eventId}/concluir`,
      presentes.map((id) => Number(id)),
    );
  }

  async getCertificates(): Promise<Certificate[]> {
    const response = await apiClient.get('/admin/certificados');
    return (response.data.certificados || []).map(normalizeCertificate);
  }

  async getCertificateByCode(code: string): Promise<{
    certificado: Certificate;
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

  async getMedals(): Promise<Medal[]> {
    const response = await apiClient.get('/admin/medalhas');
    return response.data.map(normalizeMedal);
  }

  async saveMedal(medal: Partial<Medal>): Promise<void> {
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
