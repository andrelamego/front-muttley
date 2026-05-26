import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import db from '../../data/mockDb';

export const DisciplineList: React.FC = () => {
  const [disciplines, setDisciplines] = useState(db.getDisciplines());
  const [message, setMessage] = useState('');

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir esta disciplina?')) {
      const updated = disciplines.filter(d => d.id !== id);
      db.saveDisciplines(updated);
      setDisciplines(updated);
      setMessage('Disciplina excluída com sucesso.');
    }
  };

  const professors = db.getProfessors();
  const people = db.getPeople();

  const getProfessorName = (profId: string) => {
    const prof = professors.find(p => p.id === profId);
    const person = prof ? people.find(p => p.id === prof.pessoaId) : null;
    return person ? person.nome : '-';
  };

  return (
    <div className="admin-page">
      <div className="page-title-row">
        <h1>Disciplinas</h1>
        <Link className="new-event-button" to="/admin/disciplinas/novo">
          Nova Disciplina
        </Link>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

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
