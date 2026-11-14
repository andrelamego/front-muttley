import React from 'react'
import { SkeletonBlock, SkeletonRegion } from '../../../../shared/ui'

const MetricSkeleton: React.FC = () => (
  <div className="rounded-md bg-[var(--color-bg-surface)] p-5">
    <SkeletonBlock className="h-4 w-28" />
    <SkeletonBlock className="mt-3 h-12 w-16" />
  </div>
)

export const AdminDashboardSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Carregando painel de gestão"
    className="flex flex-col gap-4"
  >
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <MetricSkeleton />
      <MetricSkeleton />
      <MetricSkeleton />
    </section>
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.5fr_1fr]">
      <section className="rounded-md bg-[var(--color-bg-surface)] p-5">
        <SkeletonBlock className="mb-4 h-6 w-40" />
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-4 py-3"
          >
            <SkeletonBlock className="h-12 w-14" />
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="h-3 w-1/3" />
            </div>
            <SkeletonBlock className="h-10 w-16" />
          </div>
        ))}
      </section>
      <section className="rounded-md bg-[var(--color-bg-surface)] p-5">
        <SkeletonBlock className="mb-4 h-6 w-48" />
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="mb-4 space-y-2">
            <SkeletonBlock className="h-3 w-2/3" />
            <SkeletonBlock className="h-2.5 w-full rounded-full" />
          </div>
        ))}
      </section>
    </div>
  </SkeletonRegion>
)
