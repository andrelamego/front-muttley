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

function UserPageHeadingSkeleton() {
  return (
    <div className="user-page-heading-skeleton">
      <Skeleton className="w-28 h-3" />
      <Skeleton className="w-64 max-w-full h-8" />
      <Skeleton className="w-[34rem] max-w-full h-4" />
    </div>
  )
}

function UserSearchSkeleton() {
  return <Skeleton className="user-search-skeleton" />
}

function UserEventCardSkeleton() {
  return (
    <div className="student-event-card ui-card user-event-card-skeleton">
      <div className="student-event-card__top">
        <Skeleton className="w-28 h-7 rounded-full" />
        <Skeleton className="w-14 h-4" />
      </div>
      <Skeleton className="w-3/5 h-5" />
      <div>
        <Skeleton className="w-full h-3" />
        <Skeleton className="w-4/5 h-3 mt-2" />
      </div>
      <div className="student-event-card__meta">
        <Skeleton className="w-44 h-4" />
        <Skeleton className="w-36 h-4" />
      </div>
      <div className="student-event-card__actions">
        <Skeleton className="h-9" />
        <Skeleton className="h-9" />
      </div>
    </div>
  )
}

export function UserDashboardSkeleton() {
  return (
    <div className="user-dashboard-container mobile-stack user-page-skeleton" role="status" aria-label="Carregando seu painel">
      <section className="student-hero user-dashboard-hero-skeleton">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-64 max-w-full h-10" />
        <Skeleton className="w-[34rem] max-w-full h-4" />
        <Skeleton className="w-4/5 max-w-full h-4" />
      </section>

      <section className="student-stat-grid" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="ui-stat-card user-stat-card-skeleton" key={index}>
            <div className="ui-stat-card__top">
              <Skeleton className="w-16 h-3" />
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
            <Skeleton className="w-12 h-8" />
          </div>
        ))}
      </section>

      <section className="user-content-skeleton">
        <div className="user-section-heading-skeleton">
          <Skeleton className="w-36 h-6" />
          <Skeleton className="w-80 max-w-full h-4" />
        </div>
        <div className="mobile-card-list">
          <UserEventCardSkeleton />
          <UserEventCardSkeleton />
        </div>
      </section>
    </div>
  )
}

function UserRecordCardSkeleton() {
  return (
    <div className="student-record-card ui-card">
      <div className="student-record-card__top">
        <Skeleton className="w-44 h-7 rounded-full" />
        <Skeleton className="w-5 h-5" />
      </div>
      <div className="student-record-card__body">
        <Skeleton className="w-3/4 h-5" />
        <div className="user-record-data-skeleton">
          <div>
            <Skeleton className="w-14 h-3" />
            <Skeleton className="w-24 h-4 mt-2" />
          </div>
          <div>
            <Skeleton className="w-12 h-3" />
            <Skeleton className="w-32 h-6 mt-2" />
          </div>
        </div>
      </div>
      <div className="student-record-card__actions">
        <Skeleton className="h-9" />
        <Skeleton className="h-9" />
      </div>
    </div>
  )
}

export function UserCertificatesSkeleton() {
  return (
    <div className="user-certs-container mobile-stack user-page-skeleton" role="status" aria-label="Carregando certificados">
      <UserPageHeadingSkeleton />
      <UserSearchSkeleton />
      <div className="mobile-card-list" aria-hidden="true">
        <UserRecordCardSkeleton />
        <UserRecordCardSkeleton />
        <UserRecordCardSkeleton />
      </div>
      <Skeleton className="user-back-link-skeleton" />
    </div>
  )
}

function UserMedalCardSkeleton() {
  return (
    <div className="achievement-card ui-card">
      <div className="achievement-card__header">
        <Skeleton className="w-[3.4rem] h-[3.4rem] rounded-full" />
        <Skeleton className="w-16 h-7 rounded-full" />
      </div>
      <Skeleton className="w-36 h-7 rounded-full" />
      <Skeleton className="w-2/3 h-5" />
      <div className="w-full">
        <Skeleton className="w-full h-3" />
        <Skeleton className="w-4/5 h-3 mt-2" />
      </div>
      <Skeleton className="w-40 h-9" />
    </div>
  )
}

export function UserMedalsSkeleton() {
  return (
    <div className="user-medals-container mobile-stack user-page-skeleton" role="status" aria-label="Carregando medalhas">
      <UserPageHeadingSkeleton />
      <UserSearchSkeleton />
      <div className="achievement-grid" aria-hidden="true">
        <UserMedalCardSkeleton />
        <UserMedalCardSkeleton />
        <UserMedalCardSkeleton />
        <UserMedalCardSkeleton />
      </div>
    </div>
  )
}

export function UserEventDetailSkeleton() {
  return (
    <div className="user-event-body min-h-screen py-6" role="status" aria-label="Carregando evento">
      <main className="user-event-page">
        <Skeleton className="w-44 h-4 mb-7" />
        <section className="user-event-hero">
          <Skeleton className="user-event-date-skeleton" />
          <div className="user-event-heading">
            <Skeleton className="w-36 h-7 rounded-full" />
            <Skeleton className="w-3/4 h-10 mt-3" />
            <Skeleton className="w-full h-4 mt-4" />
            <Skeleton className="w-4/5 h-4 mt-2" />
          </div>
        </section>
        <section className="user-event-action-panel">
          <Skeleton className="user-event-action-skeleton" />
        </section>
        <section className="user-event-details">
          {Array.from({ length: 8 }).map((_, index) => (
            <article className="user-event-info-card" key={index}>
              <Skeleton className="w-20 h-3" />
              <Skeleton className="w-3/4 h-5" />
              {index === 4 || index === 5 ? <Skeleton className="w-1/2 h-3" /> : null}
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}

function PublicEventCardSkeleton() {
  return (
    <article className="public-event-card">
      <Skeleton className="public-event-date-skeleton" />
      <div className="public-event-card__body">
        <div className="public-event-card__top">
          <Skeleton className="w-24 h-7 rounded-full" />
          <Skeleton className="w-16 h-7 rounded-full" />
        </div>
        <Skeleton className="w-3/4 h-5 mt-3" />
        <Skeleton className="w-full h-3 mt-3" />
        <Skeleton className="w-4/5 h-3 mt-2" />
        <div className="public-event-card__meta">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-28 h-4" />
          <Skeleton className="w-24 h-4" />
        </div>
      </div>
      <Skeleton className="public-event-action-skeleton" />
    </article>
  )
}

export function PublicEventListSkeleton() {
  return (
    <main className="public-events-page user-page-skeleton" role="status" aria-label="Carregando eventos">
      <section className="public-events-hero public-events-hero-skeleton">
        <div>
          <Skeleton className="w-28 h-3" />
          <Skeleton className="w-72 max-w-full h-10 mt-3" />
          <Skeleton className="w-[34rem] max-w-full h-4 mt-4" />
        </div>
        <Skeleton className="public-events-search-skeleton" />
      </section>
      <section className="public-events-grid" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => <PublicEventCardSkeleton key={index} />)}
      </section>
    </main>
  )
}

export function PublicEventDetailSkeleton() {
  return (
    <main className="public-event-detail-page user-page-skeleton" role="status" aria-label="Carregando evento">
      <Skeleton className="w-36 h-4" />
      <section className="public-event-detail-layout">
        <article className="public-event-detail-main">
          <div className="public-event-detail-kicker">
            <Skeleton className="w-24 h-7 rounded-full" />
            <Skeleton className="w-16 h-7 rounded-full" />
          </div>
          <Skeleton className="w-4/5 h-12" />
          <div>
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-4/5 h-4 mt-2" />
          </div>
          <div className="public-event-detail-meta">
            <Skeleton className="w-44 h-4" />
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-36 h-4" />
          </div>
          <div className="public-event-detail-discipline">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-48 max-w-full h-5" />
          </div>
        </article>
        <aside className="public-event-signup-panel">
          <Skeleton className="w-20 h-3" />
          <Skeleton className="w-3/4 h-6" />
          <div className="public-event-signup-fields-skeleton">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="w-24 h-3" />
                <Skeleton className="h-12 mt-2" />
              </div>
            ))}
            <Skeleton className="h-11" />
          </div>
        </aside>
      </section>
    </main>
  )
}
