import React from 'react'
import { Alert, Button } from '../../../shared/ui'

export const AdminSectionHeader: React.FC<{
  title: string
  description: string
  onRefresh?: () => void
  /** Ação principal da página, ao lado de "Atualizar dados". */
  action?: React.ReactNode
}> = ({ title, description, onRefresh, action }) => (
  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
    <div>
      <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)]">
        {title}
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-2xl">
        {description}
      </p>
    </div>
    <div className="flex flex-wrap gap-2">
      {onRefresh && (
        <Button variant="outline" size="sm" onClick={onRefresh}>
          Atualizar dados
        </Button>
      )}
      {action}
    </div>
  </div>
)

export const AdminMetric: React.FC<{
  label: string
  value: number
  detail: string
}> = ({ label, value, detail }) => (
  // Mesmo desenho dos indicadores do painel da coordenação.
  <div className="rounded-md bg-[var(--color-bg-surface)] p-5">
    <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
    <p className="font-display text-4xl font-bold tabular-nums mt-2 text-[var(--color-text-primary)]">
      {value}
    </p>
    <p className="text-xs text-[var(--color-text-muted)] mt-1">{detail}</p>
  </div>
)

export const AdminLoadError: React.FC<{
  message: string
  onRetry: () => void
}> = ({ message, onRetry }) => (
  <Alert variant="error" title="Não foi possível carregar os dados">
    <p>{message}</p>
    <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
      Tentar novamente
    </Button>
  </Alert>
)

export const AdminEmpty: React.FC<{ message: string }> = ({ message }) => (
  <div className="rounded-md bg-[var(--color-bg-surface)] px-6 py-12 text-center text-sm text-[var(--color-text-secondary)]">
    {message}
  </div>
)
