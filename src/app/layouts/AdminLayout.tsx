import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../modules/auth'
import { PageTransition } from '../../shared/motion'
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
  ThemeToggle,
  AwardIcon,
  UsersIcon,
  BookOpenIcon,
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
    {
      to: '/admin/certificados',
      label: 'Certificados',
      icon: <AwardIcon size={18} />,
      isActive: location.pathname === '/admin/certificados',
    },
    {
      to: '/admin/pessoas',
      label: 'Pessoas',
      icon: <UsersIcon size={18} />,
      isActive: location.pathname === '/admin/pessoas',
    },
    {
      to: '/admin/cadastros',
      label: 'Cadastros',
      icon: <BookOpenIcon size={18} />,
      isActive: location.pathname === '/admin/cadastros',
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
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col lg:flex-row text-[var(--color-text-primary)] font-sans antialiased selection:bg-[var(--color-primary-subtle)] selection:text-[var(--color-primary-active)]">
      {/* Skip Link para acessibilidade de teclado */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-primary)] focus:text-white focus:rounded-none focus:shadow-md focus:outline-none"
      >
        Pular para o conteúdo principal
      </a>

      {/* Barra de Topo no Mobile (< lg) */}
      <header className="lg:hidden bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] px-4 h-16 flex items-center justify-between border-b border-[var(--color-border)] sticky top-0 z-30 shadow-xs">
        <Link
          to="/admin/inicio"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-none p-1"
          aria-label="Painel Administrativo Muttley"
        >
          <Logo className="h-7 w-auto" />
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
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
            className="p-2 rounded-none text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            {isMobileMenuOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </header>

      {/* Drawer Móvel Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[var(--color-text-primary)]/40 backdrop-blur-xs lg:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Persistente no Desktop (256px) / Drawer no Mobile */}
      <aside
        id="admin-drawer"
        ref={drawerRef}
        className={`fixed inset-y-0 left-0 z-50 w-64 min-w-[256px] bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] flex flex-col border-r border-[var(--color-border)] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navegação administrativa"
      >
        {/* Cabeçalho da Sidebar com Logo Único */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[var(--color-border)]/60 shrink-0">
          <Link
            to="/admin/inicio"
            onClick={closeMobileMenu}
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-none"
          >
            <Logo className="h-7 w-auto" />
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden lg:inline-flex" />
            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Fechar menu lateral"
              className="lg:hidden p-1.5 rounded-none text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              <XIcon size={20} />
            </button>
          </div>
        </div>

        {/* Links Principais de Navegação */}
        <div className="flex-1 px-4 py-6 overflow-y-auto space-y-1.5">
          <div className="px-3 pb-2 font-mono text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            Módulos Principais
          </div>

          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-none text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                item.isActive
                  ? 'bg-[var(--color-primary)] text-white shadow-xs font-semibold'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}

          <div className="pt-4 pb-2 px-3">
            <hr className="border-[var(--color-border)]/60" />
          </div>

          <div className="px-3 pb-2 font-mono text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            Visão Externa
          </div>

          <Link
            to="/eventos"
            onClick={closeMobileMenu}
            className="flex items-center justify-between px-3 py-2.5 rounded-none text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <span className="flex items-center gap-3">
              <ExternalLinkIcon
                size={18}
                className="shrink-0 text-[var(--color-text-muted)]"
              />
              <span>Ver página pública</span>
            </span>
          </Link>
        </div>

        {/* Rodapé da Sidebar: Usuário e Sair */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-muted)]/50 shrink-0">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-primary-text)] font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-[var(--color-border)]">
              {getInitials(user?.nome)}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-[var(--color-text-primary)] block truncate">
                {user?.nome || 'Prof. Dr. Administrador'}
              </span>
              <span className="text-[11px] text-[var(--color-text-secondary)] block truncate">
                Comissão Organizadora
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            fullWidth
            className="border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary-text)] hover:bg-[var(--color-bg-subtle)] justify-center gap-2 text-xs"
            leftIcon={<LogOutIcon size={14} />}
          >
            Sair
          </Button>
        </div>
      </aside>

      {/* Conteúdo Principal com Container Desktop-First */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 focus:outline-none"
        >
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>

        <footer className="border-t border-[var(--color-border)]/60 bg-[var(--color-bg-subtle)] py-4 px-6 text-center text-xs text-[var(--color-text-muted)]">
          Área de Gestão Muttley &copy; {new Date().getFullYear()} — Plataforma
          de Eventos Acadêmicos
        </footer>
      </div>
    </div>
  )
}
