import type { ReactNode } from 'react'
import { cx } from './utils'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  compact?: boolean
  className?: string
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  compact,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cx(
        'ui-page-header',
        compact && 'ui-page-header--compact',
        className
      )}
    >
      <div className="ui-page-header__copy">
        {eyebrow && <span className="ui-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="ui-page-header__actions">{actions}</div>}
    </header>
  )
}

type SectionHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function SectionHeader({
  title,
  description,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cx('ui-section-header', className)}>
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions}
    </div>
  )
}
