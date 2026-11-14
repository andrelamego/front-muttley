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

// --- Cadastro por convite (RF-AUT-01) ---

/** Pede a conta. A API responde igual exista ou não o email, para não revelar cadastros. */
export const solicitarCadastroApi = async (dados: {
  nome: string
  email: string
}): Promise<string> => {
  const response = await apiClient.post<{ message?: string }>(
    '/auth/register',
    {
      nome: dados.nome.trim(),
      email: dados.email.trim().toLowerCase(),
    }
  )
  return response.data?.message ?? ''
}

export interface ConviteCadastro {
  nome: string
  email: string
  cpf: string | null
}

export const consultarConviteApi = async (
  token: string
): Promise<ConviteCadastro> => {
  const response = await apiClient.get<ConviteCadastro>(
    `/pessoa/dados-cadastro/${encodeURIComponent(token)}`
  )
  return response.data
}

/** Conclui o cadastro; o CPF vai formatado (o backend valida com @ValidCpf(formatted = true)). */
export const concluirCadastroApi = async (
  token: string,
  dados: {
    nome: string
    email: string
    telefone: string
    cpf: string
    senha: string
  }
): Promise<void> => {
  await apiClient.put(
    '/auth/register',
    {
      nome: dados.nome.trim(),
      email: dados.email.trim().toLowerCase(),
      telefone: dados.telefone,
      cpf: dados.cpf,
      senha: dados.senha,
    },
    { params: { token } }
  )
}

/** Altera nome e telefone da própria conta e devolve o usuário atualizado. */
export const atualizarPerfilApi = async (dados: {
  nome: string
  telefone: string
}): Promise<User> => {
  await apiClient.put('/me', {
    nome: dados.nome.trim(),
    telefone: dados.telefone.trim(),
  })
  return getMeApi()
}

export const alterarSenhaApi = async (dados: {
  senhaAtual: string
  novaSenha: string
}): Promise<void> => {
  await apiClient.put('/me/senha', dados)
}
