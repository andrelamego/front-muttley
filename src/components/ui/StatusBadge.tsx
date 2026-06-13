import { cx } from './utils'

type StatusBadgeProps = {
  status: string
  label?: string
  className?: string
}

const statusLabels: Record<string, string> = {
  CRIADO: 'Criado',
  EM_ANDAMENTO: 'Em andamento',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
  INSCRITO: 'Inscrito',
  DISPONIVEL: 'Disponivel',
  PRESENTE: 'Presenca confirmada',
  AUSENTE: 'Ausente',
  VALID: 'Valido',
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cx(
        'ui-status',
        `ui-status--${status.toLowerCase()}`,
        className
      )}
    >
      {label ||
        statusLabels[status] ||
        status.replaceAll('_', ' ').toLowerCase()}
    </span>
  )
}
