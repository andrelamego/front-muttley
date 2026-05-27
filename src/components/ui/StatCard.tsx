import type { ReactNode } from 'react'

type StatCardProps = {
  label: string
  value: ReactNode
  helper?: string
  icon?: ReactNode
  tone?: 'primary' | 'success' | 'accent' | 'neutral'
}

export function StatCard({ label, value, helper, icon, tone = 'primary' }: StatCardProps) {
  return (
    <article className={`ui-stat-card ui-stat-card--${tone}`}>
      <div className="ui-stat-card__top">
        <span>{label}</span>
        {icon}
      </div>
      <strong>{value}</strong>
      {helper && <small>{helper}</small>}
    </article>
  )
}
