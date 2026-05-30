import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, Search } from 'lucide-react';
import db from '../../data/mockDb';
import type { PublicEvent } from '../../data/types';
import { EmptyState, LoadingState, StatusBadge } from '../../components/ui';

export const PublicEventList: React.FC = () => {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    db.getPublicEvents()
      .then(setEvents)
      .catch((err) => setError(err.message || 'Nao foi possivel carregar os eventos.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sorted = [...events].sort((a, b) => {
      const dateDiff = new Date(a.data).getTime() - new Date(b.data).getTime();
      if (dateDiff !== 0) return dateDiff;
      return a.horarioInicio.localeCompare(b.horarioInicio);
    });

    if (!normalizedQuery) return sorted;

    return sorted.filter((event) =>
      [event.tema, event.descricao, event.disciplina, event.local]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
    );
  }, [events, query]);

  if (loading) {
    return <LoadingState label="Carregando eventos" />;
  }

  return (
    <main className="public-events-page">
      <section className="public-events-hero">
        <div>
          <span>Fatec Zona Leste</span>
          <h1>Eventos abertos</h1>
          <p>Confira a agenda academica e faca sua inscricao sem precisar criar conta.</p>
        </div>

        <label className="public-events-search">
          <Search aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por tema, disciplina ou local"
          />
        </label>
      </section>

      {error && <div className="alert alert-danger">{error}</div>}

      {filteredEvents.length === 0 ? (
        <EmptyState title="Nenhum evento encontrado" description="Novos eventos aparecem aqui quando forem publicados." />
      ) : (
        <section className="public-events-grid" aria-label="Lista de eventos publicos">
          {filteredEvents.map((event) => {
            const date = event.data ? new Date(`${event.data}T00:00:00`) : null;
            const day = date ? date.toLocaleDateString('pt-BR', { day: '2-digit' }) : '--';
            const month = date ? date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '') : '---';

            return (
              <article key={event.id} className="public-event-card">
                <div className="public-event-card__date">
                  <strong>{day}</strong>
                  <span>{month}</span>
                </div>

                <div className="public-event-card__body">
                  <div className="public-event-card__top">
                    <StatusBadge
                      status={event.inscricoesEncerradas ? 'FINALIZADO' : event.status}
                      label={event.inscricoesEncerradas ? 'Inscricoes encerradas' : undefined}
                    />
                    <span>{event.modalidade.toLowerCase()}</span>
                  </div>

                  <h2>{event.tema}</h2>
                  <p>{event.descricao || 'Evento academico da Fatec Zona Leste.'}</p>

                  <div className="public-event-card__meta">
                    <span><Clock aria-hidden="true" />{event.horarioInicio} - {event.horarioFim}</span>
                    <span><MapPin aria-hidden="true" />{event.local || 'Local nao informado'}</span>
                    {event.disciplina && <span><CalendarDays aria-hidden="true" />{event.disciplina}</span>}
                  </div>
                </div>

                <Link className="public-event-card__action" to={`/eventos/${event.id}`}>
                  Inscrever-se
                </Link>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
};

export default PublicEventList;
