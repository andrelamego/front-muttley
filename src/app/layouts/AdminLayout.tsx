import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../modules/auth'
import {
  Button,
  DashboardIcon,
  CalendarIcon,
  PlusIcon,
  ExternalLinkIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
  Logo,
} from '../../shared/ui'

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null)
  const drawerRef = useRef<HTMLDivElement | null>(null)

  const handleLogout = useCallback(() => {
    logout()
    navigate('/login', { replace: true, state: {} })
  }, [logout, navigate])

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
    if (menuTriggerRef.current) {
      menuTriggerRef.current.focus()
    }
  }, [])

  // Trata tecla Escape para fechar o drawer móvel
  useEffect(() => {
    if (!isMobileMenuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileMenu()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobileMenuOpen, closeMobileMenu])

  // Checa se Gestão de Eventos está ativa
  const isGestaoEventosActive =
    location.pathname === '/admin/eventos' ||
    (location.pathname.startsWith('/admin/eventos/') &&
      location.pathname !== '/admin/eventos/novo')

  const navItems = [
    {
      to: '/admin/inicio',
      label: 'Painel',
      icon: <DashboardIcon size={18} />,
      isActive: location.pathname === '/admin/inicio',
    },
    {
      to: '/admin/eventos',
      label: 'Eventos',
      icon: <CalendarIcon size={18} />,
      isActive: isGestaoEventosActive,
    },
    {
      to: '/admin/eventos/novo',
      label: 'Criar Evento',
      icon: <PlusIcon size={18} />,
      isActive: location.pathname === '/admin/eventos/novo',
    },
  ]

  // Iniciais do usuário para avatar
  const getInitials = (name?: string) => {
    if (!name) return 'AD'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-[#fcf9f5] flex flex-col lg:flex-row text-[#1c1c1a] font-sans antialiased selection:bg-[#ffdad2] selection:text-[#3d0600]">
      {/* Skip Link para acessibilidade de teclado */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#6b1705] focus:text-white focus:rounded focus:shadow-md focus:outline-none"
      >
        Pular para o conteúdo principal
      </a>

      {/* Barra de Topo no Mobile (< lg) */}
      <header className="lg:hidden bg-[#f6f3ef] text-[#1c1c1a] px-4 h-16 flex items-center justify-between border-b border-[#ddc0ba] sticky top-0 z-30 shadow-xs">
        <Link
          to="/admin/inicio"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b1705] rounded p-1"
          aria-label="Painel Administrativo Muttley"
        >
          <Logo className="h-7 w-auto" />
        </Link>

        <button
          ref={menuTriggerRef}
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="admin-drawer"
          aria-label={
            isMobileMenuOpen
              ? 'Fechar menu de navegação'
              : 'Abrir menu de navegação'
          }
          className="p-2 rounded text-[#57423d] hover:text-[#1c1c1a] hover:bg-[#f0edea] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b1705]"
        >
          {isMobileMenuOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
        </button>
      </header>

      {/* Drawer Móvel Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#1c1c1a]/40 backdrop-blur-xs lg:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Persistente no Desktop (256px) / Drawer no Mobile */}
      <aside
        id="admin-drawer"
        ref={drawerRef}
        className={`fixed inset-y-0 left-0 z-50 w-64 min-w-[256px] bg-[#f6f3ef] text-[#1c1c1a] flex flex-col border-r border-[#ddc0ba] transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navegação administrativa"
      >
        {/* Cabeçalho da Sidebar com Logo Único */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#ddc0ba]/60 shrink-0">
          <Link
            to="/admin/inicio"
            onClick={closeMobileMenu}
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b1705] rounded"
          >
            <Logo className="h-7 w-auto" />
          </Link>

          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Fechar menu lateral"
            className="lg:hidden p-1.5 rounded text-[#57423d] hover:text-[#1c1c1a] hover:bg-[#f0edea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b1705]"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Links Principais de Navegação */}
        <div className="flex-1 px-4 py-6 overflow-y-auto space-y-1.5">
          <div className="px-3 pb-2 font-mono text-[11px] font-semibold text-[#8a726c] uppercase tracking-wider">
            Módulos Principais
          </div>

          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b1705] ${
                item.isActive
                  ? 'bg-[#6b1705] text-white shadow-xs font-semibold'
                  : 'text-[#57423d] hover:bg-[#f0edea] hover:text-[#1c1c1a]'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}

          <div className="pt-4 pb-2 px-3">
            <hr className="border-[#ddc0ba]/60" />
          </div>

          <div className="px-3 pb-2 font-mono text-[11px] font-semibold text-[#8a726c] uppercase tracking-wider">
            Visão Externa
          </div>

          <Link
            to="/eventos"
            onClick={closeMobileMenu}
            className="flex items-center justify-between px-3 py-2.5 rounded text-sm text-[#57423d] hover:bg-[#f0edea] hover:text-[#1c1c1a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b1705]"
          >
            <span className="flex items-center gap-3">
              <ExternalLinkIcon size={18} className="shrink-0 text-[#8a726c]" />
              <span>Ver página pública</span>
            </span>
          </Link>
        </div>

        {/* Rodapé da Sidebar: Usuário e Sair */}
        <div className="p-4 border-t border-[#ddc0ba] bg-[#f0edea]/50 shrink-0">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-full bg-[#ffdad2] text-[#6b1705] font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-[#ddc0ba]">
              {getInitials(user?.nome)}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-[#1c1c1a] block truncate">
                {user?.nome || 'Prof. Dr. Administrador'}
              </span>
              <span className="text-[11px] text-[#57423d] block truncate">
                Comissão Organizadora
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            fullWidth
            className="border-[#ddc0ba] bg-white text-[#57423d] hover:text-[#6b1705] hover:bg-[#f6f3ef] justify-center gap-2 text-xs"
            leftIcon={<LogOutIcon size={14} />}
          >
            Sair
          </Button>
        </div>
      </aside>

      {/* Conteúdo Principal com Container Desktop-First */}
      <div className="flex-1 flex flex-col min-w-0">
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 focus:outline-none"
        >
          <Outlet />
        </main>

        <footer className="border-t border-[#ddc0ba]/60 bg-[#f6f3ef] py-4 px-6 text-center text-xs text-[#8a726c]">
          Área de Gestão Muttley &copy; {new Date().getFullYear()} — Plataforma
          de Eventos Acadêmicos
        </footer>
      </div>
    </div>
  )
}
