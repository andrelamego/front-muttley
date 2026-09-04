import React from 'react'
import {
  SkeletonBlock,
  SkeletonRegion,
  SkeletonText,
} from '../../../../shared/ui'

export const LandingEventsSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Carregando calendário acadêmico"
    className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
  >
    <div className="contents">
      {Array.from({ length: 3 }, (_, index) => (
        <article
          key={index}
          className={`surface-depth flex min-h-[22rem] flex-col justify-between border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 ${index > 0 ? 'hidden md:flex' : ''} ${index > 1 ? 'md:hidden lg:flex' : ''}`}
        >
          <div>
            <div className="mb-5 flex items-start justify-between">
              <div className="space-y-2">
                <SkeletonBlock className="h-9 w-12" />
                <SkeletonBlock className="h-3 w-24" />
              </div>
              <SkeletonBlock className="h-6 w-24" />
            </div>
            <SkeletonBlock className="mb-3 h-7 w-4/5" />
            <SkeletonText lines={3} widths={['100%', '90%', '66%']} />
          </div>
          <div className="-mx-6 -mb-6 mt-6 border-t border-[var(--color-bg-muted)] bg-[var(--color-bg-subtle)] p-6">
            <div className="mb-5 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <SkeletonBlock className="h-2.5 w-14" />
                <SkeletonBlock className="h-4 w-24" />
              </div>
              <div className="space-y-2">
                <SkeletonBlock className="h-2.5 w-12" />
                <SkeletonBlock className="h-4 w-28" />
              </div>
            </div>
            <SkeletonBlock className="h-11 w-full" />
          </div>
        </article>
      ))}
    </div>
  </SkeletonRegion>
)
