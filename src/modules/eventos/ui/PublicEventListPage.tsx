import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getEventosPublicosApi } from '../api/eventosApi'
import type { EventoPublico } from '../domain/eventoTypes'
import { buildEventPath, PUBLIC_EVENTS_PATH } from '../domain/eventRoutes'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Badge,
  Button,
  Alert,
  Input,
  SearchIcon,
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
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Hero / Cabeçalho da página pública */}
      <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[var(--color-border)]/60">
        <div>
          <span className="font-mono text-xs font-semibold text-[var(--color-primary-text)] uppercase tracking-wider">
            {participantView
              ? 'Área do participante • Eventos disponíveis'
              : 'Compêndio Acadêmico • Catálogo Geral'}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight mt-1">
            {participantView ? 'Explorar eventos' : 'Programação Aberta'}
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
      {(!isLoading || eventos.length > 0) && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredEventos.map((evt) => (
                <Card
                  key={evt.id}
                  className="surface-depth surface-depth-interactive bg-[var(--color-bg-surface)] border-[var(--color-border)] flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <CardHeader className="flex-row items-center justify-between gap-2 border-b border-[var(--color-bg-muted)]">
                    <Badge
                      variant={evt.inscricoesEncerradas ? 'danger' : 'success'}
                    >
                      {evt.inscricoesEncerradas
                        ? 'Inscrições Encerradas'
                        : 'Inscrições Abertas'}
                    </Badge>
                    <Badge variant="default" size="sm">
                      {evt.modalidade}
                    </Badge>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-3">
                    <CardTitle
                      as="h2"
                      className="text-xl text-[var(--color-text-primary)] font-serif"
                    >
                      {evt.tema}
                    </CardTitle>

                    {evt.descricao && (
                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed">
                        {evt.descricao}
                      </p>
                    )}

                    <div className="bg-[var(--color-bg-subtle)] rounded-none p-3 grid grid-cols-2 gap-2 text-xs text-[var(--color-text-secondary)] mt-2 font-mono">
                      <div>
                        <span className="block text-[var(--color-text-muted)] font-medium uppercase text-[10px]">
                          Data:
                        </span>
                        <strong className="text-[var(--color-text-primary)]">
                          {evt.data}
                        </strong>
                      </div>
                      <div>
                        <span className="block text-[var(--color-text-muted)] font-medium uppercase text-[10px]">
                          Horário:
                        </span>
                        <strong className="text-[var(--color-text-primary)]">
                          {evt.horarioInicio} às {evt.horarioFim}
                        </strong>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[var(--color-text-muted)] font-medium uppercase text-[10px]">
                          Local / Polo:
                        </span>
                        <span className="text-[var(--color-text-primary)] truncate block font-sans">
                          {evt.local || evt.disciplina || 'Campus FATEC'}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="bg-[var(--color-bg-subtle)] border-t border-[var(--color-bg-muted)]">
                    <Link
                      to={buildEventPath(eventRouteBase, evt.id)}
                      className="w-full"
                    >
                      <Button
                        variant={
                          evt.inscricoesEncerradas ? 'outline' : 'primary'
                        }
                        size="md"
                        fullWidth
                      >
                        {evt.inscricoesEncerradas
                          ? 'Ver Informações'
                          : 'Inscrever-se no Evento →'}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
