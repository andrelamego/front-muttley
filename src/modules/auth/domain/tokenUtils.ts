import type { AuthRole } from './authTypes.ts'
export type { AuthRole } from './authTypes.ts'

const roleFromValue = (value: unknown): AuthRole | null => {
  if (Array.isArray(value)) {
    for (const item of value) {
      const role = roleFromValue(item)
      if (role) return role
    }
    return null
  }

  if (typeof value === 'object' && value !== null) {
    const authority = (value as { authority?: unknown }).authority
    return roleFromValue(authority)
  }

  if (typeof value !== 'string') return null

  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, '')

  if (normalized === 'ADMIN' || normalized === 'USER') return normalized
  return null
}

export const normalizeAuthRole = (...values: unknown[]): AuthRole | null => {
  for (const value of values) {
    const role = roleFromValue(value)
    if (role) return role
  }
  return null
}

const decodeBase64 = (base64Url: string): string => {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')

  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    return window.atob(padded)
  }

  // Compatibilidade com ambiente de testes Node sem expor tipos globais desnecessários
  const nodeGlobal = globalThis as unknown as {
    Buffer?: {
      from: (
        data: string,
        encoding: string
      ) => { toString: (encoding: string) => string }
    }
  }

  if (nodeGlobal.Buffer) {
    return nodeGlobal.Buffer.from(padded, 'base64').toString('utf-8')
  }

  return ''
}

export const getRoleFromToken = (token: string | null): AuthRole | null => {
  if (!token) return null

  try {
    const parts = token.split('.')
    if (parts.length < 2 || !parts[1]) return null

    const decoded = decodeBase64(parts[1])
    if (!decoded) return null

    const claims = JSON.parse(decoded) as Record<string, unknown>

    return normalizeAuthRole(
      claims.role,
      claims.roles,
      claims.authorities,
      claims.scope
    )
  } catch {
    return null
  }
}
