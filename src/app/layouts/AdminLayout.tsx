import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../modules/auth'
import {
  Button,
  Badge,
  DashboardIcon,
  CalendarIcon,
  PlusIcon,
  ExternalLinkIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
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

  // Checa se Gestão de Eventos está ativa (inclui edição e conclusão)
  const isGestaoEventosActive =
    location.pathname === '/admin/eventos' ||
    (location.pathname.startsWith('/admin/eventos/') &&
      location.pathname !== '/admin/eventos/novo')

  const navItems = [
    {
      to: '/admin/inicio',
      label: 'Painel Geral',
      icon: <DashboardIcon size={18} />,
      isActive: location.pathname === '/admin/inicio',
    },
    {
      to: '/admin/eventos',
      label: 'Gestão de Eventos',
      icon: <CalendarIcon size={18} />,
      isActive: isGestaoEventosActive,
    },
    {
      to: '/admin/eventos/novo',
      label: 'Novo Evento',
      icon: <PlusIcon size={18} />,
      isActive: location.pathname === '/admin/eventos/novo',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-900">
      {/* Skip Link para acessibilidade de teclado */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
      >
        Pular para o conteúdo principal
      </a>

      {/* Barra de Topo no Mobile (< lg) */}
      <header className="lg:hidden bg-slate-900 text-white px-4 h-16 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30 shadow-sm">
        <Link
          to="/admin/inicio"
          className="flex items-center gap-2 text-lg font-black tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded px-1"
        >
          <span>Muttley</span>
          <Badge variant="warning" size="sm">
            ADMIN
          </Badge>
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
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          {isMobileMenuOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
        </button>
      </header>

      {/* Drawer Móvel Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Persistente no Desktop / Drawer no Mobile */}
      <aside
        id="admin-drawer"
        ref={drawerRef}
        className={`fixed inset-y-0 left-0 z-50 w-72 lg:w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navegação administrativa"
      >
        {/* Cabeçalho da Sidebar */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <Link
            to="/admin/inicio"
            className="flex items-center gap-2 text-xl font-black text-white tracking-tight hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
          >
            <span>Muttley</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ADMIN
            </span>
          </Link>

          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Fechar menu lateral"
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Links Principais de Navegação */}
        <div className="flex-1 px-3 py-6 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Gestão &amp; Eventos
          </div>

          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                item.isActive
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}

          <div className="pt-4 pb-1 px-3">
            <hr className="border-slate-800" />
          </div>

          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Portais
          </div>

          <Link
            to="/eventos"
            onClick={closeMobileMenu}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <span className="flex items-center gap-3">
              <ExternalLinkIcon size={18} className="shrink-0 text-slate-400" />
              <span>Visão Pública</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              Catálogo
            </span>
          </Link>
        </div>

        {/* Rodapé da Sidebar: Usuário e Sair */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 shrink-0">
          <div className="mb-3 px-1">
            <span className="text-xs font-semibold text-white block truncate">
              {user?.nome || 'Administrador'}
            </span>
            <span className="text-[11px] text-slate-400 block truncate">
              {user?.email || 'admin@fatec.sp.gov.br'}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            fullWidth
            className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white justify-center gap-2 text-xs"
            leftIcon={<LogOutIcon size={14} />}
          >
            Encerrar Sessão
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

        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
          Área de Gestão Muttley &copy; 2026 — Plataforma de Eventos Acadêmicos
        </footer>
      </div>
    </div>
  )
}
