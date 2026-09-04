import React, { useState, useEffect, useId } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  getAdminEventoByIdApi,
  getEventParticipationsApi,
  concluirEventoApi,
} from '../api/adminEventosApi'
import type {
  AdminEvento,
  ParticipacaoEventoAdmin,
  ConcluirEventoResponse,
} from '../domain/adminEventoTypes'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Input,
  Badge,
  Alert,
  CheckCircleIcon,
  SearchIcon,
  UploadIcon,
  UsersIcon,
} from '../../../shared/ui'
import { AdminEventConcludeSkeleton } from './skeletons'
import { HistoryBackButton } from '../../../shared/navigation'

export const AdminEventConcludePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const searchInputId = useId()
  const fileInputId = useId()

  const [event, setEvent] = useState<AdminEvento | null>(null)
  const [participacoes, setParticipacoes] = useState<ParticipacaoEventoAdmin[]>(
    []
  )
  const [presentesIds, setPresentesIds] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTab, setFilterTab] = useState<
    'TODOS' | 'PRESENTES' | 'AUSENTES'
  >('TODOS')

  // Upload de assinatura
  const [assinaturaFile, setAssinaturaFile] = useState<File | null>(null)
  const [assinaturaPreviewUrl, setAssinaturaPreviewUrl] = useState<
    string | null
  >(null)

  // Estados de controle
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isConcluding, setIsConcluding] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [concludeResult, setConcludeResult] =
    useState<ConcluirEventoResponse | null>(null)

  useEffect(() => {
    let isMounted = true
    if (!id) return

    Promise.all([getAdminEventoByIdApi(id), getEventParticipationsApi(id)])
      .then(([evtData, partsData]) => {
        if (!isMounted) return
        setEvent(evtData)
        setParticipacoes(partsData)

        // Inicializar com quem já estava marcado como presente
        const initialPresents = partsData
          .filter((p) => p.presente)
          .map((p) => p.id)
        setPresentesIds(initialPresents)
        setIsLoading(false)
      })
      .catch((err: unknown) => {
        if (!isMounted) return
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Falha ao carregar dados do evento e participações.')
        }
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  // Limpeza de preview da assinatura
  useEffect(() => {
    return () => {
      if (assinaturaPreviewUrl) {
        URL.revokeObjectURL(assinaturaPreviewUrl)
      }
    }
  }, [assinaturaPreviewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (assinaturaPreviewUrl) URL.revokeObjectURL(assinaturaPreviewUrl)
      setAssinaturaFile(file)
      setAssinaturaPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleTogglePresente = (participacaoId: number) => {
    setPresentesIds((prev) =>
      prev.includes(participacaoId)
        ? prev.filter((pid) => pid !== participacaoId)
        : [...prev, participacaoId]
    )
  }

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredParticipacoes.map((p) => p.id)
      setPresentesIds((prev) => {
        const set = new Set([...prev, ...allIds])
        return Array.from(set)
      })
    } else {
      const currentFilteredIds = filteredParticipacoes.map((p) => p.id)
      setPresentesIds((prev) =>
        prev.filter((pid) => !currentFilteredIds.includes(pid))
      )
    }
  }

  const handleConcludeEvent = async () => {
    if (!id) return
    if (presentesIds.length === 0) {
      if (
        !window.confirm(
          'Nenhum participante está marcado como presente. Concluir o evento sem gerar certificados?'
        )
      ) {
        return
      }
    }

    setIsConcluding(true)
    setError(null)

    try {
      const result = await concluirEventoApi(id, presentesIds, assinaturaFile)
      setConcludeResult(result)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Falha ao concluir evento e emitir certificados.')
      }
    } finally {
      setIsConcluding(false)
    }
  }

  // Filtros
  const filteredParticipacoes = participacoes.filter((part) => {
    const isPresent = presentesIds.includes(part.id)
    if (filterTab === 'PRESENTES' && !isPresent) return false
    if (filterTab === 'AUSENTES' && isPresent) return false

    const term = searchTerm.toLowerCase()
    const nome = part.pessoa?.nome?.toLowerCase() || ''
    const email = part.pessoa?.email?.toLowerCase() || ''
    const inscricao = String(part.inscricao)

    return (
      nome.includes(term) || email.includes(term) || inscricao.includes(term)
    )
  })

  const isAllSelected =
    filteredParticipacoes.length > 0 &&
    filteredParticipacoes.every((p) => presentesIds.includes(p.id))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Navegação superior e Título */}
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
        <HistoryBackButton label="Voltar para a página anterior" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[var(--color-success-text)] uppercase tracking-wider">
            Fechamento de Atividades
          </span>
          <h1 className="text-2xl lg:text-3xl font-black text-[var(--color-text-primary)] mt-1">
            Conclusão e Emissão de Certificados
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Valide as presenças dos inscritos, anexe a assinatura do coordenador
            e emita os certificados em lote.
          </p>
        </div>

        {event && (
          <div className="bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-none p-3 text-xs flex flex-col items-end">
            <span className="font-semibold text-[var(--color-text-primary)]">
              {event.tema}
            </span>
            <span className="text-[var(--color-text-muted)] mt-0.5">
              Data: {event.data} ({event.horarioInicio} às {event.horarioFim})
            </span>
          </div>
        )}
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="error" title="Erro no processo de conclusão">
          {error}
        </Alert>
      )}

      {/* Sucesso após conclusão */}
      {concludeResult && (
        <Card className="bg-[var(--color-success-bg)]/50 border-[var(--color-success-border)] p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success-text)] mx-auto flex items-center justify-center">
            <CheckCircleIcon size={28} />
          </div>
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              Evento Concluído com Sucesso!
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">
              {concludeResult.message ||
                'Os certificados foram gerados e autenticados digitalmente.'}
            </p>
            {concludeResult.certificadosGerados !== undefined && (
              <p className="text-xs font-semibold text-[var(--color-success-text)] mt-1">
                Total de certificados emitidos:{' '}
                {concludeResult.certificadosGerados}
              </p>
            )}
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <HistoryBackButton label="Voltar para a página anterior" />
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/admin/inicio')}
            >
              Ir ao Painel Geral
            </Button>
          </div>
        </Card>
      )}

      {/* Conteúdo do Formulário de Conclusão */}
      {!concludeResult && !isLoading && (
        <div className="space-y-6">
          {/* Card de Assinatura Digital do Coordenador */}
          <Card className="surface-depth bg-[var(--color-bg-surface)] border-[var(--color-border)] shadow-xs">
            <CardHeader className="border-b border-[var(--color-border-subtle)]">
              <CardTitle className="text-base font-bold text-[var(--color-text-primary)]">
                1. Assinatura Digital do Responsável / Coordenador
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-48 h-24 rounded-none border-2 border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] flex items-center justify-center overflow-hidden shrink-0">
                  {assinaturaPreviewUrl ? (
                    <img
                      src={assinaturaPreviewUrl}
                      alt="Prévia da Assinatura"
                      className="max-h-full max-w-full object-contain p-2"
                    />
                  ) : (
                    <div className="text-center p-2 text-xs text-[var(--color-text-muted)]">
                      Nenhuma imagem anexada
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <label
                    htmlFor={fileInputId}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)]"
                  >
                    <UploadIcon
                      size={16}
                      className="text-[var(--color-text-muted)]"
                    />
                    <span>Arquivo de Imagem da Assinatura (PNG ou JPEG)</span>
                  </label>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    A imagem enviada será inserida nos certificados emitidos em
                    lote para os participantes confirmados.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      id={fileInputId}
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileChange}
                      className="text-xs text-[var(--color-text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded-none file:border file:border-[var(--color-border-strong)] file:bg-[var(--color-bg-surface)] file:text-xs file:font-semibold file:text-[var(--color-text-secondary)] hover:file:bg-[var(--color-bg-subtle)]"
                    />
                    {assinaturaFile && (
                      <span className="text-xs text-[var(--color-success-text)] font-medium">
                        Arquivo pronto
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Lista de Presenças */}
          <Card className="surface-depth bg-[var(--color-bg-surface)] border-[var(--color-border)] shadow-xs">
            <CardHeader className="border-b border-[var(--color-border-subtle)] flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-[var(--color-text-primary)]">
                  2. Conferência de Participantes e Presenças
                </CardTitle>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Selecione quem realmente compareceu ao evento para emissão dos
                  certificados.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="info" size="md">
                  {presentesIds.length} de {participacoes.length} presentes
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Barra de Filtro e Busca */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
                <div className="max-w-md flex-1">
                  <label
                    htmlFor={searchInputId}
                    className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1"
                  >
                    Buscar participante
                  </label>
                  <div className="relative">
                    <Input
                      id={searchInputId}
                      type="search"
                      placeholder="Buscar por nome, email ou inscrição..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]">
                      <SearchIcon size={16} />
                    </div>
                  </div>
                </div>

                {/* Abas: Todos, Presentes, Ausentes */}
                <div
                  className="flex items-center gap-1.5"
                  role="tablist"
                  aria-label="Filtrar por status de presença"
                >
                  <button
                    type="button"
                    onClick={() => setFilterTab('TODOS')}
                    className={`px-3 py-1.5 rounded-none text-xs font-semibold transition-colors ${
                      filterTab === 'TODOS'
                        ? 'bg-[var(--color-primary)] text-white shadow-xs'
                        : 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                    }`}
                  >
                    Todos ({participacoes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('PRESENTES')}
                    className={`px-3 py-1.5 rounded-none text-xs font-semibold transition-colors ${
                      filterTab === 'PRESENTES'
                        ? 'bg-[var(--color-success)] text-white shadow-xs'
                        : 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                    }`}
                  >
                    Presentes ({presentesIds.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('AUSENTES')}
                    className={`px-3 py-1.5 rounded-none text-xs font-semibold transition-colors ${
                      filterTab === 'AUSENTES'
                        ? 'bg-[var(--color-warning)] text-white shadow-xs'
                        : 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                    }`}
                  >
                    Ausentes ({participacoes.length - presentesIds.length})
                  </button>
                </div>
              </div>

              {/* Tabela de Participações */}
              {participacoes.length === 0 ? (
                <div className="p-8 text-center text-[var(--color-text-muted)] border border-dashed rounded-none">
                  <UsersIcon
                    size={32}
                    className="mx-auto text-[var(--color-text-subtle)] mb-2"
                  />
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                    Nenhum participante inscrito neste evento.
                  </p>
                </div>
              ) : (
                <div className="border border-[var(--color-border)] rounded-none overflow-hidden">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)]">
                      <tr>
                        <th className="py-3 px-4 w-12 text-center">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={(e) =>
                              handleToggleSelectAll(e.target.checked)
                            }
                            aria-label="Marcar todos os participantes visíveis"
                            className="rounded-none border-[var(--color-border-strong)] text-[var(--color-primary-text)] focus:ring-[var(--focus-ring-color)] w-4 h-4 cursor-pointer"
                          />
                        </th>
                        <th className="py-3 px-4">Participante</th>
                        <th className="py-3 px-4">Inscrição</th>
                        <th className="py-3 px-4">Tipo</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-subtle)]">
                      {filteredParticipacoes.map((part) => {
                        const isPresent = presentesIds.includes(part.id)
                        return (
                          <tr
                            key={part.id}
                            className={`hover:bg-[var(--color-bg-subtle)]/70 transition-colors ${
                              isPresent ? 'bg-[var(--color-success-bg)]/20' : ''
                            }`}
                          >
                            <td className="py-3 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={isPresent}
                                onChange={() => handleTogglePresente(part.id)}
                                aria-label={`Marcar presença de ${part.pessoa?.nome || 'participante'}`}
                                className="rounded-none border-[var(--color-border-strong)] text-[var(--color-primary-text)] focus:ring-[var(--focus-ring-color)] w-4 h-4 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-[var(--color-text-primary)]">
                                {part.pessoa?.nome || 'Participante'}
                              </div>
                              <div className="text-xs text-[var(--color-text-muted)]">
                                {part.pessoa?.email || '-'}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-xs text-[var(--color-text-secondary)]">
                              #{part.inscricao}
                            </td>
                            <td className="py-3 px-4 text-xs text-[var(--color-text-secondary)]">
                              <Badge variant="default" size="sm">
                                {part.tipo || 'Aluno'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {isPresent ? (
                                <Badge variant="success" size="sm">
                                  Presente
                                </Badge>
                              ) : (
                                <Badge variant="warning" size="sm">
                                  Ausente
                                </Badge>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>

            <CardFooter className="bg-[var(--color-bg-subtle)]/80 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:px-6">
              <div className="text-xs text-[var(--color-text-muted)]">
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {presentesIds.length}
                </span>{' '}
                certificados serão emitidos após a confirmação.
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <Link to="/admin/eventos">
                  <Button variant="outline" size="md">
                    Cancelar
                  </Button>
                </Link>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleConcludeEvent}
                  disabled={isConcluding}
                  isLoading={isConcluding}
                  className="gap-2 bg-[var(--color-success)] hover:bg-[var(--color-success)]"
                >
                  <CheckCircleIcon size={18} />
                  {isConcluding
                    ? 'Emitindo Certificados...'
                    : 'Concluir Evento e Emitir Certificados'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Loading inicial */}
      {isLoading && <AdminEventConcludeSkeleton />}
    </div>
  )
}
