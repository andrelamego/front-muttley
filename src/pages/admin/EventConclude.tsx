import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import db from '../../data/mockDb';
import type { Event, Participation, Person } from '../../data/types';
import { CompletionSkeleton } from '../../components/ui';

export const EventConclude: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [participacoes, setParticipacoes] = useState<Participation[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [presentes, setPresentes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'TODOS' | 'PRESENTES' | 'AUSENTES'>('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  // Load event and participation details
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [evt, parts, pps] = await Promise.all([
          db.getEventById(id),
          db.getEventParticipations(id),
          db.getPeople()
        ]);
        setEvent(evt);
        setParticipacoes(parts);
        setPeople(pps);

        // Initialize selected presence
        const initiallyPresent = parts.filter(p => p.presente).map(p => p.id);
        setPresentes(initiallyPresent);
      } catch (err: any) {
        setErro(err.message || 'Erro ao carregar dados do evento.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Pre-process items to include person details
  const parsedParticipacoes = participacoes.map(part => {
    const person = people.find(p => p.id === part.pessoaId);
    return {
      ...part,
      nome: person?.nome || '',
      email: person?.email || '',
    };
  });

  // Filter based on search query (reactive filter by name/email/inscription)
  const searchQueryLower = searchQuery.toLowerCase();
  const searchedParticipacoes = parsedParticipacoes.filter(part => {
    const matchesName = part.nome.toLowerCase().includes(searchQueryLower);
    const matchesEmail = part.email.toLowerCase().includes(searchQueryLower);
    const matchesInscricao = part.inscricao.toString().includes(searchQueryLower);
    return matchesName || matchesEmail || matchesInscricao;
  });

  // Filter based on active tab
  const filteredParticipacoes = searchedParticipacoes.filter(part => {
    const isPresent = presentes.includes(part.id);
    if (activeTab === 'PRESENTES') return isPresent;
    if (activeTab === 'AUSENTES') return !isPresent;
    return true; // 'TODOS'
  });

  // Pagination bounds
  const totalItems = filteredParticipacoes.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;

  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);
  const paginatedParticipacoes = filteredParticipacoes.slice(startIndex, endIndex);

  // Visible selected count (for page selection)
  const visibleSelected = paginatedParticipacoes.length > 0 && paginatedParticipacoes.every(p => presentes.includes(p.id));

  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const visibleIds = paginatedParticipacoes.map(p => p.id);
    if (e.target.checked) {
      setPresentes(prev => {
        const next = [...prev];
        visibleIds.forEach(vid => {
          if (!next.includes(vid)) {
            next.push(vid);
          }
        });
        return next;
      });
    } else {
      setPresentes(prev => prev.filter(vid => !visibleIds.includes(vid)));
    }
  };

  const handleCheckboxChange = (partId: string, checked: boolean) => {
    if (checked) {
      setPresentes(prev => [...prev, partId]);
    } else {
      setPresentes(prev => prev.filter(vid => vid !== partId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!event) return;

    try {
      setLoading(true);
      const result = await db.concludeEvent(event.id, presentes);
      const total = result?.certificadosGerados ?? 0;
      sessionStorage.setItem(
        'muttley_cert_msg',
        `Evento concluido com sucesso. ${total} certificado${total === 1 ? '' : 's'} gerado${total === 1 ? '' : 's'}.`,
      );
      navigate('/admin/certificados');
    } catch (err: any) {
      setErro(err.message || 'Erro ao processar e concluir o evento.');
      setLoading(false);
    }
  };

  if (loading && !event) {
    return <CompletionSkeleton />;
  }

  if (!event) {
    return (
      <div className="admin-page text-center py-12">
        <h2 className="text-xl text-brand-danger">Evento não encontrado.</h2>
        <Link to="/admin/eventos" className="primary-action mt-4">Voltar</Link>
      </div>
    );
  }

  const percentPresent = parsedParticipacoes.length > 0 
    ? Math.round((presentes.length / parsedParticipacoes.length) * 100)
    : 0;

  return (
    <div className="admin-page">
      <div className="page-title-row">
        <div>
          <h1>Concluir evento</h1>
          <p className="completion-subtitle text-sm text-brand-muted mt-1">
            {event.tema}
          </p>
        </div>
        <Link className="link-action" to="/admin/eventos">Voltar</Link>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}

      <div className="completion-hero grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mb-8">
        <article className="summary-card p-4 bg-brand-surface border border-brand-line rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-xs text-brand-muted font-bold">
            <svg aria-hidden="true" className="w-4 h-4 text-brand-primary" viewBox="0 0 24 24">
              <rect x="4" y="5" width="16" height="15" rx="2"></rect>
              <path d="M8 3v4M16 3v4M4 10h16"></path>
            </svg>
            <span>Data e horário</span>
          </div>
          <strong className="text-xl font-bold text-brand-ink-strong mt-2 block">
            {new Date(event.data).toLocaleDateString('pt-BR')}
          </strong>
          <small className="text-xs text-brand-muted mt-1 block">
            {event.horarioInicio} - {event.horarioFim}
          </small>
        </article>

        <article className="summary-card p-4 bg-brand-surface border border-brand-line rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-xs text-brand-muted font-bold">
            <svg aria-hidden="true" className="w-4 h-4 text-brand-primary" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M12 7v5l3 3"></path>
            </svg>
            <span>Status atual</span>
          </div>
          <strong className="text-xl font-bold text-brand-primary mt-2 block">
            {event.status.replace('_', ' ')}
          </strong>
          <small className="text-[10px] text-brand-primary font-bold mt-1 block uppercase">
            Somente presentes receberão certificado
          </small>
        </article>
      </div>

      {/* Attendance Percentage Progress Bar */}
      <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
          <span style={{ fontWeight: 'bold', color: 'var(--ink-strong)' }}>Taxa de Presença Geral</span>
          <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{percentPresent}% ({presentes.length} de {parsedParticipacoes.length})</span>
        </div>
        <div style={{ width: '100%', height: '0.6rem', backgroundColor: 'var(--line)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ width: `${percentPresent}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.3s ease-out' }} />
        </div>
      </div>

      {/* Tabs for Filtering Presence */}
      <div className="flex border-b border-brand-line mb-4" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--line)', marginBottom: '1.5rem' }}>
        {(['TODOS', 'PRESENTES', 'AUSENTES'] as const).map(tab => {
          const count = 
            tab === 'TODOS' ? parsedParticipacoes.length : 
            tab === 'PRESENTES' ? presentes.length : 
            parsedParticipacoes.length - presentes.length;
          
          const label = 
            tab === 'TODOS' ? 'Todos' : 
            tab === 'PRESENTES' ? 'Presentes' : 
            'Não Confirmados';

          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 0.5rem',
                cursor: 'pointer',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                color: isActive ? 'var(--primary)' : 'var(--muted)',
                fontWeight: isActive ? 'bold' : 'normal',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>{label}</span>
              <span style={{
                fontSize: '0.75rem',
                padding: '0.1rem 0.45rem',
                backgroundColor: isActive ? 'var(--primary-soft)' : 'var(--surface-soft)',
                color: isActive ? 'var(--primary-strong)' : 'var(--muted)',
                borderRadius: '999px',
                fontWeight: 'bold',
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Selection Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 'var(--radius)', backgroundColor: 'var(--surface)', padding: '0 0.75rem', flex: 1, minWidth: '260px', height: '2.55rem' }}>
          <svg style={{ color: 'var(--muted)', marginRight: '0.5rem', width: '1rem', height: '1rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou inscrição..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.88rem', backgroundColor: 'transparent', color: 'var(--ink)' }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontWeight: 'bold', fontSize: '1.1rem' }}
            >
              ×
            </button>
          )}
        </div>
        
        {/* Toggle select-all switch */}
        {paginatedParticipacoes.length > 0 && (
          <label className="attendance-toggle flex items-center gap-2 text-xs font-bold text-brand-ink cursor-pointer">
            <input
              type="checkbox"
              checked={visibleSelected}
              onChange={handleToggleSelectAll}
              className="accent-brand-primary"
            />
            <span>Selecionar todos visíveis ({paginatedParticipacoes.length})</span>
          </label>
        )}
      </div>

      <form className="completion-form flex flex-col gap-4" onSubmit={handleSubmit}>
        <section className="participants-section mt-2" aria-labelledby="participacoes-title">
          {paginatedParticipacoes.length === 0 ? (
            <div className="empty-state compact-empty p-8 bg-brand-surface border border-brand-line rounded-lg text-center text-brand-muted">
              <p>Nenhuma participação encontrada para os filtros aplicados.</p>
            </div>
          ) : (
            <>
              <table className="participants-table">
                <thead>
                  <tr>
                    <th className="w-24 text-center">Presença</th>
                    <th>Inscrição</th>
                    <th>Participante</th>
                    <th>Tipo</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedParticipacoes.map(part => {
                    const isChecked = presentes.includes(part.id);

                    return (
                      <tr key={part.id}>
                        <td className="text-center">
                          <label className="attendance-check flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              name="presentes"
                              checked={isChecked}
                              onChange={(e) => handleCheckboxChange(part.id, e.target.checked)}
                              className="w-4 h-4 accent-brand-primary"
                            />
                          </label>
                        </td>
                        <td>#{part.inscricao}</td>
                        <td><strong>{part.nome}</strong></td>
                        <td>{part.tipo}</td>
                        <td>{part.email}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Local client-side pagination */}
              {totalPages > 1 && (
                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', marginTop: '1.5rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="table-action"
                    style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                  >
                    Anterior
                  </button>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    Página <strong>{currentPage}</strong> de {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="table-action"
                    style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <div className="form-actions completion-actions flex justify-end gap-3 mt-6">
          <Link to="/admin/eventos" className="px-4 py-2 border border-brand-line rounded-lg text-sm text-brand-muted hover:bg-slate-100">
            Cancelar
          </Link>
          <button
            className="primary-action px-6 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary-strong transition-colors cursor-pointer text-sm"
            type="submit"
            disabled={loading || participacoes.length === 0}
          >
            {loading ? 'Processando...' : 'Gerar certificados e concluir'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventConclude;
