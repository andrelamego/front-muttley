import type { StatusEvento } from '../domain/adminEventoTypes'

export const getStatusBadgeVariant = (status: StatusEvento) => {
  switch (status) {
    case 'EM_ANDAMENTO':
      return 'info' as const
    case 'CRIADO':
      return 'default' as const
    case 'FINALIZADO':
      return 'success' as const
    case 'CANCELADO':
      return 'danger' as const
    default:
      return 'default' as const
  }
}

export const getStatusLabel = (status: StatusEvento) => {
  switch (status) {
    case 'EM_ANDAMENTO':
      return 'Em andamento'
    case 'CRIADO':
      return 'Programado'
    case 'FINALIZADO':
      return 'Finalizado'
    case 'CANCELADO':
      return 'Cancelado'
    default:
      return status
  }
}
