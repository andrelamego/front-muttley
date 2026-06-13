import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import db from '../../data/mockDb'
import type {
  Participation,
  Person,
  Event,
  TipoMedalha,
} from '../../data/types'
import { FormSkeleton } from '../../components/ui'
import { toast } from '../../components/ui/Toast'

const medalTypes: Array<{
  value: TipoMedalha
  label: string
  description: string
}> = [
  {
    value: 'BRONZE',
    label: 'Bronze',
    description: 'Reconhecimento de participacao',
  },
  {
    value: 'PRATA',
    label: 'Prata',
    description: 'Destaque por contribuicao relevante',
  },
  {
    value: 'OURO',
    label: 'Ouro',
    description: 'Maior nivel de reconhecimento',
  },
]

export const MedalForm: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const participacaoIdParam = searchParams.get('participacaoId')

  const [nome, setNome] = useState('')
  const [participacaoId, setParticipacaoId] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState<TipoMedalha>('BRONZE')
  const [participacoes, setParticipacoes] = useState<Participation[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)

  // Load existing medal and options
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const [parts, evts, pps] = await Promise.all([
          db.getParticipations(),
          db.getEvents(),
          db.getPeople(),
        ])
        setParticipacoes(parts)
        setEvents(evts)
        setPeople(pps)

        if (id) {
          const medals = await db.getMedals()
          const found = medals.find((m) => m.id === id)
          if (found) {
            setNome(found.nome)
            setParticipacaoId(found.participacaoId)
            setDescricao(found.descricao)
            setTipo(found.tipo)
          } else {
            toast.error('Medalha não encontrada.')
          }
        } else if (participacaoIdParam) {
          setParticipacaoId(participacaoIdParam)
        }
      } catch (err: any) {
        toast.error(err.message || 'Erro ao carregar dados.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [id, participacaoIdParam])

  const options = participacoes.map((part) => {
    const person = part.pessoa || people.find((p) => p.id === part.pessoaId)
    const event = part.evento || events.find((e) => e.id === part.eventoId)
    return {
      id: part.id,
      text: `#${part.inscricao} - ${person ? person.nome : 'Participante'} - ${event ? event.tema : 'Evento'}`,
    }
  })

  // Selected participation info for preview banner
  const selectedPart = participacoes.find((p) => p.id === participacaoId)
  const selectedPerson = selectedPart
    ? selectedPart.pessoa || people.find((p) => p.id === selectedPart.pessoaId)
    : null
  const selectedEvent = selectedPart
    ? selectedPart.evento || events.find((e) => e.id === selectedPart.eventoId)
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome || !participacaoId || !descricao || !tipo) {
      toast.warning('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    try {
      setLoading(true)
      await db.saveMedal({
        id: id || undefined,
        nome,
        participacaoId,
        descricao,
        tipo,
      })
      toast.success(
        id ? 'Medalha atualizada com sucesso.' : 'Medalha criada com sucesso.'
      )
      navigate('/admin/medalhas')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar medalha.')
      setLoading(false)
    }
  }

  if (loading && !nome && id) {
    return (
      <div className="admin-page">
        <FormSkeleton fields={5} />
      </div>
    )
  }

  return (
    <div className="admin-page">
      <h1>{id ? 'Editar medalha' : 'Nova medalha'}</h1>

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
              {options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.text}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="field description-field medal-type-field">
            <legend>Tipo da medalha:*</legend>
            <div className="medal-type-selector">
              {medalTypes.map((option) => (
                <label
                  key={option.value}
                  className={`medal-type-option medal-type-option--${option.value.toLowerCase()} ${
                    tipo === option.value ? 'is-selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="tipo"
                    value={option.value}
                    checked={tipo === option.value}
                    onChange={() => setTipo(option.value)}
                  />
                  <span
                    className="medal-type-option__mark"
                    aria-hidden="true"
                  />
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </label>
              ))}
            </div>
          </fieldset>

          {selectedPart && selectedPerson && selectedEvent && (
            <div className="selected-participation description-field col-span-2 p-4 bg-brand-surface-soft border border-brand-line rounded-lg flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-brand-muted">
                Participante Selecionado
              </span>
              <strong className="text-sm font-bold text-brand-ink-strong">
                {selectedPerson.nome}
              </strong>
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
            {loading
              ? 'Salvando...'
              : id
                ? 'Salvar alterações'
                : 'Criar medalha'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MedalForm
