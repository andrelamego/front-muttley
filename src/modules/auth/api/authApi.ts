import apiClient from '../../../shared/http/apiClient'
import type {
  LoginCredentials,
  BackendLoginResponse,
  BackendMeResponse,
  AuthSession,
  User,
  AuthRole,
} from '../domain/authTypes'
import { getRoleFromToken, normalizeAuthRole } from '../domain/tokenUtils'

export const loginApi = async (
  credentials: LoginCredentials
): Promise<AuthSession> => {
  const normalizedEmail = credentials.email.trim().toLowerCase()
  const response = await apiClient.post<BackendLoginResponse>('/auth/login', {
    email: normalizedEmail,
    senha: credentials.senha,
  })

  const data = response.data
  const token = data.accessToken || data.token

  if (!token) {
    throw new Error('Token de autenticação não foi retornado pelo servidor.')
  }

  const role: AuthRole =
    normalizeAuthRole(getRoleFromToken(token), data.role, data.usuario?.role) ||
    'USER'

  const user: User = {
    id: String(data.usuario?.id ?? '0'),
    nome: data.usuario?.nome || 'Usuário',
    email: data.usuario?.email || normalizedEmail,
    role,
  }

  return { user, token }
}

export const getMeApi = async (): Promise<User> => {
  const response = await apiClient.get<BackendMeResponse>('/me')
  const data = response.data
  const token = localStorage.getItem('token')

  const role: AuthRole =
    normalizeAuthRole(getRoleFromToken(token), data.role) || 'USER'

  return {
    id: String(data.id),
    nome: data.nome,
    email: data.email,
    telefone: data.telefone || undefined,
    cpf: data.cpf || undefined,
    role,
  }
}
