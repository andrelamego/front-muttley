import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  confirmarPresencaApi,
  getEventoPublicoPorIdApi,
} from '../api/eventosApi'
import type { EventoPublico } from '../domain/eventoTypes'
import { formatModalidade, getTicketDateParts } from '../domain/ticketFormat'
import {
  formatPresenceWindow,
  getPresenceWindow,
} from '../domain/presenceWindow'
import { PUBLIC_EVENTS_PATH } from '../domain/eventRoutes'
import { useAuth } from '../../auth'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Alert,
  Ticket,
  ButtonLink,
} from '../../../shared/ui'
import { HistoryBackButton } from '../../../shared/navigation'

interface ConfirmarPresencaPageProps {
  eventRouteBase?: string
}

export const ConfirmarPresencaPage: React.FC<ConfirmarPresencaPageProps> = ({
  eventRouteBase = PUBLIC_EVENTS_PATH,
}) => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [cpf, setCpf] = useState(user?.cpf || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [evento, setEvento] = useState<EventoPublico | null>(null)

  // O ingresso é complementar: se o evento não carregar, o formulário continua funcionando.
  useEffect(() => {
    if (!id) return
    let ativo = true
    getEventoPublicoPorIdApi(id)
      .then((ev) => ativo && setEvento(ev))
      .catch(() => undefined)
    return () => {
      ativo = false
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !cpf.trim()) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await confirmarPresencaApi(id, cpf.trim())
      setSuccess(
        response.message ||
          'Presença confirmada com sucesso! Sua participação e medalha de presença foram registradas.'
      )
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(
          'Não foi possível registrar a presença. Verifique o CPF e o horário do evento.'
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center gap-5 px-4 py-8 max-w-md mx-auto">
      {evento &&
        (() => {
          const partes = getTicketDateParts(evento.data, evento.horarioInicio)
          const janela = getPresenceWindow(
            evento.data,
            evento.horarioInicio,
            evento.horarioFim
          )
          return (
            <Ticket
              compact
              dia={partes.dia}
              mes={partes.mes}
              horario={partes.horario}
              stamped={Boolean(success)}
              className="w-full"
            >
              <p className="font-display text-lg font-bold leading-tight">
                {evento.tema}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {[evento.local, formatModalidade(evento.modalidade)]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              {janela && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                  {formatPresenceWindow(janela)}
                </p>
              )}
            </Ticket>
          )
        })()}
      <Card className="w-full surface-depth bg-[var(--color-bg-surface)] border-[var(--color-border)] shadow-md">
        <CardHeader className="text-center pb-4">
          <CardTitle as="h1" className="text-xl font-bold">
            Confirmar presença
          </CardTitle>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Informe o seu CPF cadastrado na inscrição deste evento
          </p>
        </CardHeader>

        <CardContent className="p-6 flex flex-col gap-4">
          {success ? (
            <Alert variant="success" title="Presença confirmada">
              <div className="flex flex-col gap-3">
                <p className="text-sm leading-relaxed">{success}</p>
                <div className="flex flex-col gap-2 pt-2">
                  <ButtonLink
                    to="/user/inicio"
                    variant="primary"
                    size="md"
                    fullWidth
                  >
                    Ver meu início
                  </ButtonLink>
                  <ButtonLink
                    to={eventRouteBase}
                    variant="outline"
                    size="sm"
                    fullWidth
                  >
                    Ver eventos
                  </ButtonLink>
                </div>
              </div>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <Alert
                  variant="error"
                  title="Impedimento de presença"
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}

              <Input
                label="CPF do participante"
                type="text"
                name="cpf"
                id="cpf-presenca"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                required
                disabled={isSubmitting}
                helperText="A presença pode ser confirmada entre 10 minutos antes do início e 10 minutos após o fim do evento."
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                isLoading={isSubmitting}
                loadingText="Validando presença..."
                className="mt-2"
              >
                Confirmar presença
              </Button>

              <div className="text-center pt-2">
                <HistoryBackButton label="Voltar para a página anterior" />
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
