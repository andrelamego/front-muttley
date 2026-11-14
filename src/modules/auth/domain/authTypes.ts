export type AuthRole = 'ADMIN' | 'USER'

export interface User {
  id: string
  nome: string
  email: string
  telefone?: string
  cpf?: string
  role: AuthRole
  /** Ausente em sessões antigas: o avatar tenta buscar a foto mesmo assim. */
  temFoto?: boolean
}

export interface LoginCredentials {
  email: string
  senha: string
}

export interface BackendUsuarioResponse {
  id: number | string
  nome: string
  email: string
  role?: string | null
}

export interface BackendLoginResponse {
  accessToken?: string
  token?: string
  tokenType?: string
  expiresIn?: number
  usuario?: BackendUsuarioResponse
  role?: string
}

export interface BackendMeResponse {
  id: number | string
  nome: string
  email: string
  telefone?: string | null
  cpf?: string | null
  role?: string | null
  temFoto?: boolean
}

export interface AuthSession {
  user: User
  token: string
}
