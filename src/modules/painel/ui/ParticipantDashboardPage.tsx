import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import { getParticipantDashboardData } from '../api/painelApi'
import type {
  ParticipantDashboardData,
  ParticipacaoResumo,
  CertificadoResumo,
} from '../domain/painelTypes'
import {
  Button,
  Alert,
  Spinner,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  AwardIcon,
  CopyIcon,
  CheckIcon,
  DownloadIcon,
  LogOutIcon,
  CompassIcon,
} from '../../../shared/ui'
import apiClient from '../../../shared/http/apiClient'

const parseEventDateTime = (
  dateStr?: string | null,
  timeStr?: string | null
): Date | null => {
  if (!dateStr || !timeStr) return null
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = timeStr.split(':').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day, hours || 0, minutes || 0)
}

const isWithinPresenceWindow = (
  dateStr?: string | null,
  inicioStr?: string | null,
  fimStr?: string | null
): boolean => {
  if (!dateStr || !inicioStr || !fimStr) return false
  const inicio = parseEventDateTime(dateStr, inicioStr)
  const fim = parseEventDateTime(dateStr, fimStr)
  if (!inicio || !fim) return false

  const agora = new Date()
  const dezMinAntes = new Date(inicio.getTime() - 10 * 60 * 1000)
  const dezMinDepois = new Date(fim.getTime() + 10 * 60 * 1000)

  return agora >= dezMinAntes && agora <= dezMinDepois
}

// Formata tolerância de abertura: 10 minutos antes do início
const getPresenceOpeningTime = (inicioStr?: string | null): string => {
  if (!inicioStr) return '--:--'
  const [h, m] = inicioStr.split(':').map(Number)
  const date = new Date(2000, 0, 1, h, m)
  date.setMinutes(date.getMinutes() - 10)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// Formata tolerância de encerramento: 10 minutos após o término
const getPresenceClosingTime = (fimStr?: string | null): string => {
  if (!fimStr) return '--:--'
  const [h, m] = fimStr.split(':').map(Number)
  const date = new Date(2000, 0, 1, h, m)
  date.setMinutes(date.getMinutes() + 10)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export const ParticipantDashboardPage: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<ParticipantDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [downloadingCertId, setDownloadingCertId] = useState<number | null>(
    null
  )

  const loadData = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const result = await getParticipantDashboardData()
      setData(result)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Falha ao carregar suas participações e certificados.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    getParticipantDashboardData()
      .then((result) => {
        if (isMounted) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Falha ao carregar suas participações e certificados.'
          )
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Copia o código de validação com feedback visual
  const handleCopyCode = (codigo: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(codigo).then(() => {
        setCopiedCode(codigo)
        setTimeout(() => setCopiedCode(null), 2500)
      })
    }
  }

  // Download direto do PDF do certificado via Blob seguro
  const handleDownloadPdf = async (cert: CertificadoResumo) => {
    setDownloadingCertId(cert.id)
    try {
      const response = await apiClient.get<Blob>(
        `/certificados/${encodeURIComponent(cert.codigoValidacao)}/download`,
        { responseType: 'blob' }
      )
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `certificado-${cert.codigoValidacao}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch {
      // Fallback: se o endpoint exigir abertura direta ou falhar
      if (cert.urlPublica) {
        window.open(cert.urlPublica, '_blank')
      } else {
        navigate(`/certificados/${encodeURIComponent(cert.codigoValidacao)}`)
      }
    } finally {
      setDownloadingCertId(null)
    }
  }

  // Separa eventos válidos e prioriza:
  // 1. Evento cuja janela de presença está aberta agora
  // 2. Próximo evento futuro no cronograma
  const participacoesValidas = (data?.participacoes || [])
    .filter((p) => p.evento && p.evento.status !== 'CANCELADO')
    .sort((a, b) => {
      const dateA =
        a.evento?.data && a.evento?.horarioInicio
          ? `${a.evento.data}T${a.evento.horarioInicio}`
          : ''
      const dateB =
        b.evento?.data && b.evento?.horarioInicio
          ? `${b.evento.data}T${b.evento.horarioInicio}`
          : ''
      return dateA.localeCompare(dateB)
    })

  // Encontra prioritário
  const eventoJanelaAberta = participacoesValidas.find((p) =>
    isWithinPresenceWindow(
      p.evento?.data,
      p.evento?.horarioInicio,
      p.evento?.horarioFim
    )
  )

  const agora = new Date()
  const proximoFuturo = participacoesValidas.find((p) => {
    const fim = parseEventDateTime(p.evento?.data, p.evento?.horarioFim)
    return fim ? fim >= agora : true
  })

  const participacaoDestaque: ParticipacaoResumo | undefined =
    eventoJanelaAberta || proximoFuturo || participacoesValidas[0]

  const eventoDestaque = participacaoDestaque?.evento

  const outrosCompromissos = participacoesValidas.filter(
    (p) => p.id !== participacaoDestaque?.id
  )

  const presencaAberta = eventoDestaque
    ? isWithinPresenceWindow(
        eventoDestaque.data,
        eventoDestaque.horarioInicio,
        eventoDestaque.horarioFim
      )
    : false

  // Iniciais para avatar da conta
  const getInitials = (name?: string) => {
    if (!name) return 'PA'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <div className="w-full max-w-[76rem] mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
      {/* SAUDAÇÃO PRINCIPAL E RESUMO */}
      <section
        aria-labelledby="greeting-heading"
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#ddc0ba]/60"
      >
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-[#8a726c] font-semibold block mb-1">
            Painel do Participante • Ciclo Acadêmico
          </span>
          <h1
            id="greeting-heading"
            className="font-serif text-3xl sm:text-4xl text-[#1c1c1a] tracking-tight"
          >
            Olá, {user?.nome || 'Participante'}!
          </h1>
          <p className="text-sm text-[#57423d] mt-1 leading-relaxed">
            Você tem{' '}
            <strong className="text-[#1c1c1a] font-semibold">
              {participacoesValidas.length}
            </strong>{' '}
            {participacoesValidas.length === 1
              ? 'evento registrado'
              : 'eventos registrados'}{' '}
            e{' '}
            <strong className="text-[#1c1c1a] font-semibold">
              {data?.certificados.length || 0}
            </strong>{' '}
            {data?.certificados.length === 1
              ? 'certificado emitido'
              : 'certificados emitidos'}
            .
          </p>
        </div>

        {/* Barra de Ações Rápidas (Pílulas) */}
        <div className="flex items-center gap-2">
          <Link to="/user/inicio">
            <button
              type="button"
              className="px-4 py-2 rounded font-sans text-xs font-semibold bg-[#6b1705] text-white shadow-xs"
            >
              Painel
            </button>
          </Link>
          <Link to="/user/certificados">
            <button
              type="button"
              className="px-4 py-2 rounded font-sans text-xs font-semibold bg-[#f0edea] text-[#57423d] hover:text-[#1c1c1a] hover:bg-[#ebe8e4] transition-colors"
            >
              Certificados
            </button>
          </Link>
          <Link to="/eventos">
            <button
              type="button"
              className="px-4 py-2 rounded font-sans text-xs font-semibold bg-[#f0edea] text-[#57423d] hover:text-[#1c1c1a] hover:bg-[#ebe8e4] transition-colors inline-flex items-center gap-1.5"
            >
              <CompassIcon size={14} />
              <span>Explorar</span>
            </button>
          </Link>
        </div>
      </section>

      {/* Alerta de erro */}
      {error && (
        <Alert variant="error" title="Erro ao carregar participações">
          <div className="flex flex-col gap-2">
            <p>{error}</p>
            <div>
              <Button variant="secondary" size="sm" onClick={loadData}>
                Tentar novamente
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Carregamento */}
      {isLoading && (
        <div
          className="flex flex-col items-center justify-center py-16 gap-3 text-[#57423d]"
          role="status"
        >
          <Spinner size="lg" className="text-[#6b1705]" />
          <p className="text-sm font-medium">Carregando seus compromissos...</p>
        </div>
      )}

      {/* GRADE PRINCIPAL DESKTOP (2:1) / FLUXO LINEAR MOBILE */}
      {!isLoading && data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* COLUNA DA ESQUERDA (8 colunas no desktop): Próximo Evento e Compromissos */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* EVENTO EM DESTAQUE / PRIORITÁRIO */}
            <section aria-labelledby="featured-event-heading">
              <h2
                id="featured-event-heading"
                className="font-serif text-xl sm:text-2xl text-[#1c1c1a] font-bold mb-4"
              >
                Próximo Evento
              </h2>

              {eventoDestaque ? (
                <div className="bg-white rounded-lg border border-[#ddc0ba] shadow-xs overflow-hidden">
                  {/* Faixa Superior de Metadados do Evento */}
                  <div className="px-6 py-3 bg-[#f6f3ef] border-b border-[#f0edea] flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[#6b1705]">
                        {eventoDestaque.data}
                      </span>
                      <span className="text-[#8a726c]">•</span>
                      <span className="font-mono text-xs text-[#57423d]">
                        {eventoDestaque.horarioInicio} às{' '}
                        {eventoDestaque.horarioFim}
                      </span>
                    </div>

                    <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-[#f0edea] text-[#57423d] border border-[#ddc0ba]/60">
                      {eventoDestaque.modalidade}
                    </span>
                  </div>

                  <div className="p-6 sm:p-8 flex flex-col gap-5">
                    <div>
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1c1c1a] mb-2 leading-tight">
                        {eventoDestaque.tema}
                      </h3>
                      {eventoDestaque.descricao && (
                        <p className="text-xs sm:text-sm text-[#57423d] leading-relaxed line-clamp-3">
                          {eventoDestaque.descricao}
                        </p>
                      )}
                    </div>

                    {/* Informações de Local e Inscrição */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded bg-[#f6f3ef] border border-[#ddc0ba]/50 text-xs text-[#57423d]">
                      <div className="flex items-center gap-2">
                        <MapPinIcon
                          size={16}
                          className="text-[#6b1705] shrink-0"
                        />
                        <span className="truncate">
                          {eventoDestaque.local ||
                            eventoDestaque.disciplina ||
                            'Campus FATEC Zona Leste'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-[#8a726c] uppercase">
                          Inscrição:
                        </span>
                        <strong className="text-[#1c1c1a]">
                          #{participacaoDestaque?.inscricao}
                        </strong>
                      </div>
                    </div>

                    {/* BLOCO DE STATUS DA CONFIRMAÇÃO DE PRESENÇA */}
                    {presencaAberta ? (
                      <div className="p-4 rounded-lg bg-[#beeeca]/40 border border-[#a2d2af] flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[#244f34]">
                          <CheckCircleIcon size={18} />
                          <span className="font-mono text-xs font-bold uppercase tracking-wider">
                            Disponível Agora
                          </span>
                        </div>
                        <p className="text-xs text-[#244f34] leading-relaxed">
                          A confirmação de presença está liberada para este
                          evento (tolerância oficial de 10 min antes até 10 min
                          após o término).
                        </p>
                        <div className="pt-2">
                          <Link
                            to={`/eventos/${eventoDestaque.id}/confirmar-presenca`}
                            className="w-full block"
                          >
                            <Button
                              variant="primary"
                              size="lg"
                              fullWidth
                              leftIcon={<CheckCircleIcon size={20} />}
                            >
                              Confirmar Presença Agora
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-[#f0edea] border border-[#ddc0ba]/60 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[#57423d]">
                          <ClockIcon size={18} className="text-[#8a726c]" />
                          <span className="font-mono text-xs font-semibold uppercase tracking-wider">
                            Janela de Credenciamento
                          </span>
                        </div>
                        <p className="text-xs text-[#57423d] leading-relaxed">
                          A presença será liberada às{' '}
                          <strong className="text-[#1c1c1a]">
                            {getPresenceOpeningTime(
                              eventoDestaque.horarioInicio
                            )}
                          </strong>{' '}
                          (10 minutos antes) e ficará disponível até às{' '}
                          <strong className="text-[#1c1c1a]">
                            {getPresenceClosingTime(eventoDestaque.horarioFim)}
                          </strong>
                          .
                        </p>
                        <div className="pt-2">
                          <Link
                            to={`/eventos/${eventoDestaque.id}`}
                            className="w-full block"
                          >
                            <Button variant="outline" size="md" fullWidth>
                              Ver Detalhes do Evento
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-[#ddc0ba] p-8 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#f6f3ef] text-[#8a726c] flex items-center justify-center">
                    <CalendarIcon size={24} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#1c1c1a]">
                    Nenhuma inscrição ativa
                  </h3>
                  <p className="text-xs text-[#57423d] max-w-sm">
                    Você ainda não se inscreveu em nenhum evento programado.
                    Explore o catálogo para garantir sua vaga.
                  </p>
                  <Link to="/eventos" className="mt-2">
                    <Button variant="primary" size="md">
                      Explorar Eventos Abertos
                    </Button>
                  </Link>
                </div>
              )}
            </section>

            {/* PRÓXIMOS COMPROMISSOS */}
            <section aria-labelledby="other-events-heading">
              <div className="flex items-center justify-between mb-4">
                <h2
                  id="other-events-heading"
                  className="font-serif text-xl sm:text-2xl text-[#1c1c1a] font-bold"
                >
                  Próximos Compromissos
                </h2>
                <span className="font-mono text-xs text-[#57423d] uppercase">
                  {outrosCompromissos.length} agendado(s)
                </span>
              </div>

              {outrosCompromissos.length === 0 ? (
                <p className="text-xs text-[#57423d] italic py-2">
                  Nenhum outro evento agendado em sua conta.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {outrosCompromissos.map((p) => {
                    const ev = p.evento
                    if (!ev) return null
                    return (
                      <article
                        key={p.id}
                        className="bg-white rounded-lg p-5 border border-[#ddc0ba] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-[#6b1705] transition-colors"
                      >
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-mono text-[11px] font-semibold text-[#6b1705] uppercase">
                              {ev.data} • {ev.horarioInicio}
                            </span>
                            <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#f0edea] text-[#57423d]">
                              {ev.modalidade}
                            </span>
                          </div>
                          <h4 className="font-serif text-lg font-bold text-[#1c1c1a] group-hover:text-[#6b1705] transition-colors truncate">
                            {ev.tema}
                          </h4>
                          <span className="text-xs text-[#57423d] truncate mt-0.5">
                            {ev.local || ev.disciplina || 'Campus'}
                          </span>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <Link to={`/eventos/${ev.id}`}>
                            <Button variant="outline" size="sm">
                              Detalhes
                            </Button>
                          </Link>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          {/* COLUNA DA DIREITA (4 colunas no desktop): Certificados e Identificação */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* MEUS CERTIFICADOS */}
            <section aria-labelledby="certs-heading">
              <div className="flex items-center justify-between mb-4">
                <h2
                  id="certs-heading"
                  className="font-serif text-xl sm:text-2xl text-[#1c1c1a] font-bold"
                >
                  Meus Certificados
                </h2>
                <Link
                  to="/user/certificados"
                  className="text-xs font-semibold text-[#6b1705] hover:underline"
                >
                  Ver todos
                </Link>
              </div>

              {data.certificados.length === 0 ? (
                <div className="bg-white p-6 rounded-lg border border-[#ddc0ba] text-center">
                  <AwardIcon
                    size={32}
                    className="mx-auto text-[#8a726c] mb-2"
                  />
                  <p className="text-xs text-[#57423d] leading-relaxed">
                    Você ainda não possui certificados emitidos. Conclua seus
                    eventos para liberar a certificação.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {data.certificados.slice(0, 3).map((cert) => (
                    <article
                      key={cert.id}
                      className="bg-white rounded-lg p-5 border border-[#ddc0ba] shadow-xs flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-[11px] text-[#8a726c] uppercase block">
                            Concluído em {cert.dataEmissao || 'Data recente'}
                          </span>
                          <h4 className="font-serif text-base font-bold text-[#1c1c1a] mt-1 line-clamp-2">
                            {cert.evento?.tema || 'Evento Acadêmico Concluído'}
                          </h4>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#beeeca] text-[#244f34] flex items-center justify-center shrink-0">
                          <CheckCircleIcon size={16} />
                        </div>
                      </div>

                      {/* Código de Autenticidade com Ação de Copiar */}
                      <div className="p-2.5 bg-[#f6f3ef] rounded border border-[#ddc0ba]/60 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-mono text-[10px] uppercase text-[#8a726c] block">
                            Código de validação
                          </span>
                          <span className="font-mono text-xs font-semibold text-[#1c1c1a] truncate block">
                            #{cert.codigoValidacao}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(cert.codigoValidacao)}
                          aria-label="Copiar código de autenticidade"
                          className="px-2 py-1 rounded text-xs font-semibold text-[#57423d] hover:text-[#1c1c1a] hover:bg-[#f0edea] transition-colors flex items-center gap-1 shrink-0"
                        >
                          {copiedCode === cert.codigoValidacao ? (
                            <>
                              <CheckIcon size={14} className="text-[#244f34]" />
                              <span className="text-[#244f34] text-[11px]">
                                Copiado!
                              </span>
                            </>
                          ) : (
                            <>
                              <CopyIcon size={14} />
                              <span className="text-[11px]">Copiar</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Botão de Download do PDF */}
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        onClick={() => handleDownloadPdf(cert)}
                        isLoading={downloadingCertId === cert.id}
                        loadingText="Baixando PDF..."
                        leftIcon={<DownloadIcon size={16} />}
                      >
                        Baixar PDF
                      </Button>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* SEÇÃO DA CONTA DO PARTICIPANTE (Fiel ao Stitch) */}
            <section
              aria-labelledby="account-heading"
              className="bg-white rounded-lg p-6 border border-[#ddc0ba] shadow-xs flex flex-col items-center text-center gap-3"
            >
              <h2 id="account-heading" className="sr-only">
                Dados da Conta
              </h2>

              <div className="w-14 h-14 rounded-full bg-[#ffdad2] text-[#6b1705] font-mono text-base font-bold flex items-center justify-center border border-[#ddc0ba]">
                {getInitials(user?.nome)}
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-[#1c1c1a]">
                  {user?.nome || 'Participante'}
                </h3>
                <p className="font-mono text-xs text-[#57423d] mt-0.5">
                  {user?.email || 'participante@fatec.sp.gov.br'}
                </p>
              </div>

              <div className="w-full pt-2 border-t border-[#f0edea]">
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    navigate('/login', { replace: true, state: {} })
                  }}
                  className="text-xs font-semibold text-[#ba1a1a] hover:underline flex items-center justify-center gap-1.5 mx-auto py-1"
                >
                  <LogOutIcon size={14} />
                  <span>Sair da conta</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
