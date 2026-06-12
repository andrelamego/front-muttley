import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import db from '../../data/mockDb';
import type { Event, Participation, Discipline, Sponsor, Local, Address } from '../../data/types';
import { UserEventDetailSkeleton } from '../../components/ui';
import { toast } from '../../components/ui/Toast';

export const UserEventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [participacoes, setParticipacoes] = useState<Participation[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const loggedUser = db.getLoggedUser();

  const loadData = () => {
    if (!id) return;
    setLoading(true);
    
    Promise.all([
      db.getEventById(id).catch(() => null),
      db.getParticipations(),
      db.getDisciplines(),
      db.getSponsors(),
      db.getLocais(),
      db.getAddresses()
    ]).then(([evt, parts, discs, spons, locs, addrs]) => {
      setEvent(evt);
      setParticipacoes(parts);
      setDisciplines(discs);
      setSponsors(spons);
      setLocais(locs);
      setAddresses(addrs);
    }).catch((err) => toast.error(err.message || 'Erro ao carregar o evento.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return <UserEventDetailSkeleton />;
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center p-8 bg-brand-surface rounded-xl border border-brand-line shadow-md">
          <h2 className="text-xl font-bold text-brand-danger">Evento não encontrado</h2>
          <Link to="/login" className="primary-action mt-4 inline-flex items-center">
            Ir para Login
          </Link>
        </div>
      </div>
    );
  }

  // Check if already registered
  const userPart = loggedUser 
    ? participacoes.find(p => p.eventoId === event.id && p.pessoaId === loggedUser.id)
    : null;

  const isEnrolled = !!userPart;
  const inscricoesEncerradas = event.status === 'FINALIZADO' || event.status === 'CANCELADO';

  // Date styling
  const dateObj = new Date(event.data);
  const day = event.data ? dateObj.getDate() + 1 : 12; // adjustment for UTC conversion shift
  const monthName = event.data ? dateObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '') : 'mai';

  const handleEnroll = async () => {
    if (!loggedUser) {
      // Save redirect target
      sessionStorage.setItem('muttley_redirect_url', `/user/evento/${event.id}`);
      navigate('/login');
      return;
    }

    try {
      const newPart = {
        eventoId: event.id,
        pessoaId: loggedUser.id,
        tipo: 'Aluno' as const,
      };

      await db.saveParticipation(newPart);
      toast.success('Inscrição realizada com sucesso!');
      
      // Reload participations
      const updatedParts = await db.getParticipations();
      setParticipacoes(updatedParts);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao realizar inscrição.');
    }
  };

  // Find linked models
  const discipline = disciplines.find(d => d.id === event.disciplinaId);
  const sponsor = sponsors.find(s => s.id === event.patrocinadorId);
  const local = locais.find(l => l.id === event.localId);
  const address = local ? addresses.find(a => a.id === local.enderecoId) : null;

  return (
    <div className="user-event-body min-h-screen py-6">
      <main className="user-event-page max-w-3xl mx-auto px-4">
        {/* Back Link to User Home */}
        <div className="mb-4">
          <Link to="/user/inicio" className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline">
            ← Voltar para a Página Inicial
          </Link>
        </div>

        <section className="user-event-hero grid grid-cols-[auto_1fr] gap-6 items-start mt-6">
          <div className="user-event-date-card flex flex-col items-center justify-center p-3 w-20 h-24 bg-brand-surface border border-brand-line rounded-lg shadow-sm">
            <span className="text-3xl font-extrabold text-brand-ink-strong">{day}</span>
            <strong className="text-xs font-bold text-brand-primary uppercase mt-1">{monthName}</strong>
          </div>

          <div className="user-event-heading min-w-0">
            <span className={`user-event-status ${inscricoesEncerradas ? 'is-closed' : ''} text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-brand-primary-soft text-brand-primary-strong`}>
              {inscricoesEncerradas ? 'Encerrado' : isEnrolled ? 'Você está inscrito' : 'Inscrições abertas'}
            </span>
            <h1 id="event-title" className="text-3xl font-extrabold text-brand-ink-strong mt-2">
              {event.tema}
            </h1>
            <p className="text-brand-muted text-sm mt-3 leading-relaxed">
              {event.descricao || 'Nenhuma descrição cadastrada.'}
            </p>
          </div>
        </section>

        <section className="user-event-action-panel mt-6">
          {isEnrolled ? (
            <div className="p-4 bg-brand-surface-soft border border-brand-primary/30 rounded-lg text-brand-primary-strong text-sm font-semibold text-center flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
              </svg>
              Sua inscrição está confirmada (Código #{userPart.inscricao})
            </div>
          ) : (
            <button
              className={`event-signup-button w-full py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary-strong transition-colors cursor-pointer text-base ${
                inscricoesEncerradas ? 'is-muted !bg-slate-400 !cursor-not-allowed' : ''
              }`}
              type="button"
              disabled={inscricoesEncerradas}
              onClick={handleEnroll}
            >
              {inscricoesEncerradas ? 'Inscrições encerradas' : 'Inscrever-se no Evento'}
            </button>
          )}
        </section>

        <section className="user-event-details grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8" aria-label="Informações do evento">
          <article className="user-event-info-card bg-brand-surface p-4 border border-brand-line rounded-lg shadow-sm flex flex-col">
            <span className="text-xs text-brand-muted font-bold uppercase tracking-wider">Data</span>
            <strong className="text-sm font-bold text-brand-ink-strong mt-1">
              {event.data ? new Date(event.data).toLocaleDateString('pt-BR') : 'Data não informada'}
            </strong>
          </article>

          <article className="user-event-info-card bg-brand-surface p-4 border border-brand-line rounded-lg shadow-sm flex flex-col">
            <span className="text-xs text-brand-muted font-bold uppercase tracking-wider">Horário</span>
            <strong className="text-sm font-bold text-brand-ink-strong mt-1">
              {event.horarioInicio} - {event.horarioFim}
            </strong>
          </article>

          <article className="user-event-info-card bg-brand-surface p-4 border border-brand-line rounded-lg shadow-sm flex flex-col">
            <span className="text-xs text-brand-muted font-bold uppercase tracking-wider">Modalidade</span>
            <strong className="text-sm font-bold text-brand-ink-strong mt-1 capitalize">
              {event.modalidade.toLowerCase()}
            </strong>
          </article>

          <article className="user-event-info-card bg-brand-surface p-4 border border-brand-line rounded-lg shadow-sm flex flex-col">
            <span className="text-xs text-brand-muted font-bold uppercase tracking-wider">Disciplina Vinculada</span>
            <strong className="text-sm font-bold text-brand-ink-strong mt-1">
              {discipline?.nome || 'Nenhuma disciplina vinculada'}
            </strong>
          </article>

          <article className="user-event-info-card bg-brand-surface p-4 border border-brand-line rounded-lg shadow-sm flex flex-col">
            <span className="text-xs text-brand-muted font-bold uppercase tracking-wider">Local</span>
            <strong className="text-sm font-bold text-brand-ink-strong mt-1">
              {local?.nome || 'Local não definido'}
            </strong>
            {local?.descricao && (
              <small className="text-xs text-brand-muted mt-0.5">{local.descricao}</small>
            )}
          </article>

          <article className="user-event-info-card bg-brand-surface p-4 border border-brand-line rounded-lg shadow-sm flex flex-col">
            <span className="text-xs text-brand-muted font-bold uppercase tracking-wider">Endereço</span>
            <strong className="text-sm font-bold text-brand-ink-strong mt-1">
              {address ? `${address.logradouro}, ${address.numero}` : 'Endereço não definido'}
            </strong>
            {address && (
              <small className="text-xs text-brand-muted mt-0.5">
                {address.bairro} - {address.cidade}/{address.estado}
              </small>
            )}
          </article>

          <article className="user-event-info-card bg-brand-surface p-4 border border-brand-line rounded-lg shadow-sm flex flex-col">
            <span className="text-xs text-brand-muted font-bold uppercase tracking-wider">Capacidade</span>
            <strong className="text-sm font-bold text-brand-ink-strong mt-1">
              {local?.capacidade ? `${local.capacidade} vagas` : 'Não informada'}
            </strong>
          </article>

          <article className="user-event-info-card bg-brand-surface p-4 border border-brand-line rounded-lg shadow-sm flex flex-col">
            <span className="text-xs text-brand-muted font-bold uppercase tracking-wider">Patrocinador</span>
            <strong className="text-sm font-bold text-brand-ink-strong mt-1">
              {sponsor?.nome || 'Sem patrocínio'}
            </strong>
            {sponsor?.site && (
              <a href={sponsor.site} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-primary hover:underline mt-0.5">
                {sponsor.site}
              </a>
            )}
          </article>
        </section>
      </main>
    </div>
  );
};

export default UserEventDetail;
