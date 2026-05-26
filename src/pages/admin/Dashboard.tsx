import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import db from '../../data/mockDb';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const eventsRowRef = useRef<HTMLDivElement>(null);

  // Load active upcoming events
  const events = db.getEvents();
  const upcomingEvents = events.filter(e => e.status === 'EM_ANDAMENTO');

  // Load locations for event display
  const locations = db.getLocais();

  // Load certificates
  const certs = db.getCertificates();
  
  // Calculate Certificados Emitidos por Evento
  const participacoes = db.getParticipations();
  const certsByEventMap: { [key: string]: { total: number; label: string } } = {};
  
  certs.forEach(c => {
    const part = participacoes.find(p => p.id === c.participacaoId);
    const evt = part ? events.find(e => e.id === part.eventoId) : null;
    if (evt) {
      if (!certsByEventMap[evt.id]) {
        certsByEventMap[evt.id] = { total: 0, label: evt.tema.substring(0, 15) + '...' };
      }
      certsByEventMap[evt.id].total += 1;
    }
  });

  const certData = Object.values(certsByEventMap);
  const maxCertTotal = certData.length > 0 ? Math.max(...certData.map(d => d.total)) : 1;
  const certsWithPercentage = certData.map(d => ({
    ...d,
    percentual: Math.round((d.total / maxCertTotal) * 100),
  }));

  // Calculate Participantes com mais medalhas
  const medals = db.getMedals();
  const medalsByPersonMap: { [key: string]: { total: number; label: string } } = {};
  
  medals.forEach(m => {
    const part = participacoes.find(p => p.id === m.participacaoId);
    const person = part ? db.getPeople().find(p => p.id === part.pessoaId) : null;
    if (person) {
      if (!medalsByPersonMap[person.id]) {
        medalsByPersonMap[person.id] = { total: 0, label: person.nome };
      }
      medalsByPersonMap[person.id].total += 1;
    }
  });

  const medalData = Object.values(medalsByPersonMap).sort((a, b) => b.total - a.total).slice(0, 5);
  const maxMedalTotal = medalData.length > 0 ? Math.max(...medalData.map(d => d.total)) : 1;
  const medalsWithPercentage = medalData.map(d => ({
    ...d,
    percentual: Math.round((d.total / maxMedalTotal) * 100),
  }));

  // General counts
  const totalCertsLast30Days = certs.length; // mock representation
  const activeEventsCount = upcomingEvents.length;

  const [canScroll, setCanScroll] = useState(false);

  const checkScroll = () => {
    if (eventsRowRef.current) {
      const { scrollWidth, clientWidth } = eventsRowRef.current;
      setCanScroll(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [upcomingEvents]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (eventsRowRef.current) {
      const scrollAmount = direction === 'left' ? -336 : 336;
      eventsRowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCardClick = (id: string) => {
    navigate(`/admin/eventos/editar/${id}`);
  };

  return (
    <div className="dashboard">
      <section className="hero">
        <h1 className="text-3xl font-extrabold text-brand-ink-strong">Bem-vindo ao Muttley</h1>
      </section>

      <section className="events-section mt-8" aria-labelledby="events-title">
        <div className="section-heading flex items-center justify-between mb-4">
          <h2 id="events-title" className="text-xl font-bold text-brand-ink-strong">Próximos eventos</h2>
          <Link className="new-event-button px-4 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary-strong transition-colors cursor-pointer text-xs" to="/admin/eventos/novo">
            Novo Evento
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="events-carousel relative">
            {canScroll && (
              <button
                className="carousel-control previous"
                type="button"
                aria-label="Evento anterior"
                onClick={() => scrollCarousel('left')}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="m15 18-6-6 6-6"></path>
                </svg>
              </button>
            )}

            <div className="events-row scroll-smooth" ref={eventsRowRef}>
              {upcomingEvents.map(evento => {
                const local = locations.find(l => l.id === evento.localId);
                const dateObj = new Date(evento.data);
                const day = evento.data ? dateObj.getDate() + 1 : 12;
                const month = evento.data ? dateObj.toLocaleDateString('pt-BR', { month: '2-digit' }) : '05';

                return (
                  <article
                    key={evento.id}
                    className="event-card clickable-event-card flex flex-col p-4 bg-brand-surface border border-brand-line rounded-lg shadow-sm w-[320px] shrink-0 cursor-pointer hover:border-brand-primary/50 relative overflow-hidden"
                    onClick={() => handleCardClick(evento.id)}
                    role="link"
                    tabIndex={0}
                  >
                    <div className="event-main flex justify-between items-start">
                      <h3 className="text-sm font-bold text-brand-ink-strong max-w-[200px]">{evento.tema}</h3>
                      <time className="px-2.5 py-1 bg-brand-primary-soft text-brand-primary-strong rounded-full text-xs font-bold flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" aria-hidden="true" viewBox="0 0 24 24">
                          <rect x="4" y="5" width="16" height="15" rx="2"></rect>
                          <path d="M8 3v4M16 3v4M4 10h16"></path>
                        </svg>
                        <span>{day}/{month}</span>
                      </time>
                    </div>

                    <p className="event-location flex items-center gap-1.5 text-xs text-brand-muted mt-2">
                      <svg className="w-3.5 h-3.5 text-brand-primary" aria-hidden="true" viewBox="0 0 24 24">
                        <path d="M12 21s7-5.3 7-12a7 7 0 0 0-14 0c0 6.7 7 12 7 12z"></path>
                        <circle cx="12" cy="9" r="2.2"></circle>
                      </svg>
                      <span>{local?.nome || 'Local não definido'}</span>
                    </p>

                    <p className="event-description text-xs text-brand-muted mt-2 flex-grow line-clamp-2">
                      {evento.descricao || 'Sem descrição cadastrada.'}
                    </p>

                    <div className="event-footer flex items-center justify-between mt-4 text-xs text-brand-muted border-t border-brand-line/40 pt-2.5">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" aria-hidden="true" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="9"></circle>
                          <path d="M12 7v5l4 2"></path>
                        </svg>
                        <span>{evento.horarioInicio} - {evento.horarioFim}</span>
                      </span>
                      {evento.status === 'EM_ANDAMENTO' && (
                        <Link
                          className="event-footer-action text-white bg-brand-ink-strong px-2 py-1 rounded text-[10px] font-bold hover:bg-black transition-colors"
                          to={`/admin/eventos/concluir/${evento.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Concluir evento
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {canScroll && (
              <button
                className="carousel-control next"
                type="button"
                aria-label="Próximo evento"
                onClick={() => scrollCarousel('right')}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="m9 18 6-6-6-6"></path>
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="empty-state p-8 bg-brand-surface border border-brand-line rounded-lg text-center text-brand-muted">
            <p>Nenhum evento futuro cadastrado.</p>
          </div>
        )}
      </section>

      <section className="stats-section mt-8" aria-labelledby="stats-title">
        <h2 id="stats-title" className="text-xl font-bold text-brand-ink-strong mb-4">Estatísticas</h2>

        <div className="stats-grid grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="stat-panel bg-brand-surface border border-brand-line rounded-lg p-4 shadow-sm flex flex-col min-h-[260px]">
            <h3 className="text-sm font-bold text-brand-ink-strong mb-3">Certificados emitidos por evento</h3>
            {certsWithPercentage.length > 0 ? (
              <div className="bar-chart vertical flex-grow grid grid-flow-col gap-3 p-3 bg-brand-surface-soft rounded-lg items-end justify-start overflow-x-auto">
                {certsWithPercentage.map((item, idx) => (
                  <div key={idx} className="bar-item flex flex-col items-center gap-1 w-16 text-center">
                    <div className="w-4 bg-brand-primary rounded-t-sm" style={{ height: `${Math.max(10, item.percentual * 1.5)}px` }} />
                    <strong className="text-xs text-brand-ink-strong mt-1">{item.total}</strong>
                    <small className="text-[9px] text-brand-muted truncate w-14 block" title={item.label}>
                      {item.label}
                    </small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="stat-empty text-brand-muted flex items-center justify-center flex-grow text-sm">
                Nenhum certificado emitido ainda.
              </p>
            )}
          </article>

          <article className="stat-panel bg-brand-surface border border-brand-line rounded-lg p-4 shadow-sm flex flex-col min-h-[260px]">
            <h3 className="text-sm font-bold text-brand-ink-strong mb-3">Participantes com mais medalhas</h3>
            {medalsWithPercentage.length > 0 ? (
              <ul className="ranking-list flex flex-col gap-3 justify-center flex-grow" aria-label="Ranking de participantes com mais medalhas">
                {medalsWithPercentage.map((item, idx) => (
                  <li key={idx} className="grid grid-cols-[100px_1fr] gap-2 items-center text-xs">
                    <span className="truncate text-brand-ink font-semibold" title={item.label}>{item.label.split(' ')[0] + ' ' + (item.label.split(' ')[1] || '')}</span>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-brand-accent h-full rounded-full" style={{ width: `${item.percentual}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="stat-empty text-brand-muted flex items-center justify-center flex-grow text-sm">
                Nenhuma medalha cadastrada ainda.
              </p>
            )}
          </article>

          <article className="stat-panel compact bg-brand-surface border border-brand-line rounded-lg p-4 shadow-sm flex items-center gap-4">
            <h3 className="text-sm font-bold text-brand-ink-strong w-1/3">Últimos 30 dias</h3>
            <div className="metric-row flex items-baseline gap-2 flex-grow">
              <strong className="text-3xl font-extrabold text-brand-primary">{totalCertsLast30Days}</strong>
              <span className="text-xs text-brand-muted">
                certificados emitidos (+5% em relação aos 30 dias anteriores)
              </span>
            </div>
          </article>

          <article className="stat-panel compact bg-brand-surface border border-brand-line rounded-lg p-4 shadow-sm flex items-center gap-4">
            <h3 className="text-sm font-bold text-brand-ink-strong w-1/3">Eventos ativos</h3>
            <div className="metric-row flex items-baseline gap-2 flex-grow">
              <strong className="text-3xl font-extrabold text-brand-primary">{activeEventsCount}</strong>
              <span className="text-xs text-brand-muted">
                eventos programados para os próximos 7 dias
              </span>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
