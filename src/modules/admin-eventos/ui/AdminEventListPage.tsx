import React, { useState, useEffect, useCallback, useId, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  getAdminEventosApi,
  cancelarAdminEventoApi,
  getEventQrCodeInscricaoBlobApi,
  getEventQrCodeConfirmacaoBlobApi,
  parseBlobErrorMessage,
} from '../api/adminEventosApi'
import type { AdminEvento, StatusEvento } from '../domain/adminEventoTypes'
import {
  Card,
  Badge,
  Button,
  Alert,
  LoadingDots,
  SkeletonBlock,
  Input,
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  QrCodeIcon,
  CheckCircleIcon,
  CalendarIcon,
  ClockIcon,
  DownloadIcon,
} from '../../../shared/ui'
import { AdminEventListSkeleton } from './skeletons'
import { MoreHorizontal } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/ui/shadcn/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../shared/ui/shadcn/dropdown-menu'
import { formatModalidade } from '../../eventos'

const getStatusBadgeVariant = (status: StatusEvento) => {
  switch (status) {
    case 'EM_ANDAMENTO':
      return 'info' as const
    case 'CRIADO':
      return 'default' as const
    case 'FINALIZADO':
      return 'success' as const
    case 'CANCELADO':
      return 'danger' as const
    default:
      return 'default' as const
  }
}

const getStatusLabel = (status: StatusEvento) => {
  switch (status) {
    case 'EM_ANDAMENTO':
      return 'Em andamento'
    case 'CRIADO':
      return 'Programado'
    case 'FINALIZADO':
      return 'Finalizado'
    case 'CANCELADO':
      return 'Cancelado'
    default:
      return status
  }
}

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
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const searchInputId = useId()

  interface QrItemState {
    status: 'idle' | 'loading' | 'success' | 'error'
    url: string | null
    error: string | null
  }

  // Estado do Modal de QR Code desacoplado
  const [qrModalEvent, setQrModalEvent] = useState<AdminEvento | null>(null)
  const [qrInscricao, setQrInscricao] = useState<QrItemState>({
    status: 'idle',
    url: null,
    error: null,
  })
  const [qrConfirmacao, setQrConfirmacao] = useState<QrItemState>({
    status: 'idle',
    url: null,
    error: null,
  })

  const activeEventIdRef = useRef<number | null>(null)
  const modalTriggerRef = useRef<HTMLElement | null>(null)

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

  // Carregamento independente de QR Code de Inscrição
  const carregarInscricao = useCallback(async (eventId: number) => {
    setQrInscricao((prev) => {
      if (prev.url) URL.revokeObjectURL(prev.url)
      return { status: 'loading', url: null, error: null }
    })
    try {
      const blob = await getEventQrCodeInscricaoBlobApi(eventId)
      if (activeEventIdRef.current !== eventId) return
      const url = URL.createObjectURL(blob)
      setQrInscricao({ status: 'success', url, error: null })
    } catch (err: unknown) {
      if (activeEventIdRef.current !== eventId) return
      const message = await parseBlobErrorMessage(
        err,
        'Não foi possível gerar o QR Code de inscrição.'
      )
      setQrInscricao({ status: 'error', url: null, error: message })
    }
  }, [])

  // Carregamento independente de QR Code de Presença
  const carregarConfirmacao = useCallback(async (eventId: number) => {
    setQrConfirmacao((prev) => {
      if (prev.url) URL.revokeObjectURL(prev.url)
      return { status: 'loading', url: null, error: null }
    })
    try {
      const blob = await getEventQrCodeConfirmacaoBlobApi(eventId)
      if (activeEventIdRef.current !== eventId) return
      const url = URL.createObjectURL(blob)
      setQrConfirmacao({ status: 'success', url, error: null })
    } catch (err: unknown) {
      if (activeEventIdRef.current !== eventId) return
      const message = await parseBlobErrorMessage(
        err,
        'Não foi possível gerar o QR Code de confirmação de presença.'
      )
      setQrConfirmacao({ status: 'error', url: null, error: message })
    }
  }, [])

  // Fechamento do modal com liberação de Blobs (o foco volta em onCloseAutoFocus)
  const handleCloseQrModal = useCallback(() => {
    activeEventIdRef.current = null
    setQrModalEvent(null)
    setQrInscricao((prev) => {
      if (prev.url) URL.revokeObjectURL(prev.url)
      return { status: 'idle', url: null, error: null }
    })
    setQrConfirmacao((prev) => {
      if (prev.url) URL.revokeObjectURL(prev.url)
      return { status: 'idle', url: null, error: null }
    })
  }, [])

  // Abertura do Modal guardando disparador e disparando ambas as chamadas independentes
  const handleOpenQrModal = (
    evt: AdminEvento,
    triggerElement?: HTMLElement
  ) => {
    if (triggerElement) {
      modalTriggerRef.current = triggerElement
    }
    // Libera Blobs anteriores se houver
    if (qrInscricao.url) URL.revokeObjectURL(qrInscricao.url)
    if (qrConfirmacao.url) URL.revokeObjectURL(qrConfirmacao.url)

    activeEventIdRef.current = evt.id
    setQrModalEvent(evt)

    // Dispara carregamentos independentes
    carregarInscricao(evt.id)
    carregarConfirmacao(evt.id)
  }

  // Liberação de Blobs na desmontagem do componente
  useEffect(() => {
    return () => {
      if (qrInscricao.url) URL.revokeObjectURL(qrInscricao.url)
      if (qrConfirmacao.url) URL.revokeObjectURL(qrConfirmacao.url)
    }
  }, [qrInscricao.url, qrConfirmacao.url])

  const handleCancelEvent = async (evt: AdminEvento) => {
    const confirmMessage = `Tem certeza que deseja cancelar o evento "${evt.tema}"?\nEsta ação mudará o status para CANCELADO.`
    if (!window.confirm(confirmMessage)) return

    setDeletingId(evt.id)
    setError(null)
    try {
      await cancelarAdminEventoApi(evt.id)
      setActionSuccess(`Evento "${evt.tema}" cancelado com sucesso.`)
      setTimeout(() => setActionSuccess(null), 4000)
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
      {actionSuccess && (
        <Alert
          variant="success"
          title="Sucesso"
          onClose={() => setActionSuccess(null)}
        >
          {actionSuccess}
        </Alert>
      )}

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
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]">
              <SearchIcon size={16} />
            </div>
          </div>
        </div>

        {/* Abas de Status */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0"
          role="tablist"
          aria-label="Filtrar eventos por status"
        >
          <button
            type="button"
            onClick={() => setStatusFilter('TODOS')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              statusFilter === 'TODOS'
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]'
            }`}
          >
            Todos ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('EM_ANDAMENTO')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              statusFilter === 'EM_ANDAMENTO'
                ? 'bg-[var(--color-info)] text-white shadow-xs'
                : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]'
            }`}
          >
            Em andamento ({countEmAndamento})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('CRIADO')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              statusFilter === 'CRIADO'
                ? 'bg-[var(--color-text-secondary)] text-white shadow-xs'
                : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]'
            }`}
          >
            Programados ({countCriado})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('FINALIZADO')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              statusFilter === 'FINALIZADO'
                ? 'bg-[var(--color-success)] text-white shadow-xs'
                : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]'
            }`}
          >
            Finalizados ({countFinalizado})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('CANCELADO')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              statusFilter === 'CANCELADO'
                ? 'bg-[var(--color-danger)] text-white shadow-xs'
                : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]'
            }`}
          >
            Cancelados ({countCancelado})
          </button>
        </div>
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
                            <div className="font-semibold text-[var(--color-text-primary)] line-clamp-1">
                              {evt.tema}
                            </div>
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
                                >
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      handleOpenQrModal(
                                        evt,
                                        document.getElementById(
                                          `acoes-evento-${evt.id}`
                                        ) ?? undefined
                                      )
                                    }
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
                                        onSelect={() => handleCancelEvent(evt)}
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

      {/* QR Codes do evento: dialog prende o foco e fecha com Esc ou clique fora */}
      <Dialog
        open={qrModalEvent !== null}
        onOpenChange={(aberto) => {
          if (!aberto) handleCloseQrModal()
        }}
      >
        <DialogContent
          className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
          // Devolve o foco ao botão de ações da linha (o item do menu já não existe)
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            modalTriggerRef.current?.focus()
            modalTriggerRef.current = null
          }}
        >
          {qrModalEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  QR Codes do evento
                </DialogTitle>
                <DialogDescription className="line-clamp-1">
                  {qrModalEvent.tema} &bull; {formatDate(qrModalEvent.data)}
                </DialogDescription>
              </DialogHeader>

              <div className="py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* 1. Painel de Inscrição Pública */}
                  <div className="flex flex-col items-center justify-between p-5 bg-[var(--color-bg-subtle)] rounded-md border border-[var(--color-border)] min-h-[340px]">
                    <div className="w-full text-center mb-3">
                      <span className="text-xs font-bold text-[var(--color-text-primary)] block">
                        Inscrição Pública
                      </span>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        Direciona para a página de inscrição do evento
                      </p>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center w-full my-2">
                      {qrInscricao.status === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-6 gap-2 text-[var(--color-text-muted)]">
                          <SkeletonBlock className="h-40 w-40 border border-[var(--color-border)]" />
                          <span className="text-xs font-medium">
                            Gerando código...
                          </span>
                        </div>
                      )}

                      {qrInscricao.status === 'error' && (
                        <div className="flex flex-col items-center justify-center gap-3 p-3 bg-[var(--color-danger-bg)]/80 rounded-md border border-[var(--color-danger-border)] text-center w-full">
                          <p className="text-xs text-[var(--color-danger-text)] leading-snug">
                            {qrInscricao.error || 'Falha ao carregar QR Code.'}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => carregarInscricao(qrModalEvent.id)}
                            className="text-xs text-[var(--color-danger-text)] border-[var(--color-danger-border)] hover:bg-[var(--color-danger-bg)]"
                          >
                            Tentar novamente
                          </Button>
                        </div>
                      )}

                      {qrInscricao.status === 'success' && qrInscricao.url && (
                        <div className="flex flex-col items-center">
                          <img
                            src={qrInscricao.url}
                            alt={`QR Code para inscrição no evento ${qrModalEvent.tema}`}
                            className="w-40 h-40 surface-depth bg-[var(--color-bg-surface)] p-2 rounded-md border border-[var(--color-border)] shadow-xs object-contain"
                          />
                        </div>
                      )}
                    </div>

                    <div className="w-full pt-3 mt-auto border-t border-[var(--color-border)]/60 flex justify-center">
                      {qrInscricao.status === 'success' && qrInscricao.url ? (
                        <a
                          href={qrInscricao.url}
                          download={`qrcode-inscricao-evento-${qrModalEvent.id}.png`}
                          className="w-full"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            fullWidth
                            className="gap-1.5 text-xs"
                          >
                            <DownloadIcon size={14} />
                            Baixar PNG
                          </Button>
                        </a>
                      ) : (
                        <span className="text-xs text-[var(--color-text-muted)] py-1.5">
                          {qrInscricao.status === 'loading'
                            ? 'Aguardando processamento...'
                            : 'Download indisponível'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2. Painel de Confirmação de Presença */}
                  <div className="flex flex-col items-center justify-between p-5 bg-[var(--color-bg-subtle)] rounded-md border border-[var(--color-border)] min-h-[340px]">
                    <div className="w-full text-center mb-3">
                      <span className="text-xs font-bold text-[var(--color-text-primary)] block">
                        Confirmar Presença
                      </span>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        Check-in por leitura de câmera no local
                      </p>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center w-full my-2">
                      {qrConfirmacao.status === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-6 gap-2 text-[var(--color-text-muted)]">
                          <SkeletonBlock className="h-40 w-40 border border-[var(--color-border)]" />
                          <span className="text-xs font-medium">
                            Gerando código...
                          </span>
                        </div>
                      )}

                      {qrConfirmacao.status === 'error' && (
                        <div className="flex flex-col items-center justify-center gap-3 p-3 bg-[var(--color-danger-bg)]/80 rounded-md border border-[var(--color-danger-border)] text-center w-full">
                          <p className="text-xs text-[var(--color-danger-text)] leading-snug">
                            {qrConfirmacao.error ||
                              'Falha ao carregar QR Code.'}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => carregarConfirmacao(qrModalEvent.id)}
                            className="text-xs text-[var(--color-danger-text)] border-[var(--color-danger-border)] hover:bg-[var(--color-danger-bg)]"
                          >
                            Tentar novamente
                          </Button>
                        </div>
                      )}

                      {qrConfirmacao.status === 'success' &&
                        qrConfirmacao.url && (
                          <div className="flex flex-col items-center">
                            <img
                              src={qrConfirmacao.url}
                              alt={`QR Code para confirmação de presença no evento ${qrModalEvent.tema}`}
                              className="w-40 h-40 surface-depth bg-[var(--color-bg-surface)] p-2 rounded-md border border-[var(--color-border)] shadow-xs object-contain"
                            />
                          </div>
                        )}
                    </div>

                    <div className="w-full pt-3 mt-auto border-t border-[var(--color-border)]/60 flex justify-center">
                      {qrConfirmacao.status === 'success' &&
                      qrConfirmacao.url ? (
                        <a
                          href={qrConfirmacao.url}
                          download={`qrcode-presenca-evento-${qrModalEvent.id}.png`}
                          className="w-full"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            fullWidth
                            className="gap-1.5 text-xs"
                          >
                            <DownloadIcon size={14} />
                            Baixar PNG
                          </Button>
                        </a>
                      ) : (
                        <span className="text-xs text-[var(--color-text-muted)] py-1.5">
                          {qrConfirmacao.status === 'loading'
                            ? 'Aguardando processamento...'
                            : 'Download indisponível'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary" size="md">
                    Fechar
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
