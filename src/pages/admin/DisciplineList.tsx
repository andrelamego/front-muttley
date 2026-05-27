import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import db from '../../data/mockDb';
import type { Discipline, Professor, Person } from '../../data/types';
import { ButtonLink, LoadingState, PageHeader } from '../../components/ui';

export const DisciplineList: React.FC = () => {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [erro, setErro] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      db.getDisciplines(),
      db.getProfessors(),
      db.getPeople()
    ]).then(([discs, profs, ppl]) => {
      setDisciplines(discs);
      setProfessors(profs);
      setPeople(ppl);
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Excluir esta disciplina?')) {
      try {
        await db.deleteDiscipline(id);
        setDisciplines(prev => prev.filter(d => d.id !== id));
        setMessage('Disciplina excluída com sucesso.');
      } catch (err: any) {
        setErro(err.message || 'Erro ao excluir disciplina.');
      }
    }
  };

  const getProfessorName = (profId: string) => {
    const prof = professors.find(p => p.id === profId);
    const person = prof ? people.find(p => p.id === prof.pessoaId) : null;
    return person ? person.nome : '-';
  };

  if (loading) {
    return <LoadingState label="Carregando disciplinas" />;
  }

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Configuracao academica"
        title="Disciplinas"
        description="Mantenha a relacao entre disciplinas, turnos e professores responsaveis."
        actions={
          <ButtonLink to="/admin/disciplinas/novo" icon={<Plus aria-hidden="true" />}>
            Nova Disciplina
          </ButtonLink>
        }
      />

      {message && <div className="alert alert-success">{message}</div>}
      {erro && <div className="alert alert-danger">{erro}</div>}

      <section className="people-panel">
        <table className="participants-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Turno</th>
              <th>Professor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {disciplines.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">Nenhuma disciplina cadastrada.</td>
              </tr>
            ) : (
              disciplines.map(d => (
                <tr key={d.id}>
                  <td>{d.nome}</td>
                  <td>{d.descricao}</td>
                  <td>{d.turno}</td>
                  <td>{getProfessorName(d.professorId)}</td>
                  <td>
                    <div className="table-actions">
                      <Link className="table-action" to={`/admin/disciplinas/editar/${d.id}`}>
                        Editar
                      </Link>
                      <button
                        className="table-action danger"
                        onClick={() => handleDelete(d.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default DisciplineList;
