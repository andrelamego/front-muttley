import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import db from '../../data/mockDb'
import { AutocompleteInput } from '../../components/AutocompleteInput'
import type {
  Discipline,
  Sponsor,
  Local,
  Participation,
  Person,
  StatusEvento,
  ParticipanteEvento,
  TipoParticipacao,
} from '../../data/types'
import { FormSkeleton } from '../../components/ui'
import { toast } from '../../components/ui/Toast'

export const EventForm: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [tema, setTema] = useState('')
  const [data, setData] = useState('')
  const [horarioInicio, setHorarioInicio] = useState('')
  const [horarioFim, setHorarioFim] = useState('')
  const [modalidade, setModalidade] = useState<
    'PRESENCIAL' | 'ONLINE' | 'HIBRIDO'
  >('PRESENCIAL')
  const [disciplinaId, setDisciplinaId] = useState('')
  const [patrocinadorId, setPatrocinadorId] = useState('')
  const [localId, setLocalId] = useState('')
  const [descricao, setDescricao] = useState('')
  const [eventStatus, setEventStatus] = useState<StatusEvento>('CRIADO')

  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [locais, setLocais] = useState<Local[]>([])
  const [participacoes, setParticipacoes] = useState<Participation[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [selectedPessoaId, setSelectedPessoaId] = useState('')
  const [selectedTipo, setSelectedTipo] = useState<TipoParticipacao>('Aluno')
  const [eventParticipants, setEventParticipants] = useState<
    ParticipanteEvento[]
  >([])
  const [createdEventId, setCreatedEventId] = useState('')
  const [qrCodeInscricaoUrl, setQrCodeInscricaoUrl] = useState('')
  const [qrCodeConfirmacaoUrl, setQrCodeConfirmacaoUrl] = useState('')
  const [qrCodeLoading, setQrCodeLoading] = useState(false)
  const [showCreationModal, setShowCreationModal] = useState(false)

  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)

  // Load existing event and dropdown details
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const [discs, sps, locs, pps] = await Promise.all([
          db.getDisciplines(),
          db.getSponsors(),
          db.getLocais(),
          db.getPeople(),
        ])
        setDisciplines(discs)
        setSponsors(sps)
        setLocais(locs)
        setPeople(pps)

        if (id) {
          try {
            const found = await db.getEventById(id)
            if (found) {
              setTema(found.tema)
              setData(found.data)
              setHorarioInicio(found.horarioInicio)
              setHorarioFim(found.horarioFim)
              setModalidade(found.modalidade)
              setDisciplinaId(found.disciplinaId || '')
              setPatrocinadorId(found.patrocinadorId || '')
              setLocalId(found.localId || '')
              setDescricao(found.descricao || '')
              setEventStatus(found.status)

              // Try to load event-specific participations
              const parts = await db.getEventParticipations(id)
              setParticipacoes(parts)
              setEventParticipants(
                parts.map((part) => ({
                  id: part.id,
                  inscricao: part.inscricao,
                  pessoaId: part.pessoaId,
                  tipo: part.tipo,
                }))
              )
            } else {
              toast.error('Evento não encontrado.')
            }
          } catch (err) {
            // Fallback for finalized events since /participacoes endpoint might block
            const events = await db.getEvents()
            const found = events.find((e) => e.id === id)
            if (found) {
              setTema(found.tema)
              setData(found.data)
              setHorarioInicio(found.horarioInicio)
              setHorarioFim(found.horarioFim)
              setModalidade(found.modalidade)
              setDisciplinaId(found.disciplinaId || '')
              setPatrocinadorId(found.patrocinadorId || '')
              setLocalId(found.localId || '')
              setDescricao(found.descricao || '')
              setEventStatus(found.status)

              const allParts = await db.getParticipations()
              const eventParts = allParts.filter((p) => p.eventoId === id)
              setParticipacoes(eventParts)
              setEventParticipants(
                eventParts.map((part) => ({
                  id: part.id,
                  inscricao: part.inscricao,
                  pessoaId: part.pessoaId,
                  tipo: part.tipo,
                }))
              )
            } else {
              toast.error('Evento não encontrado.')
            }
          }
        }
      } catch (err: any) {
        toast.error(err.message || 'Erro ao carregar dados do formulário.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [id])

  useEffect(
    () => () => {
      if (qrCodeInscricaoUrl) {
        URL.revokeObjectURL(qrCodeInscricaoUrl)
      }
      if (qrCodeConfirmacaoUrl) {
        URL.revokeObjectURL(qrCodeConfirmacaoUrl)
      }
    },
    [qrCodeInscricaoUrl, qrCodeConfirmacaoUrl]
  )

  const participacaoList = participacoes.map((part) => {
    const person = part.pessoa || people.find((p) => p.id === part.pessoaId)
    return {
      id: part.id,
      inscricao: part.inscricao,
      nome: person?.nome || 'Participante não informado',
      tipo: part.tipo,
      email: person?.email || '-',
    }
  })

  const participantRoles: TipoParticipacao[] = [
    'Aluno',
    'Professor',
    'Palestrante',
    'Organizador',
    'Colaborador',
  ]
  const peopleOptions = people.map((person) => ({
    id: person.id,
    label: `${person.nome} - ${person.email || person.cpf || 'sem contato'}`,
  }))
  const selectedParticipantsList = eventParticipants.map((part) => {
    const participation = participacoes.find(
      (item) => item.pessoaId === part.pessoaId
    )
    const person =
      participation?.pessoa || people.find((p) => p.id === part.pessoaId)
    return {
      ...part,
      nome: person?.nome || 'Participante nao informado',
      email: person?.email || '-',
    }
  })
  const nextInscricao =
    Math.max(
      1000,
      ...eventParticipants.map((part) => Number(part.inscricao) || 0),
      ...participacoes.map((part) => Number(part.inscricao) || 0)
    ) + 1

  const handleAddEventParticipant = () => {
    if (!selectedPessoaId) {
      toast.warning('Selecione uma pessoa para adicionar ao evento.')
      return
    }

    if (eventParticipants.some((part) => part.pessoaId === selectedPessoaId)) {
      toast.warning('Essa pessoa já foi adicionada ao evento.')
      return
    }

    setEventParticipants((prev) => [
      ...prev,
      {
        inscricao: String(nextInscricao),
        pessoaId: selectedPessoaId,
        tipo: selectedTipo,
      },
    ])
    setSelectedPessoaId('')
    setSelectedTipo('Aluno')
  }

  const handleRemoveEventParticipant = (pessoaId: string) => {
    setEventParticipants((prev) =>
      prev.filter((part) => part.pessoaId !== pessoaId)
    )
  }

  const loadQrCodes = async (eventId: string, attempt = 1) => {
    setQrCodeLoading(true)

    try {
      const [blobInscricao, blobConfirmacao] = await Promise.all([
        db.getEventQrCodeInscricaoBlob(eventId),
        db.getEventQrCodeConfirmacaoBlob(eventId),
      ])

      setQrCodeInscricaoUrl((previousUrl) => {
        if (previousUrl) URL.revokeObjectURL(previousUrl)
        return URL.createObjectURL(blobInscricao)
      })
      setQrCodeConfirmacaoUrl((previousUrl) => {
        if (previousUrl) URL.revokeObjectURL(previousUrl)
        return URL.createObjectURL(blobConfirmacao)
      })
    } catch (err) {
      if (attempt < 4) {
        window.setTimeout(() => loadQrCodes(eventId, attempt + 1), 900)
        return
      }
      toast.error(
        'Evento criado, mas os QR Codes ainda não ficaram disponíveis.'
      )
    } finally {
      setQrCodeLoading(false)
    }
  }

  const handleCloseCreationModal = () => {
    navigate('/admin/eventos')
  }

  const handleDownloadQrCode = () => {
    if (qrCodeInscricaoUrl) {
      const a = document.createElement('a')
      a.href = qrCodeInscricaoUrl
      a.download = `qrcode-inscricao-evento-${createdEventId || 'muttley'}.png`
      a.click()
    }
    if (qrCodeConfirmacaoUrl) {
      const a = document.createElement('a')
      a.href = qrCodeConfirmacaoUrl
      a.download = `qrcode-confirmacao-evento-${createdEventId || 'muttley'}.png`
      a.click()
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleSave = async () => {
    if (step !== 3) {
      return
    }

    if (!tema || !data || !horarioInicio || !horarioFim || !modalidade) {
      toast.warning('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    try {
      setLoading(true)
      const result = await db.saveEvent({
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
        participacoes: eventParticipants,
      })

      if (!id && result.id) {
        toast.success('Evento criado com sucesso.')
        setCreatedEventId(result.id)
        setShowCreationModal(true)
        setLoading(false)
        loadQrCodes(result.id)
        return
      }

      toast.success('Evento atualizado com sucesso.')
      navigate('/admin/eventos')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar o evento.')
      setLoading(false)
    }
  }

  if (loading && step === 1 && !tema) {
    return (
      <div className="admin-page">
        <FormSkeleton fields={5} steps />
      </div>
    )
  }

  const isFinalized = eventStatus === 'FINALIZADO'

  const disciplineOptions = disciplines.map((d) => ({
    id: d.id,
    label: d.nome,
  }))
  const sponsorOptions = sponsors.map((s) => ({ id: s.id, label: s.nome }))
  const localOptions = locais.map((l) => ({ id: l.id, label: l.nome }))

  const steps = [
    { number: 1, label: 'Informações Gerais' },
    { number: 2, label: 'Local e Horário' },
    { number: 3, label: 'Vinculações' },
  ]

  const handleNextStep = () => {
    if (step === 1) {
      if (!tema) {
        toast.warning('Tema do evento é obrigatório.')
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!data || !horarioInicio || !horarioFim) {
        toast.warning('Data, horário de início e término são obrigatórios.')
        return
      }
      setStep(3)
    }
  }

  const handlePrevStep = () => {
    setStep((prev) => prev - 1)
  }

  return (
    <div className="admin-page">
      <h1>
        {id
          ? isFinalized
            ? 'Detalhes do evento'
            : 'Editar evento'
          : 'Novo evento'}
      </h1>

      {/* Step Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--line)',
        }}
      >
        {steps.map((s, idx) => {
          const isActive = step === s.number
          const isCompleted = step > s.number
          return (
            <React.Fragment key={s.number}>
              <button
                type="button"
                onClick={() => {
                  if (isFinalized) {
                    setStep(s.number)
                    return
                  }
                  if (s.number < step) {
                    setStep(s.number)
                  } else {
                    if (step === 1) {
                      if (!tema) {
                        toast.warning('Tema do evento é obrigatório.')
                        return
                      }
                      setStep(s.number)
                    } else if (step === 2) {
                      if (!data || !horarioInicio || !horarioFim) {
                        toast.warning(
                          'Data, horário de início e término são obrigatórios.'
                        )
                        return
                      }
                      setStep(s.number)
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
                  borderBottom: isActive
                    ? '2px solid var(--primary)'
                    : '2px solid transparent',
                  color: isActive
                    ? 'var(--primary)'
                    : isCompleted
                      ? 'var(--ink)'
                      : 'var(--muted)',
                  fontWeight: isActive ? 'bold' : 'normal',
                  transition: 'all 0.2s ease',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '1.5rem',
                    height: '1.5rem',
                    borderRadius: '50%',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    backgroundColor: isActive
                      ? 'var(--primary)'
                      : isCompleted
                        ? 'var(--primary-soft)'
                        : 'var(--line)',
                    color: isActive ? '#fff' : 'var(--ink)',
                  }}
                >
                  {isCompleted ? '✓' : s.number}
                </span>
                <span className="step-label" style={{ fontSize: '0.85rem' }}>
                  {s.label}
                </span>
              </button>
              {idx < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '1px',
                    backgroundColor: 'var(--line)',
                    margin: '0 1rem',
                  }}
                />
              )}
            </React.Fragment>
          )
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
              <legend className="text-sm font-semibold text-brand-ink-strong">
                Início:*
              </legend>
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
              <legend className="text-sm font-semibold text-brand-ink-strong">
                Fim:*
              </legend>
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

        <div
          className="form-actions"
          style={{ justifyContent: 'space-between' }}
        >
          <div>
            {step > 1 && (
              <button
                className="link-action"
                type="button"
                onClick={handlePrevStep}
                style={{
                  cursor: 'pointer',
                  background: 'var(--surface-soft)',
                  border: '1px solid var(--line)',
                }}
              >
                ← Voltar
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/admin/eventos" className="link-action">
              Cancelar
            </Link>
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
                <button
                  className="primary-action"
                  type="button"
                  disabled={loading}
                  onClick={handleSave}
                >
                  {loading
                    ? 'Salvando...'
                    : id
                      ? 'Salvar alterações'
                      : 'Criar evento'}
                </button>
              )
            )}
          </div>
        </div>
      </form>

      <section
        className="event-participant-builder"
        aria-labelledby="event-participants-title"
      >
        <div className="participants-heading">
          <div>
            <h2 id="event-participants-title">Participantes do evento</h2>
            <p>Adicione pessoas e defina o papel de cada uma no evento.</p>
          </div>
        </div>

        {!isFinalized && (
          <div className="event-participant-builder__controls">
            <div className="field">
              <span>Pessoa:</span>
              <AutocompleteInput
                options={peopleOptions}
                value={selectedPessoaId}
                onChange={setSelectedPessoaId}
                placeholder="Buscar participante..."
              />
            </div>

            <label className="field">
              <span>Papel:</span>
              <select
                value={selectedTipo}
                onChange={(e) =>
                  setSelectedTipo(e.target.value as TipoParticipacao)
                }
              >
                {participantRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="primary-action"
              type="button"
              onClick={handleAddEventParticipant}
            >
              Adicionar
            </button>
          </div>
        )}

        {selectedParticipantsList.length === 0 ? (
          <div className="empty-state compact-empty">
            <p>Nenhum participante adicionado.</p>
          </div>
        ) : (
          <div className="ui-table-wrap">
            <table className="participants-table event-participants-table">
              <thead>
                <tr>
                  <th>Inscricao</th>
                  <th>Participante</th>
                  <th>Papel</th>
                  <th>Email</th>
                  <th>{isFinalized ? 'Medalha' : 'Acoes'}</th>
                </tr>
              </thead>
              <tbody>
                {selectedParticipantsList.map((part) => {
                  const participation = participacoes.find(
                    (item) => item.pessoaId === part.pessoaId
                  )
                  return (
                    <tr key={part.pessoaId}>
                      <td>#{part.inscricao}</td>
                      <td>
                        <strong>{part.nome}</strong>
                      </td>
                      <td>{part.tipo}</td>
                      <td>{part.email}</td>
                      <td>
                        {isFinalized && participation ? (
                          <Link
                            to={`/admin/medalhas/novo?participacaoId=${participation.id}`}
                            className="table-action font-semibold"
                          >
                            Adicionar Medalha
                          </Link>
                        ) : !isFinalized ? (
                          <button
                            className="table-action"
                            type="button"
                            onClick={() =>
                              handleRemoveEventParticipant(part.pessoaId)
                            }
                          >
                            Remover
                          </button>
                        ) : (
                          <span className="text-xs text-brand-muted">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showCreationModal && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="creation-confirmation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="creation-confirmation-title"
          >
            <button
              className="modal-close-button"
              type="button"
              aria-label="Fechar"
              onClick={handleCloseCreationModal}
            >
              x
            </button>

            <div className="creation-confirmation-modal__header">
              <span>Evento criado</span>
              <h2 id="creation-confirmation-title">
                QR Codes gerados para o evento
              </h2>
              <p>
                Compartilhe os QR Codes com os participantes e organizadores.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                margin: '1rem 0',
              }}
            >
              {/* QR Inscrição */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Inscrição
                </span>
                <div className="creation-confirmation-modal__qr">
                  {qrCodeInscricaoUrl ? (
                    <img src={qrCodeInscricaoUrl} alt="QR Code de inscrição" />
                  ) : (
                    <div
                      className="creation-confirmation-modal__placeholder"
                      role="status"
                    >
                      Gerando QR Code...
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--muted)',
                    textAlign: 'center',
                  }}
                >
                  Participante escaneia para se inscrever
                </span>
              </div>

              {/* QR Confirmação */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Confirmação de presença
                </span>
                <div className="creation-confirmation-modal__qr">
                  {qrCodeConfirmacaoUrl ? (
                    <img
                      src={qrCodeConfirmacaoUrl}
                      alt="QR Code de confirmação de presença"
                    />
                  ) : (
                    <div
                      className="creation-confirmation-modal__placeholder"
                      role="status"
                    >
                      Gerando QR Code...
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--muted)',
                    textAlign: 'center',
                  }}
                >
                  Participante escaneia no dia do evento
                </span>
              </div>
            </div>

            <div className="creation-confirmation-modal__actions">
              <button
                className="link-action"
                type="button"
                onClick={handleDownloadQrCode}
                disabled={
                  (!qrCodeInscricaoUrl && !qrCodeConfirmacaoUrl) ||
                  qrCodeLoading
                }
              >
                Baixar QR Codes
              </button>
              <button
                className="primary-action"
                type="button"
                onClick={handleCloseCreationModal}
              >
                Concluir
              </button>
            </div>
          </section>
        </div>
      )}

      {false && id && isFinalized && (
        <section
          className="participants-section mt-8"
          aria-labelledby="participacoes-title"
        >
          <div className="participants-heading mb-4">
            <h2
              id="participacoes-title"
              className="text-lg font-bold text-brand-ink-strong"
            >
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
                  {participacaoList.map((part) => (
                    <tr key={part.id}>
                      <td>#{part.inscricao}</td>
                      <td>
                        <strong>{part.nome}</strong>
                      </td>
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
  )
}

export default EventForm
