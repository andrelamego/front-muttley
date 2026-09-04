import React from 'react'
import {
  SkeletonBlock,
  SkeletonRegion,
  SkeletonText,
} from '../../../../shared/ui'

const MetricSkeleton: React.FC = () => (
  <div className="surface-depth flex min-h-44 flex-col justify-between border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
    <div className="flex items-start justify-between">
      <div className="w-2/3 space-y-2">
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonBlock className="h-5 w-full" />
      </div>
      <SkeletonBlock className="h-10 w-10" />
    </div>
    <div className="flex items-end gap-3">
      <SkeletonBlock className="h-12 w-16" />
      <SkeletonBlock className="mb-1 h-3 w-24" />
    </div>
    <SkeletonBlock className="h-1.5 w-full rounded-full" />
  </div>
)

export const AdminDashboardSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Carregando painel de gestão"
    className="flex flex-col gap-8"
  >
    <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <MetricSkeleton key={index} />
      ))}
    </section>

    <section className="surface-depth flex flex-col gap-6 border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--color-bg-muted)] pb-4 md:flex-row md:items-center">
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-48" />
          <SkeletonBlock className="h-8 w-72 max-w-full" />
        </div>
        <SkeletonBlock className="h-10 w-full md:w-96" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <article
            key={index}
            className="flex min-h-48 flex-col justify-between border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5"
          >
            <div className="space-y-4">
              <div className="flex justify-between gap-4">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-5 w-20" />
              </div>
              <SkeletonBlock className="h-6 w-4/5" />
              <SkeletonText lines={2} widths={['72%', '58%']} />
            </div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-3">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-3 w-16" />
            </div>
          </article>
        ))}
      </div>
    </section>

    <section className="surface-depth border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--color-bg-muted)] pb-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-32" />
          <SkeletonBlock className="h-8 w-80 max-w-full" />
        </div>
        <SkeletonBlock className="h-9 w-40" />
      </div>
      <div className="mt-5 space-y-4">
        <div className="hidden grid-cols-5 gap-5 md:grid">
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonBlock key={index} className="h-3 w-4/5" />
          ))}
        </div>
        {Array.from({ length: 4 }, (_, row) => (
          <div
            key={row}
            className="grid grid-cols-2 gap-4 border-t border-[var(--color-bg-muted)] pt-4 md:grid-cols-5"
          >
            {Array.from({ length: 5 }, (_, column) => (
              <SkeletonBlock
                key={column}
                className={`${column > 1 ? 'hidden md:block' : ''} h-4 w-4/5`}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  </SkeletonRegion>
)
