import React, { useEffect, useState } from 'react'
import { m } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { getEventosPublicosApi } from '../api/eventosApi'
import type { EventoPublico } from '../domain/eventoTypes'
import { sortEventosByDate } from '../domain/carouselLogic'
import { formatModalidade, getTicketDateParts } from '../domain/ticketFormat'
import { ButtonLink, Ticket, TicketSkeleton } from '../../../shared/ui'
import { useAuth } from '../../auth'
import { MoedaTrilha } from '../../medalhas/ui/MoedaTrilha'
import type { Trilha } from '../../medalhas/domain/conquistas'
import { SecaoComoFunciona } from './landing/SecaoComoFunciona'
import { SecaoMedalhas } from './landing/SecaoMedalhas'
import { SecaoCertificado } from './landing/SecaoCertificado'
import { SecaoCoordenacao } from './landing/SecaoCoordenacao'
import { Revelar } from './landing/movimento'

// Moeda de exemplo que flutua junto dos ingressos do hero.
const MOEDA_OURO: Trilha = {
  chave: 'geral',
  titulo: 'Participação',
  metrica: 'PRESENCAS',
  valor: 25,
  nivel: 'OURO',
  proximoNivel: null,
  proximoMarco: null,
  marcos: [1, 10, 25],
}

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [eventos, setEventos] = useState<EventoPublico[]>([])
  const [carregando, setCarregando] = useState(true)
  // O ingresso da frente leva o carimbo depois que a pilha termina de entrar.
  const [carimbado, setCarimbado] = useState(false)

  useEffect(() => {
    let ativo = true
    getEventosPublicosApi()
      .then((data) => {
        if (!ativo) return
        setEventos(
          sortEventosByDate(data.filter((e) => !e.inscricoesEncerradas))
        )
        setCarregando(false)
      })
      // Sem eventos, o hero mostra só a chamada; a lista completa trata o erro.
      .catch(() => ativo && setCarregando(false))
    return () => {
      ativo = false
    }
  }, [])

  useEffect(() => {
    if (eventos.length === 0) return
    const t = window.setTimeout(() => setCarimbado(true), 1100)
    return () => window.clearTimeout(t)
  }, [eventos.length])

  const comIngressos = carregando || eventos.length > 0

  return (
    // Coreografia própria: o hero entra em onda e os ingressos (.hero-tickets) chegam em seguida.
    <div className="w-full overflow-x-clip" data-entrada="propria">
      <div className="mx-auto w-full max-w-[76rem] px-4 sm:px-6 lg:px-8">
        <section
          aria-labelledby="hero-titulo"
          className="relative flex flex-col justify-center py-14 lg:min-h-[calc(100dvh-4rem)] lg:py-16"
        >
          <div
            className={`grid items-center gap-14 ${comIngressos ? 'lg:grid-cols-12' : ''}`}
          >
            <div className="entrada lg:col-span-7">
              <h1
                id="hero-titulo"
                className="font-display text-5xl font-extrabold leading-[0.98] text-balance sm:text-6xl lg:text-7xl"
              >
                Eventos da Fatec, do ingresso ao certificado
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-text-secondary)] sm:text-xl">
                Inscreva-se em palestras e oficinas, confirme presença no dia
                pelo QR Code e receba o certificado, que vale como medalha no
                seu perfil.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ButtonLink to="/eventos" size="lg">
                  Ver programação
                </ButtonLink>
                <ButtonLink to="/#validar" variant="outline" size="lg">
                  Validar certificado
                </ButtonLink>
              </div>
            </div>

            {comIngressos && (
              <div className="relative isolate lg:col-span-5">
                {/* Fundo do palco dos ingressos */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-6 -z-10 rotate-3 rounded-[2rem] bg-[var(--color-primary-subtle)] sm:-inset-10"
                />
                <ul className="hero-tickets" aria-label="Próximos eventos">
                  {carregando && eventos.length === 0
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
                              stamped={i === 0 && carimbado}
                              to={`/eventos/${evento.id}`}
                            >
                              <p className="font-display text-lg font-bold leading-tight line-clamp-2">
                                {evento.tema}
                              </p>
                              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
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
                <m.div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-20 -right-10 hidden sm:block"
                  initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
                  animate={{ opacity: 1, scale: 1, rotate: 12 }}
                  transition={{
                    type: 'spring',
                    stiffness: 160,
                    damping: 12,
                    delay: 0.7,
                  }}
                >
                  <div className="flutuar">
                    <MoedaTrilha trilha={MOEDA_OURO} tamanho={96} semAnel />
                  </div>
                </m.div>
              </div>
            )}
          </div>

          <a
            href="#fluxo-academico"
            className="mx-auto mt-14 hidden items-center gap-1.5 rounded-md text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-primary-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] lg:flex"
          >
            Como funciona
            <ChevronDown className="size-4" aria-hidden />
          </a>
        </section>

        <SecaoComoFunciona />
        <SecaoMedalhas />
        <SecaoCertificado />
        <SecaoCoordenacao />

        {/* Chamada final */}
        <Revelar className="mb-20">
          <section
            aria-labelledby="chamada-titulo"
            className="relative overflow-hidden rounded-[1.75rem] bg-[var(--color-primary)] px-6 py-14 text-center text-white sm:px-12 lg:py-20"
          >
            {/* Picote decorativo nas laterais, como num ingresso */}
            <span
              aria-hidden="true"
              className="absolute top-1/2 -left-5 size-10 -translate-y-1/2 rounded-full bg-[var(--color-bg-page)]"
            />
            <span
              aria-hidden="true"
              className="absolute top-1/2 -right-5 size-10 -translate-y-1/2 rounded-full bg-[var(--color-bg-page)]"
            />
            <h2
              id="chamada-titulo"
              className="mx-auto max-w-3xl font-display text-3xl font-extrabold leading-tight text-balance sm:text-5xl"
            >
              O próximo evento pode ser o seu primeiro carimbo
            </h2>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink
                to="/eventos"
                size="lg"
                className="!bg-[var(--color-signal)] !text-[var(--color-signal-ink)] hover:!brightness-95"
              >
                Ver programação
              </ButtonLink>
              <ButtonLink
                to={isAuthenticated ? '/user/inicio' : '/cadastro'}
                variant="outline"
                size="lg"
                className="!border-white/60 !bg-transparent !text-white hover:!bg-white/10"
              >
                {isAuthenticated ? 'Ir para meu painel' : 'Criar conta'}
              </ButtonLink>
            </div>
          </section>
        </Revelar>
      </div>
    </div>
  )
}
