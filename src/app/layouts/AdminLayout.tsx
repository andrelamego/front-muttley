import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../modules/auth'
import { Button, Badge } from '../../shared/ui'

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col text-slate-900">
      {/* Barra de Administração Superior */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              to="/admin/inicio"
              className="flex items-center gap-2 text-xl font-black text-slate-900 tracking-tight hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1"
            >
              <span>Muttley</span>
              <Badge variant="warning" size="sm">
                ADMIN
              </Badge>
            </Link>

            <nav
              className="hidden md:flex items-center gap-1 text-sm font-medium"
              aria-label="Navegação administrativa"
            >
              <Link
                to="/admin/inicio"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/admin/inicio'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Painel Geral
              </Link>
              <Link
                to="/admin/eventos"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  location.pathname.startsWith('/admin/eventos')
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Gestão de Eventos
              </Link>
              <Link
                to="/eventos"
                className="px-3 py-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              >
                Visão Pública ↗
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-900">
                {user?.nome || 'Administrador'}
              </span>
              <span className="text-[11px] text-slate-500">{user?.email}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              aria-label="Sair da administração"
            >
              Encerrar Sessão
            </Button>
          </div>
        </div>

        {/* Barra de Navegação Mobile para Admin */}
        <nav
          className="md:hidden flex items-center justify-around text-xs border-t border-slate-100 py-2 bg-slate-50"
          aria-label="Navegação administrativa rápida"
        >
          <Link
            to="/admin/inicio"
            className={`px-3 py-1.5 rounded font-medium ${
              location.pathname === '/admin/inicio'
                ? 'bg-blue-600 text-white'
                : 'text-slate-700'
            }`}
          >
            Painel
          </Link>
          <Link
            to="/admin/eventos"
            className={`px-3 py-1.5 rounded font-medium ${
              location.pathname.startsWith('/admin/eventos')
                ? 'bg-blue-600 text-white'
                : 'text-slate-700'
            }`}
          >
            Eventos
          </Link>
          <Link to="/eventos" className="px-3 py-1.5 text-slate-600">
            Visão Pública
          </Link>
        </nav>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Área Administrativa Muttley &copy; 2026 — FATEC Zona Leste
      </footer>
    </div>
  )
}
