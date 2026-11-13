import React, { useState, useEffect, useCallback, useId, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  getAdminEventosApi,
  cancelarAdminEventoApi,
} from '../api/adminEventosApi'
import type { AdminEvento, StatusEvento } from '../domain/adminEventoTypes'
import {
  Card,
  Badge,
  Button,
  Alert,
  LoadingDots,
  Input,
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  QrCodeIcon,
  CheckCircleIcon,
  CalendarIcon,
  ClockIcon,
  toast,
  FiltroSegmentado,
} from '../../../shared/ui'
import { AdminEventListSkeleton } from './skeletons'
import { EventoQrDialog } from './EventoQrDialog'
import { getStatusBadgeVariant, getStatusLabel } from './statusEvento'
import { MoreHorizontal } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../shared/ui/shadcn/dropdown-menu'
import { formatModalidade } from '../../eventos'

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const parts = dateStr.split('-').map(Number)
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    const d = new Date(parts[0], parts[1] - 1, parts[2])
    return d.toLocaleDateString('pt-BR')
  }
  return dateStr
}

export const AdminEventListPage: React.FC = () => {
  const [events, setEvents] = useState<AdminEvento[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'TODOS' | StatusEvento>(
    'TODOS'
  )
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [eventoACancelar, setEventoACancelar] = useState<AdminEvento | null>(
    null
  )
  const searchInputId = useId()

  // Evento com o dialog de QR aberto e o botão que o abriu (recebe o foco ao fechar)
  const [qrModalEvent, setQrModalEvent] = useState<AdminEvento | null>(null)
  const modalTriggerRef = useRef<HTMLElement | null>(null)
  // Quando a escolha do menu abre um dialog, o menu não devolve o foco ao ⋯
  // (senão ele tira o foco de dentro do dialog e o Esc deixa de funcionar).
  const abrindoDialogRef = useRef(false)

  const loadEvents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAdminEventosApi()
      setEvents(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Falha ao carregar a lista de eventos administrativos.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    getAdminEventosApi()
      .then((data) => {
        if (isMounted) {
          setEvents(data)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Falha ao carregar a lista de eventos administrativos.'
          )
          setIsLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  const handleOpenQrModal = (evt: AdminEvento, trigger?: HTMLElement) => {
    modalTriggerRef.current = trigger ?? null
    setQrModalEvent(evt)
  }

  const handleCancelEvent = async (evt: AdminEvento) => {
    setDeletingId(evt.id)
    setError(null)
    try {
      await cancelarAdminEventoApi(evt.id)
      toast.success(`Evento "${evt.tema}" cancelado`)
      await loadEvents()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Falha ao cancelar evento.')
      }
    } finally {
      setDeletingId(null)
    }
  }

  // Contadores
  const countEmAndamento = events.filter(
    (e) => e.status === 'EM_ANDAMENTO'
  ).length
  const countCriado = events.filter((e) => e.status === 'CRIADO').length
  const countFinalizado = events.filter((e) => e.status === 'FINALIZADO').length
  const countCancelado = events.filter((e) => e.status === 'CANCELADO').length

  const filteredEvents = events.filter((evt) => {
    const matchesStatus =
      statusFilter === 'TODOS' || evt.status === statusFilter
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      evt.tema.toLowerCase().includes(term) ||
      (evt.descricao || '').toLowerCase().includes(term) ||
      (typeof evt.local === 'string'
        ? evt.local.toLowerCase().includes(term)
        : evt.local?.nome.toLowerCase().includes(term))
    return matchesStatus && matchesSearch
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Cabeçalho da Gestão de Eventos */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--color-border)] pb-5">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)]">
            Eventos
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Cadastre, organize horários, acompanhe presenças e conclua eventos
            acadêmicos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/eventos/novo">
            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusIcon size={18} />}
            >
              Criar evento
            </Button>
          </Link>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="error" title="Erro na gestão de eventos">
          <p className="mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={loadEvents}>
            Tentar novamente
          </Button>
        </Alert>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between surface-depth bg-[var(--color-bg-surface)] p-4 rounded-md border border-[var(--color-border)] shadow-xs">
        <div className="max-w-md flex-1">
          <label
            htmlFor={searchInputId}
            className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1"
          >
            Buscar eventos
          </label>
          <div className="relative">
            <Input
              id={searchInputId}
              type="search"
              placeholder="Buscar por título, descrição ou local..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            <div className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]">
              <SearchIcon size={16} />
            </div>
          </div>
        </div>

        {/* Abas de Status */}
        <FiltroSegmentado
          rotulo="Filtrar eventos por situação"
          valor={statusFilter}
          onChange={setStatusFilter}
          opcoes={[
            { valor: 'TODOS', rotulo: 'Todos', total: events.length },
            {
              valor: 'EM_ANDAMENTO',
              rotulo: 'Em andamento',
              total: countEmAndamento,
            },
            { valor: 'CRIADO', rotulo: 'Programados', total: countCriado },
            {
              valor: 'FINALIZADO',
              rotulo: 'Finalizados',
              total: countFinalizado,
            },
            { valor: 'CANCELADO', rotulo: 'Cancelados', total: countCancelado },
          ]}
        />
      </div>

      {/* Estado de Carregamento */}
      {isLoading && <AdminEventListSkeleton />}

      {/* Tabela de Eventos (Desktop-First) */}
      {!isLoading && !error && (
        <>
          {filteredEvents.length === 0 ? (
            <Card className="bg-[var(--color-bg-surface)] border-dashed border-[var(--color-border-strong)] p-12 text-center">
              <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--color-info-bg)] text-[var(--color-primary-text)] flex items-center justify-center">
                  <CalendarIcon size={24} />
                </div>
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                  {searchTerm || statusFilter !== 'TODOS'
                    ? 'Nenhum evento corresponde aos filtros informados'
                    : 'Nenhum evento acadêmico cadastrado'}
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {searchTerm || statusFilter !== 'TODOS'
                    ? 'Tente remover os filtros ou pesquisar por outro termo.'
                    : 'Comece criando o primeiro evento para permitir inscrições e emissão de certificados.'}
                </p>
                {searchTerm || statusFilter !== 'TODOS' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('TODOS')
                    }}
                  >
                    Redefinir filtros
                  </Button>
                ) : (
                  <Link to="/admin/eventos/novo" className="mt-2">
                    <Button variant="primary" size="md" className="gap-2">
                      <PlusIcon size={16} />
                      Criar Primeiro Evento
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ) : (
            <div className="surface-depth bg-[var(--color-bg-surface)] rounded-md border border-[var(--color-border)] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-[var(--color-bg-subtle)]/80 border-b border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)]">
                    <tr>
                      <th className="py-3.5 px-4">Evento</th>
                      <th className="py-3.5 px-4">Data e horário</th>
                      <th className="py-3.5 px-4">Modalidade</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-subtle)]">
                    {filteredEvents.map((evt) => {
                      const isCancelled = evt.status === 'CANCELADO'
                      const isFinished = evt.status === 'FINALIZADO'
                      const isDeleting = deletingId === evt.id
                      const localNome =
                        typeof evt.local === 'string'
                          ? evt.local
                          : evt.local?.nome || 'Campus FATEC'

                      return (
                        <tr
                          key={evt.id}
                          className="hover:bg-[var(--color-bg-subtle)]/60 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <Link
                              to={`/admin/eventos/${evt.id}`}
                              className="font-semibold text-[var(--color-text-primary)] line-clamp-1 hover:text-[var(--color-primary-text)] hover:underline underline-offset-2"
                            >
                              {evt.tema}
                            </Link>
                            <div className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-1">
                              {localNome}
                            </div>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap text-[var(--color-text-secondary)]">
                            <div className="flex items-center gap-1.5 text-xs font-medium">
                              <CalendarIcon
                                size={14}
                                className="text-[var(--color-text-muted)]"
                              />
                              <span>{formatDate(evt.data)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mt-0.5">
                              <ClockIcon
                                size={14}
                                className="text-[var(--color-text-muted)]"
                              />
                              <span>
                                {evt.horarioInicio || '--:--'} às{' '}
                                {evt.horarioFim || '--:--'}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <Badge variant="default" size="sm">
                              {formatModalidade(evt.modalidade)}
                            </Badge>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <Badge
                              variant={getStatusBadgeVariant(evt.status)}
                              size="sm"
                            >
                              {getStatusLabel(evt.status)}
                            </Badge>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {!isFinished && !isCancelled && (
                                <Link to={`/admin/eventos/${evt.id}/concluir`}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    leftIcon={<CheckCircleIcon size={14} />}
                                  >
                                    Concluir
                                  </Button>
                                </Link>
                              )}

                              {/* modal={false}: o menu abre um dialog; sem isso o Radix trava o ponteiro da página */}
                              <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    id={`acoes-evento-${evt.id}`}
                                    variant="ghost"
                                    size="sm"
                                    aria-label={`Ações do evento ${evt.tema}`}
                                    title="Mais ações"
                                  >
                                    {isDeleting ? (
                                      <LoadingDots label="Cancelando evento" />
                                    ) : (
                                      <MoreHorizontal className="size-4" />
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-52"
                                  onCloseAutoFocus={(e) => {
                                    if (abrindoDialogRef.current) {
                                      e.preventDefault()
                                      abrindoDialogRef.current = false
                                    }
                                  }}
                                >
                                  <DropdownMenuItem
                                    onSelect={() => {
                                      abrindoDialogRef.current = true
                                      handleOpenQrModal(
                                        evt,
                                        document.getElementById(
                                          `acoes-evento-${evt.id}`
                                        ) ?? undefined
                                      )
                                    }}
                                  >
                                    <QrCodeIcon size={16} />
                                    Ver QR Codes
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link
                                      to={`/admin/eventos/${evt.id}/editar`}
                                    >
                                      <EditIcon size={16} />
                                      Editar evento
                                    </Link>
                                  </DropdownMenuItem>
                                  {!isCancelled && !isFinished && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        variant="destructive"
                                        disabled={isDeleting}
                                        onSelect={() => {
                                          abrindoDialogRef.current = true
                                          setEventoACancelar(evt)
                                        }}
                                      >
                                        <TrashIcon size={16} />
                                        Cancelar evento
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmação de cancelamento: ação sem volta, então pede confirmação explícita */}
      <AlertDialog
        open={eventoACancelar !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setEventoACancelar(null)
        }}
      >
        <AlertDialogContent
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            if (eventoACancelar)
              document
                .getElementById(`acoes-evento-${eventoACancelar.id}`)
                ?.focus()
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar este evento?</AlertDialogTitle>
            <AlertDialogDescription>
              “{eventoACancelar?.tema}” passa a ficar cancelado e não poderá
              mais ser editado. Os links já divulgados continuam abrindo a
              página do evento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (eventoACancelar) handleCancelEvent(eventoACancelar)
              }}
            >
              Cancelar evento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EventoQrDialog
        evento={qrModalEvent}
        onClose={() => setQrModalEvent(null)}
        focoAoFechar={() => modalTriggerRef.current}
      />
    </div>
  )
}
