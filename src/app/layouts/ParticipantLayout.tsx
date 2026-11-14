import React from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AvatarPessoa, useAuth } from '../../modules/auth'
import { PageTransition } from '../../shared/motion'
import { m } from 'motion/react'
import {
  ChevronDown,
  LogOut,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  UserRound,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../shared/ui/shadcn/dropdown-menu'
import { useTheme } from '../../shared/theme'
import { PARTICIPANT_EVENTS_PATH } from '../../modules/eventos'
import {
  Logo,
  DashboardIcon,
  CalendarIcon,
  AwardIcon,
  MedalIcon,
} from '../../shared/ui'

export const ParticipantLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
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
    <div className="min-h-dvh bg-[var(--color-bg-page)] flex flex-col text-[var(--color-text-primary)] font-sans antialiased selection:bg-[var(--color-primary-subtle)] selection:text-[var(--color-primary-active)]">
      {/* Barra superior */}
      <header className="bg-[var(--color-bg-page)]/95 backdrop-blur-md border-b border-[var(--color-border)]/60 sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
        <div className="max-w-[76rem] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/user/inicio"
              className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-md"
              aria-label="Muttley, início do participante"
            >
              <Logo className="h-7 w-auto" />
            </Link>
          </div>

          {/* Tudo da conta fica no menu da foto: perfil, dados, tema e sair */}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Menu da conta"
              className="flex items-center gap-2.5 rounded-full p-0.5 sm:pr-3 transition-colors hover:bg-[var(--color-bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] data-[state=open]:bg-[var(--color-bg-hover)]"
            >
              <AvatarPessoa className="size-9 text-xs" />
              <span className="hidden sm:block text-sm font-semibold max-w-40 truncate">
                {user?.nome?.split(' ')[0] || 'Participante'}
              </span>
              <ChevronDown
                className="hidden sm:block size-4 text-[var(--color-text-muted)]"
                aria-hidden
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-64">
              <DropdownMenuLabel className="flex items-center gap-3 font-normal">
                <AvatarPessoa className="size-10 text-sm" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {user?.nome || 'Participante'}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/user/perfil">
                  <UserRound />
                  Meu perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/user/perfil/editar">
                  <Settings />
                  Configurações
                </Link>
              </DropdownMenuItem>
              {user?.role === 'ADMIN' && (
                <DropdownMenuItem asChild>
                  <Link to="/admin/inicio">
                    <ShieldCheck />
                    Painel da coordenação
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={toggleTheme}>
                {theme === 'light' ? <Moon /> : <Sun />}
                {theme === 'light' ? 'Tema escuro' : 'Tema claro'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>
                <LogOut />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            Início
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
            Meus certificados
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
            Minhas medalhas
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
            Explorar eventos
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
        Muttley &copy; {new Date().getFullYear()} — eventos acadêmicos e
        certificados
      </footer>

      {/* Barra inferior no celular */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-bg-surface)]/98 backdrop-blur-md border-t border-[var(--color-border)] flex items-center justify-around py-1.5 px-2 shadow-lg"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        aria-label="Navegação rápida móvel"
      >
        <Link
          to="/user/inicio"
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-sm transition-colors ${
            isTabActive('/user/inicio')
              ? 'text-[var(--color-primary-text)] font-semibold'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <DashboardIcon size={20} />
          <span className="text-xs mt-0.5">Início</span>
          {isTabActive('/user/inicio') && (
            <m.span
              layoutId="participant-mobile-active"
              className="absolute inset-x-2 top-0 h-0.5 bg-[var(--color-primary)]"
            />
          )}
        </Link>

        <Link
          to={PARTICIPANT_EVENTS_PATH}
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-sm transition-colors ${
            isTabActive(PARTICIPANT_EVENTS_PATH)
              ? 'text-[var(--color-primary-text)] font-semibold'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <CalendarIcon size={20} />
          <span className="text-xs mt-0.5">Eventos</span>
          {isTabActive(PARTICIPANT_EVENTS_PATH) && (
            <m.span
              layoutId="participant-mobile-active"
              className="absolute inset-x-2 top-0 h-0.5 bg-[var(--color-primary)]"
            />
          )}
        </Link>

        <Link
          to="/user/certificados"
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-sm transition-colors ${
            isTabActive('/user/certificados')
              ? 'text-[var(--color-primary-text)] font-semibold'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <AwardIcon size={20} />
          <span className="text-xs mt-0.5">Certificados</span>
          {isTabActive('/user/certificados') && (
            <m.span
              layoutId="participant-mobile-active"
              className="absolute inset-x-2 top-0 h-0.5 bg-[var(--color-primary)]"
            />
          )}
        </Link>

        <Link
          to="/user/medalhas"
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-sm transition-colors ${
            isTabActive('/user/medalhas')
              ? 'text-[var(--color-primary-text)] font-semibold'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <MedalIcon size={20} />
          <span className="text-xs mt-0.5">Medalhas</span>
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
