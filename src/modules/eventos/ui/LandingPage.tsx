import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { getEventosPublicosApi } from '../api/eventosApi'
import type { EventoPublico } from '../domain/eventoTypes'
import { sortEventosByDate } from '../domain/carouselLogic'
import { cartaoEventoSvg } from '../domain/cartaoEvento'
import { formatModalidade } from '../domain/ticketFormat'
import { ButtonLink, TicketSkeleton } from '../../../shared/ui'
import CircularCarousel from '../../../shared/ui/CircularCarousel'
import { useTheme } from '../../../shared/theme'
import { useAuth } from '../../auth'
import { SecaoComoFunciona } from './landing/SecaoComoFunciona'
import { SecaoMedalhas } from './landing/SecaoMedalhas'
import { SecaoCertificado } from './landing/SecaoCertificado'
import { SecaoCoordenacao } from './landing/SecaoCoordenacao'
import { Revelar } from './landing/movimento'

// Com poucos cartões o anel fica vazio; os eventos se repetem até completar este mínimo.
const MIN_CARTOES = 12
const MAX_EVENTOS = 12

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [eventos, setEventos] = useState<EventoPublico[]>([])
  const [carregando, setCarregando] = useState(true)

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

  const anel = useMemo(() => {
    const base = eventos.slice(0, MAX_EVENTOS)
    if (base.length === 0) return []
    return Array.from(
      { length: Math.max(MIN_CARTOES, base.length) },
      (_, i) => base[i % base.length]
    )
  }, [eventos])

  const cartoes = useMemo(
    () =>
      anel.map((evento) => ({
        src: cartaoEventoSvg(evento, theme === 'dark' ? 'papel' : 'tinta'),
        alt: evento.tema,
        title: evento.tema,
        subtitle:
          [evento.local, formatModalidade(evento.modalidade)]
            .filter(Boolean)
            .join(' · ') || undefined,
      })),
    [anel, theme]
  )

  const comIngressos = carregando || eventos.length > 0

  return (
    // Coreografia própria: o hero entra em onda e o carrossel de eventos chega em seguida.
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
                {carregando && eventos.length === 0 ? (
                  <ul className="hero-tickets" aria-label="Próximos eventos">
                    {[0, 1, 2].map((i) => (
                      <li key={i} style={{ '--i': i } as React.CSSProperties}>
                        <TicketSkeleton />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '560px',
                      position: 'relative',
                    }}
                  >
                    <CircularCarousel
                      items={cartoes}
                      preset="wheel"
                      intro="spin"
                      cardWidth={400}
                      aspectRatio={2.4}
                      speed={14}
                      gap={10}
                      tilt={-15}
                      curve={0}
                      perspective={1800}
                      fadeColor="var(--color-bg-page)"
                      onItemClick={(_, i) => navigate(`/eventos/${anel[i].id}`)}
                    />
                  </div>
                )}
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
