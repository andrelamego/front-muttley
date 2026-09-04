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
  Spinner,
  ArrowLeftIcon,
  CheckCircleIcon,
  SearchIcon,
  UploadIcon,
  UsersIcon,
} from '../../../shared/ui'

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
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <Link
          to="/admin/eventos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors p-1 rounded focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <ArrowLeftIcon size={16} />
          Voltar para Lista de Eventos
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Fechamento de Atividades
          </span>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 mt-1">
            Conclusão e Emissão de Certificados
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Valide as presenças dos inscritos, anexe a assinatura do coordenador
            e emita os certificados em lote.
          </p>
        </div>

        {event && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex flex-col items-end">
            <span className="font-semibold text-slate-900">{event.tema}</span>
            <span className="text-slate-500 mt-0.5">
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
        <Card className="bg-emerald-50/50 border-emerald-300 p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <CheckCircleIcon size={28} />
          </div>
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-slate-900">
              Evento Concluído com Sucesso!
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {concludeResult.message ||
                'Os certificados foram gerados e autenticados digitalmente.'}
            </p>
            {concludeResult.certificadosGerados !== undefined && (
              <p className="text-xs font-semibold text-emerald-700 mt-1">
                Total de certificados emitidos:{' '}
                {concludeResult.certificadosGerados}
              </p>
            )}
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/admin/eventos')}
            >
              Voltar para Gestão de Eventos
            </Button>
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
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">
                1. Assinatura Digital do Responsável / Coordenador
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-48 h-24 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  {assinaturaPreviewUrl ? (
                    <img
                      src={assinaturaPreviewUrl}
                      alt="Prévia da Assinatura"
                      className="max-h-full max-w-full object-contain p-2"
                    />
                  ) : (
                    <div className="text-center p-2 text-xs text-slate-400">
                      Nenhuma imagem anexada
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <label
                    htmlFor={fileInputId}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"
                  >
                    <UploadIcon size={16} className="text-slate-500" />
                    <span>Arquivo de Imagem da Assinatura (PNG ou JPEG)</span>
                  </label>
                  <p className="text-xs text-slate-500">
                    A imagem enviada será inserida nos certificados emitidos em
                    lote para os participantes confirmados.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      id={fileInputId}
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileChange}
                      className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-50"
                    />
                    {assinaturaFile && (
                      <span className="text-xs text-emerald-600 font-medium">
                        Arquivo pronto
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Lista de Presenças */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardHeader className="border-b border-slate-100 flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  2. Conferência de Participantes e Presenças
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
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
                    className="block text-xs font-semibold text-slate-700 mb-1"
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
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      filterTab === 'TODOS'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Todos ({participacoes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('PRESENTES')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      filterTab === 'PRESENTES'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Presentes ({presentesIds.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('AUSENTES')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      filterTab === 'AUSENTES'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Ausentes ({participacoes.length - presentesIds.length})
                  </button>
                </div>
              </div>

              {/* Tabela de Participações */}
              {participacoes.length === 0 ? (
                <div className="p-8 text-center text-slate-400 border border-dashed rounded-xl">
                  <UsersIcon
                    size={32}
                    className="mx-auto text-slate-300 mb-2"
                  />
                  <p className="text-sm font-medium text-slate-600">
                    Nenhum participante inscrito neste evento.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                      <tr>
                        <th className="py-3 px-4 w-12 text-center">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={(e) =>
                              handleToggleSelectAll(e.target.checked)
                            }
                            aria-label="Marcar todos os participantes visíveis"
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 w-4 h-4 cursor-pointer"
                          />
                        </th>
                        <th className="py-3 px-4">Participante</th>
                        <th className="py-3 px-4">Inscrição</th>
                        <th className="py-3 px-4">Tipo</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredParticipacoes.map((part) => {
                        const isPresent = presentesIds.includes(part.id)
                        return (
                          <tr
                            key={part.id}
                            className={`hover:bg-slate-50/70 transition-colors ${
                              isPresent ? 'bg-emerald-50/20' : ''
                            }`}
                          >
                            <td className="py-3 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={isPresent}
                                onChange={() => handleTogglePresente(part.id)}
                                aria-label={`Marcar presença de ${part.pessoa?.nome || 'participante'}`}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 w-4 h-4 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900">
                                {part.pessoa?.nome || 'Participante'}
                              </div>
                              <div className="text-xs text-slate-500">
                                {part.pessoa?.email || '-'}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-xs text-slate-600">
                              #{part.inscricao}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-700">
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

            <CardFooter className="bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:px-6">
              <div className="text-xs text-slate-500">
                <span className="font-semibold text-slate-800">
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
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
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
      {isLoading && (
        <div
          className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500"
          aria-live="polite"
        >
          <Spinner size="lg" className="text-blue-600" />
          <p className="text-sm font-medium">
            Carregando dados para conclusão...
          </p>
        </div>
      )}
    </div>
  )
}
