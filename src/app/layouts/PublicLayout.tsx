import React, { useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../modules/auth'
import { Button, Logo, MenuIcon, ThemeToggle, XIcon } from '../../shared/ui'
import { PageTransition } from '../../shared/motion'
import { AnimatePresence, m } from 'motion/react'

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
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col text-[var(--color-text-primary)] font-sans antialiased selection:bg-[var(--color-primary-subtle)] selection:text-[var(--color-primary-active)]">
      {/* Cabeçalho Público Fiel ao Stitch (64px) */}
      <header className="fixed top-0 left-0 right-0 w-full z-40 bg-[var(--color-bg-page)]/95 backdrop-blur-md border-b border-[var(--color-border)]/60 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
        <div className="h-16 max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo Único */}
          <Link
            to="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-none py-1 px-1"
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
                  className={`text-sm font-medium px-3 py-1.5 rounded-none transition-colors ${
                    active
                      ? 'bg-[var(--color-bg-muted)] text-[var(--color-primary-text)] font-semibold'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Ações de Conta Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                {user?.role === 'ADMIN' ? (
                  <>
                    <Link to="/user/inicio">
                      <Button variant="outline" size="sm">
                        Painel do Usuário
                      </Button>
                    </Link>
                    <Link to="/admin/inicio">
                      <Button variant="primary" size="sm">
                        Painel Admin
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link to="/user/inicio">
                    <Button variant="primary" size="sm">
                      Meu Painel
                    </Button>
                  </Link>
                )}
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
                  className="text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-primary-text)] transition-colors px-3 py-1.5"
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
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              className="p-2 rounded-none text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              {isMobileMenuOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        <AnimatePresence initial={false}>
          {isMobileMenuOpen && (
            <m.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="md:hidden border-b border-[var(--color-border)] bg-[var(--color-bg-page)] px-4 py-4 space-y-2 shadow-md"
            >
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary-text)] hover:bg-[var(--color-bg-muted)] px-3 py-2 rounded-none"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-[var(--color-border)] flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    {user?.role === 'ADMIN' ? (
                      <>
                        <Link
                          to="/user/inicio"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full"
                        >
                          <Button variant="outline" size="md" fullWidth>
                            Painel do Usuário
                          </Button>
                        </Link>
                        <Link
                          to="/admin/inicio"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full"
                        >
                          <Button variant="primary" size="md" fullWidth>
                            Painel Admin
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <Link
                        to="/user/inicio"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full"
                      >
                        <Button variant="primary" size="md" fullWidth>
                          Meu Painel
                        </Button>
                      </Link>
                    )}
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
            </m.div>
          )}
        </AnimatePresence>
      </header>

      {/* Conteúdo com offset do header fixo (64px) */}
      <main className="flex-1 pt-16">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      {/* Rodapé Editorial Institucional */}
      <footer className="bg-[var(--color-bg-subtle)] border-t border-[var(--color-border)] py-12 text-[var(--color-text-secondary)] text-sm">
        <div className="max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[var(--color-border)]">
            {/* Coluna da Marca */}
            <div className="md:col-span-6 flex flex-col gap-3">
              <Logo className="h-7 w-auto" />
              <p className="text-xs text-[var(--color-text-secondary)] max-w-md leading-relaxed mt-1">
                Infraestrutura acadêmica para gestão de eventos, conferências,
                registro rigoroso de presença e emissão pública de certificados
                com código de validação.
              </p>
            </div>

            {/* Coluna Navegação */}
            <div className="md:col-span-3 flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-primary)] font-semibold">
                Navegação
              </span>
              <Link
                to="/eventos"
                className="text-xs hover:text-[var(--color-primary-text)] transition-colors py-0.5"
              >
                Catálogo de Eventos
              </Link>
              <a
                href="#fluxo-academico"
                className="text-xs hover:text-[var(--color-primary-text)] transition-colors py-0.5"
              >
                Como Funciona o Ciclo
              </a>
              <Link
                to="/login"
                className="text-xs hover:text-[var(--color-primary-text)] transition-colors py-0.5"
              >
                Área do Participante
              </Link>
            </div>

            {/* Coluna Validação de Certificados */}
            <div className="md:col-span-3 flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-primary)] font-semibold">
                Validação Pública
              </span>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Consulte a autenticidade de certificados emitidos através do
                código único impresso no documento.
              </p>
              <Link
                to="/#validar"
                className="text-xs font-semibold text-[var(--color-primary-text)] hover:underline inline-flex items-center gap-1 mt-1"
              >
                Consultar Certificado &rarr;
              </Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--color-text-muted)]">
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
