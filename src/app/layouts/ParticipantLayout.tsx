import React from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../modules/auth'
import {
  Button,
  Logo,
  DashboardIcon,
  CalendarIcon,
  AwardIcon,
  MedalIcon,
  LogOutIcon,
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
    <div className="min-h-screen bg-[#fcf9f5] flex flex-col text-[#1c1c1a] font-sans antialiased selection:bg-[#ffdad2] selection:text-[#3d0600]">
      {/* Barra Superior Fiel ao Stitch */}
      <header className="bg-[#fcf9f5]/95 backdrop-blur-md border-b border-[#ddc0ba]/60 sticky top-0 z-30">
        <div className="max-w-[76rem] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/user/inicio"
              className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b1705] rounded"
              aria-label="Painel do Participante Muttley"
            >
              <Logo className="h-7 w-auto" />
            </Link>
            <span className="hidden sm:inline-block font-mono text-xs uppercase px-2 py-0.5 rounded bg-[#f0edea] text-[#57423d] border border-[#ddc0ba]/60">
              Meu Painel
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-[#1c1c1a]">
                {user?.nome || 'Participante'}
              </span>
              <span className="text-[11px] text-[#57423d]">{user?.email}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-[#ddc0ba] bg-white text-[#57423d] hover:text-[#6b1705] hover:bg-[#f6f3ef]"
              aria-label="Sair da conta"
              leftIcon={<LogOutIcon size={14} />}
            >
              Sair
            </Button>
          </div>
        </div>

        {/* Abas de Navegação Desktop */}
        <nav
          className="hidden md:flex max-w-[76rem] mx-auto px-4 sm:px-6 items-center gap-6 text-sm border-t border-[#f0edea]"
          aria-label="Navegação do participante"
        >
          <Link
            to="/user/inicio"
            className={`py-3 font-medium border-b-2 transition-colors ${
              isTabActive('/user/inicio')
                ? 'border-[#6b1705] text-[#6b1705] font-semibold'
                : 'border-transparent text-[#57423d] hover:text-[#1c1c1a]'
            }`}
          >
            Meu Painel
          </Link>
          <Link
            to="/user/certificados"
            className={`py-3 font-medium border-b-2 transition-colors ${
              isTabActive('/user/certificados')
                ? 'border-[#6b1705] text-[#6b1705] font-semibold'
                : 'border-transparent text-[#57423d] hover:text-[#1c1c1a]'
            }`}
          >
            Meus Certificados
          </Link>
          <Link
            to="/user/medalhas"
            className={`py-3 font-medium border-b-2 transition-colors ${
              isTabActive('/user/medalhas')
                ? 'border-[#6b1705] text-[#6b1705] font-semibold'
                : 'border-transparent text-[#57423d] hover:text-[#1c1c1a]'
            }`}
          >
            Minhas Medalhas
          </Link>
          <Link
            to="/eventos"
            className={`py-3 font-medium border-b-2 transition-colors ${
              location.pathname === '/eventos'
                ? 'border-[#6b1705] text-[#6b1705] font-semibold'
                : 'border-transparent text-[#57423d] hover:text-[#1c1c1a]'
            }`}
          >
            Explorar Eventos
          </Link>
        </nav>
      </header>

      {/* Conteúdo com espaçamento inferior para a barra mobile */}
      <main className="flex-1 pb-20 md:pb-8">
        <Outlet />
      </main>

      {/* Rodapé Desktop */}
      <footer className="hidden md:block bg-[#f6f3ef] border-t border-[#ddc0ba]/60 py-4 text-center text-xs text-[#8a726c]">
        Muttley &copy; {new Date().getFullYear()} — Plataforma Acadêmica de
        Gestão e Certificados
      </footer>

      {/* BARRA INFERIOR MOBILE (Bottom Navigation Bar) Fiel ao Stitch */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#ffffff]/98 backdrop-blur-md border-t border-[#ddc0ba] flex items-center justify-around py-1.5 px-2 shadow-lg"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        aria-label="Navegação rápida móvel"
      >
        <Link
          to="/user/inicio"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded transition-colors ${
            isTabActive('/user/inicio')
              ? 'text-[#6b1705] font-semibold'
              : 'text-[#8a726c] hover:text-[#1c1c1a]'
          }`}
        >
          <DashboardIcon size={20} />
          <span className="text-[11px] mt-0.5">Painel</span>
        </Link>

        <Link
          to="/eventos"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded transition-colors ${
            location.pathname === '/eventos'
              ? 'text-[#6b1705] font-semibold'
              : 'text-[#8a726c] hover:text-[#1c1c1a]'
          }`}
        >
          <CalendarIcon size={20} />
          <span className="text-[11px] mt-0.5">Eventos</span>
        </Link>

        <Link
          to="/user/certificados"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded transition-colors ${
            isTabActive('/user/certificados')
              ? 'text-[#6b1705] font-semibold'
              : 'text-[#8a726c] hover:text-[#1c1c1a]'
          }`}
        >
          <AwardIcon size={20} />
          <span className="text-[11px] mt-0.5">Certificados</span>
        </Link>

        <Link
          to="/user/medalhas"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded transition-colors ${
            isTabActive('/user/medalhas')
              ? 'text-[#6b1705] font-semibold'
              : 'text-[#8a726c] hover:text-[#1c1c1a]'
          }`}
        >
          <MedalIcon size={20} />
          <span className="text-[11px] mt-0.5">Medalhas</span>
        </Link>
      </nav>
    </div>
  )
}
