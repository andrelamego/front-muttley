import React, { useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../modules/auth'
import {
  Button,
  Logo,
  MenuIcon,
  ThemeToggle,
  XIcon,
  ButtonLink,
} from '../../shared/ui'
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
      <header className="fixed top-0 left-0 right-0 w-full z-40 bg-[var(--color-bg-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="h-16 max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo Único */}
          <Link
            to="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-md py-1 px-1"
            aria-label="Página inicial do Muttley"
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
                  className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
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
                    <ButtonLink to="/user/inicio" variant="outline" size="sm">
                      Painel do participante
                    </ButtonLink>
                    <ButtonLink to="/admin/inicio" variant="primary" size="sm">
                      Coordenação
                    </ButtonLink>
                  </>
                ) : (
                  <ButtonLink to="/user/inicio" variant="primary" size="sm">
                    Meu painel
                  </ButtonLink>
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
                <ButtonLink to="/login" variant="primary" size="sm">
                  Entrar
                </ButtonLink>
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
              className="p-2 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
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
                  className="block text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary-text)] hover:bg-[var(--color-bg-muted)] px-3 py-2 rounded-md"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-[var(--color-border)] flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    {user?.role === 'ADMIN' ? (
                      <>
                        <ButtonLink
                          to="/user/inicio"
                          onClick={() => setIsMobileMenuOpen(false)}
                          variant="outline"
                          size="md"
                          fullWidth
                          className="w-full"
                        >
                          Painel do participante
                        </ButtonLink>
                        <ButtonLink
                          to="/admin/inicio"
                          onClick={() => setIsMobileMenuOpen(false)}
                          variant="primary"
                          size="md"
                          fullWidth
                          className="w-full"
                        >
                          Coordenação
                        </ButtonLink>
                      </>
                    ) : (
                      <ButtonLink
                        to="/user/inicio"
                        onClick={() => setIsMobileMenuOpen(false)}
                        variant="primary"
                        size="md"
                        fullWidth
                        className="w-full"
                      >
                        Meu painel
                      </ButtonLink>
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
                    <ButtonLink
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      variant="outline"
                      size="md"
                      fullWidth
                      className="w-full"
                    >
                      Entrar
                    </ButtonLink>
                    <ButtonLink
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      variant="primary"
                      size="md"
                      fullWidth
                      className="w-full"
                    >
                      Entrar
                    </ButtonLink>
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

      {/* Rodapé enxuto: marca, atalhos e créditos numa faixa só */}
      <footer className="bg-[var(--color-bg-subtle)] border-t border-[var(--color-border)] py-8 text-sm text-[var(--color-text-secondary)]">
        <div className="max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 max-w-sm">
            <Logo className="h-6 w-auto" />
            <p className="text-xs leading-relaxed">
              Eventos acadêmicos da Fatec com inscrição on-line, presença por QR
              Code e certificados que qualquer pessoa pode validar.
            </p>
          </div>
          <nav aria-label="Rodapé">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
              <li>
                <Link
                  to="/eventos"
                  className="hover:text-[var(--color-primary-text)]"
                >
                  Programação
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-[var(--color-primary-text)]"
                >
                  Área do participante
                </Link>
              </li>
              <li>
                <Link
                  to="/#validar"
                  className="font-semibold text-[var(--color-primary-text)] hover:underline"
                >
                  Validar certificado
                </Link>
              </li>
            </ul>
          </nav>
          <span className="text-xs text-[var(--color-text-muted)]">
            &copy; {new Date().getFullYear()} Muttley
          </span>
        </div>
      </footer>
    </div>
  )
}
