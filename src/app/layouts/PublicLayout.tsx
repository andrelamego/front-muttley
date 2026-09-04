import React, { useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../modules/auth'
import { Button, Logo, MenuIcon, XIcon } from '../../shared/ui'

export const PublicLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true, state: {} })
  }

  const navItems = [
    { to: '/', label: 'Início', exact: true },
    { to: '/eventos', label: 'Eventos' },
    { to: '/#fluxo-academico', label: 'Como funciona' },
  ]

  const isItemActive = (to: string, exact?: boolean) => {
    if (to.startsWith('/#')) return false
    return exact ? location.pathname === to : location.pathname.startsWith(to)
  }

  return (
    <div className="min-h-screen bg-[#fcf9f5] flex flex-col text-[#1c1c1a] font-sans antialiased selection:bg-[#ffdad2] selection:text-[#3d0600]">
      {/* Cabeçalho Público Fiel ao Stitch (64px) */}
      <header className="fixed top-0 left-0 right-0 w-full z-40 bg-[#fcf9f5]/95 backdrop-blur-md border-b border-[#ddc0ba]/60 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
        <div className="h-16 max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo Único */}
          <Link
            to="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b1705] rounded py-1 px-1"
            aria-label="Página inicial do Muttley Acadêmico"
          >
            <Logo className="h-8 w-auto" />
          </Link>

          {/* Navegação Desktop */}
          <nav
            className="hidden md:flex items-center gap-1 sm:gap-2"
            aria-label="Navegação principal"
          >
            {navItems.map((item) => {
              const active = isItemActive(item.to, item.exact)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-sm font-medium px-3 py-1.5 rounded transition-colors ${
                    active
                      ? 'bg-[#f0edea] text-[#6b1705] font-semibold'
                      : 'text-[#57423d] hover:text-[#1c1c1a] hover:bg-[#f6f3ef]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Ações de Conta Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
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
                  onClick={handleLogout}
                  aria-label="Encerrar sessão"
                >
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-[#57423d] hover:text-[#6b1705] transition-colors px-3 py-1.5"
                >
                  Entrar
                </Link>
                <Link to="/login">
                  <Button variant="primary" size="sm">
                    Área Restrita
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Menu Mobile Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              className="p-2 rounded text-[#57423d] hover:text-[#1c1c1a] hover:bg-[#f0edea] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b1705]"
            >
              {isMobileMenuOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-[#ddc0ba] bg-[#fcf9f5] px-4 py-4 space-y-2 shadow-md">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm font-medium text-[#57423d] hover:text-[#6b1705] hover:bg-[#f0edea] px-3 py-2 rounded"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#ddc0ba] flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to={
                      user?.role === 'ADMIN' ? '/admin/inicio' : '/user/inicio'
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <Button variant="primary" size="md" fullWidth>
                      {user?.role === 'ADMIN' ? 'Painel Admin' : 'Meu Painel'}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      handleLogout()
                    }}
                  >
                    Sair da conta
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <Button variant="outline" size="md" fullWidth>
                      Entrar
                    </Button>
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <Button variant="primary" size="md" fullWidth>
                      Área Restrita
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Conteúdo com offset do header fixo (64px) */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* Rodapé Editorial Institucional */}
      <footer className="bg-[#f6f3ef] border-t border-[#ddc0ba] py-12 text-[#57423d] text-sm">
        <div className="max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[#ddc0ba]">
            {/* Coluna da Marca */}
            <div className="md:col-span-6 flex flex-col gap-3">
              <Logo className="h-7 w-auto" />
              <p className="text-xs text-[#57423d] max-w-md leading-relaxed mt-1">
                Infraestrutura acadêmica para gestão de eventos, conferências,
                registro rigoroso de presença e emissão pública de certificados
                com código de validação.
              </p>
            </div>

            {/* Coluna Navegação */}
            <div className="md:col-span-3 flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#1c1c1a] font-semibold">
                Navegação
              </span>
              <Link
                to="/eventos"
                className="text-xs hover:text-[#6b1705] transition-colors py-0.5"
              >
                Catálogo de Eventos
              </Link>
              <a
                href="#fluxo-academico"
                className="text-xs hover:text-[#6b1705] transition-colors py-0.5"
              >
                Como Funciona o Ciclo
              </a>
              <Link
                to="/login"
                className="text-xs hover:text-[#6b1705] transition-colors py-0.5"
              >
                Área do Participante
              </Link>
            </div>

            {/* Coluna Validação de Certificados */}
            <div className="md:col-span-3 flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#1c1c1a] font-semibold">
                Validação Pública
              </span>
              <p className="text-xs text-[#57423d] leading-relaxed">
                Consulte a autenticidade de certificados emitidos através do
                código único impresso no documento.
              </p>
              <Link
                to="/#validar"
                className="text-xs font-semibold text-[#6b1705] hover:underline inline-flex items-center gap-1 mt-1"
              >
                Consultar Certificado &rarr;
              </Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8a726c]">
            <span>
              &copy; {new Date().getFullYear()} Plataforma Acadêmica Muttley.
              Todos os direitos reservados.
            </span>
            <span className="font-mono uppercase tracking-wider">
              Rigor Acadêmico • Preservação Digital
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
