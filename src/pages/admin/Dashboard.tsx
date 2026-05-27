import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import db from '../../data/mockDb';
import { LoadingState, PageHeader } from '../../components/ui';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const eventsRowRef = useRef<HTMLDivElement>(null);

  const [events, setEvents] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [participacoes, setParticipacoes] = useState<any[]>([]);
  const [medals, setMedals] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [disciplines, setDisciplines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      db.getEvents(),
      db.getLocais(),
      db.getCertificates(),
      db.getParticipations(),
      db.getMedals(),
      db.getPeople(),
      db.getDisciplines()
    ]).then(([evts, locs, crts, parts, mdls, ppl, discs]) => {
      setEvents(evts);
      setLocations(locs);
      setCerts(crts);
      setParticipacoes(parts);
      setMedals(mdls);
      setPeople(ppl);
      setDisciplines(discs);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const upcomingEvents = events.filter(e => e.status === 'EM_ANDAMENTO');

  // Calculate Certificados Emitidos por Evento
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
  const medalsByPersonMap: { [key: string]: { total: number; label: string } } = {};
  
  medals.forEach(m => {
    const part = participacoes.find(p => p.id === m.participacaoId);
    const person = part ? people.find(p => p.id === part.pessoaId) : null;
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

  // General calculations for dashboard Bento Grid
  const totalInscricoes = participacoes.length;
  const totalPresentes = participacoes.filter(p => p.presente).length;
  const taxaPresenca = totalInscricoes > 0 ? Math.round((totalPresentes / totalInscricoes) * 100) : 0;
  const totalMedalhas = medals.length;
  const totalCertificados = certs.length;

  // Calculate top discipline by student enrollment engagement
  const disciplineEngagement: { [key: string]: number } = {};

  events.forEach(e => {
    if (e.disciplinaId) {
      const regCount = participacoes.filter(p => p.eventoId === e.id).length;
      disciplineEngagement[e.disciplinaId] = (disciplineEngagement[e.disciplinaId] || 0) + regCount;
    }
  });

  let topDisciplineId = '';
  let maxEngagement = 0;
  Object.entries(disciplineEngagement).forEach(([id, count]) => {
    if (count > maxEngagement) {
      maxEngagement = count;
      topDisciplineId = id;
    }
  });
  const topDiscipline = disciplines.find(d => d.id === topDisciplineId);

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

  if (loading) {
    return <LoadingState label="Carregando painel administrativo" />;
  }

  return (
    <div className="dashboard">
      <PageHeader
        eyebrow="Painel administrativo"
        title="Muttley"
        description="Visao operacional de eventos, inscricoes, certificados e reconhecimentos academicos."
        compact
      />

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
        <h2 id="stats-title" className="text-xl font-bold text-brand-ink-strong mb-4">Estatísticas do Sistema</h2>

        <div className="bento-grid grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          
          {/* Card 1: Visão Geral (col-span-2) */}
          <article className="bento-card bento-kpi bg-brand-surface border border-brand-line rounded-xl p-5 shadow-sm md:col-span-2 flex flex-col justify-between min-h-[180px]">
            <div>
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Visão Geral</span>
              <h3 className="text-base font-bold text-brand-ink-strong mt-0.5 mb-4">Métricas Consolidadas</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-brand-surface-soft rounded-lg border border-brand-line/50">
                <span className="text-xl md:text-2xl font-extrabold text-brand-primary block">{totalInscricoes}</span>
                <span className="text-[9px] text-brand-muted font-bold uppercase tracking-wider block mt-1">Inscrições</span>
              </div>
              <div className="text-center p-2 bg-brand-surface-soft rounded-lg border border-brand-line/50">
                <span className="text-xl md:text-2xl font-extrabold text-teal-600 block">{totalCertificados}</span>
                <span className="text-[9px] text-brand-muted font-bold uppercase tracking-wider block mt-1">Diplomas</span>
              </div>
              <div className="text-center p-2 bg-brand-surface-soft rounded-lg border border-brand-line/50">
                <span className="text-xl md:text-2xl font-extrabold text-amber-500 block">{totalMedalhas}</span>
                <span className="text-[9px] text-brand-muted font-bold uppercase tracking-wider block mt-1">Medalhas</span>
              </div>
            </div>
          </article>

          {/* Card 2: Taxa de Presença (col-span-1) */}
          <article className="bento-card bg-brand-surface border border-brand-line rounded-xl p-5 shadow-sm md:col-span-1 flex flex-col justify-between min-h-[180px]">
            <div>
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Engajamento</span>
              <h3 className="text-base font-bold text-brand-ink-strong mt-0.5 mb-1">Presença Média</h3>
            </div>
            <div className="flex flex-col gap-1.5 mt-auto">
              <div className="flex items-baseline gap-1">
                <strong className="text-4xl font-extrabold text-brand-ink-strong">{taxaPresenca}%</strong>
                <span className="text-xs text-brand-muted">comparecimento</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mt-1 border border-brand-line/30">
                <div className="bg-brand-primary h-full rounded-full" style={{ width: `${taxaPresenca}%` }} />
              </div>
            </div>
          </article>

          {/* Card 3: Disciplina Destaque (col-span-1) */}
          <article className="bento-card bg-brand-surface border border-brand-line rounded-xl p-5 shadow-sm md:col-span-1 flex flex-col justify-between min-h-[180px]">
            <div>
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Atividade Acadêmica</span>
              <h3 className="text-base font-bold text-brand-ink-strong mt-0.5 mb-2">Disciplina Líder</h3>
            </div>
            {topDiscipline ? (
              <div className="mt-auto">
                <strong className="text-sm font-extrabold text-brand-primary block truncate-2-lines leading-tight" title={topDiscipline.nome}>
                  {topDiscipline.nome}
                </strong>
                <span className="text-xs text-brand-muted block mt-1">
                  {maxEngagement} inscrições geradas
                </span>
              </div>
            ) : (
              <p className="text-xs text-brand-muted mt-auto">Nenhum engajamento registrado.</p>
            )}
          </article>

          {/* Card 4: Gráfico de Certificados por Evento (col-span-2) */}
          <article className="bento-card bg-brand-surface border border-brand-line rounded-xl p-5 shadow-sm md:col-span-2 flex flex-col min-h-[280px]">
            <div>
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Certificação</span>
              <h3 className="text-base font-bold text-brand-ink-strong mt-0.5 mb-3">Diplomas por Evento</h3>
            </div>
            {certsWithPercentage.length > 0 ? (
              <div className="bar-chart vertical flex-grow grid grid-flow-col gap-3 p-3 bg-brand-surface-soft rounded-lg items-end justify-start overflow-x-auto border border-brand-line/30">
                {certsWithPercentage.map((item, idx) => (
                  <div key={idx} className="bar-item flex flex-col items-center gap-1 w-16 text-center">
                    <div className="w-4 bg-brand-primary rounded-t-sm" style={{ height: `${Math.max(10, item.percentual * 1.5)}px` }} />
                    <strong className="text-[11px] text-brand-ink-strong mt-1">{item.total}</strong>
                    <small className="text-[9px] text-brand-muted truncate w-14 block" title={item.label}>
                      {item.label}
                    </small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-brand-muted flex items-center justify-center flex-grow text-xs italic">
                Nenhum certificado emitido.
              </p>
            )}
          </article>

          {/* Card 5: Ranking de Medalhas (col-span-2) */}
          <article className="bento-card bg-brand-surface border border-brand-line rounded-xl p-5 shadow-sm md:col-span-2 flex flex-col min-h-[280px]">
            <div>
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Reconhecimento</span>
              <h3 className="text-base font-bold text-brand-ink-strong mt-0.5 mb-3">Destaque: Medalhistas</h3>
            </div>
            {medalsWithPercentage.length > 0 ? (
              <ul className="ranking-list flex flex-col gap-3 justify-center flex-grow" aria-label="Ranking de participantes com mais medalhas">
                {medalsWithPercentage.map((item, idx) => (
                  <li key={idx} className="grid grid-cols-[100px_1fr] gap-2 items-center text-xs">
                    <span className="truncate text-brand-ink font-semibold" title={item.label}>
                      {item.label.split(' ')[0] + ' ' + (item.label.split(' ')[1] || '')}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-brand-line/30 flex-grow">
                        <div className="bg-brand-accent h-full rounded-full" style={{ width: `${item.percentual}%` }} />
                      </div>
                      <span className="font-bold text-brand-ink-strong min-w-[20px] text-right">
                        {item.total} 🏅
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-brand-muted flex items-center justify-center flex-grow text-xs italic">
                Nenhuma medalha emitida.
              </p>
            )}
          </article>

        </div>
      </section>

    </div>
  );
};

export default Dashboard;
