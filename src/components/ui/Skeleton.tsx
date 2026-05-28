import type { CSSProperties, HTMLAttributes } from 'react'
import { cx } from './utils'

type SkeletonProps = HTMLAttributes<HTMLSpanElement> & {
  className?: string
}

type TableSkeletonProps = {
  columns?: number
  rows?: number
  className?: string
}

const widths = ['72%', '52%', '64%', '44%', '58%', '36%']

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <span className={cx('ui-skeleton', className)} aria-hidden="true" {...props} />
}

export function PageHeaderSkeleton({ action = false }: { action?: boolean }) {
  return (
    <div className="ui-skeleton-page-header" aria-hidden="true">
      <div>
        <Skeleton className="w-28 h-3 mb-3" />
        <Skeleton className="w-64 max-w-full h-9 mb-3" />
        <Skeleton className="w-[34rem] max-w-full h-4" />
      </div>
      {action && <Skeleton className="w-36 h-10" />}
    </div>
  )
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="ui-skeleton-stat-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div className="ui-skeleton-card" key={index}>
          <Skeleton className="w-24 h-3" />
          <Skeleton className="w-16 h-8 mt-5" />
          <Skeleton className="w-32 h-3 mt-3" />
        </div>
      ))}
    </div>
  )
}

export function EventCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="ui-skeleton-carousel" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div className="ui-skeleton-event-card" key={index}>
          <div className="flex items-start justify-between gap-4">
            <Skeleton className="w-40 h-4" />
            <Skeleton className="w-14 h-7 rounded-full" />
          </div>
          <Skeleton className="w-36 h-3 mt-4" />
          <Skeleton className="w-full h-3 mt-4" />
          <Skeleton className="w-4/5 h-3 mt-2" />
          <div className="flex items-center justify-between mt-auto pt-4">
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-20 h-7" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ToolbarSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="ui-skeleton-toolbar" aria-hidden="true">
      {Array.from({ length: fields }).map((_, index) => (
        <Skeleton className={index === 0 ? 'ui-skeleton-toolbar__search' : 'h-10'} key={index} />
      ))}
    </div>
  )
}

export function TableSkeleton({ columns = 5, rows = 6, className }: TableSkeletonProps) {
  const gridStyle = { '--skeleton-columns': columns } as CSSProperties

  return (
    <div className={cx('ui-skeleton-table', className)} aria-hidden="true">
      <div className="ui-skeleton-table__row ui-skeleton-table__head" style={gridStyle}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton className="h-3" key={index} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div className="ui-skeleton-table__row" style={gridStyle} key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton className="h-4" style={{ width: widths[(rowIndex + colIndex) % widths.length] }} key={colIndex} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function FormSkeleton({ fields = 5, steps = false }: { fields?: number; steps?: boolean }) {
  return (
    <div className="ui-skeleton-form" aria-hidden="true">
      {steps && (
        <div className="ui-skeleton-steps">
          {[1, 2, 3].map((item) => (
            <div className="ui-skeleton-step" key={item}>
              <Skeleton className="w-7 h-7 rounded-full" />
              <Skeleton className="w-28 h-3" />
            </div>
          ))}
        </div>
      )}
      <div className="ui-skeleton-form-grid">
        {Array.from({ length: fields }).map((_, index) => (
          <div className={cx('ui-skeleton-field', index === fields - 1 && fields > 3 ? 'ui-skeleton-field--wide' : '')} key={index}>
            <Skeleton className="w-24 h-3" />
            <Skeleton className={index === fields - 1 && fields > 3 ? 'h-24' : 'h-11'} />
          </div>
        ))}
      </div>
      <div className="ui-skeleton-actions">
        <Skeleton className="w-24 h-10" />
        <Skeleton className="w-36 h-10" />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="dashboard">
      <PageHeaderSkeleton action />
      <EventCardsSkeleton />
      <StatGridSkeleton count={5} />
    </div>
  )
}

export function EventListSkeleton() {
  return (
    <div className="admin-page">
      <PageHeaderSkeleton action />
      <EventCardsSkeleton />
      <StatGridSkeleton count={4} />
      <ToolbarSkeleton fields={5} />
      <div className="ui-skeleton-list">
        {[1, 2, 3, 4].map((item) => (
          <div className="ui-skeleton-list-card" key={item}>
            <Skeleton className="w-32 h-4" />
            <div className="min-w-0">
              <Skeleton className="w-72 max-w-full h-5" />
              <Skeleton className="w-full h-3 mt-4" />
              <Skeleton className="w-3/4 h-3 mt-2" />
            </div>
            <Skeleton className="w-24 h-9" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function TablePageSkeleton({ action = true, columns = 5, rows = 6 }: { action?: boolean; columns?: number; rows?: number }) {
  return (
    <div className="admin-page">
      <PageHeaderSkeleton action={action} />
      <TableSkeleton columns={columns} rows={rows} />
    </div>
  )
}

export function CertificatesSkeleton() {
  return (
    <div className="admin-page certificates-page">
      <PageHeaderSkeleton />
      <EventCardsSkeleton />
      <div className="ui-skeleton-certificate" aria-hidden="true">
        <div>
          <Skeleton className="w-44 h-5 mb-4" />
          <Skeleton className="w-full h-64" />
        </div>
      </div>
      <TableSkeleton columns={5} rows={5} />
    </div>
  )
}

export function CompletionSkeleton() {
  return (
    <div className="admin-page">
      <PageHeaderSkeleton action />
      <StatGridSkeleton count={2} />
      <Skeleton className="w-full h-16 mb-5" />
      <ToolbarSkeleton fields={2} />
      <TableSkeleton columns={5} rows={8} />
    </div>
  )
}
