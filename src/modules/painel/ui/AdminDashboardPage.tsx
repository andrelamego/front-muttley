import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MonitorUp, UserRoundX } from 'lucide-react'
import { getAdminDashboardData } from '../api/painelApi'
import { getTicketDateParts, parseEventDateTime } from '../../eventos'
import { formatResumoSemana } from '../domain/resumoSemana'
import { situacaoOcupacao, type SituacaoOcupacao } from '../domain/painelAdmin'
import type { AdminDashboardData, EventoResumo } from '../domain/painelTypes'
import { Alert, Badge, Button, ButtonLink, PlusIcon } from '../../../shared/ui'
import { AdminDashboardSkeleton } from './skeletons'
import { Barra, Bloco, GraficoMensal, Indicador } from './admin/PartesPainel'

const MENSAGEM_FALHA = 'Falha ao carregar indicadores administrativos.'

const SELO: Record<
  SituacaoOcupacao,
  { texto: string; variante: 'danger' | 'warning' | 'info' }
> = {
  LOTADO: { texto: 'Lotado', variante: 'danger' },
  QUASE_LOTADO: { texto: 'Quase lotado', variante: 'warning' },
  BAIXA_PROCURA: { texto: 'Baixa procura', variante: 'info' },
}

/** Hoje no fuso do navegador, em YYYY-MM-DD. */
const hojeIso = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const dataCurta = (data: string, horario?: string | null) => {
  const p = getTicketDateParts(data, horario)
  return [`${p.dia} ${p.mes}`, p.horario].filter(Boolean).join(' · ')
}

const linkClasse =
  'text-sm font-semibold text-[var(--color-primary-text)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-sm'

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      setData(await getAdminDashboardData())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : MENSAGEM_FALHA)
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
          setError(err instanceof Error ? err.message : MENSAGEM_FALHA)
          setIsLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  // Evento com pendência de conclusão real: EM_ANDAMENTO cujo horário de término já passou.
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
  const hoje = hojeIso()
  const semestre = data?.semestre
  const anterior = data?.semestreAnterior ?? undefined
  const maiorDisciplina = Math.max(
    1,
    ...(data?.porDisciplina ?? []).map((d) => d.presentes)
  )

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
                  {pendenciasConclusao.length > 1
                    ? `${pendenciasConclusao.length} eventos aguardam conclusão`
                    : `${eventoPendente.tema} terminou e aguarda conclusão`}
                </h2>
                <p className="text-sm mt-1">
                  {pendenciasConclusao.length > 1 &&
                    `Comece por ${eventoPendente.tema}. `}
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

          {data.hoje.length > 0 && (
            <Bloco
              titulo="Hoje"
              descricao="Abra o telão para a presença por QR Code na sala."
            >
              <ul className="divide-y divide-[var(--color-border-subtle)]">
                {data.hoje.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <strong className="font-semibold [overflow-wrap:anywhere]">
                          {ev.tema}
                        </strong>
                        {ev.status === 'EM_ANDAMENTO' && (
                          <Badge variant="success" size="sm">
                            Em andamento
                          </Badge>
                        )}
                        {ev.status === 'FINALIZADO' && (
                          <Badge variant="default" size="sm">
                            Concluído
                          </Badge>
                        )}
                      </span>
                      <span className="block text-sm text-[var(--color-text-secondary)] tabular-nums">
                        {ev.horarioInicio}–{ev.horarioFim} · {ev.presentes} de{' '}
                        {ev.inscritos} presentes
                      </span>
                    </span>
                    <span className="flex gap-2">
                      {ev.status !== 'FINALIZADO' && (
                        <ButtonLink
                          to={`/admin/eventos/${ev.id}/telao`}
                          size="sm"
                          leftIcon={<MonitorUp className="size-4" />}
                        >
                          Telão
                        </ButtonLink>
                      )}
                      <ButtonLink
                        to={`/admin/eventos/${ev.id}`}
                        variant="outline"
                        size="sm"
                      >
                        Abrir
                      </ButtonLink>
                    </span>
                  </li>
                ))}
              </ul>
            </Bloco>
          )}

          {semestre && (
            <section aria-labelledby="semestre-heading">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2
                  id="semestre-heading"
                  className="font-display text-lg font-bold"
                >
                  Semestre {semestre.semestre}
                </h2>
                {data.pessoasSemConta > 0 && (
                  <Link
                    to="/admin/pessoas"
                    className={`${linkClasse} inline-flex items-center gap-1.5`}
                  >
                    <UserRoundX className="size-4" aria-hidden />
                    {data.pessoasSemConta === 1
                      ? '1 inscrito ainda não criou conta'
                      : `${data.pessoasSemConta} inscritos ainda não criaram conta`}
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                <Indicador
                  rotulo="Eventos realizados"
                  valor={semestre.eventosRealizados}
                  anterior={anterior?.eventosRealizados}
                  semestreAnterior={anterior?.semestre}
                />
                <Indicador
                  rotulo="Inscrições"
                  valor={semestre.inscricoes}
                  anterior={anterior?.inscricoes}
                  semestreAnterior={anterior?.semestre}
                />
                <Indicador
                  rotulo="Presenças"
                  valor={semestre.presentes}
                  anterior={anterior?.presentes}
                  semestreAnterior={anterior?.semestre}
                />
                <Indicador
                  rotulo="Taxa de presença"
                  valor={semestre.taxaPresenca}
                  sufixo="%"
                  anterior={anterior?.taxaPresenca}
                  semestreAnterior={anterior?.semestre}
                />
                <Indicador
                  rotulo="Certificados"
                  valor={semestre.certificados}
                  anterior={anterior?.certificados}
                  semestreAnterior={anterior?.semestre}
                />
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Bloco
              titulo="Ocupação dos próximos eventos"
              descricao="Inscritos sobre a capacidade do local. Palestrantes não contam."
              acao={
                <Link to="/admin/eventos" className={linkClasse}>
                  Ver todos
                </Link>
              }
            >
              {data.ocupacao.length === 0 ? (
                <p className="py-4 text-sm text-[var(--color-text-secondary)]">
                  Nenhum evento agendado. Crie um evento para abrir inscrições.
                </p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {data.ocupacao.map((o) => {
                    const situacao = situacaoOcupacao(o, hoje)
                    return (
                      <Barra
                        key={o.id}
                        percentual={o.percentual ?? 0}
                        rotulo={
                          <Link
                            to={`/admin/eventos/${o.id}`}
                            className="hover:text-[var(--color-primary-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-sm"
                          >
                            <span className="text-[var(--color-text-muted)] tabular-nums">
                              {dataCurta(o.data, o.horarioInicio)}
                            </span>{' '}
                            {o.tema}
                          </Link>
                        }
                        valor={
                          o.capacidade
                            ? `${o.inscritos}/${o.capacidade}`
                            : `${o.inscritos} inscritos`
                        }
                        extra={
                          situacao && (
                            <Badge variant={SELO[situacao].variante} size="sm">
                              {SELO[situacao].texto}
                            </Badge>
                          )
                        }
                      />
                    )
                  })}
                </ul>
              )}
            </Bloco>

            <Bloco
              titulo="Últimos 6 meses"
              descricao="Presenças contam no mês do evento."
            >
              <div className="flex flex-col gap-8">
                <GraficoMensal
                  titulo="Presenças"
                  meses={data.serieMensal.map((m) => ({
                    mes: m.mes,
                    rotulo: m.rotulo,
                    valor: m.presencas,
                  }))}
                />
                <GraficoMensal
                  titulo="Certificados emitidos"
                  meses={data.serieMensal.map((m) => ({
                    mes: m.mes,
                    rotulo: m.rotulo,
                    valor: m.certificados,
                  }))}
                />
              </div>
            </Bloco>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
            <Bloco
              titulo="Presença nos últimos eventos"
              descricao="Presentes sobre inscritos."
            >
              {data.presencaRecentes.length === 0 ? (
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Nenhum evento concluído ainda.
                </p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {data.presencaRecentes.map((p) => (
                    <Barra
                      key={p.id}
                      percentual={p.taxa}
                      rotulo={p.tema}
                      valor={`${p.taxa}%`}
                      extra={
                        <span className="text-xs text-[var(--color-text-muted)] tabular-nums">
                          {p.presentes}/{p.inscritos}
                        </span>
                      }
                    />
                  ))}
                </ul>
              )}
            </Bloco>

            <Bloco
              titulo="Por disciplina"
              descricao="Presenças em eventos concluídos no semestre."
            >
              {data.porDisciplina.length === 0 ? (
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Nenhum evento concluído neste semestre.
                </p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {data.porDisciplina.map((d) => (
                    <Barra
                      key={d.disciplina}
                      percentual={(d.presentes / maiorDisciplina) * 100}
                      rotulo={d.disciplina}
                      valor={String(d.presentes)}
                      extra={
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {d.eventos === 1
                            ? '1 evento'
                            : `${d.eventos} eventos`}
                        </span>
                      }
                    />
                  ))}
                </ul>
              )}
            </Bloco>

            <Bloco
              titulo="Destaques do semestre"
              descricao="No fim do semestre, o primeiro recebe a medalha Diamante."
            >
              {data.destaquesSemestre.length === 0 ? (
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Nenhuma presença em evento concluído neste semestre.
                </p>
              ) : (
                <ol className="flex flex-col gap-2.5">
                  {data.destaquesSemestre.map((d, i) => (
                    <li
                      key={d.nome}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--color-bg-muted)] text-xs font-bold tabular-nums">
                        {i + 1}
                      </span>
                      <span className="flex-1 truncate">{d.nome}</span>
                      <b className="tabular-nums">{d.presencas}</b>
                    </li>
                  ))}
                </ol>
              )}
            </Bloco>
          </div>
        </div>
      )}
    </div>
  )
}
