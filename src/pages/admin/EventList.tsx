import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import db from '../../data/mockDb';
import type { Event, Local, Discipline, Sponsor } from '../../data/types';
import { ButtonLink, EmptyState, EventListSkeleton, PageHeader, StatusBadge } from '../../components/ui';

export const EventList: React.FC = () => {
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [ordenar, setOrdenar] = useState('data');
  const [tamanho, setTamanho] = useState(10);
  const [pagina, setPagina] = useState(0);
  const [message, setMessage] = useState('');
  const [erro, setErro] = useState('');

  const carouselRef = useRef<HTMLDivElement>(null);

  // Load state datasets
  const [events, setEvents] = useState<Event[]>([]);
  const [locations, setLocations] = useState<Local[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      db.getEvents(),
      db.getLocais(),
      db.getDisciplines(),
      db.getSponsors()
    ]).then(([evts, locs, discs, spons]) => {
      setEvents(evts);
      setLocations(locs);
      setDisciplines(discs);
      setSponsors(spons);
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeEvents = useMemo(() => events.filter(e => e.status === 'EM_ANDAMENTO'), [events]);

  const [canScroll, setCanScroll] = useState(false);

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollWidth, clientWidth } = carouselRef.current;
      setCanScroll(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [activeEvents]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -336 : 336;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCancel = async (id: string) => {
    if (window.confirm('Cancelar este evento?')) {
      try {
        await db.cancelEvent(id);
        setMessage('Evento cancelado com sucesso.');
        // Refresh event list
        const evts = await db.getEvents();
        setEvents(evts);
      } catch (err: any) {
        setErro(err.message || 'Erro ao cancelar evento.');
      }
    }
  };

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Filter by search query
    if (busca.trim()) {
      const query = busca.toLowerCase();
      result = result.filter(e => 
        e.tema.toLowerCase().includes(query) || 
        (e.descricao && e.descricao.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (statusFiltro) {
      result = result.filter(e => e.status === statusFiltro);
    }

    // Sort
    result.sort((a, b) => {
      if (ordenar === 'tema') {
        return a.tema.localeCompare(b.tema);
      } else {
        // Sort by date (descending)
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      }
    });

    return result;
  }, [events, busca, statusFiltro, ordenar]);

  // Paginated events
  const paginatedEvents = useMemo(() => {
    const start = pagina * tamanho;
    return filteredEvents.slice(start, start + tamanho);
  }, [filteredEvents, pagina, tamanho]);

  const totalPages = Math.ceil(filteredEvents.length / tamanho);

  if (loading) {
    return <EventListSkeleton />;
  }

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Gestao academica"
        title="Eventos"
        description="Cadastre, acompanhe e conclua atividades academicas com controle de inscricoes e certificados."
        actions={
          <ButtonLink to="/admin/eventos/novo" icon={<Plus aria-hidden="true" />}>
            Novo Evento
          </ButtonLink>
        }
      />

      {message && <div className="alert alert-success">{message}</div>}
      {erro && <div className="alert alert-danger">{erro}</div>}

      {activeEvents.length > 0 && (
        <section className="events-section mb-8" aria-labelledby="active-events-title">
          <div className="section-heading mb-4">
            <h2 id="active-events-title" className="text-lg font-bold text-brand-ink-strong">
              Eventos em andamento
            </h2>
          </div>

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

            <div className="events-row scroll-smooth" ref={carouselRef}>
              {activeEvents.map(evento => {
                const local = locations.find(l => l.id === evento.localId);
                const dateObj = new Date(evento.data);
                const day = evento.data ? dateObj.getDate() + 1 : 12;
                const month = evento.data ? dateObj.toLocaleDateString('pt-BR', { month: '2-digit' }) : '05';

                return (
                  <article key={evento.id} className="event-card flex flex-col p-4 bg-brand-surface border border-brand-line rounded-lg shadow-sm w-[320px] shrink-0 relative overflow-hidden">
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

                    <p className="event-location flex items-center gap-1.5 text-xs text-brand-muted mt-2 font-semibold">
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
                      <Link
                        className="event-footer-action text-white bg-brand-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-brand-primary-strong transition-colors"
                        to={`/admin/eventos/concluir/${evento.id}`}
                      >
                        Concluir evento
                      </Link>
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
        </section>
      )}

      <section className="summary-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <article className="summary-card p-4 bg-brand-surface border border-brand-line rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-xs text-brand-muted font-bold">
            <svg aria-hidden="true" className="w-4 h-4 text-brand-primary" viewBox="0 0 24 24">
              <rect x="4" y="5" width="16" height="15" rx="2"></rect>
              <path d="M8 3v4M16 3v4M4 10h16"></path>
            </svg>
            <span>Eventos exibidos</span>
          </div>
          <strong className="text-2xl font-extrabold text-brand-ink-strong mt-2 block">
            {filteredEvents.length}
          </strong>
        </article>

        <article className="summary-card p-4 bg-brand-surface border border-brand-line rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-xs text-brand-muted font-bold">
            <svg aria-hidden="true" className="w-4 h-4 text-brand-primary" viewBox="0 0 24 24">
              <rect x="4" y="5" width="16" height="15" rx="2"></rect>
              <path d="M8 3v4M16 3v4M4 10h16"></path>
            </svg>
            <span>Página atual</span>
          </div>
          <strong className="text-2xl font-extrabold text-brand-ink-strong mt-2 block">
            {pagina + 1} / {totalPages || 1}
          </strong>
        </article>

        <article className="summary-card p-4 bg-brand-surface border border-brand-line rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-xs text-brand-muted font-bold">
            <svg aria-hidden="true" className="w-4 h-4 text-brand-primary" viewBox="0 0 24 24">
              <path d="M16 21v-2a4 4 0 0 0-8 0v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Exibindo</span>
          </div>
          <strong className="text-2xl font-extrabold text-brand-ink-strong mt-2 block">
            {paginatedEvents.length}
          </strong>
        </article>

        <article className="summary-card p-4 bg-brand-surface border border-brand-line rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-xs text-brand-muted font-bold">
            <svg aria-hidden="true" className="w-4 h-4 text-brand-primary" viewBox="0 0 24 24">
              <rect x="4" y="5" width="16" height="15" rx="2"></rect>
              <path d="M8 3v4M16 3v4M4 10h16"></path>
            </svg>
            <span>Por página</span>
          </div>
          <strong className="text-2xl font-extrabold text-brand-ink-strong mt-2 block">
            {tamanho}
          </strong>
        </article>
      </section>

      <form
        className="events-toolbar grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mb-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <label className="search-field bg-brand-surface border border-brand-line p-2 rounded-lg flex items-center gap-2 focus-within:border-brand-primary">
          <svg className="w-4 h-4 text-brand-muted" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7"></circle>
            <path d="m20 20-3.5-3.5"></path>
          </svg>
          <input
            type="search"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(0);
            }}
            placeholder="Buscar evento"
            className="w-full text-sm outline-none bg-transparent"
          />
        </label>

        <select
          value={ordenar}
          onChange={(e) => setOrdenar(e.target.value)}
          className="border border-brand-line p-2 rounded-lg text-sm bg-brand-surface"
        >
          <option value="data">Ordenar por: Data</option>
          <option value="tema">Ordenar por: Nome</option>
        </select>

        <select
          value={statusFiltro}
          onChange={(e) => {
            setStatusFiltro(e.target.value);
            setPagina(0);
          }}
          className="border border-brand-line p-2 rounded-lg text-sm bg-brand-surface"
        >
          <option value="">Todos os status</option>
          <option value="CRIADO">Criado</option>
          <option value="EM_ANDAMENTO">Em andamento</option>
          <option value="FINALIZADO">Finalizado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>

        <select
          value={tamanho}
          onChange={(e) => {
            setTamanho(Number(e.target.value));
            setPagina(0);
          }}
          className="border border-brand-line p-2 rounded-lg text-sm bg-brand-surface"
        >
          <option value="5">Exibir: 5 itens</option>
          <option value="10">Exibir: 10 itens</option>
          <option value="25">Exibir: 25 itens</option>
          <option value="50">Exibir: 50 itens</option>
        </select>

        <button
          type="button"
          onClick={() => {
            setBusca('');
            setStatusFiltro('');
            setOrdenar('data');
            setPagina(0);
          }}
          className="bg-brand-muted hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
        >
          Limpar Filtros
        </button>
      </form>

      <section className="event-list flex flex-col gap-4">
        {paginatedEvents.length === 0 ? (
          <EmptyState title="Nenhum evento encontrado" description="Ajuste os filtros ou cadastre um novo evento." />
        ) : (
          paginatedEvents.map(evento => {
            const local = locations.find(l => l.id === evento.localId);
            const disc = disciplines.find(d => d.id === evento.disciplinaId);
            const sponsor = sponsors.find(s => s.id === evento.patrocinadorId);
            const isFinalized = evento.status === 'FINALIZADO';
            const isCancelled = evento.status === 'CANCELADO';
            const dateObj = new Date(evento.data);
            const day = evento.data ? dateObj.getDate() + 1 : 12;
            const month = evento.data ? dateObj.toLocaleDateString('pt-BR', { month: '2-digit' }) : '05';

            return (
              <article key={evento.id} className="event-list-card grid md:grid-cols-[180px_1fr_120px] gap-4 p-4 bg-brand-surface border border-brand-line rounded-lg shadow-sm">
                <div className="event-list-meta flex flex-col gap-2 md:border-r border-brand-line md:pr-4 justify-center text-xs text-brand-muted">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <svg className="w-4 h-4 text-brand-primary" viewBox="0 0 24 24">
                      <path d="M12 21s7-5.3 7-12a7 7 0 0 0-14 0c0 6.7 7 12 7 12z"></path>
                      <circle cx="12" cy="9" r="2.2"></circle>
                    </svg>
                    <span>{local?.nome || '—'}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-brand-primary" viewBox="0 0 24 24">
                      <rect x="4" y="5" width="16" height="15" rx="2"></rect>
                      <path d="M8 3v4M16 3v4M4 10h16"></path>
                    </svg>
                    <span>{day}/{month} | {evento.horarioInicio} - {evento.horarioFim}</span>
                  </span>
                </div>

                <div className="event-list-content min-w-0">
                  <h2 className="text-lg font-bold text-brand-ink-strong truncate mb-2">{evento.tema}</h2>
                  <div className="event-tags flex flex-wrap gap-2 text-xs text-brand-muted mb-2">
                    <StatusBadge status={evento.status} />
                    {disc && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-brand-primary" viewBox="0 0 24 24">
                          <path d="M4 19.5V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-1.5z"></path>
                        </svg>
                        <span>{disc.nome}</span>
                      </span>
                    )}
                    {sponsor && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-brand-primary" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="9"></circle>
                          <path d="M8 12h8M12 8v8"></path>
                        </svg>
                        <span>{sponsor.nome}</span>
                      </span>
                    )}
                    <span className="capitalize px-2 py-0.5 rounded border border-brand-line">
                      {evento.modalidade.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-xs text-brand-muted leading-relaxed line-clamp-2 mt-1">
                    {evento.descricao || 'Nenhuma descrição cadastrada.'}
                  </p>
                </div>

                <div className="event-actions flex flex-col gap-2 justify-center">
                  <Link
                    className="table-action text-center font-bold"
                    to={`/admin/eventos/editar/${evento.id}`}
                  >
                    {isFinalized ? 'Ver detalhes' : 'Editar'}
                  </Link>

                  {!isFinalized && !isCancelled && (
                    <>
                      <Link
                        className="table-action text-center font-bold"
                        to={`/admin/eventos/concluir/${evento.id}`}
                      >
                        Concluir
                      </Link>
                      <button
                        className="table-action danger font-bold"
                        onClick={() => handleCancel(evento.id)}
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                  {evento.qrCodeUrl && (
                    <a
                      href={evento.qrCodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-center text-brand-primary font-bold hover:underline"
                    >
                      Ver QR Code
                    </a>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="pagination mt-6 flex justify-center gap-1 text-xs font-bold text-brand-muted">
          <button
            onClick={() => setPagina(0)}
            disabled={pagina === 0}
            className={`px-3 py-1.5 rounded-full ${pagina === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-brand-primary hover:text-white'}`}
          >
            Primeiro
          </button>
          <button
            onClick={() => setPagina(p => Math.max(0, p - 1))}
            disabled={pagina === 0}
            className={`px-3 py-1.5 rounded-full ${pagina === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-brand-primary hover:text-white'}`}
          >
            Anterior
          </button>
          
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPagina(idx)}
              className={`px-3 py-1.5 rounded-full ${pagina === idx ? 'bg-brand-primary text-white' : 'hover:bg-brand-primary hover:text-white'}`}
            >
              {idx + 1}
            </button>
          ))}

          <button
            onClick={() => setPagina(p => Math.min(totalPages - 1, p + 1))}
            disabled={pagina === totalPages - 1}
            className={`px-3 py-1.5 rounded-full ${pagina === totalPages - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-brand-primary hover:text-white'}`}
          >
            Próximo
          </button>
          <button
            onClick={() => setPagina(totalPages - 1)}
            disabled={pagina === totalPages - 1}
            className={`px-3 py-1.5 rounded-full ${pagina === totalPages - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-brand-primary hover:text-white'}`}
          >
            Último
          </button>
        </nav>
      )}
    </div>
  );
};

export default EventList;
