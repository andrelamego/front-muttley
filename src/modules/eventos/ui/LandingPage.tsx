import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getEventosPublicosApi } from '../api/eventosApi'
import type { EventoPublico } from '../domain/eventoTypes'
import {
  Button,
  CheckCircleIcon,
  SearchIcon,
  UsersIcon,
  QrCodeIcon,
  AwardIcon,
  Ticket,
  TicketSkeleton,
} from '../../../shared/ui'
import { sortEventosByDate } from '../domain/carouselLogic'
import { formatModalidade, getTicketDateParts } from '../domain/ticketFormat'

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const [eventos, setEventos] = useState<EventoPublico[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [certCodigo, setCertCodigo] = useState<string>('')

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
      // Sem eventos, o hero mostra só a chamada; a lista completa trata o erro.
      .catch(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleConsultarCertificado = (e: React.FormEvent) => {
    e.preventDefault()
    const codigoLimpo = certCodigo.trim()
    if (codigoLimpo) {
      navigate(`/certificados/${encodeURIComponent(codigoLimpo)}`)
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Container Central com Limite Máximo 76rem (1216px) */}
      <div className="w-full max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Hero: a promessa em uma frase e os próximos eventos reais como ingressos */}
        <section
          aria-labelledby="hero-title"
          className="relative w-full pt-4 pb-14 lg:pb-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <h1
                id="hero-title"
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.02] text-balance"
              >
                Eventos da Fatec, do ingresso ao certificado
              </h1>
              <p className="text-lg text-[var(--color-text-secondary)] max-w-xl mt-6 leading-relaxed">
                Inscreva-se em palestras e oficinas, confirme presença no dia e
                receba o certificado com código de validação.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-8">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/eventos')}
                >
                  Ver programação
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() =>
                    document
                      .getElementById('validar')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  Validar certificado
                </Button>
              </div>
            </div>

            {(isLoading || eventos.length > 0) && (
              <div className="lg:col-span-5">
                <ul className="hero-tickets" aria-label="Próximos eventos">
                  {isLoading && eventos.length === 0
                    ? [0, 1, 2].map((i) => (
                        <li key={i} style={{ '--i': i } as React.CSSProperties}>
                          <TicketSkeleton />
                        </li>
                      ))
                    : eventos.slice(0, 3).map((evento, i) => {
                        const partes = getTicketDateParts(
                          evento.data,
                          evento.horarioInicio
                        )
                        return (
                          <li
                            key={evento.id}
                            style={{ '--i': i } as React.CSSProperties}
                          >
                            <Ticket
                              compact
                              dia={partes.dia}
                              mes={partes.mes}
                              horario={partes.horario}
                              to={`/eventos/${evento.id}`}
                            >
                              <p className="font-display text-lg font-bold leading-tight line-clamp-2">
                                {evento.tema}
                              </p>
                              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                {[
                                  evento.local,
                                  formatModalidade(evento.modalidade),
                                ]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </p>
                            </Ticket>
                          </li>
                        )
                      })}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* SEÇÃO: COMO FUNCIONA O CICLO ACADÊMICO (4 ETAPAS NUMERADAS) */}
        <section
          id="fluxo-academico"
          aria-labelledby="flow-heading"
          className="w-full py-12 lg:py-16 my-8 bg-[var(--color-bg-subtle)] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-md border border-[var(--color-border)]/40"
        >
          <div className="max-w-[76rem] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <span className="tabular-nums text-xs text-[var(--color-primary-text)] font-semibold block mb-1">
                  Da inscrição ao certificado
                </span>
                <h2
                  id="flow-heading"
                  className="font-display text-2xl sm:text-3xl lg:text-4xl text-[var(--color-text-primary)]"
                >
                  Como funciona o ciclo acadêmico
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-md">
                Cada etapa é auditada e validada em conformidade com as
                diretrizes de extensão e emissão de certificados acadêmicos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Etapa 01 */}
              <div className="surface-depth surface-depth-interactive bg-[var(--color-bg-surface)] p-6 rounded-md border border-[var(--color-border)] shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="tabular-nums text-2xl font-bold text-[var(--color-primary-text)]">
                      01
                    </span>
                    <SearchIcon
                      size={22}
                      className="text-[var(--color-text-muted)]"
                    />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)] mb-2">
                    Encontrar evento
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    Pesquisa refinada por temática, modalidade (presencial,
                    híbrida ou remota) e cronograma acadêmico.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[var(--color-bg-muted)]">
                  <span className="tabular-nums text-xs text-[var(--color-text-muted)] block">
                    Filtros temáticos
                  </span>
                </div>
              </div>

              {/* Etapa 02 */}
              <div className="surface-depth surface-depth-interactive bg-[var(--color-bg-surface)] p-6 rounded-md border border-[var(--color-border)] shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="tabular-nums text-2xl font-bold text-[var(--color-primary-text)]">
                      02
                    </span>
                    <UsersIcon
                      size={22}
                      className="text-[var(--color-text-muted)]"
                    />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)] mb-2">
                    Inscrever-se
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    Reserva imediata de vaga respeitando o prazo limite e a
                    capacidade do auditório ou ambiente virtual.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[var(--color-bg-muted)]">
                  <span className="tabular-nums text-xs text-[var(--color-text-muted)] block">
                    Garantia de vaga
                  </span>
                </div>
              </div>

              {/* Etapa 03 */}
              <div className="surface-depth surface-depth-interactive bg-[var(--color-bg-surface)] p-6 rounded-md border border-[var(--color-border)] shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="tabular-nums text-2xl font-bold text-[var(--color-primary-text)]">
                      03
                    </span>
                    <CheckCircleIcon
                      size={22}
                      className="text-[var(--color-text-muted)]"
                    />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)] mb-2">
                    Confirmar presença
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    Validação de presença rigorosa: janela ativa de 10 minutos
                    antes a 10 minutos após o término por link ou QR Code do
                    evento.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[var(--color-bg-muted)]">
                  <span className="tabular-nums text-xs text-[var(--color-text-muted)] block">
                    10 minutos antes e depois
                  </span>
                </div>
              </div>

              {/* Etapa 04 */}
              <div className="surface-depth surface-depth-interactive bg-[var(--color-bg-surface)] p-6 rounded-md border border-[var(--color-border)] shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="tabular-nums text-2xl font-bold text-[var(--color-primary-text)]">
                      04
                    </span>
                    <AwardIcon
                      size={22}
                      className="text-[var(--color-text-muted)]"
                    />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)] mb-2">
                    Acessar certificado
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    Emissão automatizada após encerramento do evento, com código
                    de autenticidade para validação direta por secretarias.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[var(--color-bg-muted)]">
                  <span className="tabular-nums text-xs text-[var(--color-text-muted)] block">
                    Código de autenticidade
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
              <span className="tabular-nums text-xs text-[var(--color-primary-text)] font-semibold mb-2">
                Para coordenação e docentes
              </span>
              <h2
                id="organizers-heading"
                className="font-display text-2xl sm:text-3xl lg:text-4xl text-[var(--color-text-primary)] tracking-tight mb-4"
              >
                Recursos integrados para gestão de eventos acadêmicos
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
                Elimine o retrabalho de planilhas dispersas e confecção manual
                de documentos. A infraestrutura do Muttley gerencia todo o ciclo
                com precisão acadêmica.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-[var(--color-bg-muted)] flex items-center justify-center shrink-0 mt-0.5 text-[var(--color-primary-text)]">
                    <UsersIcon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                      Gestão simplificada de participantes
                    </h4>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-0.5">
                      Acompanhamento em tempo real de inscritos, presença
                      consolidada e controle de ocupação de auditórios.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-[var(--color-bg-muted)] flex items-center justify-center shrink-0 mt-0.5 text-[var(--color-primary-text)]">
                    <QrCodeIcon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                      Credenciamento com QR Code
                    </h4>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-0.5">
                      Exibição na projeção ou totem do evento para registro
                      pontual pelo próprio dispositivo do participante.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-[var(--color-bg-muted)] flex items-center justify-center shrink-0 mt-0.5 text-[var(--color-primary-text)]">
                    <AwardIcon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                      Emissão automatizada de certificados
                    </h4>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-0.5">
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
              <div className="surface-depth bg-[var(--color-bg-surface)] rounded-md p-6 sm:p-8 border border-[var(--color-border)] shadow-sm relative">
                {/* Cabeçalho do Certificado Ilustrativo */}
                <div className="flex items-center justify-between pb-4 border-b border-[var(--color-bg-muted)]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full bg-[var(--color-primary)]"
                      aria-hidden="true"
                    />
                    <span className="tabular-nums text-xs text-[var(--color-text-secondary)] font-semibold">
                      Exemplo de certificado
                    </span>
                  </div>
                  <span className="tabular-nums text-xs px-2 py-0.5 rounded-md bg-[var(--color-success-bg)] text-[var(--color-success-text)] font-semibold">
                    Válido
                  </span>
                </div>

                {/* Corpo do Certificado */}
                <div className="py-6">
                  <span className="tabular-nums text-xs text-[var(--color-text-muted)] block mb-2">
                    Certificamos que
                  </span>
                  <h3 className="font-display text-2xl text-[var(--color-text-primary)] font-bold mb-3">
                    Mariana Cavalcanti de Albuquerque
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    participou com êxito das atividades do{' '}
                    <strong className="text-[var(--color-text-primary)]">
                      Simpósio Internacional de Tecnologias Acadêmicas
                    </strong>
                    , com carga horária de 12 horas-aula.
                  </p>
                </div>

                {/* Rodapé com Código de autenticidade */}
                <div className="p-4 bg-[var(--color-bg-subtle)] rounded-md border border-[var(--color-border)]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="tabular-nums text-xs text-[var(--color-text-muted)] block">
                      Código de validação
                    </span>
                    <span className="tabular-nums text-xs font-bold text-[var(--color-text-primary)]">
                      MTT-8921-BR-2026
                    </span>
                  </div>
                  <span className="tabular-nums text-xs text-[var(--color-text-secondary)]">
                    Via oficial da Fatec
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
          className="w-full py-10 lg:py-12 border-t border-[var(--color-border)]/60"
        >
          <div className="max-w-2xl mx-auto text-center">
            <h2
              id="validate-heading"
              className="font-display text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-2"
            >
              Validar autenticidade de certificado
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
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
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-sm border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] tabular-nums text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
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
