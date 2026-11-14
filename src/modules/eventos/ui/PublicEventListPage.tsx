import React, { useState, useEffect, useCallback } from 'react'
import { getEventosPublicosApi } from '../api/eventosApi'
import type { EventoPublico } from '../domain/eventoTypes'
import { buildEventPath, PUBLIC_EVENTS_PATH } from '../domain/eventRoutes'
import { formatModalidade, getTicketDateParts } from '../domain/ticketFormat'
import {
  Card,
  Badge,
  Button,
  Alert,
  Input,
  SearchIcon,
  Ticket,
} from '../../../shared/ui'
import { EventListSkeleton } from './skeletons'

interface PublicEventListPageProps {
  eventRouteBase?: string
  participantView?: boolean
}

export const PublicEventListPage: React.FC<PublicEventListPageProps> = ({
  eventRouteBase = PUBLIC_EVENTS_PATH,
  participantView = false,
}) => {
  const [eventos, setEventos] = useState<EventoPublico[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadEventos = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const data = await getEventosPublicosApi()
      setEventos(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Falha ao carregar a lista pública de eventos.')
      }
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
          setError(
            err instanceof Error
              ? err.message
              : 'Falha ao carregar a lista pública de eventos.'
          )
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredEventos = eventos.filter((evt) => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return true
    return (
      evt.tema.toLowerCase().includes(term) ||
      (evt.descricao && evt.descricao.toLowerCase().includes(term)) ||
      (evt.disciplina && evt.disciplina.toLowerCase().includes(term)) ||
      (evt.local && evt.local.toLowerCase().includes(term))
    )
  })

  return (
    <div className="flex flex-col gap-6 w-full max-w-[76rem] mx-auto py-6 px-4 sm:px-6">
      {/* Hero / Cabeçalho da página pública */}
      <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[var(--color-border)]/60">
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
            placeholder="Buscar por tema ou local..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar eventos abertos"
          />
        </div>
      </div>

      {/* Alerta de erro */}
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

      {/* Estado de Carregamento */}
      {isLoading && eventos.length === 0 && <EventListSkeleton />}

      {/* Grid de Eventos */}
      {!error && (!isLoading || eventos.length > 0) && (
        <>
          {filteredEventos.length === 0 ? (
            <Card className="bg-[var(--color-bg-surface)] border-dashed border-[var(--color-border-strong)] p-12 text-center">
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
                    Limpar filtro de busca
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <ul className="content-enter grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEventos.map((evt) => {
                const partes = getTicketDateParts(evt.data, evt.horarioInicio)
                return (
                  <li key={evt.id}>
                    <Ticket
                      compact
                      dia={partes.dia}
                      mes={partes.mes}
                      horario={partes.horario}
                      to={buildEventPath(eventRouteBase, evt.id)}
                      className="h-full [&>.ticket]:h-full"
                    >
                      <Badge
                        variant={
                          evt.inscricoesEncerradas ? 'danger' : 'success'
                        }
                        size="sm"
                      >
                        {evt.inscricoesEncerradas
                          ? 'Inscrições encerradas'
                          : 'Inscrições abertas'}
                      </Badge>
                      <h2 className="font-display text-lg font-bold leading-tight mt-3">
                        {evt.tema}
                      </h2>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        {[evt.local, formatModalidade(evt.modalidade)]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      <span className="ticket-cta inline-block mt-3 text-sm font-semibold text-[var(--color-primary-text)]">
                        {evt.inscricoesEncerradas
                          ? 'Ver detalhes'
                          : 'Ver detalhes e inscrever-se'}
                      </span>
                    </Ticket>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
