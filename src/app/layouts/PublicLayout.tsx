import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../../modules/auth'
import { Button } from '../../shared/ui'

export const PublicLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Cabeçalho Público */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-black text-blue-600 tracking-tight hover:text-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1"
          >
            <span>Muttley</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Eventos FATEC
            </span>
          </Link>

          <nav
            className="flex items-center gap-2 sm:gap-4"
            aria-label="Navegação principal"
          >
            <Link
              to="/eventos"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-2 py-1 rounded focus-visible:ring-2"
            >
              Eventos
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={user?.role === 'ADMIN' ? '/admin/inicio' : '/user/inicio'}
                >
                  <Button variant="primary" size="sm">
                    {user?.role === 'ADMIN' ? 'Painel Admin' : 'Meu Painel'}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  aria-label="Encerrar sessão"
                >
                  Sair
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="sm">
                  Entrar
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Rodapé institucional */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Muttley — Gestão de Eventos Acadêmicos e Certificados</span>
          <span>FATEC Zona Leste &copy; 2026</span>
        </div>
      </footer>
    </div>
  )
}
