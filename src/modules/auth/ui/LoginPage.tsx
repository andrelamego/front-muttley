import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../application/useAuth'
import { LoginForm } from './LoginForm'
import { Alert, Card, CardContent, Logo, ThemeToggle } from '../../../shared/ui'
import type { LoginCredentials } from '../domain/authTypes'
import { resolveLoginDestination } from '../domain/loginDestinationPolicy'
import { HistoryBackButton } from '../../../shared/navigation'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    login,
    isLoading,
    isAuthenticated,
    role,
    sessionExpiredMessage,
    clearSessionExpiredMessage,
  } = useAuth()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Mensagem opcional de acesso negado vinda do redirecionamento
  const locationState = location.state as
    | {
        accessDenied?: boolean
        from?: { pathname: string; search?: string; hash?: string } | string
      }
    | undefined
  const accessDenied = locationState?.accessDenied

  // Determina o caminho pretendido preservando search e hash se houver
  const searchParams = new URLSearchParams(location.search)
  const queryReturnTo = searchParams.get('returnTo')

  let rawTarget: string | undefined
  if (typeof locationState?.from === 'string') {
    rawTarget = locationState.from
  } else if (locationState?.from?.pathname) {
    rawTarget = `${locationState.from.pathname}${locationState.from.search || ''}${locationState.from.hash || ''}`
  } else if (queryReturnTo) {
    rawTarget = queryReturnTo
  }

  // Se o usuário já estiver autenticado ao acessar a página de login, redireciona ao seu destino
  React.useEffect(() => {
    if (isAuthenticated && role) {
      const destination = resolveLoginDestination(rawTarget, role)
      navigate(destination, { replace: true })
    }
  }, [isAuthenticated, role, rawTarget, navigate])

  const handleLoginSubmit = async (credentials: LoginCredentials) => {
    setErrorMessage(null)
    clearSessionExpiredMessage()
    try {
      const session = await login(credentials)
      const destination = resolveLoginDestination(rawTarget, session.user.role)
      navigate(destination, { replace: true, state: {} })
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage(
          'Email ou senha inválidos. Verifique suas credenciais e tente novamente.'
        )
      }
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
      <HistoryBackButton
        label="Voltar"
        className="fixed left-4 top-4 sm:left-6 sm:top-6"
      />
      <ThemeToggle className="fixed right-4 top-4 sm:right-6 sm:top-6" />
      <div className="w-full max-w-md">
        {/* Cabeçalho de Identificação com Logo Único */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="inline-flex items-center p-1 mb-2">
            <Logo className="h-9 w-auto" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Acesso à Plataforma
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Acesse suas inscrições, presença e certificados
          </p>
        </div>

        {/* Notificações contextuais */}
        <div className="flex flex-col gap-3 mb-4">
          {sessionExpiredMessage && (
            <Alert
              variant="warning"
              title="Sessão expirada"
              onClose={clearSessionExpiredMessage}
            >
              {sessionExpiredMessage}
            </Alert>
          )}

          {accessDenied && (
            <Alert variant="error" title="Acesso restrito">
              Você não possui permissão para acessar a página solicitada. Faça
              login com uma conta que possua o perfil adequado.
            </Alert>
          )}
        </div>

        {/* Cartão principal do formulário */}
        <Card className="shadow-xs border-[var(--color-border)] surface-depth bg-[var(--color-bg-surface)]">
          <CardContent className="p-6 sm:p-8">
            <LoginForm
              onSubmit={handleLoginSubmit}
              isLoading={isLoading}
              errorMessage={errorMessage}
              onClearError={() => setErrorMessage(null)}
            />

            <div className="mt-6 pt-5 border-t border-[var(--color-bg-muted)] flex flex-col gap-3 text-center text-sm text-[var(--color-text-secondary)]">
              <p>
                Ainda não possui conta?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-[var(--color-primary-text)] hover:text-[var(--color-primary-text-hover)] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-none px-1"
                >
                  Cadastre-se gratuitamente
                </Link>
              </p>

              <div>
                <Link
                  to="/eventos"
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-none px-1"
                >
                  Ver eventos acadêmicos sem fazer login &rarr;
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rodapé informativo */}
        <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
          Muttley &copy; {new Date().getFullYear()} — Plataforma de Eventos
          Acadêmicos
        </p>
      </div>
    </div>
  )
}
