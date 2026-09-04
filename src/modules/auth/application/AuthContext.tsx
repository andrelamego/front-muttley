import React, { createContext, useState, useEffect, useCallback } from 'react'
import type {
  User,
  AuthRole,
  LoginCredentials,
  AuthSession,
} from '../domain/authTypes'
import { loginApi, getMeApi } from '../api/authApi'
import {
  setAuthTokenGetter,
  setUnauthorizedHandler,
} from '../../../shared/http'

export interface AuthContextValue {
  user: User | null
  token: string | null
  role: AuthRole | null
  isAuthenticated: boolean
  isLoading: boolean
  sessionExpiredMessage: string | null
  login: (credentials: LoginCredentials) => Promise<AuthSession>
  logout: () => void
  clearSessionExpiredMessage: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const getStoredSession = (): { user: User | null; token: string | null } => {
  try {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('usuario')
    if (token && storedUser) {
      const user = JSON.parse(storedUser) as User
      return { user, token }
    }
  } catch {
    // Falha silenciosa de JSON inválido
  }
  return { user: null, token: null }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<{
    user: User | null
    token: string | null
  }>(getStoredSession)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<
    string | null
  >(null)

  // Registra o token getter no shared/http para desacoplar a requisição
  useEffect(() => {
    setAuthTokenGetter(() => session.token)
  }, [session.token])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('usuario')
    setSession({ user: null, token: null })
  }, [])

  const handleUnauthorized = useCallback(() => {
    logout()
    setSessionExpiredMessage(
      'Sua sessão expirou. Por favor, faça login novamente para continuar.'
    )
  }, [logout])

  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized)

    const handleCustomUnauthorized = () => {
      handleUnauthorized()
    }

    window.addEventListener('muttley:unauthorized', handleCustomUnauthorized)
    return () => {
      window.removeEventListener(
        'muttley:unauthorized',
        handleCustomUnauthorized
      )
    }
  }, [handleUnauthorized])

  // Validação opcional de fundo do usuário logado contra o backend
  useEffect(() => {
    if (session.token && !session.user?.cpf) {
      getMeApi()
        .then((freshUser) => {
          setSession((prev) => ({ ...prev, user: freshUser }))
          localStorage.setItem('usuario', JSON.stringify(freshUser))
          localStorage.setItem('role', freshUser.role)
        })
        .catch(() => {
          // Se der 401, o interceptor já aciona handleUnauthorized
        })
    }
  }, [session.token, session.user?.cpf])

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthSession> => {
      setIsLoading(true)
      setSessionExpiredMessage(null)
      try {
        const authSession = await loginApi(credentials)
        localStorage.setItem('token', authSession.token)
        localStorage.setItem('role', authSession.user.role)
        localStorage.setItem('usuario', JSON.stringify(authSession.user))
        setSession({ user: authSession.user, token: authSession.token })
        return authSession
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const clearSessionExpiredMessage = useCallback(() => {
    setSessionExpiredMessage(null)
  }, [])

  const value: AuthContextValue = {
    user: session.user,
    token: session.token,
    role: session.user?.role ?? null,
    isAuthenticated: Boolean(session.token && session.user),
    isLoading,
    sessionExpiredMessage,
    login,
    logout,
    clearSessionExpiredMessage,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
