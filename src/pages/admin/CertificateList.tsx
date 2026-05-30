import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import db from '../../data/mockDb';
import type { Event, Certificate, Participation, Person, Local } from '../../data/types';
import { CertificatesSkeleton, PageHeader } from '../../components/ui';

const formatDate = (date: string) => {
  if (!date) return 'N/A';
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR');
};

export const CertificateList: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [participacoes, setParticipacoes] = useState<Participation[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [evts, certs, parts, pps, locs] = await Promise.all([
          db.getEvents(),
          db.getCertificates(),
          db.getParticipations(),
          db.getPeople(),
          db.getLocais()
        ]);
        setEvents(evts);
        setCertificates(certs);
        setParticipacoes(parts);
        setPeople(pps);
        setLocais(locs);
      } catch (err) {
        console.error('Error loading certificates list:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Load events waiting for certificate (status = EM_ANDAMENTO)
  const pendingEvents = events.filter(e => e.status === 'EM_ANDAMENTO');

  const latestCerts = certificates.map(c => {
    const enrichedPart = participacoes.find(p => p.id === c.participacaoId || p.id === c.participacao?.id);
    const part = enrichedPart || c.participacao || null;
    const person = part ? part.pessoa || people.find(p => p.id === part.pessoaId) : null;
    const event = enrichedPart?.evento || (part ? events.find(e => e.id === part.eventoId) : null);
    return {
      id: c.id,
      dataEmissao: c.dataEmissao,
      participante: person?.nome || 'Participante nao informado',
      evento: event?.tema || 'Evento nao informado',
      assinatura: c.assinatura || '-',
      codigoValidacao: c.codigoValidacao,
      urlPublica: `/certificados/${c.codigoValidacao}`,
    };
  }).reverse(); // Latest first

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
  }, [events]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -336 : 336;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return <CertificatesSkeleton />;
  }

  return (
    <div className="admin-page certificates-page">
      <PageHeader
        eyebrow="Certificacao"
        title="Certificados"
        description="Conclua eventos, gere certificados e acompanhe os ultimos documentos emitidos."
        compact
      />

      <section className="events-section mb-8" aria-labelledby="pending-certificates-title">
        <div className="section-heading flex items-center justify-between mb-4">
          <h2 id="pending-certificates-title" className="text-lg font-bold text-brand-ink-strong">
            Eventos aguardando emissão
          </h2>
        </div>

        {pendingEvents.length > 0 ? (
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
              {pendingEvents.map(evento => {
                const local = locais.find(l => l.id === evento.localId);
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
        ) : (
          <div className="empty-state p-8 bg-brand-surface border border-brand-line rounded-lg text-center text-brand-muted">
            <p>Nenhum evento em andamento aguardando emissão.</p>
          </div>
        )}
      </section>

      <section className="certificate-overview mb-8" aria-label="Modelo do certificado e resumo">
        <article className="certificate-preview-panel">
          <div className="section-heading flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-brand-ink-strong">Modelo do certificado</h2>
            <Link className="link-action text-brand-primary font-bold hover:underline text-xs" to="/certificados/MUTE-928A-817B" target="_blank">
              Abrir modelo (Visualização pública)
            </Link>
          </div>
          <div className="certificate-preview-shell border border-brand-line rounded-xl overflow-hidden aspect-[1.7/1] shadow-sm bg-white relative max-w-2xl mx-auto flex items-center justify-center p-6 text-center">
            {/* Visual representation of the layout inside a card */}
            <div className="border-4 border-brand-line p-4 w-full h-full flex flex-col justify-between items-center" style={{ backgroundImage: "url('/Fundo.jpg')", backgroundSize: 'cover' }}>
              <h3 className="text-2xl font-serif font-bold text-amber-500 tracking-wider">CERTIFICADO</h3>
              <div className="my-2">
                <p className="text-[10px] text-slate-800">Este certificado é concedido ao participante</p>
                <h4 className="text-xs font-bold text-slate-900 border-b border-brand-primary/20 pb-0.5 mt-1 inline-block px-2">
                  [Nome do Participante]
                </h4>
                <p className="text-[9px] text-slate-600 max-w-sm mx-auto mt-2 leading-relaxed">
                  por participar e concluir as atividades do evento <strong>[Tema do Evento]</strong> realizado em [Data do Evento], promovido pela FATEC Zona Leste.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-24 border-t border-slate-900 my-0.5"></div>
                <p className="text-[8px] text-slate-500">Coordenador do curso de ADS</p>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="latest-certificates mt-12" aria-labelledby="latest-certificates-title">
        <div className="section-heading mb-4">
          <h2 id="latest-certificates-title" className="text-lg font-bold text-brand-ink-strong">
            Últimos certificados emitidos
          </h2>
        </div>

        <div className="people-panel">
          <table className="participants-table">
            <thead>
              <tr>
                <th>Emissão</th>
                <th>Participante</th>
                <th>Evento</th>
                <th>Assinatura</th>
                <th>Validação</th>
              </tr>
            </thead>
            <tbody>
              {latestCerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center">Nenhum certificado emitido.</td>
                </tr>
              ) : (
                latestCerts.map(cert => {
                  return (
                    <tr key={cert.id}>
                      <td>{formatDate(cert.dataEmissao)}</td>
                      <td><strong>{cert.participante}</strong></td>
                      <td>{cert.evento}</td>
                      <td className="font-mono text-xs max-w-xs truncate" title={cert.assinatura}>{cert.assinatura}</td>
                      <td>
                        <Link className="table-action" to={cert.urlPublica}>
                          Abrir
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default CertificateList;
