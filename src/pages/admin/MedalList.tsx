import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import db from '../../data/mockDb';
import type { Medal, Participation, Person, Event } from '../../data/types';
import { ButtonLink, PageHeader, TablePageSkeleton } from '../../components/ui';
import { toast } from '../../components/ui/Toast';

export const MedalList: React.FC = () => {
  const [medals, setMedals] = useState<Medal[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [meds, parts, pps, evts] = await Promise.all([
        db.getMedals(),
        db.getParticipations(),
        db.getPeople(),
        db.getEvents()
      ]);
      setMedals(meds);
      setParticipations(parts);
      setPeople(pps);
      setEvents(evts);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar medalhas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Excluir esta medalha?')) {
      try {
        setLoading(true);
        await db.deleteMedal(id);
        setMedals(prev => prev.filter(m => m.id !== id));
        toast.success('Medalha excluída com sucesso.');
      } catch (err: any) {
        toast.error(err.message || 'Erro ao excluir medalha.');
      } finally {
        setLoading(false);
      }
    }
  };

  const getParticipationInfo = (partId: string) => {
    const part = participations.find(p => p.id === partId);
    const person = part ? part.pessoa || people.find(p => p.id === part.pessoaId) : null;
    const event = part ? part.evento || events.find(e => e.id === part.eventoId) : null;
    
    return {
      personName: person ? person.nome : '-',
      eventTitle: event ? event.tema : '-',
    };
  };

  if (loading && medals.length === 0) {
    return <TablePageSkeleton columns={5} rows={6} />;
  }

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Reconhecimento"
        title="Medalhas"
        description="Crie e acompanhe reconhecimentos vinculados as participacoes."
        actions={
          <ButtonLink to="/admin/medalhas/novo" icon={<Plus aria-hidden="true" />}>
            Nova medalha
          </ButtonLink>
        }
      />

      <section className="people-panel">
        <table className="participants-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Participante</th>
              <th>Evento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {medals.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">Nenhuma medalha cadastrada.</td>
              </tr>
            ) : (
              medals.map(m => {
                const info = getParticipationInfo(m.participacaoId);
                return (
                  <tr key={m.id}>
                    <td><strong>{m.nome}</strong></td>
                    <td>
                      <span className={`medal-type-badge medal-type-badge--${m.tipo.toLowerCase()}`}>
                        {m.tipo}
                      </span>
                    </td>
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
                          disabled={loading}
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
