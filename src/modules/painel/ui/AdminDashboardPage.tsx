import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAdminDashboardData } from '../api/painelApi'
import {
  formatModalidade,
  getTicketDateParts,
  isWithinPresenceWindow,
  parseEventDateTime,
} from '../../eventos'
import { formatResumoSemana } from '../domain/resumoSemana'
import type { AdminDashboardData, EventoResumo } from '../domain/painelTypes'
import { Alert, Badge, Button, PlusIcon } from '../../../shared/ui'
import { AdminDashboardSkeleton } from './skeletons'

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const result = await getAdminDashboardData()
      setData(result)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Falha ao carregar indicadores administrativos.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    getAdminDashboardData()
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
              : 'Falha ao carregar indicadores administrativos.'
          )
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Identifica evento com pendência de conclusão real (EM_ANDAMENTO cujo horário de término já passou)
  const pendenciasConclusao = (data?.proximosEventos || []).filter(
    (ev: EventoResumo) => {
      if (ev.status !== 'EM_ANDAMENTO') return false
      const fim = parseEventDateTime(ev.data, ev.horarioFim)
      return fim ? new Date() > fim : false
    }
  )
  const eventoPendente = pendenciasConclusao[0] as EventoResumo | undefined

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const variacao = data?.variacaoCertificadosUltimos30Dias ?? 0

  return (
    <div className="flex flex-col gap-6 w-full max-w-[76rem] mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold leading-none">
            {saudacao}, coordenação
          </h1>
          {data && (
            <p className="text-[var(--color-text-secondary)] mt-2">
              {formatResumoSemana(data.eventosAtivosNaSemana)}
            </p>
          )}
        </div>
        <Button
          variant="primary"
          leftIcon={<PlusIcon size={18} />}
          onClick={() => navigate('/admin/eventos/novo')}
        >
          Criar evento
        </Button>
      </header>

      {error && (
        <Alert variant="error" title="Não foi possível carregar o painel">
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

      {isLoading && !data && <AdminDashboardSkeleton />}

      {data && (
        <div className="content-enter flex flex-col gap-6">
          {eventoPendente && (
            <section
              aria-labelledby="pendencias-heading"
              className="rounded-[var(--radius-lg)] bg-[var(--color-signal)] text-[var(--color-signal-ink)] p-5 flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="flex-1">
                <h2
                  id="pendencias-heading"
                  className="font-display text-lg font-bold"
                >
                  {eventoPendente.tema} terminou e aguarda conclusão
                </h2>
                <p className="text-sm mt-1">
                  Marque os presentes e envie a assinatura para emitir os
                  certificados.
                </p>
              </div>
              <Button
                className="bg-[var(--color-signal-ink)]! text-white! hover:opacity-90"
                onClick={() =>
                  navigate(`/admin/eventos/${eventoPendente.id}/concluir`)
                }
              >
                Concluir evento
              </Button>
            </section>
          )}

          <section
            aria-labelledby="metrics-heading"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <h2 id="metrics-heading" className="sr-only">
              Números do período
            </h2>
            <div className="bg-[var(--color-bg-surface)] rounded-md p-5">
              <span className="text-sm text-[var(--color-text-secondary)]">
                Eventos ativos
              </span>
              <b className="block font-display text-5xl font-extrabold leading-none mt-2 [font-variation-settings:'wdth'_75]">
                {data.eventosAtivos}
              </b>
            </div>
            <div className="bg-[var(--color-bg-surface)] rounded-md p-5">
              <span className="text-sm text-[var(--color-text-secondary)]">
                Nesta semana
              </span>
              <b className="block font-display text-5xl font-extrabold leading-none mt-2 [font-variation-settings:'wdth'_75]">
                {data.eventosAtivosNaSemana}
              </b>
            </div>
            <div className="bg-[var(--color-bg-surface)] rounded-md p-5">
              <span className="text-sm text-[var(--color-text-secondary)]">
                Certificados em 30 dias
              </span>
              <b className="block font-display text-5xl font-extrabold leading-none mt-2 [font-variation-settings:'wdth'_75]">
                {data.certificadosUltimos30Dias.toLocaleString('pt-BR')}
              </b>
              {variacao !== 0 && (
                <span
                  className={`block text-sm font-semibold mt-2 ${
                    variacao > 0
                      ? 'text-[var(--color-success-text)]'
                      : 'text-[var(--color-danger-text)]'
                  }`}
                >
                  {variacao > 0 ? '+' : ''}
                  {variacao}% que os 30 dias anteriores
                </span>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 items-start">
            <section
              aria-labelledby="agenda-heading"
              className="bg-[var(--color-bg-surface)] rounded-md p-5"
            >
              <div className="flex items-baseline justify-between mb-2">
                <h2
                  id="agenda-heading"
                  className="font-display text-lg font-bold"
                >
                  Próximos eventos
                </h2>
                <Link
                  to="/admin/eventos"
                  className="text-sm font-semibold text-[var(--color-primary-text)] hover:underline"
                >
                  Ver todos
                </Link>
              </div>

              {data.proximosEventos.length === 0 ? (
                <p className="text-sm text-[var(--color-text-secondary)] py-6">
                  Nenhum evento agendado. Crie um evento para abrir inscrições.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--color-border)]">
                  {data.proximosEventos.slice(0, 6).map((evento) => {
                    const partes = getTicketDateParts(
                      evento.data,
                      evento.horarioInicio
                    )
                    const janelaAberta = isWithinPresenceWindow(
                      evento.data,
                      evento.horarioInicio,
                      evento.horarioFim
                    )
                    return (
                      <li
                        key={evento.id}
                        className="grid grid-cols-[3.5rem_1fr_auto] gap-4 items-center py-3"
                      >
                        <span className="rounded-sm border-2 border-dashed border-[var(--color-border)] text-center py-1">
                          <span className="block font-display text-xl font-extrabold leading-none text-[var(--color-primary-text)]">
                            {partes.dia}
                          </span>
                          <span className="text-xs text-[var(--color-text-secondary)]">
                            {partes.mes}
                          </span>
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2 flex-wrap">
                            <strong className="font-semibold">
                              {evento.tema}
                            </strong>
                            {janelaAberta && (
                              <Badge variant="success" size="sm">
                                Presença aberta
                              </Badge>
                            )}
                            {evento.status === 'CANCELADO' && (
                              <Badge variant="danger" size="sm">
                                Cancelado
                              </Badge>
                            )}
                          </span>
                          <span className="block text-sm text-[var(--color-text-secondary)] truncate">
                            {[
                              partes.horario,
                              evento.local ||
                                formatModalidade(evento.modalidade),
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/eventos/${evento.id}/editar`)
                          }
                          aria-label={`Abrir ${evento.tema}`}
                        >
                          Abrir
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>

            <section
              aria-labelledby="certs-heading"
              className="bg-[var(--color-bg-surface)] rounded-md p-5"
            >
              <h2
                id="certs-heading"
                className="font-display text-lg font-bold mb-4"
              >
                Certificados por evento
              </h2>
              {data.certificadosPorEvento.length === 0 ? (
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Nenhum certificado emitido ainda.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {data.certificadosPorEvento.map((barra) => (
                    <li key={barra.rotulo}>
                      <span className="flex justify-between gap-3 text-sm">
                        <span className="truncate">{barra.rotulo}</span>
                        <b className="tabular-nums">{barra.total}</b>
                      </span>
                      <span className="block h-2.5 rounded-full bg-[var(--color-primary-subtle)] mt-1.5 overflow-hidden">
                        <span
                          className="block h-full rounded-full bg-[var(--color-primary)]"
                          style={{
                            width: `${Math.min(100, Math.max(0, barra.percentual))}%`,
                          }}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
