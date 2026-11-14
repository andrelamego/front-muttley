import React from 'react'
import { SkeletonBlock, SkeletonRegion } from '../../../../shared/ui'

/** Medalhas: a disputa do semestre e as trilhas, cada uma com a moeda e os marcos. */
export const MedalGridSkeleton: React.FC = () => (
  <SkeletonRegion label="Buscando suas medalhas" className="space-y-8">
    <div className="rounded-md bg-[var(--color-bg-surface)] p-5 space-y-4">
      <SkeletonBlock className="h-6 w-56" />
      <SkeletonBlock className="h-4 w-96 max-w-full" />
      {Array.from({ length: 2 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonBlock circular className="size-5 shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-48" />
            <SkeletonBlock className="h-3.5 w-64 max-w-full" />
          </div>
        </div>
      ))}
    </div>
    <div className="space-y-3">
      <SkeletonBlock className="h-6 w-24" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-md bg-[var(--color-bg-surface)] p-4"
          >
            <SkeletonBlock circular className="size-[88px] shrink-0" />
            <div className="flex-1 space-y-2.5">
              <SkeletonBlock className="h-5 w-3/4" />
              <SkeletonBlock className="h-3.5 w-1/2" />
              <div className="flex gap-1.5">
                <SkeletonBlock className="h-5 w-8 rounded-full" />
                <SkeletonBlock className="h-5 w-8 rounded-full" />
                <SkeletonBlock className="h-5 w-8 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </SkeletonRegion>
)
