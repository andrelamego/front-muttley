import React from 'react'
import { SkeletonBlock, SkeletonRegion } from '../../shared/ui'

/** Enquanto a sessão é conferida: cabeçalho com logo e avatar, e a página em superfícies lisas. */
export const SessionSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Verificando autenticação"
    className="min-h-dvh bg-[var(--color-bg-page)]"
  >
    <div className="h-16 border-b border-[var(--color-border)]/60 px-4 sm:px-6">
      <div className="mx-auto flex h-full max-w-[76rem] items-center justify-between">
        <SkeletonBlock className="h-7 w-28" />
        <SkeletonBlock circular className="size-9" />
      </div>
    </div>
    <div className="mx-auto flex w-full max-w-[76rem] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <SkeletonBlock className="h-9 w-72 max-w-full" />
        <SkeletonBlock className="h-4 w-[28rem] max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="rounded-md bg-[var(--color-bg-surface)] p-5">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="mt-3 h-10 w-16" />
          </div>
        ))}
      </div>
      <div className="rounded-md bg-[var(--color-bg-surface)] p-5 space-y-4">
        <SkeletonBlock className="h-6 w-40" />
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonBlock key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  </SkeletonRegion>
)
