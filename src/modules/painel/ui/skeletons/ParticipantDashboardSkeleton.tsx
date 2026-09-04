import React from 'react'
import {
  SkeletonBlock,
  SkeletonRegion,
  SkeletonText,
} from '../../../../shared/ui'

export const ParticipantDashboardSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Carregando seus compromissos"
    className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12"
  >
    <div className="flex flex-col gap-8 lg:col-span-8">
      <section>
        <SkeletonBlock className="mb-4 h-8 w-44" />
        <div className="surface-depth border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <div className="flex justify-between gap-4 border-b border-[var(--color-bg-muted)] bg-[var(--color-bg-subtle)] px-6 py-3">
            <SkeletonBlock className="h-4 w-48" />
            <SkeletonBlock className="h-5 w-20" />
          </div>
          <div className="flex flex-col gap-5 p-6 sm:p-8">
            <SkeletonBlock className="h-9 w-4/5" />
            <SkeletonText lines={3} widths={['100%', '90%', '64%']} />
            <div className="grid grid-cols-1 gap-3 bg-[var(--color-bg-subtle)] p-4 sm:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="space-y-2">
                  <SkeletonBlock className="h-3 w-20" />
                  <SkeletonBlock className="h-4 w-4/5" />
                </div>
              ))}
            </div>
            <SkeletonBlock className="h-11 w-full sm:w-56" />
          </div>
        </div>
      </section>

      <section>
        <SkeletonBlock className="mb-4 h-8 w-56" />
        <div className="surface-depth divide-y divide-[var(--color-bg-muted)] border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex items-start gap-4 p-5">
              <div className="w-16 shrink-0 space-y-2 border-r border-[var(--color-border)] pr-4">
                <SkeletonBlock className="h-7 w-10" />
                <SkeletonBlock className="h-3 w-12" />
              </div>
              <div className="flex-1 space-y-3">
                <SkeletonBlock className="h-6 w-3/4" />
                <SkeletonText lines={2} widths={['58%', '46%']} />
              </div>
              <SkeletonBlock className="hidden h-9 w-24 sm:block" />
            </div>
          ))}
        </div>
      </section>
    </div>

    <aside className="flex flex-col gap-6 lg:col-span-4">
      <SkeletonBlock className="h-8 w-44" />
      <div className="surface-depth border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <div className="space-y-5">
          <SkeletonBlock className="h-6 w-4/5" />
          <SkeletonText lines={2} widths={['100%', '70%']} />
          <div className="border-t border-[var(--color-bg-muted)] pt-5">
            <SkeletonBlock className="h-11 w-full" />
          </div>
        </div>
      </div>
      <div className="surface-depth border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <SkeletonBlock className="mb-4 h-6 w-36" />
        <div className="grid grid-cols-2 gap-4">
          <SkeletonBlock className="h-20 w-full" />
          <SkeletonBlock className="h-20 w-full" />
        </div>
      </div>
    </aside>
  </SkeletonRegion>
)
