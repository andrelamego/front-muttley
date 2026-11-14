import React from 'react'
import { SkeletonBlock, SkeletonRegion } from '../../../shared/ui'

/** Pessoas, cadastros e certificados da coordenação: indicadores, filtros e a lista. */
export const AdminDataSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Carregando dados administrativos"
    className="space-y-6"
  >
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="rounded-md bg-[var(--color-bg-surface)] p-5">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="mt-3 h-9 w-16" />
          <SkeletonBlock className="mt-3 h-3 w-36" />
        </div>
      ))}
    </div>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <SkeletonBlock className="h-10 w-80 max-w-full rounded-full" />
      <SkeletonBlock className="h-10 w-full sm:w-80" />
    </div>
    <div className="overflow-hidden rounded-md bg-[var(--color-bg-surface)]">
      <div className="bg-[var(--color-bg-subtle)] px-5 py-3.5">
        <SkeletonBlock className="h-3.5 w-1/3" />
      </div>
      <div className="divide-y divide-[var(--color-border-subtle)]">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-5 px-5 py-4">
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-1/2" />
              <SkeletonBlock className="h-3 w-1/3" />
            </div>
            <SkeletonBlock className="hidden h-6 w-24 rounded-full sm:block" />
            <SkeletonBlock className="h-8 w-8" />
          </div>
        ))}
      </div>
    </div>
  </SkeletonRegion>
)
