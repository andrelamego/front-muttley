import React from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../modules/auth'
import { PageTransition } from '../../shared/motion'
import { m } from 'motion/react'
import { PARTICIPANT_EVENTS_PATH } from '../../modules/eventos'
import {
  Button,
  Logo,
  DashboardIcon,
  CalendarIcon,
  AwardIcon,
  MedalIcon,
  LogOutIcon,
  ThemeToggle,
} from '../../shared/ui'

export const ParticipantLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true, state: {} })
  }

  const isTabActive = (path: string) => {
    if (path === '/user/inicio') return location.pathname === '/user/inicio'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col text-[var(--color-text-primary)] font-sans antialiased selection:bg-[var(--color-primary-subtle)] selection:text-[var(--color-primary-active)]">
      {/* Barra Superior Fiel ao Stitch */}
      <header className="bg-[var(--color-bg-page)]/95 backdrop-blur-md border-b border-[var(--color-border)]/60 sticky top-0 z-30">
        <div className="max-w-[76rem] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/user/inicio"
              className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-none"
              aria-label="Painel do Participante Muttley"
            >
              <Logo className="h-7 w-auto" />
            </Link>
            <span className="hidden sm:inline-block font-mono text-xs uppercase px-2 py-0.5 rounded-none bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]/60">
              Meu Painel
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                {user?.nome || 'Participante'}
              </span>
              <span className="text-[11px] text-[var(--color-text-secondary)]">
                {user?.email}
              </span>
            </div>

            <ThemeToggle />

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary-text)] hover:bg-[var(--color-bg-subtle)]"
              aria-label="Sair da conta"
              leftIcon={<LogOutIcon size={14} />}
            >
              Sair
            </Button>
          </div>
        </div>

        {/* Abas de Navegação Desktop */}
        <nav
          className="hidden md:flex max-w-[76rem] mx-auto px-4 sm:px-6 items-center gap-6 text-sm border-t border-[var(--color-bg-muted)]"
          aria-label="Navegação do participante"
        >
          <Link
            to="/user/inicio"
            className={`relative py-3 font-medium transition-colors ${
              isTabActive('/user/inicio')
                ? 'text-[var(--color-primary-text)] font-semibold'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Meu Painel
            {isTabActive('/user/inicio') && (
              <m.span
                layoutId="participant-desktop-active"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--color-primary)]"
              />
            )}
          </Link>
          <Link
            to="/user/certificados"
            className={`relative py-3 font-medium transition-colors ${
              isTabActive('/user/certificados')
                ? 'text-[var(--color-primary-text)] font-semibold'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Meus Certificados
            {isTabActive('/user/certificados') && (
              <m.span
                layoutId="participant-desktop-active"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--color-primary)]"
              />
            )}
          </Link>
          <Link
            to="/user/medalhas"
            className={`relative py-3 font-medium transition-colors ${
              isTabActive('/user/medalhas')
                ? 'text-[var(--color-primary-text)] font-semibold'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Minhas Medalhas
            {isTabActive('/user/medalhas') && (
              <m.span
                layoutId="participant-desktop-active"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--color-primary)]"
              />
            )}
          </Link>
          <Link
            to={PARTICIPANT_EVENTS_PATH}
            className={`relative py-3 font-medium transition-colors ${
              isTabActive(PARTICIPANT_EVENTS_PATH)
                ? 'text-[var(--color-primary-text)] font-semibold'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Explorar Eventos
            {isTabActive(PARTICIPANT_EVENTS_PATH) && (
              <m.span
                layoutId="participant-desktop-active"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--color-primary)]"
              />
            )}
          </Link>
        </nav>
      </header>

      {/* Conteúdo com espaçamento inferior para a barra mobile */}
      <main className="flex-1 pb-20 md:pb-8">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      {/* Rodapé Desktop */}
      <footer className="hidden md:block bg-[var(--color-bg-subtle)] border-t border-[var(--color-border)]/60 py-4 text-center text-xs text-[var(--color-text-muted)]">
        Muttley &copy; {new Date().getFullYear()} — Plataforma Acadêmica de
        Gestão e Certificados
      </footer>

      {/* BARRA INFERIOR MOBILE (Bottom Navigation Bar) Fiel ao Stitch */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-bg-surface)]/98 backdrop-blur-md border-t border-[var(--color-border)] flex items-center justify-around py-1.5 px-2 shadow-lg"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        aria-label="Navegação rápida móvel"
      >
        <Link
          to="/user/inicio"
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-none transition-colors ${
            isTabActive('/user/inicio')
              ? 'text-[var(--color-primary-text)] font-semibold'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <DashboardIcon size={20} />
          <span className="text-[11px] mt-0.5">Painel</span>
          {isTabActive('/user/inicio') && (
            <m.span
              layoutId="participant-mobile-active"
              className="absolute inset-x-2 top-0 h-0.5 bg-[var(--color-primary)]"
            />
          )}
        </Link>

        <Link
          to={PARTICIPANT_EVENTS_PATH}
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-none transition-colors ${
            isTabActive(PARTICIPANT_EVENTS_PATH)
              ? 'text-[var(--color-primary-text)] font-semibold'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <CalendarIcon size={20} />
          <span className="text-[11px] mt-0.5">Eventos</span>
          {isTabActive(PARTICIPANT_EVENTS_PATH) && (
            <m.span
              layoutId="participant-mobile-active"
              className="absolute inset-x-2 top-0 h-0.5 bg-[var(--color-primary)]"
            />
          )}
        </Link>

        <Link
          to="/user/certificados"
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-none transition-colors ${
            isTabActive('/user/certificados')
              ? 'text-[var(--color-primary-text)] font-semibold'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <AwardIcon size={20} />
          <span className="text-[11px] mt-0.5">Certificados</span>
          {isTabActive('/user/certificados') && (
            <m.span
              layoutId="participant-mobile-active"
              className="absolute inset-x-2 top-0 h-0.5 bg-[var(--color-primary)]"
            />
          )}
        </Link>

        <Link
          to="/user/medalhas"
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-none transition-colors ${
            isTabActive('/user/medalhas')
              ? 'text-[var(--color-primary-text)] font-semibold'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <MedalIcon size={20} />
          <span className="text-[11px] mt-0.5">Medalhas</span>
          {isTabActive('/user/medalhas') && (
            <m.span
              layoutId="participant-mobile-active"
              className="absolute inset-x-2 top-0 h-0.5 bg-[var(--color-primary)]"
            />
          )}
        </Link>
      </nav>
    </div>
  )
}
