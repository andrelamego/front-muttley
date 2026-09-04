import type { AuthRole } from './authTypes'

/**
 * Retorna a rota inicial padrão baseada no perfil autenticado.
 */
export const getDefaultRouteForRole = (role: AuthRole): string => {
  return role === 'ADMIN' ? '/admin/inicio' : '/user/inicio'
}

/**
 * Política pura de resolução de destino pós-login.
 *
 * Regras:
 * 1. Destinos externos (open redirect como //evil.com, https://..., javascript:...) são bloqueados.
 * 2. Retornos para a própria página de /login são bloqueados.
 * 3. Rotas administrativas (/admin/**) são permitidas exclusivamente para a role ADMIN.
 *    Se um USER tentar acessar rota administrativa após login, é enviado com segurança para /user/inicio.
 * 4. Rotas de participante (/user/**) e públicas (/eventos/**, /certificados/**, /) são permitidas.
 * 5. Query params e hash válidos são preservados na jornada se o pathname for autorizado.
 */
export const resolveLoginDestination = (
  target: string | null | undefined,
  role: AuthRole
): string => {
  const fallback = getDefaultRouteForRole(role)

  if (!target || typeof target !== 'string') {
    return fallback
  }

  const trimmed = target.trim()

  // Bloqueia caminhos que não comecem com / ou comecem com esquema de protocolo ou barra dupla
  if (
    trimmed.startsWith('//') ||
    trimmed.startsWith('\\\\') ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
  ) {
    return fallback
  }

  if (!trimmed.startsWith('/')) {
    return fallback
  }

  // Normaliza barras repetidas no início
  const normalized = trimmed.replace(/^\/+/, '/')

  // Bloqueia loops para o próprio login
  if (
    normalized === '/login' ||
    normalized.startsWith('/login?') ||
    normalized.startsWith('/login#')
  ) {
    return fallback
  }

  // Separa pathname de search/hash para checar permissão de acesso
  let pathname = normalized
  let suffix = ''

  const searchIndex = normalized.search(/[?#]/)
  if (searchIndex !== -1) {
    pathname = normalized.slice(0, searchIndex)
    suffix = normalized.slice(searchIndex)
  }

  // Remove barra final opcional exceto para a raiz
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1)
  }

  // Se a rota for administrativa (/admin ou /admin/...)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (role !== 'ADMIN') {
      return fallback
    }
    return `${pathname}${suffix}`
  }

  // Se a rota for de participante (/user ou /user/...)
  if (pathname === '/user' || pathname.startsWith('/user/')) {
    return `${pathname}${suffix}`
  }

  // Se a rota for pública mapeada
  if (
    pathname === '/' ||
    pathname === '/eventos' ||
    pathname.startsWith('/eventos/') ||
    pathname.startsWith('/certificados/')
  ) {
    return `${pathname}${suffix}`
  }

  // Rotas não reconhecidas caem no fallback do perfil
  return fallback
}
