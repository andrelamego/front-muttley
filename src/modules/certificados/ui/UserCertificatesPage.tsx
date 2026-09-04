import React, { useState, useEffect, useCallback, useId } from 'react'
import { Link } from 'react-router-dom'
import { PARTICIPANT_EVENTS_PATH } from '../../eventos'
import {
  getMeCertificadosApi,
  downloadCertificadoPdfApi,
} from '../api/certificadosApi'
import {
  type CertificadoUsuario,
  buildLinkedInCertUrl,
} from '../domain/certificadoTypes'
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
  ShieldCheckIcon,
  SearchIcon,
  DownloadIcon,
  ExternalLinkIcon,
  CopyIcon,
  CheckIcon,
  AwardIcon,
} from '../../../shared/ui'
import { CertificateListSkeleton } from './skeletons'
import { HistoryBackButton } from '../../../shared/navigation'

const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'Data não informada'
  const parts = dateStr.split('-').map(Number)
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    const d = new Date(parts[0], parts[1] - 1, parts[2])
    return d.toLocaleDateString('pt-BR')
  }
  return dateStr
}

export const UserCertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<CertificadoUsuario[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const searchInputId = useId()

  const loadCertificates = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getMeCertificadosApi()
      setCertificates(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Não foi possível carregar seus certificados.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    getMeCertificadosApi()
      .then((data) => {
        if (isMounted) {
          setCertificates(data)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar seus certificados.'
          )
          setIsLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  const handleCopyCode = async (codigo: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(codigo)
        setCopiedCode(codigo)
        setTimeout(() => setCopiedCode(null), 2500)
      }
    } catch {
      // Falha silenciosa de permissão de clipboard
    }
  }

  const handleDownloadPdf = async (cert: CertificadoUsuario) => {
    setDownloadingId(cert.id)
    setDownloadError(null)
    try {
      const blob = await downloadCertificadoPdfApi(cert.codigoValidacao)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Certificado_${cert.codigoValidacao}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch {
      setDownloadError(
        `Não foi possível baixar o PDF do certificado ${cert.codigoValidacao}. Tente pela página de visualização.`
      )
    } finally {
      setDownloadingId(null)
    }
  }

  const filteredCertificates = certificates.filter((cert) => {
    const eventName = cert.evento?.tema || 'Certificado'
    const code = cert.codigoValidacao || ''
    const term = searchTerm.toLowerCase()
    return (
      eventName.toLowerCase().includes(term) ||
      code.toLowerCase().includes(term) ||
      (cert.tipoParticipacao || '').toLowerCase().includes(term)
    )
  })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--color-border)] pb-5">
        <div>
          <span className="text-xs font-semibold text-[var(--color-primary-text)] uppercase tracking-wider">
            Reconhecimento Acadêmico
          </span>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">
            Meus Certificados
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Comprovantes oficiais emitidos após validação de presença e
            conclusão das atividades.
          </p>
        </div>

        <HistoryBackButton label="Voltar para a página anterior" />
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="error" title="Erro ao consultar certificados">
          <p className="mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={loadCertificates}>
            Tentar novamente
          </Button>
        </Alert>
      )}

      {downloadError && (
        <Alert
          variant="warning"
          title="Falha no download"
          onClose={() => setDownloadError(null)}
        >
          {downloadError}
        </Alert>
      )}

      {/* Barra de Filtro e Busca */}
      <div className="max-w-md">
        <label
          htmlFor={searchInputId}
          className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1"
        >
          Buscar certificados
        </label>
        <div className="relative">
          <Input
            id={searchInputId}
            type="search"
            placeholder="Buscar por evento ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]">
            <SearchIcon size={16} />
          </div>
        </div>
      </div>

      {/* Estado de Carregamento */}
      {isLoading && <CertificateListSkeleton />}

      {/* Lista de Certificados */}
      {!isLoading && !error && (
        <>
          {filteredCertificates.length === 0 ? (
            <Card className="bg-[var(--color-bg-surface)] border-dashed border-[var(--color-border-strong)] p-10 text-center">
              <div className="max-w-sm mx-auto flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--color-info-bg)] text-[var(--color-primary-text)] flex items-center justify-center">
                  <AwardIcon size={24} />
                </div>
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                  {searchTerm
                    ? 'Nenhum certificado encontrado'
                    : 'Nenhum certificado emitido até o momento'}
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {searchTerm
                    ? 'Tente utilizar outros termos na busca.'
                    : 'Assim que você participar de um evento e ele for concluído pela organização, seu certificado oficial ficará disponível aqui.'}
                </p>
                {!searchTerm && (
                  <Link to={PARTICIPANT_EVENTS_PATH} className="mt-2">
                    <Button variant="primary" size="md">
                      Explorar Eventos Abertos
                    </Button>
                  </Link>
                )}
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
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCertificates.map((cert) => {
                const eventName = cert.evento?.tema || 'Certificado Muttley'
                const linkedinUrl = buildLinkedInCertUrl(
                  eventName,
                  cert.codigoValidacao,
                  cert.dataEmissao
                )
                const isCopied = copiedCode === cert.codigoValidacao
                const isDownloading = downloadingId === cert.id

                return (
                  <Card
                    key={cert.id}
                    className="bg-[var(--color-bg-surface)] hover:border-[var(--color-border-strong)] transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
                        <Badge variant="success" className="gap-1">
                          <ShieldCheckIcon size={14} />
                          Certificado Válido
                        </Badge>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {formatDate(cert.dataEmissao)}
                        </span>
                      </CardHeader>

                      <CardContent className="pt-4 space-y-3">
                        <div>
                          <CardTitle className="text-base font-bold text-[var(--color-text-primary)] line-clamp-2">
                            {eventName}
                          </CardTitle>
                          <p className="text-xs text-[var(--color-text-muted)] mt-1">
                            Tipo de participação:{' '}
                            <span className="font-semibold text-[var(--color-text-secondary)]">
                              {cert.tipoParticipacao || 'Participante'}
                            </span>
                          </p>
                        </div>

                        {/* Código de Validação */}
                        <div className="bg-[var(--color-bg-subtle)] rounded-none p-2.5 border border-[var(--color-border)] flex items-center justify-between gap-2">
                          <div className="overflow-hidden">
                            <span className="block text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                              Código de Validação
                            </span>
                            <span className="font-mono text-xs text-[var(--color-text-primary)] truncate block">
                              {cert.codigoValidacao}
                            </span>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCode(cert.codigoValidacao)}
                            title="Copiar código de validação"
                            aria-label="Copiar código de validação"
                            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] shrink-0"
                          >
                            {isCopied ? (
                              <span className="flex items-center gap-1 text-[var(--color-success-text)] text-xs font-semibold">
                                <CheckIcon size={14} />
                                Copiado
                              </span>
                            ) : (
                              <CopyIcon size={16} />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </div>

                    <CardFooter className="pt-2 border-t border-[var(--color-border-subtle)] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Link to={`/certificados/${cert.codigoValidacao}`}>
                          <Button variant="outline" size="sm">
                            Visualizar
                          </Button>
                        </Link>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDownloadPdf(cert)}
                          isLoading={isDownloading}
                          loadingText="PDF"
                        >
                          {!isDownloading && <DownloadIcon size={14} />}
                          {!isDownloading && 'PDF'}
                        </Button>
                      </div>

                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary-text)] hover:text-[var(--color-primary-text-hover)] hover:underline px-2 py-1 rounded-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]"
                      >
                        LinkedIn
                        <ExternalLinkIcon size={12} />
                      </a>
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
