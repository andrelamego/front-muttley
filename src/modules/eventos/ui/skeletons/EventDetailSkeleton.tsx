import React from 'react'
import {
  SkeletonBlock,
  SkeletonRegion,
  SkeletonText,
} from '../../../../shared/ui'

export const EventDetailSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Carregando detalhes do evento"
    className="flex flex-col gap-6"
  >
    <div className="surface-depth border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-bg-muted)] px-5 py-4">
        <div className="flex gap-2">
          <SkeletonBlock className="h-6 w-32" />
          <SkeletonBlock className="h-6 w-24" />
        </div>
        <SkeletonBlock className="h-9 w-52" />
      </div>

      <div className="flex flex-col gap-5 p-6">
        <div className="space-y-4">
          <SkeletonBlock className="h-9 w-4/5 sm:w-3/5" />
          <SkeletonText lines={3} widths={['100%', '94%', '70%']} />
        </div>
        <div className="grid grid-cols-1 gap-4 border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-5 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="surface-depth border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <div className="border-b border-[var(--color-bg-muted)] px-5 py-4">
        <SkeletonBlock className="h-7 w-56" />
      </div>
      <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className={index === 2 ? 'sm:col-span-2' : ''}>
            <SkeletonBlock className="mb-2 h-3 w-24" />
            <SkeletonBlock className="h-11 w-full border border-[var(--color-border)]" />
          </div>
        ))}
        <SkeletonBlock className="h-11 w-full sm:col-span-2" />
      </div>
    </div>
  </SkeletonRegion>
)
