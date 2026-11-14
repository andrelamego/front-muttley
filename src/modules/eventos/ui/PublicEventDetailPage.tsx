import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getEventoPublicoPorIdApi,
  criarInscricaoPublicaApi,
  getMinhaInscricaoApi,
  cancelarInscricaoApi,
} from '../api/eventosApi'
import type { EventoPublico } from '../domain/eventoTypes'
import { buildPresencePath, PUBLIC_EVENTS_PATH } from '../domain/eventRoutes'
import { formatModalidade, getTicketDateParts } from '../domain/ticketFormat'
import {
  formatPresenceWindow,
  getPresenceWindow,
  isWithinPresenceWindow,
  parseEventDateTime,
} from '../domain/presenceWindow'
import { useAuth } from '../../auth'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Input,
  Alert,
  Ticket,
  toast,
  ButtonLink,
} from '../../../shared/ui'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../shared/ui/shadcn/alert-dialog'
import { EventDetailSkeleton } from './skeletons'
import { HistoryBackButton } from '../../../shared/navigation'

interface PublicEventDetailPageProps {
  eventRouteBase?: string
}

export const PublicEventDetailPage: React.FC<PublicEventDetailPageProps> = ({
  eventRouteBase = PUBLIC_EVENTS_PATH,
}) => {
  const { id } = useParams<{ id: string }>()
  const { user, isAuthenticated } = useAuth()

  const [evento, setEvento] = useState<EventoPublico | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Formulário de Inscrição
  const [nome, setNome] = useState(user?.nome || '')
  const [cpf, setCpf] = useState(user?.cpf || '')
  const [email, setEmail] = useState(user?.email || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<{
    message: string
    inscricao: number
  } | null>(null)

  // Inscrição da pessoa logada: undefined enquanto não se sabe, null quando não há.
  const [minhaInscricao, setMinhaInscricao] = useState<
    { id: number; inscricao: number } | null | undefined
  >(undefined)
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false)
  const [cancelando, setCancelando] = useState(false)
  const participante = isAuthenticated && user?.role === 'USER'

  const carregarMinhaInscricao = useCallback(() => {
    if (!id || !participante) return
    getMinhaInscricaoApi(id)
      .then(setMinhaInscricao)
      .catch(() => setMinhaInscricao(null)) // sem a lista, o formulário segue disponível
  }, [id, participante])

  useEffect(carregarMinhaInscricao, [carregarMinhaInscricao])

  const cancelarInscricao = async () => {
    if (!minhaInscricao) return
    setCancelando(true)
    try {
      await cancelarInscricaoApi(minhaInscricao.id)
      setMinhaInscricao(null)
      setSuccessInfo(null)
      toast.success('Inscrição cancelada')
      if (id)
        getEventoPublicoPorIdApi(id)
          .then(setEvento)
          .catch(() => {})
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Não foi possível cancelar a inscrição.'
      )
    } finally {
      setCancelando(false)
      setConfirmandoCancelamento(false)
    }
  }

  const loadEvento = useCallback(async () => {
    if (!id) return
    setError(null)
    setIsLoading(true)
    try {
      const data = await getEventoPublicoPorIdApi(id)
      setEvento(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Não foi possível encontrar as informações deste evento.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!id) return
    let isMounted = true
    getEventoPublicoPorIdApi(id)
      .then((data) => {
        if (isMounted) {
          setEvento(data)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível encontrar as informações deste evento.'
          )
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [id])

  const handleInscricao = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    setSubmitError(null)
    setIsSubmitting(true)

    try {
      const result = await criarInscricaoPublicaApi(id, {
        nomeCompleto: nome.trim(),
        cpf: cpf.trim(),
        email: email.trim().toLowerCase(),
      })

      setSuccessInfo({
        message: result.message || 'Inscrição realizada com sucesso!',
        inscricao: result.inscricao,
      })
      carregarMinhaInscricao()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message)
      } else {
        setSubmitError(
          'Falha ao concluir a inscrição. Verifique os dados informados.'
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto py-6 px-4 sm:px-6">
      {/* Botão de Retorno */}
      <div>
        <HistoryBackButton label="Voltar para a página anterior" />
      </div>

      {/* Alerta de erro de carregamento */}
      {error && (
        <Alert variant="error" title="Evento não encontrado">
          <div className="flex flex-col gap-2">
            <p>{error}</p>
            <div>
              <Button variant="secondary" size="sm" onClick={loadEvento}>
                Tentar novamente
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Carregando */}
      {isLoading && !evento && <EventDetailSkeleton />}

      {evento && (
        <div className="flex flex-col gap-6">
          {/* Cabeçalho do evento em forma de ingresso */}
          {(() => {
            const partes = getTicketDateParts(evento.data, evento.horarioInicio)
            const janela = getPresenceWindow(
              evento.data,
              evento.horarioInicio,
              evento.horarioFim
            )
            return (
              <Ticket
                dia={partes.dia}
                mes={partes.mes}
                horario={partes.horario}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={evento.inscricoesEncerradas ? 'danger' : 'success'}
                  >
                    {evento.inscricoesEncerradas
                      ? 'Inscrições encerradas'
                      : 'Inscrições abertas'}
                  </Badge>
                  {formatModalidade(evento.modalidade) && (
                    <Badge variant="default">
                      {formatModalidade(evento.modalidade)}
                    </Badge>
                  )}
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight mt-3">
                  {evento.tema}
                </h1>
                <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed whitespace-pre-line">
                  {evento.descricao || 'Sem descrição adicional.'}
                </p>
                <p className="text-sm mt-3">
                  {[
                    evento.horarioInicio && evento.horarioFim
                      ? `${evento.horarioInicio.slice(0, 5)} às ${evento.horarioFim.slice(0, 5)}`
                      : null,
                    evento.local || evento.disciplina,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {janela && (
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Presença: {formatPresenceWindow(janela).toLowerCase()}
                  </p>
                )}
                {isWithinPresenceWindow(
                  evento.data,
                  evento.horarioInicio,
                  evento.horarioFim
                ) && (
                  <Link
                    to={buildPresencePath(eventRouteBase, evento.id)}
                    className="inline-flex items-center min-h-[44px] mt-1 text-sm font-semibold text-[var(--color-primary-text)] hover:underline"
                  >
                    Confirmar presença
                  </Link>
                )}
              </Ticket>
            )
          })()}

          {/* Seção de Inscrição */}
          <section aria-labelledby="inscricao-titulo">
            <Card className="bg-[var(--color-bg-surface)] border-[var(--color-border)]">
              <CardHeader>
                <CardTitle as="h2" id="inscricao-titulo">
                  Inscrição
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                {successInfo ? (
                  <Alert
                    variant="success"
                    title="Inscrição confirmada"
                    className="p-5"
                  >
                    <div className="flex flex-col gap-2">
                      <p className="text-base font-semibold">
                        Sua inscrição #{successInfo.inscricao} foi registrada
                        com sucesso.
                      </p>
                      <p className="text-sm">
                        Um email de confirmação foi enviado com os dados deste
                        evento. Guarde seu número de inscrição para a
                        confirmação de presença.
                      </p>
                      <div className="pt-2 flex gap-3">
                        {isAuthenticated ? (
                          <ButtonLink
                            to="/user/inicio"
                            variant="primary"
                            size="sm"
                          >
                            Ir para meu início
                          </ButtonLink>
                        ) : (
                          <ButtonLink to="/login" variant="primary" size="sm">
                            Entrar na minha conta
                          </ButtonLink>
                        )}
                        <ButtonLink
                          to={buildPresencePath(eventRouteBase, evento.id)}
                          variant="outline"
                          size="sm"
                        >
                          Confirmar presença
                        </ButtonLink>
                      </div>
                    </div>
                  </Alert>
                ) : minhaInscricao ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="success">Inscrição confirmada</Badge>
                      <span className="text-sm text-[var(--color-text-secondary)] tabular-nums">
                        Inscrição #{minhaInscricao.inscricao}
                      </span>
                    </div>
                    {(() => {
                      const inicio = parseEventDateTime(
                        evento.data,
                        evento.horarioInicio
                      )
                      return inicio && new Date() < inicio ? (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            Não vai poder ir? Cancele para liberar a vaga para
                            outra pessoa.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmandoCancelamento(true)}
                          >
                            Cancelar inscrição
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          O evento já começou, então a inscrição não pode mais
                          ser cancelada.
                        </p>
                      )
                    })()}
                  </div>
                ) : evento.inscricoesEncerradas ? (
                  <Alert
                    variant="warning"
                    title="Inscrições encerradas"
                    className="p-5"
                  >
                    As vagas para este evento foram totalmente preenchidas ou o
                    período de inscrição foi finalizado pelo início da
                    atividade.
                  </Alert>
                ) : (
                  <form
                    onSubmit={handleInscricao}
                    className="flex flex-col gap-4"
                  >
                    {submitError && (
                      <Alert
                        variant="error"
                        title="Falha na inscrição"
                        onClose={() => setSubmitError(null)}
                      >
                        {submitError}
                      </Alert>
                    )}

                    <Input
                      label="Nome completo"
                      type="text"
                      name="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                      disabled={isSubmitting}
                    />

                    <Input
                      label="CPF"
                      type="text"
                      name="cpf"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      required
                      disabled={isSubmitting}
                    />

                    <Input
                      label="Email"
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      required
                      disabled={isSubmitting}
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isSubmitting}
                      loadingText="Processando inscrição..."
                      className="mt-2"
                    >
                      Inscrever-se
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      )}

      <AlertDialog
        open={confirmandoCancelamento}
        onOpenChange={(aberto) =>
          !cancelando && setConfirmandoCancelamento(aberto)
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar sua inscrição?</AlertDialogTitle>
            <AlertDialogDescription>
              Sua vaga em “{evento?.tema}” será liberada para outra pessoa. Se
              mudar de ideia, você pode se inscrever de novo enquanto houver
              vagas e o evento não tiver começado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelando}>
              Manter inscrição
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={cancelando}
              onClick={(e) => {
                e.preventDefault() // fecha só depois da resposta da API
                void cancelarInscricao()
              }}
            >
              {cancelando ? 'Cancelando…' : 'Cancelar inscrição'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
