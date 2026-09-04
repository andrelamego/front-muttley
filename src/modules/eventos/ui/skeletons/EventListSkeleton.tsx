import React from 'react'
import {
  SkeletonBlock,
  SkeletonRegion,
  SkeletonText,
} from '../../../../shared/ui'

const EventCardSkeleton: React.FC = () => (
  <article className="surface-depth flex min-h-[22rem] flex-col justify-between overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
    <div className="flex items-center justify-between gap-2 border-b border-[var(--color-bg-muted)] px-5 py-4">
      <SkeletonBlock className="h-6 w-32" />
      <SkeletonBlock className="h-6 w-24" />
    </div>

    <div className="flex flex-1 flex-col gap-4 p-5">
      <SkeletonBlock className="h-7 w-4/5" />
      <SkeletonText lines={3} widths={['100%', '92%', '68%']} />
      <div className="mt-auto grid grid-cols-2 gap-3 border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-3">
        <div className="space-y-2">
          <SkeletonBlock className="h-2.5 w-12" />
          <SkeletonBlock className="h-4 w-24" />
        </div>
        <div className="space-y-2">
          <SkeletonBlock className="h-2.5 w-14" />
          <SkeletonBlock className="h-4 w-28" />
        </div>
        <div className="col-span-2 space-y-2">
          <SkeletonBlock className="h-2.5 w-20" />
          <SkeletonBlock className="h-4 w-3/5" />
        </div>
      </div>
    </div>

    <div className="border-t border-[var(--color-bg-muted)] bg-[var(--color-bg-subtle)] p-4">
      <SkeletonBlock className="h-11 w-full" />
    </div>
  </article>
)

export const EventListSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Buscando eventos disponíveis"
    className="grid grid-cols-1 gap-5 md:grid-cols-2"
  >
    <div className="contents">
      {Array.from({ length: 4 }, (_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  </SkeletonRegion>
)
