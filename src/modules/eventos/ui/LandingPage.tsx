import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getEventosPublicosApi } from '../api/eventosApi'
import type { EventoPublico } from '../domain/eventoTypes'
import {
  Button,
  Spinner,
  Alert,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  CheckCircleIcon,
  SearchIcon,
  ShieldCheckIcon,
  UsersIcon,
  QrCodeIcon,
  AwardIcon,
} from '../../../shared/ui'

import {
  calculateNextIndex,
  calculatePrevIndex,
  sortEventosByDate,
} from '../domain/carouselLogic'

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const [eventos, setEventos] = useState<EventoPublico[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [carouselIndex, setCarouselIndex] = useState<number>(0)
  const [certCodigo, setCertCodigo] = useState<string>('')

  // Suporte a gestos touch
  const touchStartXRef = useRef<number | null>(null)

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      handlePrev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      handleNext()
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartXRef.current - touchEndX
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext()
      } else {
        handlePrev()
      }
    }
    touchStartXRef.current = null
  }

  const handleConsultarCertificado = (e: React.FormEvent) => {
    e.preventDefault()
    const codigoLimpo = certCodigo.trim()
    if (codigoLimpo) {
      navigate(`/certificados/${encodeURIComponent(codigoLimpo)}`)
    }
  }

  const getModalidadeBadge = (modalidade: string) => {
    const modUpper = (modalidade || '').toUpperCase()
    if (modUpper.includes('ONLINE')) {
      return (
        <span className="font-mono text-xs uppercase tracking-wider px-2 py-0.5 rounded bg-[#beeeca] text-[#244f34] font-medium">
          Online
        </span>
      )
    }
    if (modUpper.includes('HIBRID') || modUpper.includes('HÍBRID')) {
      return (
        <span className="font-mono text-xs uppercase tracking-wider px-2 py-0.5 rounded bg-[#ffdad2] text-[#822713] font-medium">
          Híbrido
        </span>
      )
    }
    return (
      <span className="font-mono text-xs uppercase tracking-wider px-2 py-0.5 rounded bg-[#dce1ff] text-[#1d3989] font-medium">
        Presencial
      </span>
    )
  }

  // Extrai dia e mês abreviado de uma data ISO YYYY-MM-DD
  const extractDateParts = (dateStr: string) => {
    if (!dateStr) return { day: '--', monthYear: '---' }
    const [year, month, day] = dateStr.split('-')
    const meses = [
      'JAN',
      'FEV',
      'MAR',
      'ABR',
      'MAI',
      'JUN',
      'JUL',
      'AGO',
      'SET',
      'OUT',
      'NOV',
      'DEZ',
    ]
    const monthIndex = parseInt(month, 10) - 1
    const monthName = meses[monthIndex] || month
    return {
      day: day || '--',
      monthYear: `${monthName} • ${year || ''}`,
    }
  }

  // Janela visível de 3 eventos
  const visibleEventos = eventos.slice(carouselIndex, carouselIndex + 3)
  if (visibleEventos.length < 3 && eventos.length >= 3) {
    const faltam = 3 - visibleEventos.length
    visibleEventos.push(...eventos.slice(0, faltam))
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Container Central com Limite Máximo 76rem (1216px) */}
      <div className="w-full max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* HERO SECTION EDITORIAL */}
        <section
          aria-labelledby="hero-title"
          className="relative w-full pt-4 pb-12 lg:pb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Coluna Principal Esquerda (8 colunas) */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 mb-4">
                  <span
                    className="w-2 h-2 rounded-full bg-[#6b1705]"
                    aria-hidden="true"
                  />
                  <span className="font-mono text-xs text-[#57423d] uppercase tracking-wider font-medium">
                    Compêndio Acadêmico Nacional • Gestão &amp; Certificação
                  </span>
                </div>

                <h1
                  id="hero-title"
                  className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] lg:leading-[4rem] text-[#1c1c1a] tracking-tight text-balance mb-6"
                >
                  Encontre seu próximo encontro com o{' '}
                  <span className="italic font-serif text-[#6b1705]">
                    conhecimento
                  </span>
                  .
                </h1>

                <p className="text-base sm:text-lg text-[#57423d] max-w-2xl mb-8 leading-relaxed">
                  Plataforma integrada para descoberta de eventos acadêmicos,
                  simpósios, conferências e emissão instantânea e verificável de
                  certificados de participação com registro perene.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <a href="#proximos-eventos">
                    <Button
                      variant="primary"
                      size="lg"
                      className="px-6 py-3.5"
                      rightIcon={<ArrowUpRightIcon size={18} />}
                    >
                      Explorar eventos
                    </Button>
                  </a>
                  <a href="#fluxo-academico">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="px-6 py-3.5"
                      leftIcon={<BookOpenIcon size={18} />}
                    >
                      Como funciona o ciclo
                    </Button>
                  </a>
                </div>
              </div>

              {/* Faixa de Capacidades Reais */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 pt-6 bg-[#f6f3ef] p-6 rounded-lg border border-[#ddc0ba]/50">
                <div>
                  <span className="font-mono text-xs text-[#57423d] block uppercase tracking-wider">
                    Inscrição
                  </span>
                  <span className="font-serif text-xl font-bold text-[#6b1705] mt-1 block">
                    Garantida
                  </span>
                  <span className="text-xs text-[#57423d]">
                    Reserva imediata de vaga
                  </span>
                </div>
                <div>
                  <span className="font-mono text-xs text-[#57423d] block uppercase tracking-wider">
                    Presença
                  </span>
                  <span className="font-serif text-xl font-bold text-[#6b1705] mt-1 block">
                    Janela [-10m / +10m]
                  </span>
                  <span className="text-xs text-[#57423d]">
                    Validação pontual no evento
                  </span>
                </div>
                <div>
                  <span className="font-mono text-xs text-[#57423d] block uppercase tracking-wider">
                    Certificação
                  </span>
                  <span className="font-serif text-xl font-bold text-[#6b1705] mt-1 block">
                    Código Único
                  </span>
                  <span className="text-xs text-[#57423d]">
                    Validação pública perene
                  </span>
                </div>
              </div>
            </div>

            {/* Coluna Editorial Lateral Direita (4 colunas) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Painel Editorial Solene com Citação da Ata Científica */}
              <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden shadow-sm bg-[#31302e] text-[#fcf9f5] flex flex-col justify-end p-6 border border-[#ddc0ba]/40">
                {/* Background Decorativo Geométrico Editorial */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#1c1c1a] via-[#31302e]/90 to-[#6b1705]/40 opacity-95"
                  aria-hidden="true"
                />
                <div
                  className="absolute top-6 right-6 opacity-20"
                  aria-hidden="true"
                >
                  <BookOpenIcon size={96} />
                </div>

                <div className="relative z-10">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#ffdad2] block mb-2 font-medium">
                    Ata Científica Geral
                  </span>
                  <p className="font-serif text-xl sm:text-2xl italic leading-snug mb-3">
                    &ldquo;A difusão do saber preserva a memória do progresso
                    humano.&rdquo;
                  </p>
                  <span className="text-xs text-[#ddc0ba] block">
                    Arquivo Central de Simpósios • FATEC
                  </span>
                </div>
              </div>

              {/* Protocolo Público de Conferência */}
              <div className="p-4 bg-[#f6f3ef] rounded-lg border border-[#ddc0ba]/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheckIcon size={20} className="text-[#6b1705]" />
                  <span className="text-xs font-semibold text-[#1c1c1a]">
                    Protocolo Público de Conferência
                  </span>
                </div>
                <span className="font-mono text-xs text-[#57423d] font-semibold">
                  v4.2.1-SEC
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO DE PRÓXIMOS EVENTOS COM CARROSSEL MANUAL */}
        <section
          id="proximos-eventos"
          aria-labelledby="events-heading"
          className="w-full py-10 lg:py-14 border-t border-[#ddc0ba]/60"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[#6b1705] mb-1">
                <CalendarIcon size={16} />
                <span className="font-mono text-xs uppercase tracking-wider font-semibold">
                  Calendário Acadêmico
                </span>
              </div>
              <h2
                id="events-heading"
                className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1c1c1a] tracking-tight"
              >
                Próximos Encontros Científicos
              </h2>
            </div>

            {/* Controles Manuais Acessíveis */}
            {eventos.length > 1 && (
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[#57423d]">
                  Evento {carouselIndex + 1} de {eventos.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Ver evento anterior"
                    className="w-10 h-10 rounded border border-[#ddc0ba] bg-[#f6f3ef] flex items-center justify-center text-[#1c1c1a] hover:bg-[#f0edea] active:bg-[#e5e2de] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b1705]"
                  >
                    <ChevronLeftIcon size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Ver próximo evento"
                    className="w-10 h-10 rounded border border-[#ddc0ba] bg-[#f6f3ef] flex items-center justify-center text-[#1c1c1a] hover:bg-[#f0edea] active:bg-[#e5e2de] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b1705]"
                  >
                    <ChevronRightIcon size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Estado de Carregamento */}
          {isLoading && (
            <div
              className="flex flex-col items-center justify-center py-16 gap-3 text-[#57423d]"
              role="status"
            >
              <Spinner size="lg" className="text-[#6b1705]" />
              <p className="text-sm font-medium">
                Carregando calendário acadêmico...
              </p>
            </div>
          )}

          {/* Alerta de Erro */}
          {error && (
            <Alert variant="error" title="Falha de conexão com os eventos">
              <div className="flex flex-col gap-2">
                <p>{error}</p>
                <div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={carregarEventos}
                  >
                    Tentar novamente
                  </Button>
                </div>
              </div>
            </Alert>
          )}

          {/* Carrossel Ativo */}
          {!isLoading && !error && eventos.length > 0 && (
            <div
              tabIndex={0}
              onKeyDown={handleKeyDown}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              role="region"
              aria-label="Carrossel de eventos acadêmicos"
              aria-roledescription="carousel"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6b1705] rounded-lg"
            >
              {visibleEventos.map((evento, idx) => {
                const { day, monthYear } = extractDateParts(evento.data)
                return (
                  <article
                    key={`${evento.id}-${idx}`}
                    className="bg-white rounded-lg p-6 border border-[#ddc0ba] shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow"
                  >
                    <div>
                      {/* Topo: Dia, Mês e Modalidade */}
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div className="flex flex-col">
                          <span className="font-serif text-3xl font-bold text-[#6b1705] leading-none">
                            {day}
                          </span>
                          <span className="font-mono text-xs uppercase text-[#57423d] mt-1 font-semibold">
                            {monthYear}
                          </span>
                        </div>
                        {getModalidadeBadge(evento.modalidade)}
                      </div>

                      {/* Título e Descrição */}
                      <h3 className="font-serif text-xl font-bold text-[#1c1c1a] group-hover:text-[#6b1705] transition-colors mb-2 line-clamp-2">
                        {evento.tema}
                      </h3>
                      <p className="text-xs text-[#57423d] line-clamp-3 mb-6 leading-relaxed">
                        {evento.descricao ||
                          'Encontro acadêmico com palestras, debates técnicos e certificação garantida aos participantes presentes.'}
                      </p>
                    </div>

                    {/* Metadados e Ação */}
                    <div className="pt-4 mt-2 bg-[#f6f3ef] -mx-6 -mb-6 p-6 rounded-b-lg border-t border-[#f0edea]">
                      <div className="grid grid-cols-2 gap-2 text-[#1c1c1a] mb-4 font-mono text-xs">
                        <div>
                          <span className="text-[#8a726c] block uppercase">
                            Horário
                          </span>
                          <span className="font-medium">
                            {evento.horarioInicio} - {evento.horarioFim}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#8a726c] block uppercase">
                            Local
                          </span>
                          <span className="font-medium truncate block">
                            {evento.local || evento.disciplina || 'Campus'}
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/eventos/${evento.id}`}
                        className="w-full block"
                      >
                        <Button
                          variant="secondary"
                          size="md"
                          fullWidth
                          className="hover:bg-[#6b1705] hover:text-white transition-colors"
                          rightIcon={<ArrowUpRightIcon size={16} />}
                        >
                          Ver evento
                        </Button>
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {/* Estado Vazio */}
          {!isLoading && !error && eventos.length === 0 && (
            <div className="text-center py-16 px-4 bg-white rounded-lg border border-[#ddc0ba]">
              <CalendarIcon size={40} className="mx-auto text-[#8a726c] mb-3" />
              <h3 className="font-serif text-xl font-bold text-[#1c1c1a] mb-2">
                Nenhum evento programado no momento
              </h3>
              <p className="text-sm text-[#57423d] max-w-md mx-auto mb-6">
                Novos simpósios e conferências serão cadastrados em breve pelas
                comissões acadêmicas.
              </p>
              <Link to="/eventos">
                <Button variant="outline" size="md">
                  Ver histórico no catálogo
                </Button>
              </Link>
            </div>
          )}

          {/* Link para o Catálogo Geral */}
          <div className="mt-8 text-center">
            <Link
              to="/eventos"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#6b1705] hover:underline"
            >
              <span>Acessar catálogo completo de eventos</span>
              <ArrowUpRightIcon size={16} />
            </Link>
          </div>
        </section>

        {/* SEÇÃO: COMO FUNCIONA O CICLO ACADÊMICO (4 ETAPAS NUMERADAS) */}
        <section
          id="fluxo-academico"
          aria-labelledby="flow-heading"
          className="w-full py-12 lg:py-16 my-8 bg-[#f6f3ef] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-lg border border-[#ddc0ba]/40"
        >
          <div className="max-w-[76rem] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#6b1705] font-semibold block mb-1">
                  Rastreabilidade Ponta a Ponta
                </span>
                <h2
                  id="flow-heading"
                  className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1c1c1a]"
                >
                  Como funciona o ciclo acadêmico
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#57423d] max-w-md">
                Cada etapa é auditada e validada em conformidade com as
                diretrizes de extensão e emissão de certificados acadêmicos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Etapa 01 */}
              <div className="bg-white p-6 rounded-lg border border-[#ddc0ba] shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-bold text-[#6b1705]">
                      01
                    </span>
                    <SearchIcon size={22} className="text-[#8a726c]" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#1c1c1a] mb-2">
                    Encontrar evento
                  </h3>
                  <p className="text-xs text-[#57423d] leading-relaxed">
                    Pesquisa refinada por temática, modalidade (presencial,
                    híbrida ou remota) e cronograma acadêmico.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[#f0edea]">
                  <span className="font-mono text-[11px] text-[#8a726c] uppercase tracking-wider block">
                    Filtros Temáticos
                  </span>
                </div>
              </div>

              {/* Etapa 02 */}
              <div className="bg-white p-6 rounded-lg border border-[#ddc0ba] shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-bold text-[#6b1705]">
                      02
                    </span>
                    <UsersIcon size={22} className="text-[#8a726c]" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#1c1c1a] mb-2">
                    Inscrever-se
                  </h3>
                  <p className="text-xs text-[#57423d] leading-relaxed">
                    Reserva imediata de vaga respeitando o prazo limite e a
                    capacidade do auditório ou ambiente virtual.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[#f0edea]">
                  <span className="font-mono text-[11px] text-[#8a726c] uppercase tracking-wider block">
                    Garantia de Vaga
                  </span>
                </div>
              </div>

              {/* Etapa 03 */}
              <div className="bg-white p-6 rounded-lg border border-[#ddc0ba] shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-bold text-[#6b1705]">
                      03
                    </span>
                    <CheckCircleIcon size={22} className="text-[#8a726c]" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#1c1c1a] mb-2">
                    Confirmar presença
                  </h3>
                  <p className="text-xs text-[#57423d] leading-relaxed">
                    Validação de presença rigorosa: janela ativa de 10 minutos
                    antes a 10 minutos após o término por link ou QR Code do
                    evento.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[#f0edea]">
                  <span className="font-mono text-[11px] text-[#8a726c] uppercase tracking-wider block">
                    Janela [-10m / +10m]
                  </span>
                </div>
              </div>

              {/* Etapa 04 */}
              <div className="bg-white p-6 rounded-lg border border-[#ddc0ba] shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-bold text-[#6b1705]">
                      04
                    </span>
                    <AwardIcon size={22} className="text-[#8a726c]" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#1c1c1a] mb-2">
                    Acessar certificado
                  </h3>
                  <p className="text-xs text-[#57423d] leading-relaxed">
                    Emissão automatizada após encerramento do evento, com código
                    de autenticidade para validação direta por secretarias.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[#f0edea]">
                  <span className="font-mono text-[11px] text-[#8a726c] uppercase tracking-wider block">
                    Código de Autenticidade
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO INSTITUCIONAL: RECURSOS PARA COMISSÕES & ORGANIZADORES */}
        <section
          aria-labelledby="organizers-heading"
          className="w-full py-12 lg:py-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Benefícios à Esquerda (6 colunas) */}
            <div className="lg:col-span-6 flex flex-col">
              <span className="font-mono text-xs uppercase tracking-wider text-[#6b1705] font-semibold mb-2">
                Para Comissões Organizadoras &amp; Docentes
              </span>
              <h2
                id="organizers-heading"
                className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1c1c1a] tracking-tight mb-4"
              >
                Recursos integrados para gestão de eventos acadêmicos
              </h2>
              <p className="text-sm text-[#57423d] mb-6 leading-relaxed">
                Elimine o retrabalho de planilhas dispersas e confecção manual
                de documentos. A infraestrutura do Muttley gerencia todo o ciclo
                com precisão acadêmica.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-[#f0edea] flex items-center justify-center shrink-0 mt-0.5 text-[#6b1705]">
                    <UsersIcon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#1c1c1a]">
                      Gestão simplificada de participantes
                    </h4>
                    <p className="text-xs text-[#57423d] leading-relaxed mt-0.5">
                      Acompanhamento em tempo real de inscritos, presença
                      consolidada e controle de ocupação de auditórios.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-[#f0edea] flex items-center justify-center shrink-0 mt-0.5 text-[#6b1705]">
                    <QrCodeIcon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#1c1c1a]">
                      Credenciamento com QR Code
                    </h4>
                    <p className="text-xs text-[#57423d] leading-relaxed mt-0.5">
                      Exibição na projeção ou totem do evento para registro
                      pontual pelo próprio dispositivo do participante.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-[#f0edea] flex items-center justify-center shrink-0 mt-0.5 text-[#6b1705]">
                    <AwardIcon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#1c1c1a]">
                      Emissão automatizada de certificados
                    </h4>
                    <p className="text-xs text-[#57423d] leading-relaxed mt-0.5">
                      Conclusão com assinatura digitalizada do coordenador e
                      geração automática dos certificados em PDF.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Link to="/login">
                  <Button variant="primary" size="lg">
                    Acessar painel administrativo &rarr;
                  </Button>
                </Link>
              </div>
            </div>

            {/* Cartão de Certificado Ilustrativo à Direita (6 colunas) */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="bg-white rounded-lg p-6 sm:p-8 border border-[#ddc0ba] shadow-sm relative">
                {/* Cabeçalho do Certificado Ilustrativo */}
                <div className="flex items-center justify-between pb-4 border-b border-[#f0edea]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full bg-[#6b1705]"
                      aria-hidden="true"
                    />
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#57423d] font-semibold">
                      Exemplo Ilustrativo de Certificado
                    </span>
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#beeeca] text-[#244f34] font-semibold">
                    Válido
                  </span>
                </div>

                {/* Corpo do Certificado */}
                <div className="py-6">
                  <span className="font-mono text-xs uppercase text-[#8a726c] tracking-widest block mb-2">
                    Certificamos que
                  </span>
                  <h3 className="font-serif text-2xl text-[#1c1c1a] font-bold mb-3">
                    Mariana Cavalcanti de Albuquerque
                  </h3>
                  <p className="text-xs text-[#57423d] leading-relaxed">
                    participou com êxito das atividades do{' '}
                    <strong className="text-[#1c1c1a]">
                      Simpósio Internacional de Tecnologias Acadêmicas
                    </strong>
                    , com carga horária de 12 horas-aula.
                  </p>
                </div>

                {/* Rodapé com Código de Autenticidade */}
                <div className="p-4 bg-[#f6f3ef] rounded border border-[#ddc0ba]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase text-[#8a726c] block">
                      Código de validação
                    </span>
                    <span className="font-mono text-xs font-bold text-[#1c1c1a]">
                      MTT-8921-BR-2026
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#57423d]">
                    Via oficial • FATEC
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO DE CONSULTA PÚBLICA DE CERTIFICADOS */}
        <section
          id="validar"
          aria-labelledby="validate-heading"
          className="w-full py-10 lg:py-12 border-t border-[#ddc0ba]/60"
        >
          <div className="max-w-2xl mx-auto text-center">
            <h2
              id="validate-heading"
              className="font-serif text-2xl sm:text-3xl text-[#1c1c1a] mb-2"
            >
              Validar autenticidade de certificado
            </h2>
            <p className="text-sm text-[#57423d] mb-6">
              Informe o código de validação constante no verso ou rodapé do
              documento para atestar a autenticidade acadêmica.
            </p>

            <form
              onSubmit={handleConsultarCertificado}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <div className="flex-1">
                <input
                  type="text"
                  value={certCodigo}
                  onChange={(e) => setCertCodigo(e.target.value)}
                  placeholder="Ex: MTT-8921-BR ou código hash"
                  aria-label="Código de validação do certificado"
                  required
                  className="w-full min-h-[44px] px-4 py-2.5 rounded border border-[#ddc0ba] bg-white text-[#1c1c1a] placeholder:text-[#8a726c] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#6b1705]"
                />
              </div>
              <Button type="submit" variant="primary" size="md">
                Consultar Certificado
              </Button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
