import React, { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../modules/auth'
import { Logo, MenuIcon, ThemeToggle, XIcon, ButtonLink } from '../../shared/ui'
import { PageTransition } from '../../shared/motion'
import { MenuConta } from './MenuConta'
import { AnimatePresence, m } from 'motion/react'

export const PublicLayout: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Rolagem com inércia (Lenis) só nas páginas públicas: a roda do mouse desliza e
  // desacelera. No toque fica a rolagem nativa, e quem prefere menos movimento
  // rola sem animação (a Lenis respeita prefers-reduced-motion por padrão).
  const rolagem = useRef<Lenis | null>(null)
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      stopInertiaOnNavigate: true,
    })
    rolagem.current = lenis
    return () => {
      lenis.destroy()
      rolagem.current = null
    }
  }, [])

  // O roteador não rola sozinho: com âncora (/#validar), desliza até a seção;
  // sem âncora, uma página nova começa do topo.
  useEffect(() => {
    const t = window.setTimeout(() => {
      const alvo = location.hash
        ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
        : null
      if (location.hash && !alvo) return
      if (rolagem.current) {
        // -80: o cabeçalho fixo cobre o topo da seção.
        rolagem.current.scrollTo(alvo ?? 0, {
          offset: alvo ? -80 : 0,
          immediate: !alvo,
        })
      } else if (alvo) {
        alvo.scrollIntoView({ block: 'start' })
      } else {
        window.scrollTo(0, 0)
      }
    }, 60)
    return () => window.clearTimeout(t)
  }, [location.pathname, location.hash])

  const navItems = [
    { to: '/', label: 'Início', exact: true },
    { to: '/eventos', label: 'Eventos' },
    { to: '/#fluxo-academico', label: 'Como funciona' },
    { to: '/validar', label: 'Validar certificado' },
  ]

  const isItemActive = (to: string, exact?: boolean) => {
    if (to.startsWith('/#')) return false
    return exact ? location.pathname === to : location.pathname.startsWith(to)
  }

  return (
    <div className="min-h-dvh bg-[var(--color-bg-page)] flex flex-col text-[var(--color-text-primary)] font-sans antialiased selection:bg-[var(--color-primary-subtle)] selection:text-[var(--color-primary-active)]">
      {/* Cabeçalho Público Fiel ao Stitch (64px) */}
      <header className="fixed top-0 left-0 right-0 w-full z-40 bg-[var(--color-bg-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)] pt-[env(safe-area-inset-top)]">
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

          {/* Conta: logado, tudo fica no menu da foto; deslogado, entrar e criar conta */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <MenuConta comPainel />
            ) : (
              <>
                <ButtonLink to="/login" variant="ghost" size="sm">
                  Entrar
                </ButtonLink>
                <ButtonLink to="/cadastro" variant="primary" size="sm">
                  Criar conta
                </ButtonLink>
                {/* Mesma altura do botão pequeno, sem borda */}
                <ThemeToggle className="size-10 border-0 bg-transparent sm:size-9" />
              </>
            )}
          </div>

          {/* Menu Mobile Trigger */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated ? (
              <MenuConta comPainel />
            ) : (
              <ThemeToggle className="size-10 border-0 bg-transparent" />
            )}
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
              {!isAuthenticated && (
                <div className="pt-3 border-t border-[var(--color-border)] flex flex-col gap-2">
                  <ButtonLink
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="outline"
                    size="md"
                    fullWidth
                  >
                    Entrar
                  </ButtonLink>
                  <ButtonLink
                    to="/cadastro"
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    size="md"
                    fullWidth
                  >
                    Criar conta
                  </ButtonLink>
                </div>
              )}
            </m.div>
          )}
        </AnimatePresence>
      </header>

      {/* Conteúdo com offset do header fixo (64px) */}
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top))]">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      {/* Rodapé enxuto: marca, atalhos e créditos numa faixa só */}
      <footer className="bg-[var(--color-bg-subtle)] border-t border-[var(--color-border)] py-8 text-sm text-[var(--color-text-secondary)]">
        <div className="max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 max-w-sm">
            <Logo className="h-6 w-auto self-start" />
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
                  to="/validar"
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
