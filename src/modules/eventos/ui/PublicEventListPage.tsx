import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getEventosPublicosApi,
  getMinhasParticipacoesApi,
  type MinhaParticipacao,
} from '../api/eventosApi'
import type { EventoPublico } from '../domain/eventoTypes'
import { buildEventPath, PUBLIC_EVENTS_PATH } from '../domain/eventRoutes'
import { formatModalidade, getTicketDateParts } from '../domain/ticketFormat'
import { hojeLocal, secoesExplorar } from '../domain/explorarEventos'
import {
  Badge,
  Button,
  Alert,
  Input,
  SearchIcon,
  Ticket,
} from '../../../shared/ui'
import { EventListSkeleton } from './skeletons'
import { CarrosselEventos } from './CarrosselEventos'

interface PublicEventListPageProps {
  eventRouteBase?: string
  participantView?: boolean
}

const MENSAGEM_FALHA = 'Falha ao carregar a lista pública de eventos.'

/** Ingresso do evento na vitrine; o inteiro é um link para o detalhe. */
const IngressoEvento: React.FC<{
  evento: EventoPublico
  to: string
  inscrito: boolean
  /** Falso na prateleira da própria disciplina, onde o título já diz qual é. */
  mostrarDisciplina?: boolean
}> = ({ evento, to, inscrito, mostrarDisciplina = true }) => {
  const partes = getTicketDateParts(evento.data, evento.horarioInicio)
  return (
    <Ticket
      compact
      dia={partes.dia}
      mes={partes.mes}
      horario={partes.horario}
      to={to}
      className="h-full [&>.ticket]:h-full"
    >
      {inscrito ? (
        <Badge variant="info" size="sm">
          Você está inscrito
        </Badge>
      ) : (
        <Badge
          variant={evento.inscricoesEncerradas ? 'danger' : 'success'}
          size="sm"
        >
          {evento.inscricoesEncerradas
            ? 'Inscrições encerradas'
            : 'Inscrições abertas'}
        </Badge>
      )}
      {mostrarDisciplina && evento.disciplina && (
        <p className="mt-3 text-xs font-semibold text-[var(--color-primary-text)]">
          {evento.disciplina}
        </p>
      )}
      <h3
        className={`font-display text-lg font-bold leading-tight line-clamp-2 ${mostrarDisciplina && evento.disciplina ? 'mt-1' : 'mt-3'}`}
      >
        {evento.tema}
      </h3>
      <p className="text-sm text-[var(--color-text-secondary)] mt-1">
        {[evento.local, formatModalidade(evento.modalidade)]
          .filter(Boolean)
          .join(' · ')}
      </p>
      <span className="ticket-cta inline-block mt-3 text-sm font-semibold text-[var(--color-primary-text)]">
        {inscrito || evento.inscricoesEncerradas
          ? 'Ver detalhes'
          : 'Ver detalhes e inscrever-se'}
      </span>
    </Ticket>
  )
}

export const PublicEventListPage: React.FC<PublicEventListPageProps> = ({
  eventRouteBase = PUBLIC_EVENTS_PATH,
  participantView = false,
}) => {
  const [eventos, setEventos] = useState<EventoPublico[]>([])
  const [participacoes, setParticipacoes] = useState<MinhaParticipacao[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadEventos = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      setEventos(await getEventosPublicosApi())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : MENSAGEM_FALHA)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    getEventosPublicosApi()
      .then((data) => {
        if (isMounted) {
          setEventos(data)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : MENSAGEM_FALHA)
          setIsLoading(false)
        }
      })
    if (participantView) {
      // Sem o histórico a vitrine funciona igual, só sem "Para você".
      getMinhasParticipacoesApi()
        .then((data) => isMounted && setParticipacoes(data))
        .catch(() => undefined)
    }

    return () => {
      isMounted = false
    }
  }, [participantView])

  const inscritos = useMemo(
    () =>
      new Set(participacoes.flatMap((p) => (p.evento ? [p.evento.id] : []))),
    [participacoes]
  )

  const secoes = useMemo(() => {
    const disciplinasDaPessoa = participacoes
      .flatMap((p) => (p.evento?.disciplina ? [p.evento] : []))
      .sort((a, b) => b.data.localeCompare(a.data))
      .map((e) => e.disciplina as string)
    return secoesExplorar(eventos, {
      hoje: hojeLocal(),
      disciplinasDaPessoa,
      inscritos,
    })
  }, [eventos, participacoes, inscritos])

  const termo = searchTerm.toLowerCase().trim()
  const filteredEventos = eventos.filter(
    (evt) =>
      !termo ||
      evt.tema.toLowerCase().includes(termo) ||
      (evt.descricao && evt.descricao.toLowerCase().includes(termo)) ||
      (evt.disciplina && evt.disciplina.toLowerCase().includes(termo)) ||
      (evt.local && evt.local.toLowerCase().includes(termo))
  )

  const ingresso = (evt: EventoPublico, chaveSecao?: string) => (
    <IngressoEvento
      key={evt.id}
      evento={evt}
      to={buildEventPath(eventRouteBase, evt.id)}
      inscrito={inscritos.has(evt.id)}
      mostrarDisciplina={chaveSecao !== `disciplina:${evt.disciplina}`}
    />
  )

  return (
    <div className="flex flex-col gap-8 w-full max-w-[76rem] mx-auto py-6 px-4 sm:px-6">
      <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)]">
            {participantView ? 'Explorar eventos' : 'Programação aberta'}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {participantView
              ? 'Encontre novas atividades e faça sua inscrição sem sair do painel.'
              : 'Inscreva-se em palestras, workshops e simpósios com emissão de certificados'}
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Input
            type="search"
            placeholder="Buscar por tema, disciplina ou local"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar eventos abertos"
          />
        </div>
      </div>

      {error && (
        <Alert variant="error" title="Não foi possível obter os eventos">
          <div className="flex flex-col gap-2">
            <p>{error}</p>
            <div>
              <Button variant="secondary" size="sm" onClick={loadEventos}>
                Tentar novamente
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {isLoading && eventos.length === 0 && <EventListSkeleton />}

      {!error && (!isLoading || eventos.length > 0) && (
        <>
          {filteredEventos.length === 0 ? (
            <div className="rounded-md bg-[var(--color-bg-surface)] p-12 text-center">
              <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center text-[var(--color-text-muted)]">
                  <SearchIcon size={24} />
                </div>
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                  Nenhum evento encontrado
                </h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {searchTerm
                    ? 'Nenhum evento corresponde à busca informada. Tente outros termos.'
                    : 'Não há eventos abertos para inscrição no momento. Volte em breve!'}
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                  >
                    Limpar busca
                  </Button>
                )}
              </div>
            </div>
          ) : termo ? (
            // Na busca, as prateleiras repetiriam eventos: a lista vira uma grade única.
            <section
              aria-labelledby="resultado-busca"
              className="flex flex-col gap-3"
            >
              <h2
                id="resultado-busca"
                className="font-display text-xl font-bold"
                aria-live="polite"
              >
                {filteredEventos.length === 1
                  ? '1 evento encontrado'
                  : `${filteredEventos.length} eventos encontrados`}
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredEventos.map((evt) => (
                  <li key={evt.id}>{ingresso(evt)}</li>
                ))}
              </ul>
            </section>
          ) : (
            <div className="content-enter flex flex-col gap-10">
              {secoes.map((secao) => (
                <CarrosselEventos
                  key={secao.chave}
                  titulo={secao.titulo}
                  descricao={secao.descricao}
                >
                  {secao.eventos.map((evt) => ingresso(evt, secao.chave))}
                </CarrosselEventos>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
