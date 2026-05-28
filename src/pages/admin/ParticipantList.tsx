import React, { useState, useEffect } from 'react';
import db from '../../data/mockDb';
import type { Person, Student, Professor, Speaker, Organizer, Collaborator } from '../../data/types';
import { PageHeader, TablePageSkeleton } from '../../components/ui';

type TabType = 'alunos' | 'professores' | 'palestrantes' | 'organizadores' | 'colaboradores';

export const ParticipantList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('alunos');

  const [people, setPeople] = useState<Person[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [pps, stds, profs, spks, orgs, colls] = await Promise.all([
          db.getPeople(),
          db.getStudents(),
          db.getProfessors(),
          db.getSpeakers(),
          db.getOrganizers(),
          db.getCollaborators()
        ]);
        setPeople(pps);
        setStudents(stds);
        setProfessors(profs);
        setSpeakers(spks);
        setOrganizers(orgs);
        setCollaborators(colls);
      } catch (err) {
        console.error('Error loading participants:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Map students
  const listAlunos = students.map(s => {
    const p = people.find(person => person.id === s.pessoaId);
    return {
      id: s.id,
      matricula: s.matricula,
      nome: p?.nome || '-',
      email: p?.email || '-',
      telefone: p?.telefone || '-',
      instituicao: s.instituicao,
    };
  });

  // Map professors
  const listProfessores = professors.map(prof => {
    const p = people.find(person => person.id === prof.pessoaId);
    return {
      id: prof.id,
      nome: p?.nome || '-',
      email: p?.email || '-',
      telefone: p?.telefone || '-',
      area: prof.areaFormacao,
      titulacao: prof.titulacao,
    };
  });

  // Map speakers
  const listPalestrantes = speakers.map(s => {
    const p = people.find(person => person.id === s.pessoaId);
    return {
      id: s.id,
      nome: p?.nome || '-',
      email: p?.email || '-',
      empresa: s.empresaAtual,
      cargo: s.cargo,
      resumo: s.resumoProfissional,
    };
  });

  // Map organizers
  const listOrganizadores = organizers.map(o => {
    const p = people.find(person => person.id === o.pessoaId);
    return {
      id: o.id,
      nome: p?.nome || '-',
      email: p?.email || '-',
      telefone: p?.telefone || '-',
      instituicao: o.instituicao,
      cargo: o.cargo,
    };
  });

  // Map collaborators
  const listColaboradores = collaborators.map(c => {
    const p = people.find(person => person.id === c.pessoaId);
    return {
      id: c.id,
      nome: p?.nome || '-',
      email: p?.email || '-',
      funcao: c.funcao,
      disponibilidade: c.disponibilidade,
      tipo: c.tipo,
    };
  });

  if (loading) {
    return <TablePageSkeleton action={false} columns={5} rows={7} />;
  }

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Comunidade academica"
        title="Pessoas"
        description="Consulte alunos, professores, palestrantes, organizadores e colaboradores."
        compact
      />

      <div className="tab-group">
        <button
          className={`tab-button ${activeTab === 'alunos' ? 'active' : ''}`}
          onClick={() => setActiveTab('alunos')}
          type="button"
        >
          Alunos <span className="tab-badge">{listAlunos.length}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'professores' ? 'active' : ''}`}
          onClick={() => setActiveTab('professores')}
          type="button"
        >
          Professores <span className="tab-badge">{listProfessores.length}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'palestrantes' ? 'active' : ''}`}
          onClick={() => setActiveTab('palestrantes')}
          type="button"
        >
          Palestrantes <span className="tab-badge">{listPalestrantes.length}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'organizadores' ? 'active' : ''}`}
          onClick={() => setActiveTab('organizadores')}
          type="button"
        >
          Organizadores <span className="tab-badge">{listOrganizadores.length}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'colaboradores' ? 'active' : ''}`}
          onClick={() => setActiveTab('colaboradores')}
          type="button"
        >
          Colaboradores <span className="tab-badge">{listColaboradores.length}</span>
        </button>
      </div>

      <section className="people-panel">
        {activeTab === 'alunos' && (
          <table className="participants-table">
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Instituição</th>
              </tr>
            </thead>
            <tbody>
              {listAlunos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center">Nenhum aluno cadastrado.</td>
                </tr>
              ) : (
                listAlunos.map(item => (
                  <tr key={item.id}>
                    <td>{item.matricula}</td>
                    <td>{item.nome}</td>
                    <td>{item.email}</td>
                    <td>{item.telefone}</td>
                    <td>{item.instituicao}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'professores' && (
          <table className="participants-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Área</th>
                <th>Titulação</th>
              </tr>
            </thead>
            <tbody>
              {listProfessores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center">Nenhum professor cadastrado.</td>
                </tr>
              ) : (
                listProfessores.map(item => (
                  <tr key={item.id}>
                    <td>{item.nome}</td>
                    <td>{item.email}</td>
                    <td>{item.telefone}</td>
                    <td>{item.area}</td>
                    <td>{item.titulacao}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'palestrantes' && (
          <table className="participants-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Empresa</th>
                <th>Cargo</th>
                <th>Resumo</th>
              </tr>
            </thead>
            <tbody>
              {listPalestrantes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center">Nenhum palestrante cadastrado.</td>
                </tr>
              ) : (
                listPalestrantes.map(item => (
                  <tr key={item.id}>
                    <td>{item.nome}</td>
                    <td>{item.email}</td>
                    <td>{item.empresa}</td>
                    <td>{item.cargo}</td>
                    <td className="max-w-xs truncate" title={item.resumo}>{item.resumo}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'organizadores' && (
          <table className="participants-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Instituição</th>
                <th>Cargo</th>
              </tr>
            </thead>
            <tbody>
              {listOrganizadores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center">Nenhum organizador cadastrado.</td>
                </tr>
              ) : (
                listOrganizadores.map(item => (
                  <tr key={item.id}>
                    <td>{item.nome}</td>
                    <td>{item.email}</td>
                    <td>{item.telefone}</td>
                    <td>{item.instituicao}</td>
                    <td>{item.cargo}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'colaboradores' && (
          <table className="participants-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Função</th>
                <th>Disponibilidade</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {listColaboradores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center">Nenhum colaborador cadastrado.</td>
                </tr>
              ) : (
                listColaboradores.map(item => (
                  <tr key={item.id}>
                    <td>{item.nome}</td>
                    <td>{item.email}</td>
                    <td>{item.funcao}</td>
                    <td>{item.disponibilidade}</td>
                    <td>{item.tipo}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default ParticipantList;
