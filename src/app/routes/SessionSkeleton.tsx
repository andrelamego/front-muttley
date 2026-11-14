import React from 'react'
import { SkeletonBlock, SkeletonRegion } from '../../shared/ui'

export const SessionSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Verificando autenticação"
    className="min-h-screen bg-[var(--color-bg-page)]"
  >
    <div className="h-16 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 sm:px-6">
      <div className="mx-auto flex h-full max-w-[76rem] items-center justify-between">
        <SkeletonBlock className="h-8 w-32" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-10 w-10" />
          <SkeletonBlock className="h-10 w-24" />
        </div>
      </div>
    </div>
    <div className="mx-auto flex w-full max-w-[76rem] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-3 border-b border-[var(--color-border)] pb-6">
        <SkeletonBlock className="h-3 w-64 max-w-full" />
        <SkeletonBlock className="h-10 w-80 max-w-full" />
        <SkeletonBlock className="h-4 w-[32rem] max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <SkeletonBlock
            key={index}
            className="surface-depth h-44 border border-[var(--color-border)]"
          />
        ))}
      </div>
      <SkeletonBlock className="surface-depth h-80 w-full border border-[var(--color-border)]" />
    </div>
  </SkeletonRegion>
)
