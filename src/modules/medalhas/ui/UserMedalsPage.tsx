import React, { useState, useEffect, useCallback, useId } from 'react'
import { Link } from 'react-router-dom'
import { PARTICIPANT_EVENTS_PATH } from '../../eventos'
import { getMeMedalhasApi } from '../api/medalhasApi'
import type { MedalhaUsuario, TipoMedalha } from '../domain/medalhaTypes'
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
  MedalIcon,
  SearchIcon,
  CopyIcon,
  CheckIcon,
} from '../../../shared/ui'
import { MedalGridSkeleton } from './skeletons'
import { HistoryBackButton } from '../../../shared/navigation'

const getMedalBadgeVariant = (tipo: TipoMedalha): 'warning' | 'default' => {
  switch (tipo) {
    case 'OURO':
      return 'warning'
    case 'PRATA':
      return 'default'
    case 'BRONZE':
    default:
      return 'warning'
  }
}

const getMedalBorderClass = (tipo: TipoMedalha) => {
  switch (tipo) {
    case 'OURO':
      return 'border-[var(--color-warning-border)] bg-[var(--color-warning-bg)]/30'
    case 'PRATA':
      return 'border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)]/40'
    case 'BRONZE':
    default:
      return 'border-orange-200 bg-orange-50/20'
  }
}

const getMedalIconClass = (tipo: TipoMedalha) => {
  switch (tipo) {
    case 'OURO':
      return 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] ring-[var(--color-warning-border)]'
    case 'PRATA':
      return 'bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] ring-[var(--color-border-strong)]'
    case 'BRONZE':
    default:
      return 'bg-orange-100 text-orange-700 ring-orange-200'
  }
}

export const UserMedalsPage: React.FC = () => {
  const [medals, setMedals] = useState<MedalhaUsuario[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'TODAS' | TipoMedalha>('TODAS')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const searchInputId = useId()

  const loadMedals = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getMeMedalhasApi()
      setMedals(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Não foi possível carregar suas medalhas.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    getMeMedalhasApi()
      .then((data) => {
        if (isMounted) {
          setMedals(data)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar suas medalhas.'
          )
          setIsLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  const handleCopyAchievement = async (medal: MedalhaUsuario) => {
    const eventName = medal.evento?.tema || 'Evento Acadêmico'
    const text = `Conquistei a Medalha de ${medal.tipo.toLowerCase()} "${medal.nome}" no evento "${eventName}" na FATEC!`
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        setCopiedId(medal.id)
        setTimeout(() => setCopiedId(null), 2500)
      }
    } catch {
      // Falha de clipboard silenciosa
    }
  }

  const filteredMedals = medals.filter((medal) => {
    const matchesType = typeFilter === 'TODAS' || medal.tipo === typeFilter
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      medal.nome.toLowerCase().includes(term) ||
      (medal.descricao || '').toLowerCase().includes(term) ||
      (medal.evento?.tema || '').toLowerCase().includes(term)
    return matchesType && matchesSearch
  })

  // Contagem por tipo para os badges dos filtros
  const countOuro = medals.filter((m) => m.tipo === 'OURO').length
  const countPrata = medals.filter((m) => m.tipo === 'PRATA').length
  const countBronze = medals.filter((m) => m.tipo === 'BRONZE').length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--color-border)] pb-5">
        <div>
          <span className="text-xs font-semibold text-[var(--color-primary-text)] uppercase tracking-wider">
            Gamificação e Conquistas
          </span>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">
            Minhas Medalhas
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Reconhecimentos de destaque atribuídos pela participação em eventos
            acadêmicos.
          </p>
        </div>

        <HistoryBackButton label="Voltar para a página anterior" />
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="error" title="Erro ao consultar medalhas">
          <p className="mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={loadMedals}>
            Tentar novamente
          </Button>
        </Alert>
      )}

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
        <div className="max-w-md flex-1">
          <label
            htmlFor={searchInputId}
            className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1"
          >
            Buscar medalhas
          </label>
          <div className="relative">
            <Input
              id={searchInputId}
              type="search"
              placeholder="Buscar por nome da medalha ou evento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]">
              <SearchIcon size={16} />
            </div>
          </div>
        </div>

        {/* Seletor de Tipo */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0"
          role="tablist"
          aria-label="Filtrar por tipo de medalha"
        >
          <button
            type="button"
            onClick={() => setTypeFilter('TODAS')}
            className={`px-3 py-1.5 rounded-none text-xs font-semibold transition-colors ${
              typeFilter === 'TODAS'
                ? 'bg-[var(--color-primary)] text-white shadow-sm'
                : 'bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
            }`}
          >
            Todas ({medals.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('OURO')}
            className={`px-3 py-1.5 rounded-none text-xs font-semibold transition-colors ${
              typeFilter === 'OURO'
                ? 'bg-[var(--color-warning)] text-white shadow-sm'
                : 'bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
            }`}
          >
            Ouro ({countOuro})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('PRATA')}
            className={`px-3 py-1.5 rounded-none text-xs font-semibold transition-colors ${
              typeFilter === 'PRATA'
                ? 'bg-[var(--color-text-muted)] text-white shadow-sm'
                : 'bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
            }`}
          >
            Prata ({countPrata})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('BRONZE')}
            className={`px-3 py-1.5 rounded-none text-xs font-semibold transition-colors ${
              typeFilter === 'BRONZE'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
            }`}
          >
            Bronze ({countBronze})
          </button>
        </div>
      </div>

      {/* Estado de Carregamento */}
      {isLoading && <MedalGridSkeleton />}

      {/* Grid de Medalhas */}
      {!isLoading && !error && (
        <>
          {filteredMedals.length === 0 ? (
            <Card className="bg-[var(--color-bg-surface)] border-dashed border-[var(--color-border-strong)] p-10 text-center">
              <div className="max-w-sm mx-auto flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] flex items-center justify-center">
                  <MedalIcon size={24} />
                </div>
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                  {searchTerm || typeFilter !== 'TODAS'
                    ? 'Nenhuma medalha corresponde aos filtros'
                    : 'Você ainda não possui medalhas'}
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {searchTerm || typeFilter !== 'TODAS'
                    ? 'Tente remover os filtros ou pesquisar por outro termo.'
                    : 'As medalhas são atribuídas a participantes e organizadores como reconhecimento pelo engajamento em palestras, cursos e workshops.'}
                </p>
                {searchTerm || typeFilter !== 'TODAS' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setTypeFilter('TODAS')
                    }}
                  >
                    Redefinir filtros
                  </Button>
                ) : (
                  <Link to={PARTICIPANT_EVENTS_PATH} className="mt-2">
                    <Button variant="primary" size="md">
                      Explorar Eventos Disponíveis
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMedals.map((medal) => {
                const eventName = medal.evento?.tema || 'Evento Acadêmico'
                const isCopied = copiedId === medal.id

                return (
                  <Card
                    key={medal.id}
                    className={`surface-depth surface-depth-interactive bg-[var(--color-bg-surface)] transition-all hover:shadow-md flex flex-col justify-between ${getMedalBorderClass(medal.tipo)}`}
                  >
                    <div>
                      <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ring-2 ${getMedalIconClass(medal.tipo)}`}
                        >
                          <MedalIcon size={20} />
                        </div>
                        <Badge variant={getMedalBadgeVariant(medal.tipo)}>
                          {medal.tipo}
                        </Badge>
                      </CardHeader>

                      <CardContent className="space-y-2">
                        <CardTitle className="text-base font-bold text-[var(--color-text-primary)]">
                          {medal.nome}
                        </CardTitle>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                          {medal.descricao ||
                            'Reconhecimento concedido por destaque e participação exemplar.'}
                        </p>

                        <div className="pt-2 border-t border-[var(--color-border-subtle)]">
                          <span className="block text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                            Evento
                          </span>
                          <span className="text-xs font-medium text-[var(--color-text-primary)] line-clamp-1">
                            {eventName}
                          </span>
                        </div>
                      </CardContent>
                    </div>

                    <CardFooter className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                      <span className="text-[11px] text-[var(--color-text-muted)]">
                        Inscrição #{medal.inscricao}
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyAchievement(medal)}
                        className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                        title="Copiar texto da conquista"
                      >
                        {isCopied ? (
                          <span className="flex items-center gap-1 text-[var(--color-success-text)] font-semibold">
                            <CheckIcon size={14} />
                            Copiado!
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <CopyIcon size={14} />
                            Copiar
                          </span>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
