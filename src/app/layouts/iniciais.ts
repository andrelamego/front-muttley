/** Iniciais do avatar: primeiro e último nome ("Ana Souza" → "AS"). */
export const getInitials = (name?: string) => {
  if (!name?.trim()) return 'AD'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
