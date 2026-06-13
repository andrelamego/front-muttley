export type AuthRole = 'ADMIN' | 'USER'

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

export const getRoleFromToken = (token: string | null): AuthRole | null => {
  if (!token) return null

  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const claims = JSON.parse(atob(padded)) as Record<string, unknown>

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
