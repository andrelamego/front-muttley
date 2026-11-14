import React, { useEffect, useId, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ShieldCheck, ShieldX } from 'lucide-react'
import apiClient from '../../../shared/http/apiClient'
import {
  Button,
  ButtonLink,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  Input,
  Ticket,
  copiarTexto,
} from '../../../shared/ui'
import { deDataIso } from '../../../shared/lib/datas'
import { getTicketDateParts } from '../../eventos'
import { PublicCertificateSkeleton } from './skeletons'
import { HistoryBackButton } from '../../../shared/navigation'

// Contrato de GET /api/certificados/{codigo}: só dados públicos (sem CPF, email ou telefone).
interface CertificadoPublicoData {
  certificado: {
    codigoValidacao: string
    dataEmissao: string
    assinatura: string | null
    urlPublica: string
    participacao?: {
      tipo?: string | null
      pessoa?: { nome?: string } | null
      evento?: {
        tema?: string
        data?: string
        horarioInicio?: string
        horarioFim?: string
        modalidade?: string
      } | null
    } | null
  }
  linkedinUrl?: string
}

const porExtenso = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' })

const dataLonga = (iso?: string) => {
  const d = iso ? deDataIso(iso.slice(0, 10)) : undefined
  return d ? porExtenso.format(d) : null
}

/** Caixa para conferir outro código; usada também quando o código não é encontrado. */
const ConsultarOutro: React.FC<{ titulo: string }> = ({ titulo }) => {
  const navigate = useNavigate()
  const id = useId()
  const [codigo, setCodigo] = useState('')
  return (
    <form
      className="flex flex-col sm:flex-row sm:items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        const limpo = codigo.trim()
        if (limpo) navigate(`/certificados/${encodeURIComponent(limpo)}`)
      }}
    >
      <div className="flex-1">
        <Input
          id={id}
          label={titulo}
          placeholder="Ex.: 8f166ceb-d791-3838-b0bc-faedc6c8b90c"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          className="font-mono"
        />
      </div>
      <Button type="submit" variant="outline" disabled={!codigo.trim()}>
        Consultar
      </Button>
    </form>
  )
}

/** Remonta a consulta a cada código: nada da consulta anterior aparece na nova. */
export const PublicCertificateViewPage: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>()
  return <ConsultaCertificado key={codigo} codigo={codigo} />
}

const ConsultaCertificado: React.FC<{ codigo?: string }> = ({ codigo }) => {
  const [data, setData] = useState<CertificadoPublicoData | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (!codigo) return
    let ativo = true
    apiClient
      .get<CertificadoPublicoData>(`/certificados/${codigo}`)
      .then((r) => ativo && setData(r.data))
      .catch((err: unknown) => {
        if (ativo)
          setErro(
            err instanceof Error
              ? err.message
              : 'Certificado não encontrado ou código inválido.'
          )
      })
      .finally(() => ativo && setCarregando(false))
    return () => {
      ativo = false
    }
  }, [codigo])

  const copiarCodigo = async () => {
    if (!codigo) return
    if (await copiarTexto(codigo, 'Código copiado')) {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    }
  }

  const certificado = data?.certificado
  const evento = certificado?.participacao?.evento
  const partes = evento?.data
    ? getTicketDateParts(evento.data, evento.horarioInicio)
    : null
  const emitidoEm = dataLonga(certificado?.dataEmissao)
  const realizadoEm = dataLonga(evento?.data)
  const tipo = certificado?.participacao?.tipo?.toLowerCase()

  const corpo = certificado && (
    <>
      <p className="text-sm text-[var(--color-text-secondary)]">Conferido a</p>
      <p className="font-display text-3xl sm:text-4xl font-bold leading-tight mt-1 break-words">
        {certificado.participacao?.pessoa?.nome || 'Participante'}
      </p>
      <p className="text-[var(--color-text-secondary)] mt-3 leading-relaxed">
        Participou{tipo ? ` como ${tipo}` : ''} do evento{' '}
        <strong className="text-[var(--color-text-primary)]">
          {evento?.tema || 'acadêmico'}
        </strong>
        {realizadoEm ? `, realizado em ${realizadoEm}` : ''}.
      </p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-sm">
        <div className="min-w-0">
          <dt className="text-[var(--color-text-muted)]">
            Código de validação
          </dt>
          <dd className="font-mono mt-0.5 break-all">
            {certificado.codigoValidacao}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--color-text-muted)]">Assinado por</dt>
          <dd className="font-medium mt-0.5">
            {certificado.assinatura || 'Coordenação da Fatec'}
          </dd>
        </div>
      </dl>
    </>
  )

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div>
        <HistoryBackButton label="Voltar" />
      </div>

      {carregando && <PublicCertificateSkeleton />}

      {!carregando && erro && (
        <section className="rounded-md bg-[var(--color-bg-surface)] p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]">
              <ShieldX className="size-6" aria-hidden />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold">
                Não encontramos este certificado
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Confira se o código foi digitado exatamente como aparece no
                documento. Um certificado que não está no sistema não deve ser
                considerado válido.
              </p>
            </div>
          </div>
          <ConsultarOutro titulo="Tentar outro código" />
        </section>
      )}

      {!carregando && certificado && (
        <>
          {/* O veredito vem primeiro: é a resposta que quem valida procura */}
          <section
            aria-labelledby="veredito"
            className="rounded-md bg-[var(--color-success-bg)] border border-[var(--color-success-border)] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--color-bg-surface)] text-[var(--color-success-text)]">
              <ShieldCheck className="size-7" aria-hidden />
            </span>
            <div className="flex-1 min-w-0">
              <h1
                id="veredito"
                className="font-display text-2xl font-bold text-[var(--color-text-primary)]"
              >
                Certificado autêntico
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                Emitido pela Fatec Zona Leste
                {emitidoEm ? ` em ${emitidoEm}` : ''} e registrado no Muttley.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copiarCodigo}
              leftIcon={
                copiado ? (
                  <CheckIcon
                    size={14}
                    className="text-[var(--color-success-text)]"
                  />
                ) : (
                  <CopyIcon size={14} />
                )
              }
            >
              {copiado ? 'Código copiado' : 'Copiar código'}
            </Button>
          </section>

          {partes ? (
            <Ticket dia={partes.dia} mes={partes.mes} horario={partes.horario}>
              {corpo}
            </Ticket>
          ) : (
            <section className="rounded-md bg-[var(--color-bg-surface)] p-6">
              {corpo}
            </section>
          )}

          <div className="flex flex-wrap gap-3">
            <ButtonLink
              href={`/api/certificados/${codigo}/download`}
              download
              leftIcon={<DownloadIcon size={16} />}
              className="whitespace-nowrap"
            >
              Baixar PDF
            </ButtonLink>
            <ButtonLink
              href={`/api/certificados/${codigo}/preview`}
              target="_blank"
              rel="noreferrer"
              variant="outline"
              className="whitespace-nowrap"
            >
              Abrir no navegador
            </ButtonLink>
            {data?.linkedinUrl && (
              <ButtonLink
                href={data.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                variant="ghost"
                rightIcon={<ExternalLinkIcon size={14} />}
                className="whitespace-nowrap"
              >
                Adicionar ao LinkedIn
              </ButtonLink>
            )}
          </div>

          <section className="rounded-md border border-dashed p-5">
            <ConsultarOutro titulo="Validar outro certificado" />
          </section>
        </>
      )}
    </div>
  )
}
