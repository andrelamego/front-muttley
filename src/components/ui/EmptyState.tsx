import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="ui-empty-state">
      <Inbox aria-hidden="true" />
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}
