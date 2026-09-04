import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboardData } from '../api/painelApi'
import type { AdminDashboardData, EventoResumo } from '../domain/painelTypes'
import {
  Button,
  Alert,
  CalendarIcon,
  PlusIcon,
  ClockIcon,
  ArrowUpRightIcon,
  AwardIcon,
} from '../../../shared/ui'
import { AdminDashboardSkeleton } from './skeletons'

// Helper seguro para analisar data e hora de eventos
const parseEventDateTime = (dateStr: string, timeStr: string): Date | null => {
  if (!dateStr || !timeStr) return null
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = timeStr.split(':').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day, hours || 0, minutes || 0)
}

// Checa se o credenciamento está aberto (10 min antes até 10 min após o término)
const isWithinPresenceWindow = (
  dateStr?: string,
  inicioStr?: string,
  fimStr?: string
): boolean => {
  if (!dateStr || !inicioStr || !fimStr) return false
  const inicio = parseEventDateTime(dateStr, inicioStr)
  const fim = parseEventDateTime(dateStr, fimStr)
  if (!inicio || !fim) return false

  const agora = new Date()
  const dezMinAntes = new Date(inicio.getTime() - 10 * 60 * 1000)
  const dezMinDepois = new Date(fim.getTime() + 10 * 60 * 1000)

  return agora >= dezMinAntes && agora <= dezMinDepois
}

// Extrai dia e mês abreviado de uma data ISO YYYY-MM-DD
const extractDateParts = (dateStr: string) => {
  if (!dateStr) return { day: '--', monthYear: '---' }
  const [year, month, day] = dateStr.split('-')
  const meses = [
    'JAN',
    'FEV',
    'MAR',
    'ABR',
    'MAI',
    'JUN',
    'JUL',
    'AGO',
    'SET',
    'OUT',
    'NOV',
    'DEZ',
  ]
  const monthIndex = parseInt(month, 10) - 1
  const monthName = meses[monthIndex] || month
  return {
    day: day || '--',
    monthYear: `${monthName} • ${year || ''}`,
  }
}

export const AdminDashboardPage: React.FC = () => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EM_ANDAMENTO':
        return (
          <span className="font-mono text-xs uppercase tracking-wider px-2 py-0.5 rounded-none bg-[var(--color-info-bg)] text-[var(--color-info-text)] font-medium inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-info-text)]" />
            Em Andamento
          </span>
        )
      case 'PROGRAMADO':
        return (
          <span className="font-mono text-xs uppercase tracking-wider px-2 py-0.5 rounded-none bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] font-medium">
            Programado
          </span>
        )
      case 'FINALIZADO':
        return (
          <span className="font-mono text-xs uppercase tracking-wider px-2 py-0.5 rounded-none bg-[var(--color-success-bg)] text-[var(--color-success-text)] font-medium">
            Finalizado
          </span>
        )
      case 'CANCELADO':
        return (
          <span className="font-mono text-xs uppercase tracking-wider px-2 py-0.5 rounded-none bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] font-medium">
            Cancelado
          </span>
        )
      default:
        return (
          <span className="font-mono text-xs uppercase tracking-wider px-2 py-0.5 rounded-none bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] font-medium">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-[76rem] mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Barra de Título e Ações Principais do Administrador */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-6 border-b border-[var(--color-border)]/60">
        <div>
          <div className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-1">
            Sessão Acadêmica • Comissão de Extensão e Pesquisa
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--color-text-primary)] tracking-tight">
            Painel de Gestão
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-2xl leading-relaxed">
            Bem-vindo à sala de coordenação. Visualize o status operacional dos
            eventos, controle a abertura do credenciamento e valide as atas de
            conclusão.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="md"
            onClick={loadData}
            isLoading={isLoading}
          >
            Atualizar
          </Button>
          <Link to="/admin/eventos/novo">
            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusIcon size={18} />}
            >
              Criar Evento
            </Button>
          </Link>
        </div>
      </div>

      {/* Alerta de erro */}
      {error && (
        <Alert
          variant="error"
          title="Falha ao carregar indicadores administrativos"
        >
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

      {/* Estado de carregamento */}
      {isLoading && !data && <AdminDashboardSkeleton />}

      {data && (
        <>
          {/* BANNER: Eventos Aguardando Conclusão (quando houver) */}
          {eventoPendente && (
            <section
              aria-labelledby="pendencias-heading"
              className="p-6 rounded-none bg-[var(--color-primary-subtle)] border border-[var(--color-warning-border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <AwardIcon size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2
                      id="pendencias-heading"
                      className="text-base font-bold text-[var(--color-primary-active)]"
                    >
                      Eventos Aguardando Conclusão e Emissão
                    </h2>
                    <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-none bg-[var(--color-primary)] text-white">
                      Ação Necessária
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-warning-text)] leading-relaxed">
                    O evento{' '}
                    <strong className="text-[var(--color-primary-active)] font-semibold">
                      {eventoPendente.tema}
                    </strong>{' '}
                    já encerrou seu horário previsto. Revise as presenças e faça
                    o upload da assinatura do coordenador para emitir os
                    certificados aos participantes.
                  </p>
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <Link
                  to={`/admin/eventos/${eventoPendente.id}/concluir`}
                  className="block w-full"
                >
                  <Button variant="primary" size="sm" fullWidth>
                    Revisar Conclusão
                  </Button>
                </Link>
              </div>
            </section>
          )}

          {/* OS TRÊS INDICADORES PRINCIPAIS */}
          <section
            aria-labelledby="metrics-heading"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <h2 id="metrics-heading" className="sr-only">
              Indicadores Principais
            </h2>

            {/* Indicador 1 */}
            <div className="flex flex-col justify-between p-6 surface-depth bg-[var(--color-bg-surface)] rounded-none border border-[var(--color-border)] shadow-xs relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold block">
                    Ciclo Vigente
                  </span>
                  <span className="text-base font-bold text-[var(--color-text-primary)] mt-1 block">
                    Eventos Ativos
                  </span>
                </div>
                <div className="w-10 h-10 rounded-none bg-[var(--color-bg-subtle)] flex items-center justify-center text-[var(--color-primary-text)]">
                  <CalendarIcon size={20} />
                </div>
              </div>
              <div className="mt-6 flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-4xl sm:text-5xl text-[var(--color-primary-text)] font-bold leading-none">
                    {data.eventosAtivos}
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    em curso ou abertura
                  </span>
                </div>
              </div>
              <div className="mt-4 w-full bg-[var(--color-bg-muted)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--color-primary)] h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(15, data.eventosAtivos * 12))}%`,
                  }}
                />
              </div>
            </div>

            {/* Indicador 2 */}
            <div className="flex flex-col justify-between p-6 surface-depth bg-[var(--color-bg-surface)] rounded-none border border-[var(--color-border)] shadow-xs relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold block">
                    Projeção Imediata
                  </span>
                  <span className="text-base font-bold text-[var(--color-text-primary)] mt-1 block">
                    Próximos 7 Dias
                  </span>
                </div>
                <div className="w-10 h-10 rounded-none bg-[var(--color-bg-subtle)] flex items-center justify-center text-[var(--color-info-text)]">
                  <ClockIcon size={20} />
                </div>
              </div>
              <div className="mt-6 flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-4xl sm:text-5xl text-[var(--color-text-primary)] font-bold leading-none">
                    {data.eventosAtivosNaSemana}
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    com inscrições ativas
                  </span>
                </div>
              </div>
              <div className="mt-4 w-full bg-[var(--color-bg-muted)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--color-info-text)] h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(15, data.eventosAtivosNaSemana * 20))}%`,
                  }}
                />
              </div>
            </div>

            {/* Indicador 3 */}
            <div className="flex flex-col justify-between p-6 surface-depth bg-[var(--color-bg-surface)] rounded-none border border-[var(--color-border)] shadow-xs relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold block">
                    Autenticação Pública
                  </span>
                  <span className="text-base font-bold text-[var(--color-text-primary)] mt-1 block truncate">
                    Certificados (30 dias)
                  </span>
                </div>
                <div className="w-10 h-10 rounded-none bg-[var(--color-bg-subtle)] flex items-center justify-center text-[var(--color-success-text)]">
                  <AwardIcon size={20} />
                </div>
              </div>
              <div className="mt-6 flex items-baseline justify-between flex-wrap gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-4xl sm:text-5xl text-[var(--color-success-text)] font-bold leading-none">
                    {data.certificadosUltimos30Dias.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    emitidos
                  </span>
                </div>
                {data.variacaoCertificadosUltimos30Dias !== 0 && (
                  <span className="font-mono text-xs text-[var(--color-success-text)] font-semibold flex items-center gap-1">
                    {data.variacaoCertificadosUltimos30Dias > 0 ? '+' : ''}
                    {data.variacaoCertificadosUltimos30Dias}%
                  </span>
                )}
              </div>
              <div className="mt-4 w-full bg-[var(--color-bg-muted)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--color-success-text)] h-full rounded-full"
                  style={{ width: '85%' }}
                />
              </div>
            </div>
          </section>

          {/* AGENDA DOS PRÓXIMOS EVENTOS */}
          <section
            aria-labelledby="agenda-heading"
            className="surface-depth bg-[var(--color-bg-surface)] p-6 sm:p-8 rounded-none border border-[var(--color-border)] shadow-xs flex flex-col gap-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[var(--color-bg-muted)] gap-3">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)] font-semibold block mb-0.5">
                  Fluxo Presencial e Digital
                </span>
                <h2
                  id="agenda-heading"
                  className="font-serif text-2xl text-[var(--color-text-primary)] font-bold"
                >
                  Agenda dos Próximos Eventos
                </h2>
              </div>

              <div className="flex items-center gap-2 p-2 bg-[var(--color-bg-subtle)] rounded-none border border-[var(--color-border)]/60 text-xs text-[var(--color-text-secondary)]">
                <span
                  className="w-2 h-2 rounded-full bg-[var(--color-primary)]"
                  aria-hidden="true"
                />
                <span>
                  Regra institucional: Credenciamento disponível de 10 min antes
                  até 10 min após o término.
                </span>
              </div>
            </div>

            {data.proximosEventos.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)] py-6 text-center">
                Não há eventos agendados para os próximos dias.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.proximosEventos.slice(0, 6).map((evento) => {
                  const { day, monthYear } = extractDateParts(evento.data)
                  const janelaAberta = isWithinPresenceWindow(
                    evento.data,
                    evento.horarioInicio,
                    evento.horarioFim
                  )

                  return (
                    <article
                      key={evento.id}
                      className="p-5 rounded-none bg-[var(--color-bg-subtle)] border border-[var(--color-border)]/60 flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">
                            {day} {monthYear}
                          </span>
                          {janelaAberta ? (
                            <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-none bg-[var(--color-success-bg)] text-[var(--color-success-text)] font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success-text)] animate-pulse" />
                              Janela Aberta
                            </span>
                          ) : (
                            getStatusBadge(evento.status)
                          )}
                        </div>

                        <h3 className="font-serif text-lg font-bold text-[var(--color-text-primary)] mb-2 line-clamp-2">
                          {evento.tema}
                        </h3>

                        <div className="space-y-1 text-xs text-[var(--color-text-secondary)]">
                          <div className="flex items-center gap-1.5">
                            <ClockIcon
                              size={14}
                              className="text-[var(--color-text-muted)]"
                            />
                            <span>
                              {evento.horarioInicio} às {evento.horarioFim}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] uppercase text-[var(--color-text-muted)]">
                              Local:
                            </span>
                            <span className="truncate">
                              {evento.local ||
                                evento.disciplina ||
                                'Campus FATEC'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[var(--color-border)]/60 flex items-center justify-between">
                        <span className="font-mono text-[11px] text-[var(--color-text-secondary)] uppercase font-medium">
                          {evento.modalidade}
                        </span>
                        <Link
                          to={`/admin/eventos/${evento.id}/editar`}
                          className="text-xs font-semibold text-[var(--color-primary-text)] hover:underline inline-flex items-center gap-1"
                        >
                          <span>Gerenciar</span>
                          <ArrowUpRightIcon size={14} />
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          {/* CATÁLOGO RESUMIDO DE EVENTOS CADASTRADOS */}
          <section
            aria-labelledby="catalog-heading"
            className="surface-depth bg-[var(--color-bg-surface)] p-6 sm:p-8 rounded-none border border-[var(--color-border)] shadow-xs flex flex-col gap-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--color-bg-muted)] gap-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold block mb-0.5">
                  Registro Geral
                </span>
                <h2
                  id="catalog-heading"
                  className="font-serif text-2xl text-[var(--color-text-primary)] font-bold"
                >
                  Eventos Cadastrados no Sistema
                </h2>
              </div>

              <Link to="/admin/eventos">
                <Button variant="outline" size="sm">
                  Ver Todos os Eventos &rarr;
                </Button>
              </Link>
            </div>

            {/* Tabela Responsiva */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
                    <th scope="col" className="pb-3 pr-4 font-semibold">
                      Tema do Evento
                    </th>
                    <th scope="col" className="pb-3 px-4 font-semibold">
                      Data &amp; Horário
                    </th>
                    <th scope="col" className="pb-3 px-4 font-semibold">
                      Modalidade
                    </th>
                    <th scope="col" className="pb-3 px-4 font-semibold">
                      Status
                    </th>
                    <th
                      scope="col"
                      className="pb-3 pl-4 text-right font-semibold"
                    >
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-bg-muted)]">
                  {data.proximosEventos.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-[var(--color-text-secondary)]"
                      >
                        Nenhum evento registrado no catálogo.
                      </td>
                    </tr>
                  ) : (
                    data.proximosEventos.map((evento) => (
                      <tr
                        key={evento.id}
                        className="hover:bg-[var(--color-bg-page)] transition-colors"
                      >
                        <td className="py-4 pr-4">
                          <span className="font-semibold text-[var(--color-text-primary)] block">
                            {evento.tema}
                          </span>
                          <span className="text-xs text-[var(--color-text-muted)] block">
                            {evento.local || evento.disciplina || 'Campus'}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-[var(--color-text-secondary)] whitespace-nowrap">
                          <div>{evento.data}</div>
                          <div className="text-[11px] text-[var(--color-text-muted)]">
                            {evento.horarioInicio} - {evento.horarioFim}
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-mono text-xs uppercase text-[var(--color-text-secondary)]">
                            {evento.modalidade}
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          {getStatusBadge(evento.status)}
                        </td>
                        <td className="py-4 pl-4 text-right whitespace-nowrap">
                          <Link
                            to={`/admin/eventos/${evento.id}/editar`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary-text)] hover:underline"
                          >
                            <span>Gerenciar</span>
                            <ArrowUpRightIcon size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
