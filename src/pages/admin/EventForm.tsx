import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import db from '../../data/mockDb';
import { AutocompleteInput } from '../../components/AutocompleteInput';
import type { Discipline, Sponsor, Local, Participation, Person, StatusEvento } from '../../data/types';
import { FormSkeleton } from '../../components/ui';

export const EventForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [tema, setTema] = useState('');
  const [data, setData] = useState('');
  const [horarioInicio, setHorarioInicio] = useState('');
  const [horarioFim, setHorarioFim] = useState('');
  const [modalidade, setModalidade] = useState<'PRESENCIAL' | 'ONLINE' | 'HIBRIDO'>('PRESENCIAL');
  const [disciplinaId, setDisciplinaId] = useState('');
  const [patrocinadorId, setPatrocinadorId] = useState('');
  const [localId, setLocalId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [eventStatus, setEventStatus] = useState<StatusEvento>('CRIADO');
  
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [participacoes, setParticipacoes] = useState<Participation[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [step, setStep] = useState(1);

  // Load existing event and dropdown details
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [discs, sps, locs, pps] = await Promise.all([
          db.getDisciplines(),
          db.getSponsors(),
          db.getLocais(),
          db.getPeople()
        ]);
        setDisciplines(discs);
        setSponsors(sps);
        setLocais(locs);
        setPeople(pps);

        if (id) {
          try {
            const found = await db.getEventById(id);
            if (found) {
              setTema(found.tema);
              setData(found.data);
              setHorarioInicio(found.horarioInicio);
              setHorarioFim(found.horarioFim);
              setModalidade(found.modalidade);
              setDisciplinaId(found.disciplinaId || '');
              setPatrocinadorId(found.patrocinadorId || '');
              setLocalId(found.localId || '');
              setDescricao(found.descricao || '');
              setEventStatus(found.status);

              // Try to load event-specific participations
              const parts = await db.getEventParticipations(id);
              setParticipacoes(parts);
            } else {
              setErro('Evento não encontrado.');
            }
          } catch (err) {
            // Fallback for finalized events since /participacoes endpoint might block
            const events = await db.getEvents();
            const found = events.find(e => e.id === id);
            if (found) {
              setTema(found.tema);
              setData(found.data);
              setHorarioInicio(found.horarioInicio);
              setHorarioFim(found.horarioFim);
              setModalidade(found.modalidade);
              setDisciplinaId(found.disciplinaId || '');
              setPatrocinadorId(found.patrocinadorId || '');
              setLocalId(found.localId || '');
              setDescricao(found.descricao || '');
              setEventStatus(found.status);

              const allParts = await db.getParticipations();
              setParticipacoes(allParts.filter(p => p.eventoId === id));
            } else {
              setErro('Evento não encontrado.');
            }
          }
        }
      } catch (err: any) {
        setErro(err.message || 'Erro ao carregar dados do formulário.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const participacaoList = participacoes.map(part => {
    const person = part.pessoa || people.find(p => p.id === part.pessoaId);
    return {
      id: part.id,
      inscricao: part.inscricao,
      nome: person?.nome || 'Participante não informado',
      tipo: part.tipo,
      email: person?.email || '-',
    };
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSave = async () => {
    setErro('');

    if (step !== 3) {
      return;
    }

    if (!tema || !data || !horarioInicio || !horarioFim || !modalidade) {
      setErro('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setLoading(true);
      await db.saveEvent({
        id: id || undefined,
        tema,
        data,
        horarioInicio,
        horarioFim,
        modalidade,
        disciplinaId: disciplinaId || undefined,
        patrocinadorId: patrocinadorId || undefined,
        localId: localId || undefined,
        descricao,
      });
      navigate('/admin/eventos');
    } catch (err: any) {
      setErro(err.message || 'Erro ao salvar o evento.');
      setLoading(false);
    }
  };

  if (loading && step === 1 && !tema) {
    return <div className="admin-page"><FormSkeleton fields={5} steps /></div>;
  }

  const isFinalized = eventStatus === 'FINALIZADO';

  const disciplineOptions = disciplines.map(d => ({ id: d.id, label: d.nome }));
  const sponsorOptions = sponsors.map(s => ({ id: s.id, label: s.nome }));
  const localOptions = locais.map(l => ({ id: l.id, label: l.nome }));

  const steps = [
    { number: 1, label: 'Informações Gerais' },
    { number: 2, label: 'Local e Horário' },
    { number: 3, label: 'Vinculações' }
  ];

  const handleNextStep = () => {
    setErro('');
    if (step === 1) {
      if (!tema) {
        setErro('Tema do evento é obrigatório.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!data || !horarioInicio || !horarioFim) {
        setErro('Data, horário de início e término são obrigatórios.');
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setErro('');
    setStep(prev => prev - 1);
  };

  return (
    <div className="admin-page">
      <h1>{id ? isFinalized ? 'Detalhes do evento' : 'Editar evento' : 'Novo evento'}</h1>

      {erro && <div className="alert alert-danger">{erro}</div>}

      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--line)' }}>
        {steps.map((s, idx) => {
          const isActive = step === s.number;
          const isCompleted = step > s.number;
          return (
            <React.Fragment key={s.number}>
              <button
                type="button"
                onClick={() => {
                  if (isFinalized) {
                    setStep(s.number);
                    return;
                  }
                  if (s.number < step) {
                    setStep(s.number);
                    setErro('');
                  } else {
                    if (step === 1) {
                      if (!tema) {
                        setErro('Tema do evento é obrigatório.');
                        return;
                      }
                      setStep(s.number);
                      setErro('');
                    } else if (step === 2) {
                      if (!data || !horarioInicio || !horarioFim) {
                        setErro('Data, horário de início e término são obrigatórios.');
                        return;
                      }
                      setStep(s.number);
                      setErro('');
                    }
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                  color: isActive ? 'var(--primary)' : isCompleted ? 'var(--ink)' : 'var(--muted)',
                  fontWeight: isActive ? 'bold' : 'normal',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: '50%',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  backgroundColor: isActive ? 'var(--primary)' : isCompleted ? 'var(--primary-soft)' : 'var(--line)',
                  color: isActive ? '#fff' : 'var(--ink)',
                }}>
                  {isCompleted ? '✓' : s.number}
                </span>
                <span className="step-label" style={{ fontSize: '0.85rem' }}>{s.label}</span>
              </button>
              {idx < steps.length - 1 && (
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--line)', margin: '0 1rem' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <form className="event-form" onSubmit={handleFormSubmit}>
        {step === 1 && (
          <div className="form-grid">
            <label className="field col-span-2">
              <span>Tema do evento:*</span>
              <input
                type="text"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="Nome ou tema do evento"
                required
                disabled={isFinalized}
              />
            </label>

            <label className="field col-span-2">
              <span>Modalidade:*</span>
              <select
                value={modalidade}
                onChange={(e) => setModalidade(e.target.value as any)}
                required
                disabled={isFinalized}
              >
                <option value="PRESENCIAL">Presencial</option>
                <option value="ONLINE">Online</option>
                <option value="HIBRIDO">Híbrido</option>
              </select>
            </label>

            <label className="field description-field col-span-2">
              <span>Descrição:</span>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição do evento"
                rows={4}
                disabled={isFinalized}
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="form-grid">
            <label className="field col-span-2">
              <span>Data:*</span>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
                disabled={isFinalized}
              />
            </label>

            <fieldset className="date-group">
              <legend className="text-sm font-semibold text-brand-ink-strong">Início:*</legend>
              <input
                type="time"
                value={horarioInicio}
                onChange={(e) => setHorarioInicio(e.target.value)}
                required
                disabled={isFinalized}
                className="border border-brand-line p-2 rounded-lg text-sm bg-brand-surface w-full mt-1.5"
              />
            </fieldset>

            <fieldset className="date-group">
              <legend className="text-sm font-semibold text-brand-ink-strong">Fim:*</legend>
              <input
                type="time"
                value={horarioFim}
                onChange={(e) => setHorarioFim(e.target.value)}
                required
                disabled={isFinalized}
                className="border border-brand-line p-2 rounded-lg text-sm bg-brand-surface w-full mt-1.5"
              />
            </fieldset>

            <div className="field col-span-2 description-field">
              <span>Local:</span>
              <AutocompleteInput
                options={localOptions}
                value={localId}
                onChange={setLocalId}
                placeholder="Buscar local..."
                disabled={isFinalized}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-grid">
            <div className="field col-span-2 description-field">
              <span>Disciplina:</span>
              <AutocompleteInput
                options={disciplineOptions}
                value={disciplinaId}
                onChange={setDisciplinaId}
                placeholder="Buscar disciplina..."
                disabled={isFinalized}
              />
            </div>

            <div className="field col-span-2 description-field">
              <span>Patrocinador:</span>
              <AutocompleteInput
                options={sponsorOptions}
                value={patrocinadorId}
                onChange={setPatrocinadorId}
                placeholder="Buscar patrocinador..."
                disabled={isFinalized}
              />
            </div>
          </div>
        )}

        <div className="form-actions" style={{ justifyContent: 'space-between' }}>
          <div>
            {step > 1 && (
              <button
                className="link-action"
                type="button"
                onClick={handlePrevStep}
                style={{ cursor: 'pointer', background: 'var(--surface-soft)', border: '1px solid var(--line)' }}
              >
                ← Voltar
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/admin/eventos" className="link-action">Cancelar</Link>
            {step < 3 ? (
              <button
                className="primary-action"
                type="button"
                onClick={handleNextStep}
              >
                Avançar →
              </button>
            ) : (
              !isFinalized && (
                <button className="primary-action" type="button" disabled={loading} onClick={handleSave}>
                  {loading ? 'Salvando...' : id ? 'Salvar alterações' : 'Criar evento'}
                </button>
              )
            )}
          </div>
        </div>
      </form>

      {id && (
        <section className="participants-section mt-8" aria-labelledby="participacoes-title">
          <div className="participants-heading mb-4">
            <h2 id="participacoes-title" className="text-lg font-bold text-brand-ink-strong">
              Participações ({participacaoList.length})
            </h2>
          </div>

          {participacaoList.length === 0 ? (
            <div className="empty-state compact-empty p-6 bg-brand-surface border border-brand-line rounded-lg text-center text-brand-muted">
              <p>Nenhuma participação cadastrada para este evento.</p>
            </div>
          ) : (
            <div className="ui-table-wrap">
            <table className="participants-table event-participants-table">
              <thead>
                <tr>
                  <th>Inscrição</th>
                  <th>Participante</th>
                  <th>Tipo</th>
                  <th>Email</th>
                  {isFinalized && <th>Medalha</th>}
                </tr>
              </thead>
              <tbody>
                {participacaoList.map(part => (
                  <tr key={part.id}>
                    <td>#{part.inscricao}</td>
                    <td><strong>{part.nome}</strong></td>
                    <td>{part.tipo}</td>
                    <td>{part.email}</td>
                    {isFinalized && (
                      <td>
                        <Link
                          to={`/admin/medalhas/novo?participacaoId=${part.id}`}
                          className="table-action font-semibold"
                        >
                          Adicionar Medalha
                        </Link>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default EventForm;
