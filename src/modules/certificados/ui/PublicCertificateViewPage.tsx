import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import apiClient from '../../../shared/http/apiClient'
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  Alert,
  CopyIcon,
  CheckIcon,
  DownloadIcon,
  ExternalLinkIcon,
} from '../../../shared/ui'
import { PublicCertificateSkeleton } from './skeletons'
import { HistoryBackButton } from '../../../shared/navigation'

interface CertificadoPublicoData {
  certificado: {
    codigoValidacao: string
    dataEmissao: string
    assinatura: string
    urlPublica: string
    participacao?: {
      tipo?: string
      pessoa?: {
        nome?: string
      }
      evento?: {
        tema?: string
        data?: string
        horarioInicio?: string
        horarioFim?: string
        modalidade?: string
      }
    }
  }
  linkedinUrl?: string
}

export const PublicCertificateViewPage: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>()
  const [data, setData] = useState<CertificadoPublicoData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!codigo) return
    let isMounted = true

    apiClient
      .get<CertificadoPublicoData>(`/certificados/${codigo}`)
      .then((response) => {
        if (isMounted) {
          setData(response.data)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Certificado não localizado ou código de validação inválido.'
          )
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [codigo])

  const handleCopyCode = async () => {
    if (!codigo) return
    try {
      await navigator.clipboard.writeText(codigo)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
    }
  }

  const previewUrl = codigo ? `/api/certificados/${codigo}/preview` : ''
  const downloadUrl = codigo ? `/api/certificados/${codigo}/download` : ''

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div>
        <HistoryBackButton label="Voltar para a página anterior" />
      </div>

      {error && (
        <Alert variant="error" title="Validação de Certificado">
          {error}
        </Alert>
      )}

      {isLoading && <PublicCertificateSkeleton />}

      {!isLoading && data && (
        <Card className="surface-depth bg-[var(--color-bg-surface)] border-[var(--color-border)] shadow-sm overflow-hidden">
          <CardHeader className="bg-[var(--color-bg-subtle)]/70 border-b border-[var(--color-border-subtle)] flex-row items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="success">Certificado Autêntico</Badge>
              <span className="text-xs text-[var(--color-text-muted)]">
                Emissão: {data.certificado.dataEmissao}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="gap-1.5"
            >
              {copied ? (
                <>
                  <CheckIcon
                    size={14}
                    className="text-[var(--color-success-text)]"
                  />
                  <span>Código Copiado!</span>
                </>
              ) : (
                <>
                  <CopyIcon size={14} />
                  <span>Copiar Código</span>
                </>
              )}
            </Button>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
            <div className="text-center py-4 border-b border-[var(--color-border-subtle)]">
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                FATEC Zona Leste — Certificado de Participação
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-text-primary)] mt-2 tracking-tight">
                {data.certificado.participacao?.pessoa?.nome || 'Participante'}
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-xl mx-auto">
                Participou com êxito do evento acadêmico{' '}
                <strong className="text-[var(--color-text-primary)]">
                  {data.certificado.participacao?.evento?.tema || 'Evento'}
                </strong>
                .
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[var(--color-bg-subtle)] p-4 rounded-none border border-[var(--color-border-subtle)]">
              <div>
                <span className="text-[var(--color-text-muted)] font-medium block">
                  Código de Autenticidade (UUID):
                </span>
                <span className="font-mono text-[var(--color-text-primary)] break-all">
                  {data.certificado.codigoValidacao}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] font-medium block">
                  Assinatura Digital:
                </span>
                <span className="text-[var(--color-text-primary)] font-medium">
                  {data.certificado.assinatura || 'Coordenação FATEC'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={downloadUrl}
                download
                className="w-full sm:w-auto"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="primary" size="md" fullWidth className="gap-2">
                  <DownloadIcon size={16} />
                  Baixar Certificado (PDF)
                </Button>
              </a>

              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="outline" size="md" fullWidth>
                  Visualizar no Navegador
                </Button>
              </a>

              {data.linkedinUrl && (
                <a
                  href={data.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="secondary"
                    size="md"
                    fullWidth
                    className="gap-2"
                  >
                    Compartilhar no LinkedIn
                    <ExternalLinkIcon size={14} />
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
