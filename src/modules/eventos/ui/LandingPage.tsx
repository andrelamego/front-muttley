import React, { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { getEventosPublicosApi } from '../api/eventosApi'
import type { EventoPublico } from '../domain/eventoTypes'
import { sortEventosByDate } from '../domain/carouselLogic'
import { ButtonLink } from '../../../shared/ui'
import { useAuth } from '../../auth'
import { SecaoProcesso } from './landing/SecaoProcesso'
import { SecaoMedalhas } from './landing/SecaoMedalhas'
import { SecaoCertificado } from './landing/SecaoCertificado'
import { SecaoCoordenacao } from './landing/SecaoCoordenacao'
import { ParedeIngressos } from './landing/ParedeIngressos'
import { Revelar } from './landing/movimento'

const TITULO = 'Eventos da Fatec, do ingresso ao certificado'

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [eventos, setEventos] = useState<EventoPublico[]>([])

  useEffect(() => {
    let ativo = true
    getEventosPublicosApi()
      .then((data) => {
        if (ativo)
          setEventos(
            sortEventosByDate(data.filter((e) => !e.inscricoesEncerradas))
          )
      })
      // Sem eventos, o hero fica só com a chamada, sem a parede.
      .catch(() => undefined)
    return () => {
      ativo = false
    }
  }, [])

  return (
    <div className="w-full overflow-x-clip" data-entrada="propria">
      <section
        aria-labelledby="hero-titulo"
        className="relative isolate flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden py-20"
      >
        {/* Parede: no desktop ocupa a direita; no celular fica atrás do texto */}
        <div className="absolute inset-0 lg:left-[40%]">
          <ParedeIngressos eventos={eventos} />
          {/* Transição suave da página para a parede */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-[var(--color-bg-page)] to-transparent lg:block"
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_50%,var(--color-bg-page)_40%,color-mix(in_oklab,var(--color-bg-page)_70%,transparent)_70%,transparent_100%)] lg:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[var(--color-bg-page)]"
        />

        <div className="relative mx-auto w-full max-w-[76rem] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
            <h1
              id="hero-titulo"
              className="font-display text-5xl font-extrabold leading-[0.98] text-balance sm:text-6xl lg:text-7xl"
            >
              {TITULO}
            </h1>
            <div>
              <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-secondary)] sm:text-xl">
                Inscreva-se em palestras e oficinas, confirme presença no dia
                pelo QR Code e receba o certificado, que vale como medalha no
                seu perfil.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <ButtonLink to="/eventos" size="lg">
                  Ver programação
                </ButtonLink>
                <ButtonLink to="/#validar" variant="outline" size="lg">
                  Validar certificado
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>

        <a
          href="#fluxo-academico"
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-1.5 rounded-md text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-primary-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] lg:flex"
        >
          Como funciona
          <ChevronDown className="size-4" aria-hidden />
        </a>
      </section>

      <div className="mx-auto w-full max-w-[76rem] px-4 sm:px-6 lg:px-8">
        <SecaoProcesso />
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
