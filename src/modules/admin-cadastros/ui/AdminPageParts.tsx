import React from 'react'
import { Alert, Button } from '../../../shared/ui'

export const AdminSectionHeader: React.FC<{
  eyebrow: string
  title: string
  description: string
  onRefresh?: () => void
}> = ({ eyebrow, title, description, onRefresh }) => (
  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
    <div>
      <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-primary-text)] font-semibold">
        {eyebrow}
      </p>
      <h1 className="font-serif text-3xl sm:text-4xl text-[var(--color-text-primary)] mt-1">
        {title}
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-2xl">
        {description}
      </p>
    </div>
    {onRefresh && (
      <Button variant="outline" size="sm" onClick={onRefresh}>
        Atualizar dados
      </Button>
    )}
  </div>
)

export const AdminMetric: React.FC<{
  label: string
  value: number
  detail: string
}> = ({ label, value, detail }) => (
  <div className="surface-depth bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-5">
    <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">
      {label}
    </p>
    <p className="font-serif text-3xl text-[var(--color-text-primary)] mt-2">
      {value}
    </p>
    <p className="text-xs text-[var(--color-text-secondary)] mt-1">{detail}</p>
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
  <div className="p-10 text-center text-sm text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
    {message}
  </div>
)
