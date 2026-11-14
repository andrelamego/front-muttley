import React from 'react'
import { SkeletonBlock, SkeletonRegion } from '../../../shared/ui'

export const AdminDataSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Carregando dados administrativos"
    className="space-y-6"
  >
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="surface-depth border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5"
        >
          <SkeletonBlock className="h-3 w-24 mb-4" />
          <SkeletonBlock className="h-9 w-16" />
        </div>
      ))}
    </div>
    <div className="border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <div className="p-5 border-b border-[var(--color-border)]">
        <SkeletonBlock className="h-10 w-full max-w-sm" />
      </div>
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="grid grid-cols-4 gap-5 p-5 border-b last:border-b-0 border-[var(--color-border-subtle)]"
        >
          <SkeletonBlock className="h-4 col-span-2" />
          <SkeletonBlock className="h-4" />
          <SkeletonBlock className="h-4" />
        </div>
      ))}
    </div>
  </SkeletonRegion>
)
