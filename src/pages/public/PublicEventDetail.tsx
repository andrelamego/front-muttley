import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import db from '../../data/mockDb';
import type { PublicEvent } from '../../data/types';
import { LoadingState, StatusBadge } from '../../components/ui';

export const PublicEventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const loggedUser = db.getLoggedUser();
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState<{ message: string; inscricao: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nomeCompleto: '',
    cpf: '',
    email: '',
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    db.getPublicEventById(id)
      .then(setEvent)
      .catch((err) => setError(err.message || 'Evento nao encontrado.'))
      .finally(() => setLoading(false));
  }, [id]);

  const submitInscription = async (
    payload: { nomeCompleto: string; cpf: string; email: string },
    options: { fromLoggedUser?: boolean } = {},
  ) => {
    if (!id || !event) return;

    setError('');

    const normalizedPayload = {
      nomeCompleto: payload.nomeCompleto.trim(),
      cpf: payload.cpf.trim(),
      email: payload.email.trim(),
    };

    if (!normalizedPayload.nomeCompleto || !normalizedPayload.email || !normalizedPayload.cpf) {
      setError(options.fromLoggedUser
        ? 'Nao foi possivel localizar nome, CPF e e-mail da sua conta. Saia e entre novamente.'
        : 'Preencha nome, CPF e e-mail para concluir a inscricao.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await db.createPublicInscription(id, {
        nomeCompleto: normalizedPayload.nomeCompleto,
        cpf: normalizedPayload.cpf,
        email: normalizedPayload.email,
      });
      setConfirmation({
        message: response.message,
        inscricao: response.inscricao,
      });
      setForm({ nomeCompleto: '', cpf: '', email: '' });
    } catch (err: any) {
      setError(err.message || 'Nao foi possivel realizar sua inscricao.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();
    await submitInscription(form);
  };

  const handleLoggedUserSignup = async () => {
    if (!loggedUser) return;

    let userData = loggedUser;

    try {
      userData = await db.getMe();
    } catch (err) {
      console.error('Nao foi possivel atualizar os dados do usuario logado pelo endpoint /me.', err);
    }

    await submitInscription({
      nomeCompleto: userData.nome,
      cpf: userData.cpf,
      email: userData.email,
    }, { fromLoggedUser: true });
  };

  if (loading) {
    return <LoadingState label="Carregando evento" />;
  }

  if (!event) {
    return (
      <main className="public-event-detail-page">
        <div className="public-event-not-found">
          <h1>Evento nao encontrado</h1>
          <Link className="primary-action" to="/eventos">Voltar aos eventos</Link>
        </div>
      </main>
    );
  }

  const date = event.data ? new Date(`${event.data}T00:00:00`) : null;
  const formattedDate = date ? date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }) : 'Data nao informada';

  return (
    <main className="public-event-detail-page">
      <Link className="public-event-back" to="/eventos">Voltar aos eventos</Link>

      <section className="public-event-detail-layout">
        <article className="public-event-detail-main">
          <div className="public-event-detail-kicker">
            <StatusBadge
              status={event.inscricoesEncerradas ? 'FINALIZADO' : event.status}
              label={event.inscricoesEncerradas ? 'Inscricoes encerradas' : undefined}
            />
            <span>{event.modalidade.toLowerCase()}</span>
          </div>

          <h1>{event.tema}</h1>
          <p>{event.descricao || 'Evento academico da Fatec Zona Leste.'}</p>

          <div className="public-event-detail-meta">
            <span><CalendarDays aria-hidden="true" />{formattedDate}</span>
            <span><Clock aria-hidden="true" />{event.horarioInicio} - {event.horarioFim}</span>
            <span><MapPin aria-hidden="true" />{event.local || 'Local nao informado'}</span>
          </div>

          {event.disciplina && (
            <div className="public-event-detail-discipline">
              <span>Disciplina</span>
              <strong>{event.disciplina}</strong>
            </div>
          )}
        </article>

        <aside className="public-event-signup-panel">
          <span>Inscricao</span>
          <h2>{event.inscricoesEncerradas ? 'Inscricoes encerradas' : 'Reserve sua participacao'}</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          {loggedUser ? (
            <div className="public-event-logged-signup">
              <p>Vamos usar os dados da sua conta para confirmar a inscricao.</p>
              <strong>{loggedUser.nome}</strong>
              <small>{loggedUser.email}</small>
              <button className="primary-action" type="button" onClick={handleLoggedUserSignup} disabled={event.inscricoesEncerradas || submitting}>
                {submitting ? 'Enviando...' : event.inscricoesEncerradas ? 'Inscricoes encerradas' : 'Inscrever-se'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className="field">
                <span>Nome completo:*</span>
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={form.nomeCompleto}
                  onChange={(changeEvent) => setForm((current) => ({ ...current, nomeCompleto: changeEvent.target.value }))}
                  disabled={event.inscricoesEncerradas || submitting}
                  required
                />
              </label>

              <label className="field">
                <span>CPF:*</span>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={(changeEvent) => setForm((current) => ({ ...current, cpf: changeEvent.target.value }))}
                  disabled={event.inscricoesEncerradas || submitting}
                  required
                />
              </label>

              <label className="field">
                <span>E-mail:*</span>
                <input
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={form.email}
                  onChange={(changeEvent) => setForm((current) => ({ ...current, email: changeEvent.target.value }))}
                  disabled={event.inscricoesEncerradas || submitting}
                  required
                />
              </label>

              <button className="primary-action" type="submit" disabled={event.inscricoesEncerradas || submitting}>
                {submitting ? 'Enviando...' : event.inscricoesEncerradas ? 'Inscricoes encerradas' : 'Inscrever-se'}
              </button>
            </form>
          )}
        </aside>
      </section>

      {confirmation && (
        <div className="modal-backdrop" role="presentation">
          <section className="public-inscription-modal" role="dialog" aria-modal="true" aria-labelledby="public-inscription-title">
            <button
              className="modal-close-button"
              type="button"
              aria-label="Fechar"
              onClick={() => setConfirmation(null)}
            >
              x
            </button>

            <div className="public-inscription-modal__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M20 6 9 17l-5-5"></path>
              </svg>
            </div>

            <div className="public-inscription-modal__content">
              <span>Inscricao confirmada</span>
              <h2 id="public-inscription-title">Voce esta inscrito no evento</h2>
              <p>{confirmation.message}</p>
              <strong>Numero de inscricao: #{confirmation.inscricao}</strong>
              <small>Todos os dados da sua inscricao serao enviados para o e-mail informado.</small>
            </div>

            <button className="primary-action" type="button" onClick={() => setConfirmation(null)}>
              Entendi
            </button>
          </section>
        </div>
      )}
    </main>
  );
};

export default PublicEventDetail;
