import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getEventosPublicosApi } from '../api/eventosApi'
import type { EventoPublico } from '../domain/eventoTypes'
import {
  Button,
  Badge,
  Spinner,
  Alert,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AwardIcon,
  SearchIcon,
} from '../../../shared/ui'

import {
  calculateNextIndex,
  calculatePrevIndex,
  sortEventosByDate,
  formatDateSafe,
} from '../domain/carouselLogic'

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const [eventos, setEventos] = useState<EventoPublico[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [carouselIndex, setCarouselIndex] = useState<number>(0)
  const [certCodigo, setCertCodigo] = useState<string>('')

  // Suporte a swipe de toque
  const touchStartXRef = useRef<number | null>(null)
  const carouselContainerRef = useRef<HTMLDivElement | null>(null)

  const carregarEventos = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getEventosPublicosApi()
      const sorted = sortEventosByDate(data)
      setEventos(sorted)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Não foi possível carregar a lista de eventos no momento.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    getEventosPublicosApi()
      .then((data) => {
        if (isMounted) {
          const sorted = sortEventosByDate(data)
          setEventos(sorted)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar a lista de eventos no momento.'
          )
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Controles do carrossel
  const handlePrev = () => {
    setCarouselIndex((prev) => calculatePrevIndex(prev, eventos.length))
  }

  const handleNext = () => {
    setCarouselIndex((prev) => calculateNextIndex(prev, eventos.length))
  }

  // Navegação por teclado dentro do carrossel
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      handlePrev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      handleNext()
    }
  }

  // Toque mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartXRef.current - touchEndX
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext()
      } else {
        handlePrev()
      }
    }
    touchStartXRef.current = null
  }

  const handleBuscarCertificado = (e: React.FormEvent) => {
    e.preventDefault()
    const codigoLimpo = certCodigo.trim()
    if (codigoLimpo) {
      navigate(`/certificados/${encodeURIComponent(codigoLimpo)}`)
    }
  }

  const currentEvento = eventos[carouselIndex]

  return (
    <div className="flex flex-col min-h-full">
      {/* 1. Hero Section Editorial */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide uppercase">
            <span>Plataforma Oficial de Eventos Acadêmicos FATEC</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none text-white">
            Conhecimento que se transforma em certificação oficial.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Participe de semanas acadêmicas, palestras técnicas e simpósios.
            Inscreva-se gratuitamente, confirme sua presença via QR Code e emita
            seus certificados digitais válidos.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/eventos" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" fullWidth className="sm:px-8">
                Explorar Todos os Eventos
              </Button>
            </Link>

            <Link to="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                fullWidth
                className="bg-transparent border-slate-700 text-white hover:bg-slate-800 sm:px-8"
              >
                Acessar Minha Conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Carrossel de Eventos em Destaque */}
      <section
        className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full"
        aria-labelledby="titulo-carrossel"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Agenda em Tempo Real
            </span>
            <h2
              id="titulo-carrossel"
              className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
            >
              Eventos Acadêmicos em Destaque
            </h2>
          </div>

          <Link
            to="/eventos"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
          >
            Ver catálogo completo &rarr;
          </Link>
        </div>

        {/* Estado de Carregamento */}
        {isLoading && (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-slate-500"
            role="status"
          >
            <Spinner size="lg" className="text-blue-600" />
            <span className="text-sm font-medium">
              Consultando agenda acadêmica no servidor...
            </span>
          </div>
        )}

        {/* Estado de Falha de Conexão com a API */}
        {error && (
          <Alert variant="error" title="Falha ao carregar eventos">
            <div className="flex flex-col gap-2">
              <p>{error}</p>
              <div>
                <Button variant="secondary" size="sm" onClick={carregarEventos}>
                  Tentar novamente
                </Button>
              </div>
            </div>
          </Alert>
        )}

        {/* Estado Vazio */}
        {!isLoading && !error && eventos.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <CalendarIcon size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Nenhum evento programado no momento
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Novas semanas acadêmicas e palestras técnicas serão publicadas em
              breve. Acompanhe as novidades pelo portal da faculdade.
            </p>
          </div>
        )}

        {/* Carrossel Ativo */}
        {!isLoading && !error && currentEvento && (
          <div
            ref={carouselContainerRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            role="region"
            aria-roledescription="carrossel"
            aria-label="Carrossel de eventos acadêmicos"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-2xl"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
              {/* Bloco Lateral Editorial */}
              <div className="bg-slate-900 text-white p-6 sm:p-8 md:w-2/5 flex flex-col justify-between relative">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge
                      variant={
                        currentEvento.status === 'EM_ANDAMENTO'
                          ? 'warning'
                          : 'info'
                      }
                      size="sm"
                    >
                      {currentEvento.status === 'EM_ANDAMENTO'
                        ? 'Em Andamento'
                        : 'Programado'}
                    </Badge>

                    <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                      {currentEvento.modalidade}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
                    {currentEvento.disciplina || 'Evento Institucional'}
                  </span>

                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                    {currentEvento.tema}
                  </h3>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>
                    Evento {carouselIndex + 1} de {eventos.length}
                  </span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">
                    Use &larr; &rarr; para navegar
                  </span>
                </div>
              </div>

              {/* Bloco de Detalhes e Inscrição */}
              <div className="p-6 sm:p-8 md:w-3/5 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {currentEvento.descricao ||
                      'Participe desta atividade acadêmica oficial. Confirmação de presença e horas complementares registradas na plataforma.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <CalendarIcon
                        size={16}
                        className="text-blue-600 shrink-0"
                      />
                      <div>
                        <span className="font-semibold block text-slate-900">
                          {formatDateSafe(currentEvento.data)}
                        </span>
                        <span className="text-slate-500">Data do evento</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <ClockIcon size={16} className="text-blue-600 shrink-0" />
                      <div>
                        <span className="font-semibold block text-slate-900">
                          {currentEvento.horarioInicio || '--:--'} às{' '}
                          {currentEvento.horarioFim || '--:--'}
                        </span>
                        <span className="text-slate-500">Horário oficial</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 sm:col-span-2">
                      <MapPinIcon
                        size={16}
                        className="text-blue-600 shrink-0"
                      />
                      <div className="truncate">
                        <span className="font-semibold block text-slate-900 truncate">
                          {currentEvento.local ||
                            (currentEvento.modalidade === 'ONLINE'
                              ? 'Ambiente Virtual / Transmissão'
                              : 'Campus Universitário FATEC')}
                        </span>
                        <span className="text-slate-500">Localização</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ações e Navegação */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <Link
                    to={`/eventos/${currentEvento.id}`}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      variant={
                        currentEvento.inscricoesEncerradas
                          ? 'outline'
                          : 'primary'
                      }
                      size="md"
                      fullWidth
                    >
                      {currentEvento.inscricoesEncerradas
                        ? 'Ver Detalhes do Evento'
                        : 'Inscrever-se Gratuitamente'}
                    </Button>
                  </Link>

                  {/* Controles de Próximo / Anterior do Carrossel */}
                  {eventos.length > 1 && (
                    <div className="flex items-center justify-end gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="Ver evento anterior"
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      >
                        <ChevronLeftIcon size={18} />
                      </button>

                      <span
                        className="text-xs font-semibold text-slate-500 px-2"
                        aria-live="polite"
                      >
                        {carouselIndex + 1} / {eventos.length}
                      </span>

                      <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Ver próximo evento"
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      >
                        <ChevronRightIcon size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. Fluxo Explicativo em 4 Etapas */}
      <section
        className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200"
        aria-labelledby="titulo-fluxo"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Passo a Passo
            </span>
            <h2
              id="titulo-fluxo"
              className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
            >
              Como funciona a sua participação
            </h2>
            <p className="text-sm text-slate-500">
              Processo direto e descomplicado para você garantir presença e
              certificação
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Etapa 1 */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-blue-600 px-2 py-0.5 rounded bg-blue-50 border border-blue-200/60 inline-block mb-3">
                  Etapa 01
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Encontre o Evento
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Consulte a programação acadêmica oficial e escolha as
                  palestras e simpósios do seu interesse.
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-slate-400">
                Público e aberto
              </div>
            </div>

            {/* Etapa 2 */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-blue-600 px-2 py-0.5 rounded bg-blue-50 border border-blue-200/60 inline-block mb-3">
                  Etapa 02
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Faça sua Inscrição
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Informe seus dados cadastrais (nome, CPF e email) para
                  garantir sua vaga antes do início da sessão.
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-slate-400">
                Gratuito e imediato
              </div>
            </div>

            {/* Etapa 3 */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-blue-600 px-2 py-0.5 rounded bg-blue-50 border border-blue-200/60 inline-block mb-3">
                  Etapa 03
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Confirme sua Presença
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  No dia do evento, escaneie o QR Code oficial de confirmação
                  com a câmera do seu celular para registrar sua presença.
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-slate-400">
                Check-in por QR Code
              </div>
            </div>

            {/* Etapa 4 */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-emerald-700 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200/60 inline-block mb-3">
                  Etapa 04
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Receba seu Certificado
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Após a conclusão pelo organizador, acesse o PDF assinado com
                  código de validação para horas complementares.
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-emerald-600">
                Válido para o LinkedIn
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Validação Rápida de Certificados */}
      <section
        className="py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full"
        aria-labelledby="titulo-validacao"
      >
        <div className="bg-slate-100/90 rounded-2xl border border-slate-200 p-6 sm:p-8 text-center space-y-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 mx-auto flex items-center justify-center">
            <AwardIcon size={22} />
          </div>

          <h2
            id="titulo-validacao"
            className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight"
          >
            Validar Autenticidade de um Certificado
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Possui um certificado emitido pelo Muttley? Digite o código
            alfanumérico impresso no documento para verificar a assinatura
            digital e os dados do titular.
          </p>

          <form
            onSubmit={handleBuscarCertificado}
            className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto pt-2"
          >
            <input
              type="text"
              value={certCodigo}
              onChange={(e) => setCertCodigo(e.target.value)}
              placeholder="Ex: CERT-2026-ABC12345"
              aria-label="Código de validação do certificado"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!certCodigo.trim()}
              className="w-full sm:w-auto shrink-0"
              leftIcon={<SearchIcon size={16} />}
            >
              Consultar
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
