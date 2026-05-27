import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import db from '../../data/mockDb';
import type { Participation, Person, Event } from '../../data/types';

export const MedalForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const participacaoIdParam = searchParams.get('participacaoId');

  const [nome, setNome] = useState('');
  const [participacaoId, setParticipacaoId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [participacoes, setParticipacoes] = useState<Participation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Load existing medal and options
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [parts, evts, pps] = await Promise.all([
          db.getParticipations(),
          db.getEvents(),
          db.getPeople()
        ]);
        setParticipacoes(parts);
        setEvents(evts);
        setPeople(pps);

        if (id) {
          const medals = await db.getMedals();
          const found = medals.find(m => m.id === id);
          if (found) {
            setNome(found.nome);
            setParticipacaoId(found.participacaoId);
            setDescricao(found.descricao);
          } else {
            setErro('Medalha não encontrada.');
          }
        } else if (participacaoIdParam) {
          setParticipacaoId(participacaoIdParam);
        }
      } catch (err: any) {
        setErro(err.message || 'Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, participacaoIdParam]);

  const options = participacoes.map(part => {
    const person = people.find(p => p.id === part.pessoaId);
    const event = events.find(e => e.id === part.eventoId);
    return {
      id: part.id,
      text: `#${part.inscricao} - ${person ? person.nome : 'Participante'} - ${event ? event.tema : 'Evento'}`,
    };
  });

  // Selected participation info for preview banner
  const selectedPart = participacoes.find(p => p.id === participacaoId);
  const selectedPerson = selectedPart ? people.find(p => p.id === selectedPart.pessoaId) : null;
  const selectedEvent = selectedPart ? events.find(e => e.id === selectedPart.eventoId) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!nome || !participacaoId || !descricao) {
      setErro('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setLoading(true);
      await db.saveMedal({
        id: id || undefined,
        nome,
        participacaoId,
        descricao,
      });
      navigate('/admin/medalhas');
    } catch (err: any) {
      setErro(err.message || 'Erro ao salvar medalha.');
      setLoading(false);
    }
  };

  if (loading && !nome && id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>{id ? 'Editar medalha' : 'Nova medalha'}</h1>

      {erro && <div className="alert alert-danger">{erro}</div>}

      <form className="event-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Nome:*</span>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome da medalha (ex: Destaque, Melhor Palestrante)"
              required
            />
          </label>

          <label className="field">
            <span>Participação:*</span>
            <select
              value={participacaoId}
              onChange={(e) => setParticipacaoId(e.target.value)}
              required
            >
              <option value="">Selecione uma participação</option>
              {options.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.text}
                </option>
              ))}
            </select>
          </label>

          {selectedPart && selectedPerson && selectedEvent && (
            <div className="selected-participation description-field col-span-2 p-4 bg-brand-surface-soft border border-brand-line rounded-lg flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-brand-muted">Participante Selecionado</span>
              <strong className="text-sm font-bold text-brand-ink-strong">{selectedPerson.nome}</strong>
              <small className="text-xs text-brand-muted">
                Inscrição #{selectedPart.inscricao} - {selectedEvent.tema}
              </small>
            </div>
          )}

          <label className="field description-field">
            <span>Descrição da Conquista:*</span>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o motivo da concessão da medalha..."
              rows={4}
              required
            />
          </label>
        </div>

        <div className="form-actions">
          <Link to="/admin/medalhas">Cancelar</Link>
          <button className="primary-action" type="submit" disabled={loading}>
            {loading ? 'Salvando...' : id ? 'Salvar alterações' : 'Criar medalha'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedalForm;
