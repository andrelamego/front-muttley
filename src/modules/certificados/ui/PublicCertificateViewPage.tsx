import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import apiClient from '../../../shared/http/apiClient'
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  Alert,
  Spinner,
} from '../../../shared/ui'

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
        <Link
          to="/"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors rounded focus-visible:ring-2 px-1"
        >
          ← Início
        </Link>
      </div>

      {error && (
        <Alert variant="error" title="Validação de Certificado">
          {error}
        </Alert>
      )}

      {isLoading && (
        <div
          className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500"
          role="status"
        >
          <Spinner size="lg" className="text-blue-600" />
          <p className="text-sm font-medium">
            Consultando registro do certificado...
          </p>
        </div>
      )}

      {!isLoading && data && (
        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/70 border-b border-slate-100 flex-row items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="success">Certificado Autêntico</Badge>
              <span className="text-xs text-slate-500">
                Emissão: {data.certificado.dataEmissao}
              </span>
            </div>

            <Button variant="outline" size="sm" onClick={handleCopyCode}>
              {copied ? 'Código Copiado!' : 'Copiar Código'}
            </Button>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
            <div className="text-center py-4 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                FATEC Zona Leste — Certificado de Participação
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                {data.certificado.participacao?.pessoa?.nome || 'Participante'}
              </h1>
              <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
                Participou com êxito do evento acadêmico{' '}
                <strong className="text-slate-900">
                  {data.certificado.participacao?.evento?.tema || 'Evento'}
                </strong>
                .
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 font-medium block">
                  Código de Autenticidade (UUID):
                </span>
                <span className="font-mono text-slate-800 break-all">
                  {data.certificado.codigoValidacao}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">
                  Assinatura Digital:
                </span>
                <span className="text-slate-800 font-medium">
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
                <Button variant="primary" size="md" fullWidth>
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
                  <Button variant="secondary" size="md" fullWidth>
                    Compartilhar no LinkedIn
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
