import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import db from '../../data/mockDb';

export const MedalList: React.FC = () => {
  const [medals, setMedals] = useState(db.getMedals());
  const [message, setMessage] = useState('');

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir esta medalha?')) {
      const updated = medals.filter(m => m.id !== id);
      db.saveMedals(updated);
      setMedals(updated);
      setMessage('Medalha excluída com sucesso.');
    }
  };

  const getParticipationInfo = (partId: string) => {
    const part = db.getParticipations().find(p => p.id === partId);
    const person = part ? db.getPeople().find(p => p.id === part.pessoaId) : null;
    const event = part ? db.getEvents().find(e => e.id === part.eventoId) : null;
    
    return {
      personName: person ? person.nome : '-',
      eventTitle: event ? event.tema : '-',
    };
  };

  return (
    <div className="admin-page">
      <div className="page-title-row">
        <h1>Medalhas</h1>
        <Link className="new-event-button" to="/admin/medalhas/novo">
          Nova medalha
        </Link>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <section className="people-panel">
        <table className="participants-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Participante</th>
              <th>Evento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {medals.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">Nenhuma medalha cadastrada.</td>
              </tr>
            ) : (
              medals.map(m => {
                const info = getParticipationInfo(m.participacaoId);
                return (
                  <tr key={m.id}>
                    <td><strong>{m.nome}</strong></td>
                    <td>{m.descricao}</td>
                    <td>{info.personName}</td>
                    <td>{info.eventTitle}</td>
                    <td>
                      <div className="table-actions">
                        <Link className="table-action" to={`/admin/medalhas/editar/${m.id}`}>
                          Editar
                        </Link>
                        <button
                          className="table-action danger"
                          onClick={() => handleDelete(m.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default MedalList;
