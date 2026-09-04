import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { confirmarPresencaApi } from '../api/eventosApi'
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
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8 max-w-md mx-auto">
      <Card className="w-full surface-depth bg-[var(--color-bg-surface)] border-[var(--color-border)] shadow-md">
        <CardHeader className="text-center pb-4">
          <span className="text-xs font-bold text-[var(--color-primary-text)] uppercase tracking-wider">
            Validação de Presença
          </span>
          <CardTitle as="h1" className="text-xl font-bold mt-1">
            Confirmar Presença no Evento
          </CardTitle>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Informe o seu CPF cadastrado na inscrição deste evento
          </p>
        </CardHeader>

        <CardContent className="p-6 flex flex-col gap-4">
          {success ? (
            <Alert variant="success" title="Presença Confirmada!">
              <div className="flex flex-col gap-3">
                <p className="text-sm leading-relaxed">{success}</p>
                <div className="flex flex-col gap-2 pt-2">
                  <Link to="/user/inicio">
                    <Button variant="primary" size="md" fullWidth>
                      Ver Minhas Conquistas
                    </Button>
                  </Link>
                  <Link to={eventRouteBase}>
                    <Button variant="outline" size="sm" fullWidth>
                      Ir para Lista de Eventos
                    </Button>
                  </Link>
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
                label="CPF do Participante"
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
                className="mt-2 bg-[var(--color-success)] hover:bg-[var(--color-success)] active:bg-[var(--color-success)] focus-visible:ring-[var(--color-success)]"
              >
                Confirmar Presença Agora
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
