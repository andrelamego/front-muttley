import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import db from '../../data/mockDb'
import type { Participation } from '../../data/types'
import { toast } from '../../components/ui/Toast'

export const CertificateView: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<any | null>(null)
  const [participation, setParticipation] = useState<Participation | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const previewUrl = useMemo(
    () =>
      codigo ? `/api/certificados/${encodeURIComponent(codigo)}/preview` : '',
    [codigo]
  )

  const downloadUrl = useMemo(
    () =>
      codigo ? `/api/certificados/${encodeURIComponent(codigo)}/download` : '',
    [codigo]
  )

  useEffect(() => {
    if (!codigo) return

    setLoading(true)
    setHasError(false)
    setParticipation(null)

    const loadCertificate = async () => {
      try {
        const certificateData = await db.getCertificateByCode(codigo)
        setData(certificateData)

        const participationId =
          certificateData.certificado.participacaoId ||
          certificateData.raw?.participacao?.id
        const participationData = participationId
          ? await db
              .getParticipationById(String(participationId))
              .catch(() => certificateData.certificado.participacao || null)
          : certificateData.certificado.participacao || null
        setParticipation(participationData)
      } catch (err) {
        console.error(err)
        setHasError(true)
        toast.error('Certificado nao encontrado ou codigo invalido.')
      } finally {
        setLoading(false)
      }
    }

    loadCertificate()
  }, [codigo])

  const handleCopyKey = async () => {
    if (!data?.certificado?.codigoValidacao) return
    try {
      await navigator.clipboard.writeText(data.certificado.codigoValidacao)
      toast.success('Chave copiada.')
    } catch (err) {
      console.error('Falha ao copiar a chave', err)
      toast.error('Não foi possível copiar a chave.')
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copiado.')
    } catch (err) {
      console.error('Falha ao copiar o link', err)
      toast.error('Não foi possível copiar o link.')
    }
  }

  const handleShare = async () => {
    if (!navigator.share || !data?.certificado) return

    const rawPart =
      participation || data.certificado?.participacao || data.raw?.participacao
    const rawEvent = rawPart?.evento
    try {
      await navigator.share({
        title: `Certificado - ${rawEvent?.tema || 'Muttley'}`,
        text: `Confira meu certificado de participacao no evento ${rawEvent?.tema || 'Muttley'}! Codigo de validacao: ${data.certificado.codigoValidacao}`,
        url: window.location.href,
      })
    } catch (err) {
      console.error('Erro ao compartilhar', err)
      toast.error('Não foi possível compartilhar o certificado.')
    }
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary" />
      </div>
    )
  }

  if (hasError || !data?.certificado) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center p-8 bg-brand-surface rounded-xl border border-brand-line shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-brand-danger">
            Certificado nao encontrado
          </h2>
          <button
            type="button"
            onClick={handleBack}
            className="primary-action mt-6 inline-flex items-center"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  const { certificado, linkedinUrl } = data
  const rawPart =
    participation || certificado.participacao || data.raw?.participacao
  const rawEvent = rawPart?.evento
  const rawPerson = rawPart?.pessoa
  const participantName = rawPerson?.nome || 'Participante'
  const participantEmail = rawPerson?.email || 'N/A'
  const participantRole = rawPart?.tipo || 'participante'
  const eventTitle = rawEvent?.tema || 'Evento'

  return (
    <main className="admin-page public-certificate-view mx-auto p-4 md:p-8 flex flex-col gap-8 max-w-6xl">
      <div className="page-title-row flex items-center justify-between border-b border-brand-line pb-4">
        <div>
          <span className="public-certificate-status">
            <svg
              className="w-4 h-4 mr-1 text-emerald-500 fill-none stroke-current"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Certificado valido
          </span>
          <h1 className="text-3xl font-extrabold text-brand-ink-strong mt-1">
            Validacao de Certificado
          </h1>
        </div>
        <button className="link-action" type="button" onClick={handleBack}>
          Voltar
        </button>
      </div>

      <section className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-brand-ink-strong">
            Visualizacao do Certificado
          </h2>
          <div className="public-certificate-actions flex gap-2 flex-wrap justify-end">
            <button
              type="button"
              className="primary-action px-3 py-2 text-xs font-bold"
              onClick={handleCopyKey}
            >
              Copiar chave
            </button>
            <button
              type="button"
              className="primary-action px-3 py-2 text-xs font-bold"
              onClick={handleCopyLink}
            >
              Copiar link
            </button>
            {typeof navigator !== 'undefined' &&
              typeof navigator.share === 'function' && (
                <button
                  type="button"
                  className="primary-action px-3 py-2 text-xs font-bold"
                  onClick={handleShare}
                >
                  Compartilhar
                </button>
              )}
            {linkedinUrl && (
              <a
                className="primary-action linkedin-action px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold"
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            )}
            <a
              className="primary-action px-4 py-2 bg-brand-primary hover:bg-brand-primary-strong text-white rounded-lg text-xs font-bold"
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Baixar PDF
            </a>
          </div>
        </div>

        <div className="certificate-preview-shell border border-brand-line rounded-xl overflow-hidden shadow-md bg-white w-full aspect-[1.414/1]">
          <iframe
            title="Preview do certificado emitido"
            src={previewUrl}
            className="w-full h-full border-0 bg-white"
          />
        </div>
      </section>

      <section className="w-full">
        <article className="stat-panel bg-brand-surface border border-brand-line rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-brand-ink-strong mb-4">
            Dados de Registro
          </h3>
          <dl className="certificate-data-list">
            <div>
              <dt className="text-xs text-brand-muted font-bold uppercase">
                Participante
              </dt>
              <dd className="text-sm font-semibold text-brand-ink-strong">
                {participantName}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted font-bold uppercase">
                E-mail
              </dt>
              <dd className="text-sm font-semibold text-brand-ink-strong">
                {participantEmail}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-brand-muted font-bold uppercase">
                Evento
              </dt>
              <dd className="text-sm font-semibold text-brand-ink-strong">
                {eventTitle}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted font-bold uppercase">
                Inscricao
              </dt>
              <dd className="text-sm font-semibold text-brand-ink-strong">
                {rawPart?.inscricao ? `#${rawPart.inscricao}` : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted font-bold uppercase">
                Tipo
              </dt>
              <dd className="text-sm font-semibold text-brand-ink-strong">
                {participantRole}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted font-bold uppercase">
                Emissao
              </dt>
              <dd className="text-sm font-semibold text-brand-ink-strong">
                {certificado.dataEmissao || 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted font-bold uppercase">
                Codigo de validacao
              </dt>
              <dd className="text-sm font-mono font-bold text-brand-primary">
                {certificado.codigoValidacao}
              </dd>
            </div>

            <div className="col-span-full">
              <dt className="text-xs text-brand-muted font-bold uppercase">
                Assinatura Digital (Hash)
              </dt>
              <dd className="text-xs font-mono break-all bg-brand-surface-soft p-2.5 rounded border border-brand-line mt-1">
                {certificado.assinatura}
              </dd>
            </div>

            {/* SEÇÃO DA IMAGEM DA ASSINATURA */}
            <div className="col-span-full mt-4 pt-4 border-t border-brand-line">
              <dt className="text-xs text-brand-muted font-bold uppercase">
                Assinatura do Coordenador
              </dt>
              <dd className="mt-2 flex justify-start">
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL || '/api'}/certificados/${certificado.id}/assinatura-visual`}
                  alt="Assinatura não encontrada ou não cadastrada"
                  className="h-20 object-contain rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  )
}

export default CertificateView
