import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../modules/auth'
import { Button } from '../../shared/ui'

export const ParticipantLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Barra de Navegação Superior */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/user/inicio"
              className="flex items-center gap-1.5 text-xl font-black text-blue-600 tracking-tight hover:text-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1"
            >
              <span>Muttley</span>
            </Link>
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              Área do Participante
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-800">
                {user?.nome || 'Participante'}
              </span>
              <span className="text-[11px] text-slate-500">{user?.email}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              aria-label="Sair da conta"
            >
              Sair
            </Button>
          </div>
        </div>

        {/* Abas de Navegação */}
        <nav
          className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center gap-6 text-sm border-t border-slate-100"
          aria-label="Navegação do participante"
        >
          <Link
            to="/user/inicio"
            className={`py-2.5 font-medium border-b-2 transition-colors ${
              location.pathname === '/user/inicio'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Meu Painel
          </Link>
          <Link
            to="/eventos"
            className={`py-2.5 font-medium border-b-2 transition-colors ${
              location.pathname === '/eventos'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Explorar Eventos
          </Link>
        </nav>
      </header>

      {/* Conteúdo da Área do Participante */}
      <main className="flex-1 py-4">
        <Outlet />
      </main>

      {/* Rodapé simples */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        Muttley &copy; 2026 — Plataforma FATEC de Gestão Acadêmica
      </footer>
    </div>
  )
}
