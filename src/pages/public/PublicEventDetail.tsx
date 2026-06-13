import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
import db from '../../data/mockDb'
import type { PublicEvent } from '../../data/types'
import { PublicEventDetailSkeleton, StatusBadge } from '../../components/ui'
import { toast } from '../../components/ui/Toast'

export const PublicEventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const loggedUser = db.getLoggedUser()
  const [event, setEvent] = useState<PublicEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    nomeCompleto: '',
    cpf: '',
    email: '',
  })

  useEffect(() => {
    if (!id) return
    setLoading(true)
    db.getPublicEventById(id)
      .then(setEvent)
      .catch((err) => toast.error(err.message || 'Evento nao encontrado.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleCpfChange = (
    changeEvent: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = changeEvent.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)

    value = value.replace(/(\d{3})(\d)/, '$1.$2')
    value = value.replace(/(\d{3})(\d)/, '$1.$2')
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')

    setForm((current) => ({ ...current, cpf: value }))
  }

  const submitInscription = async (
    payload: { nomeCompleto: string; cpf: string; email: string },
    options: { fromLoggedUser?: boolean } = {}
  ) => {
    if (!id || !event) return

    const normalizedPayload = {
      nomeCompleto: payload.nomeCompleto.trim(),
      cpf: payload.cpf.trim(),
      email: payload.email.trim(),
    }

    if (
      !normalizedPayload.nomeCompleto ||
      !normalizedPayload.email ||
      !normalizedPayload.cpf
    ) {
      toast.warning(
        options.fromLoggedUser
          ? 'Nao foi possivel localizar nome, CPF e e-mail da sua conta. Saia e entre novamente.'
          : 'Preencha nome, CPF e e-mail para concluir a inscricao.'
      )
      return
    }

    try {
      setSubmitting(true)
      const response = await db.createPublicInscription(id, {
        nomeCompleto: normalizedPayload.nomeCompleto,
        cpf: normalizedPayload.cpf,
        email: normalizedPayload.email,
      })
      toast.success(
        `${response.message} Numero de inscricao: #${response.inscricao}`
      )
      setForm({ nomeCompleto: '', cpf: '', email: '' })
    } catch (err: any) {
      toast.error(err.message || 'Nao foi possivel realizar sua inscricao.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault()
    await submitInscription(form)
  }

  const handleLoggedUserSignup = async () => {
    if (!loggedUser) return

    let userData = loggedUser

    try {
      userData = await db.getMe()
    } catch (err) {
      console.error(
        'Nao foi possivel atualizar os dados do usuario logado pelo endpoint /me.',
        err
      )
      toast.warning(
        'Não foi possível atualizar os dados da sua conta. Usaremos os dados salvos neste dispositivo.'
      )
    }

    await submitInscription(
      {
        nomeCompleto: userData.nome,
        cpf: userData.cpf,
        email: userData.email,
      },
      { fromLoggedUser: true }
    )
  }

  if (loading) {
    return <PublicEventDetailSkeleton />
  }

  if (!event) {
    return (
      <main className="public-event-detail-page">
        <div className="public-event-not-found">
          <h1>Evento nao encontrado</h1>
          <Link className="primary-action" to="/eventos">
            Voltar aos eventos
          </Link>
        </div>
      </main>
    )
  }

  const date = event.data ? new Date(`${event.data}T00:00:00`) : null
  const formattedDate = date
    ? date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Data nao informada'

  return (
    <main className="public-event-detail-page">
      <Link className="public-event-back" to="/eventos">
        Voltar aos eventos
      </Link>

      <section className="public-event-detail-layout">
        <article className="public-event-detail-main">
          <div className="public-event-detail-kicker">
            <StatusBadge
              status={event.inscricoesEncerradas ? 'FINALIZADO' : event.status}
              label={
                event.inscricoesEncerradas ? 'Inscricoes encerradas' : undefined
              }
            />
            <span>{event.modalidade.toLowerCase()}</span>
          </div>

          <h1>{event.tema}</h1>
          <p>{event.descricao || 'Evento academico da Fatec Zona Leste.'}</p>

          <div className="public-event-detail-meta">
            <span>
              <CalendarDays aria-hidden="true" />
              {formattedDate}
            </span>
            <span>
              <Clock aria-hidden="true" />
              {event.horarioInicio} - {event.horarioFim}
            </span>
            <span>
              <MapPin aria-hidden="true" />
              {event.local || 'Local nao informado'}
            </span>
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
          <h2>
            {event.inscricoesEncerradas
              ? 'Inscricoes encerradas'
              : 'Reserve sua participacao'}
          </h2>

          {loggedUser ? (
            <div className="public-event-logged-signup">
              <p>
                Vamos usar os dados da sua conta para confirmar a inscricao.
              </p>
              <strong>{loggedUser.nome}</strong>
              <small>{loggedUser.email}</small>
              <button
                className="primary-action"
                type="button"
                onClick={handleLoggedUserSignup}
                disabled={event.inscricoesEncerradas || submitting}
              >
                {submitting
                  ? 'Enviando...'
                  : event.inscricoesEncerradas
                    ? 'Inscricoes encerradas'
                    : 'Inscrever-se'}
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
                  onChange={(changeEvent) =>
                    setForm((current) => ({
                      ...current,
                      nomeCompleto: changeEvent.target.value,
                    }))
                  }
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
                  onChange={handleCpfChange}
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
                  onChange={(changeEvent) =>
                    setForm((current) => ({
                      ...current,
                      email: changeEvent.target.value,
                    }))
                  }
                  disabled={event.inscricoesEncerradas || submitting}
                  required
                />
              </label>

              <button
                className="primary-action"
                type="submit"
                disabled={event.inscricoesEncerradas || submitting}
              >
                {submitting
                  ? 'Enviando...'
                  : event.inscricoesEncerradas
                    ? 'Inscricoes encerradas'
                    : 'Inscrever-se'}
              </button>
            </form>
          )}
        </aside>
      </section>
    </main>
  )
}

export default PublicEventDetail
