import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../application/useAuth'
import { LoginForm } from './LoginForm'
import { Alert, Card, CardContent, Logo } from '../../../shared/ui'
import type { LoginCredentials } from '../domain/authTypes'
import { resolveLoginDestination } from '../domain/loginDestinationPolicy'

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
    <div className="min-h-screen bg-[#fcf9f5] flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Cabeçalho de Identificação com Logo Único */}
        <div className="text-center mb-6 flex flex-col items-center">
          <Link
            to="/"
            className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b1705] rounded p-1 mb-2"
            aria-label="Voltar para página inicial"
          >
            <Logo className="h-9 w-auto" />
          </Link>
          <h1 className="font-serif text-2xl font-bold text-[#1c1c1a] tracking-tight">
            Acesso à Plataforma
          </h1>
          <p className="mt-1 text-sm text-[#57423d]">
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
        <Card className="shadow-xs border-[#ddc0ba] bg-white">
          <CardContent className="p-6 sm:p-8">
            <LoginForm
              onSubmit={handleLoginSubmit}
              isLoading={isLoading}
              errorMessage={errorMessage}
              onClearError={() => setErrorMessage(null)}
            />

            <div className="mt-6 pt-5 border-t border-[#f0edea] flex flex-col gap-3 text-center text-sm text-[#57423d]">
              <p>
                Ainda não possui conta?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-[#6b1705] hover:text-[#8b2e19] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b1705] rounded px-1"
                >
                  Cadastre-se gratuitamente
                </Link>
              </p>

              <div>
                <Link
                  to="/eventos"
                  className="text-xs text-[#8a726c] hover:text-[#1c1c1a] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b1705] rounded px-1"
                >
                  Ver eventos acadêmicos sem fazer login &rarr;
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rodapé informativo */}
        <p className="mt-6 text-center text-xs text-[#8a726c]">
          Muttley &copy; {new Date().getFullYear()} — Plataforma de Eventos
          Acadêmicos
        </p>
      </div>
    </div>
  )
}
