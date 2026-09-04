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
  Spinner,
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
  XIcon,
} from '../../../shared/ui'

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
      return 'Em Andamento'
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

  // Fechamento do Modal com devolução de foco ao elemento disparador e liberação de Blobs
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
    if (modalTriggerRef.current) {
      modalTriggerRef.current.focus()
      modalTriggerRef.current = null
    }
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

  // Fecha modal com Escape
  useEffect(() => {
    if (!qrModalEvent) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseQrModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [qrModalEvent, handleCloseQrModal])

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Área do Administrador
          </span>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 mt-1">
            Gestão de Eventos
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Cadastre, organize horários, acompanhe presenças e conclua eventos
            acadêmicos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/eventos/novo">
            <Button variant="primary" size="md" className="gap-2 shadow-xs">
              <PlusIcon size={18} />
              Criar Novo Evento
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
      <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="max-w-md flex-1">
          <label
            htmlFor={searchInputId}
            className="block text-xs font-semibold text-slate-700 mb-1"
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
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'TODOS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('EM_ANDAMENTO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'EM_ANDAMENTO'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Em Andamento ({countEmAndamento})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('CRIADO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'CRIADO'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Programados ({countCriado})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('FINALIZADO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'FINALIZADO'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Finalizados ({countFinalizado})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('CANCELADO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'CANCELADO'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Cancelados ({countCancelado})
          </button>
        </div>
      </div>

      {/* Estado de Carregamento */}
      {isLoading && (
        <div
          className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500"
          aria-live="polite"
        >
          <Spinner size="lg" className="text-blue-600" />
          <p className="text-sm font-medium">
            Carregando eventos acadêmicos...
          </p>
        </div>
      )}

      {/* Tabela de Eventos (Desktop-First) */}
      {!isLoading && !error && (
        <>
          {filteredEvents.length === 0 ? (
            <Card className="bg-white border-dashed border-slate-300 p-12 text-center">
              <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CalendarIcon size={24} />
                </div>
                <h2 className="text-base font-semibold text-slate-900">
                  {searchTerm || statusFilter !== 'TODOS'
                    ? 'Nenhum evento corresponde aos filtros informados'
                    : 'Nenhum evento acadêmico cadastrado'}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
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
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Evento</th>
                      <th className="py-3.5 px-4">Data e Horário</th>
                      <th className="py-3.5 px-4">Modalidade</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">
                        Ações Operacionais
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
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
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="font-semibold text-slate-900 line-clamp-1">
                              {evt.tema}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                              {localNome}
                            </div>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap text-slate-700">
                            <div className="flex items-center gap-1.5 text-xs font-medium">
                              <CalendarIcon
                                size={14}
                                className="text-slate-400"
                              />
                              <span>{formatDate(evt.data)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                              <ClockIcon size={14} className="text-slate-400" />
                              <span>
                                {evt.horarioInicio || '--:--'} às{' '}
                                {evt.horarioFim || '--:--'}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <Badge variant="default" size="sm">
                              {evt.modalidade}
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
                              {/* Botão QR Code */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) =>
                                  handleOpenQrModal(evt, e.currentTarget)
                                }
                                title="Visualizar QR Codes do evento"
                                aria-label={`Visualizar QR Codes do evento ${evt.tema}`}
                                className="text-slate-600 hover:text-slate-900"
                              >
                                <QrCodeIcon size={16} />
                              </Button>

                              {/* Botão Editar */}
                              <Link to={`/admin/eventos/${evt.id}/editar`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Editar evento"
                                  aria-label="Editar evento"
                                  className="text-slate-600 hover:text-slate-900"
                                >
                                  <EditIcon size={16} />
                                </Button>
                              </Link>

                              {/* Botão Concluir */}
                              {!isFinished && !isCancelled && (
                                <Link to={`/admin/eventos/${evt.id}/concluir`}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    title="Concluir evento e emitir certificados"
                                    className="gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50 text-xs"
                                  >
                                    <CheckCircleIcon size={14} />
                                    Concluir
                                  </Button>
                                </Link>
                              )}

                              {/* Botão Cancelar */}
                              {!isCancelled && !isFinished && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancelEvent(evt)}
                                  disabled={isDeleting}
                                  title="Cancelar evento"
                                  aria-label="Cancelar evento"
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  {isDeleting ? (
                                    <Spinner size="sm" />
                                  ) : (
                                    <TrashIcon size={16} />
                                  )}
                                </Button>
                              )}
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

      {/* Modal de QR Codes com Estados e Tentativas Independentes */}
      {qrModalEvent && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-qrcode-titulo"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 gap-4">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  Códigos de Acesso Rápido
                </span>
                <h3
                  id="modal-qrcode-titulo"
                  className="text-xl font-black text-slate-900 tracking-tight"
                >
                  QR Codes do Evento
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {qrModalEvent.tema} &bull; {formatDate(qrModalEvent.data)}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseQrModal}
                aria-label="Fechar modal de QR Codes"
                className="text-slate-400 hover:text-slate-800"
              >
                <XIcon size={20} />
              </Button>
            </div>

            <div className="py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 1. Painel de Inscrição Pública */}
                <div className="flex flex-col items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-200 min-h-[340px]">
                  <div className="w-full text-center mb-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Inscrição Pública
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Direciona para a página de inscrição do evento
                    </p>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center w-full my-2">
                    {qrInscricao.status === 'loading' && (
                      <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-500">
                        <Spinner size="md" className="text-blue-600" />
                        <span className="text-xs font-medium">
                          Gerando código...
                        </span>
                      </div>
                    )}

                    {qrInscricao.status === 'error' && (
                      <div className="flex flex-col items-center justify-center gap-3 p-3 bg-red-50/80 rounded-lg border border-red-200 text-center w-full">
                        <p className="text-xs text-red-700 leading-snug">
                          {qrInscricao.error || 'Falha ao carregar QR Code.'}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => carregarInscricao(qrModalEvent.id)}
                          className="text-xs text-red-700 border-red-300 hover:bg-red-100"
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
                          className="w-40 h-40 bg-white p-2 rounded-xl border border-slate-200 shadow-xs object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <div className="w-full pt-3 mt-auto border-t border-slate-200/60 flex justify-center">
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
                      <span className="text-[11px] text-slate-400 py-1.5">
                        {qrInscricao.status === 'loading'
                          ? 'Aguardando processamento...'
                          : 'Download indisponível'}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Painel de Confirmação de Presença */}
                <div className="flex flex-col items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-200 min-h-[340px]">
                  <div className="w-full text-center mb-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Confirmar Presença
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Check-in por leitura de câmera no local
                    </p>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center w-full my-2">
                    {qrConfirmacao.status === 'loading' && (
                      <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-500">
                        <Spinner size="md" className="text-blue-600" />
                        <span className="text-xs font-medium">
                          Gerando código...
                        </span>
                      </div>
                    )}

                    {qrConfirmacao.status === 'error' && (
                      <div className="flex flex-col items-center justify-center gap-3 p-3 bg-red-50/80 rounded-lg border border-red-200 text-center w-full">
                        <p className="text-xs text-red-700 leading-snug">
                          {qrConfirmacao.error || 'Falha ao carregar QR Code.'}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => carregarConfirmacao(qrModalEvent.id)}
                          className="text-xs text-red-700 border-red-300 hover:bg-red-100"
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
                            className="w-40 h-40 bg-white p-2 rounded-xl border border-slate-200 shadow-xs object-contain"
                          />
                        </div>
                      )}
                  </div>

                  <div className="w-full pt-3 mt-auto border-t border-slate-200/60 flex justify-center">
                    {qrConfirmacao.status === 'success' && qrConfirmacao.url ? (
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
                      <span className="text-[11px] text-slate-400 py-1.5">
                        {qrConfirmacao.status === 'loading'
                          ? 'Aguardando processamento...'
                          : 'Download indisponível'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Pressione{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-600">
                  Esc
                </kbd>{' '}
                para fechar a qualquer momento
              </span>
              <Button
                variant="secondary"
                size="md"
                onClick={handleCloseQrModal}
              >
                Fechar Janela
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
