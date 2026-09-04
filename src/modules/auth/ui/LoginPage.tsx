import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../application/useAuth'
import { LoginForm } from './LoginForm'
import { Alert, Card, CardContent } from '../../../shared/ui'
import type { LoginCredentials } from '../domain/authTypes'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    login,
    isLoading,
    sessionExpiredMessage,
    clearSessionExpiredMessage,
  } = useAuth()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Mensagem opcional de acesso negado vinda do redirecionamento
  const locationState = location.state as
    | { accessDenied?: boolean; from?: { pathname: string } }
    | undefined
  const accessDenied = locationState?.accessDenied
  const returnTo = locationState?.from?.pathname

  const handleLoginSubmit = async (credentials: LoginCredentials) => {
    setErrorMessage(null)
    clearSessionExpiredMessage()
    try {
      const session = await login(credentials)
      const destination =
        returnTo ||
        (session.user.role === 'ADMIN' ? '/admin/inicio' : '/user/inicio')
      navigate(destination, { replace: true })
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Cabeçalho de Identificação */}
        <div className="text-center mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-2xl font-black text-blue-600 tracking-tight hover:text-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg px-2 py-1"
          >
            <span>Muttley</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              FATEC
            </span>
          </Link>
          <h1 className="mt-3 text-xl font-bold text-slate-900 tracking-tight">
            Gestão de Eventos Acadêmicos
          </h1>
          <p className="mt-1 text-sm text-slate-500">
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
        <Card className="shadow-md border-slate-200 bg-white">
          <CardContent className="p-6 sm:p-8">
            <LoginForm
              onSubmit={handleLoginSubmit}
              isLoading={isLoading}
              errorMessage={errorMessage}
              onClearError={() => setErrorMessage(null)}
            />

            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-3 text-center text-sm text-slate-600">
              <p>
                Ainda não possui conta?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1"
                >
                  Cadastre-se gratuitamente
                </Link>
              </p>

              <div>
                <Link
                  to="/eventos"
                  className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1"
                >
                  Ver eventos acadêmicos sem fazer login →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rodapé informativo */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Muttley &copy; 2026 — Plataforma de Eventos FATEC
        </p>
      </div>
    </div>
  )
}
