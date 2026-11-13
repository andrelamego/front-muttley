import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import {
  buildEventPath,
  buildPresencePath,
  formatDateSafe,
  formatPresenceWindow,
  getPresenceWindow,
  formatModalidade,
  getTicketDateParts,
  isWithinPresenceWindow,
  PARTICIPANT_EVENTS_PATH,
} from '../../eventos'
import {
  formatProximoEvento,
  selecionarEventoDestaque,
} from '../domain/proximoEvento'
import { getParticipantDashboardData } from '../api/painelApi'
import type {
  ParticipantDashboardData,
  CertificadoResumo,
} from '../domain/painelTypes'
import {
  Alert,
  AwardIcon,
  Badge,
  Button,
  DownloadIcon,
  MedalIcon,
  Ticket,
} from '../../../shared/ui'
import { ParticipantDashboardSkeleton } from './skeletons'

// Eventos mostrados em "Depois disso" antes de expandir
const VISIVEIS_DEPOIS = 3
import apiClient from '../../../shared/http/apiClient'

export const ParticipantDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<ParticipantDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [mostrarTodos, setMostrarTodos] = useState(false)
  const [downloadingCertId, setDownloadingCertId] = useState<number | null>(
    null
  )

  const loadData = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const result = await getParticipantDashboardData()
      setData(result)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Falha ao carregar suas participações e certificados.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    getParticipantDashboardData()
      .then((result) => {
        if (isMounted) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Falha ao carregar suas participações e certificados.'
          )
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Download direto do PDF do certificado via Blob seguro
  const handleDownloadPdf = async (cert: CertificadoResumo) => {
    setDownloadingCertId(cert.id)
    try {
      const response = await apiClient.get<Blob>(
        `/certificados/${encodeURIComponent(cert.codigoValidacao)}/download`,
        { responseType: 'blob' }
      )
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `certificado-${cert.codigoValidacao}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch {
      // Fallback: se o endpoint exigir abertura direta ou falhar
      if (cert.urlPublica) {
        window.open(cert.urlPublica, '_blank')
      } else {
        navigate(`/certificados/${encodeURIComponent(cert.codigoValidacao)}`)
      }
    } finally {
      setDownloadingCertId(null)
    }
  }

  const {
    destaque: participacaoDestaque,
    passado: destaquePassado,
    depois: outrosCompromissos,
  } = selecionarEventoDestaque(data?.participacoes ?? [], new Date())
  const eventoDestaque = participacaoDestaque?.evento

  const presencaAberta = eventoDestaque
    ? isWithinPresenceWindow(
        eventoDestaque.data,
        eventoDestaque.horarioInicio,
        eventoDestaque.horarioFim
      )
    : false

  const janela = eventoDestaque
    ? getPresenceWindow(
        eventoDestaque.data,
        eventoDestaque.horarioInicio,
        eventoDestaque.horarioFim
      )
    : null
  const ticket = eventoDestaque
    ? getTicketDateParts(eventoDestaque.data, eventoDestaque.horarioInicio)
    : null
  const primeiroNome = (user?.nome || 'Participante').trim().split(' ')[0]
  const medalhas = data?.medalhas.length ?? 0

  return (
    <div className="flex flex-col">
      {/* Faixa cobalto com o próximo compromisso; o ingresso sobrepõe a borda inferior */}
      <section
        aria-labelledby="greeting-heading"
        className="bg-[var(--color-primary)] text-white"
      >
        <div className="max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
          <p className="text-sm">Olá, {primeiroNome}</p>
          <h1
            id="greeting-heading"
            className="font-display text-3xl sm:text-4xl font-bold leading-tight mt-2 max-w-xl"
          >
            {!data
              ? 'Seu início'
              : eventoDestaque
                ? formatProximoEvento(eventoDestaque.data, new Date())
                : 'Nenhum evento na sua agenda'}
          </h1>
        </div>
      </section>

      <div className="w-full max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 -mt-14 pb-8 flex flex-col gap-6">
        {error && (
          <Alert variant="error" title="Não foi possível carregar seu início">
            <div className="flex flex-col gap-2">
              <p>{error}</p>
              <div>
                <Button variant="secondary" size="sm" onClick={loadData}>
                  Tentar novamente
                </Button>
              </div>
            </div>
          </Alert>
        )}

        {isLoading && !data && <ParticipantDashboardSkeleton />}

        {data && (
          <div className="content-enter grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-7 flex flex-col gap-6">
              {eventoDestaque && ticket ? (
                <Ticket
                  dia={ticket.dia}
                  mes={ticket.mes}
                  horario={ticket.horario}
                >
                  {destaquePassado ? (
                    <Badge variant="default">Evento realizado</Badge>
                  ) : (
                    <Badge variant="success">Inscrição confirmada</Badge>
                  )}
                  <h2 className="font-display text-xl sm:text-2xl font-bold leading-tight mt-3">
                    {eventoDestaque.tema}
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1.5">
                    {[
                      eventoDestaque.local,
                      formatModalidade(eventoDestaque.modalidade),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {!destaquePassado && (
                    <>
                      <Button
                        variant="primary"
                        fullWidth
                        className="mt-4"
                        disabled={!presencaAberta}
                        onClick={() =>
                          navigate(
                            buildPresencePath(
                              PARTICIPANT_EVENTS_PATH,
                              eventoDestaque.id
                            )
                          )
                        }
                      >
                        Confirmar presença
                      </Button>
                      {janela && (
                        <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                          {formatPresenceWindow(janela)}
                        </p>
                      )}
                    </>
                  )}
                  <Link
                    to={buildEventPath(
                      PARTICIPANT_EVENTS_PATH,
                      eventoDestaque.id
                    )}
                    className="inline-flex items-center min-h-[44px] text-sm font-semibold text-[var(--color-primary-text)] hover:underline"
                  >
                    Ver detalhes do evento
                  </Link>
                </Ticket>
              ) : (
                <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6 flex flex-col items-start gap-3">
                  <h2 className="font-display text-xl font-bold">
                    Você ainda não tem inscrições
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Escolha um evento aberto para garantir sua vaga.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => navigate(PARTICIPANT_EVENTS_PATH)}
                  >
                    Ver eventos abertos
                  </Button>
                </div>
              )}

              {outrosCompromissos.length > 0 && (
                <section aria-labelledby="other-events-heading">
                  <h2
                    id="other-events-heading"
                    className="font-display text-lg font-bold mb-3"
                  >
                    Depois disso
                  </h2>
                  <ul className="flex flex-col gap-2">
                    {(mostrarTodos
                      ? outrosCompromissos
                      : outrosCompromissos.slice(0, VISIVEIS_DEPOIS)
                    ).map((p, i) => {
                      const ev = p.evento
                      if (!ev) return null
                      const partes = getTicketDateParts(
                        ev.data,
                        ev.horarioInicio
                      )
                      return (
                        <li
                          key={p.id}
                          className={
                            i >= VISIVEIS_DEPOIS ? 'content-enter' : undefined
                          }
                        >
                          <Link
                            to={buildEventPath(PARTICIPANT_EVENTS_PATH, ev.id)}
                            className="flex items-center gap-3 bg-[var(--color-bg-surface)] rounded-md p-3 border border-transparent hover:border-[var(--color-primary)] transition-colors"
                          >
                            <span className="w-14 shrink-0 rounded-sm border-2 border-dashed border-[var(--color-border)] text-center py-1">
                              <span className="block font-display text-xl font-extrabold leading-none text-[var(--color-primary-text)]">
                                {partes.dia}
                              </span>
                              <span className="text-xs text-[var(--color-text-secondary)]">
                                {partes.mes}
                              </span>
                            </span>
                            <span className="min-w-0">
                              <span className="block font-semibold truncate">
                                {ev.tema}
                              </span>
                              <span className="block text-sm text-[var(--color-text-secondary)] truncate">
                                {[
                                  partes.horario,
                                  ev.local || formatModalidade(ev.modalidade),
                                ]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </span>
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                  {outrosCompromissos.length > VISIVEIS_DEPOIS && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      aria-expanded={mostrarTodos}
                      onClick={() => setMostrarTodos((v) => !v)}
                    >
                      {mostrarTodos
                        ? 'Mostrar menos'
                        : `Mostrar mais ${outrosCompromissos.length - VISIVEIS_DEPOIS}`}
                    </Button>
                  )}
                </section>
              )}
            </div>

            <div className="lg:col-span-5 lg:mt-16 flex flex-col gap-6">
              <section aria-labelledby="certs-heading">
                <div className="flex items-baseline justify-between mb-3">
                  <h2
                    id="certs-heading"
                    className="font-display text-lg font-bold"
                  >
                    Certificados
                  </h2>
                  <Link
                    to="/user/certificados"
                    className="text-sm font-semibold text-[var(--color-primary-text)] hover:underline"
                  >
                    Ver todos
                  </Link>
                </div>

                {data.certificados.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-bg-surface)] rounded-md p-4">
                    Seus certificados aparecem aqui depois que a coordenação
                    concluir os eventos de que você participou.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {data.certificados.slice(0, 3).map((cert) => (
                      <li
                        key={cert.id}
                        className="flex items-center gap-3 bg-[var(--color-bg-surface)] rounded-md p-3"
                      >
                        <span className="w-10 h-10 shrink-0 rounded-sm bg-[var(--color-primary-subtle)] text-[var(--color-primary-text)] flex items-center justify-center">
                          <AwardIcon size={20} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-sm line-clamp-2">
                            {cert.evento?.tema || 'Evento concluído'}
                          </span>
                          <span className="block text-xs text-[var(--color-text-secondary)]">
                            Emitido em{' '}
                            {formatDateSafe(
                              (cert.dataEmissao || '').slice(0, 10)
                            )}
                          </span>
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPdf(cert)}
                          isLoading={downloadingCertId === cert.id}
                          loadingText="Baixando"
                          leftIcon={<DownloadIcon size={16} />}
                          aria-label={`Baixar certificado de ${cert.evento?.tema || 'evento'}`}
                          className="shrink-0 min-w-[44px] min-h-[44px]"
                        >
                          {/* No celular fica só o ícone, para o título ter espaço */}
                          <span className="hidden sm:inline">Baixar</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <Link
                to="/user/medalhas"
                className="flex items-center gap-3 bg-[var(--color-bg-surface)] rounded-md p-3 min-h-[44px] hover:bg-[var(--color-bg-hover)] transition-colors"
              >
                <span className="w-10 h-10 shrink-0 rounded-full bg-[var(--color-signal)] text-[var(--color-signal-ink)] flex items-center justify-center">
                  <MedalIcon size={20} />
                </span>
                <span className="font-semibold text-sm">
                  {medalhas === 0
                    ? 'Nenhuma medalha ainda'
                    : medalhas === 1
                      ? '1 medalha conquistada'
                      : `${medalhas} medalhas conquistadas`}
                </span>
                <span className="ml-auto shrink-0 whitespace-nowrap text-sm font-semibold text-[var(--color-primary-text)]">
                  Ver medalhas
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
