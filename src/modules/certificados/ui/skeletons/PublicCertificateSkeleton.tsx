import React from 'react'
import {
  SkeletonBlock,
  SkeletonRegion,
  TicketSkeleton,
} from '../../../../shared/ui'

/** Validação pública: o veredito no topo, o ingresso com os dados e as ações. */
export const PublicCertificateSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Consultando registro do certificado"
    className="flex flex-col gap-6"
  >
    <div className="flex flex-col gap-4 rounded-md bg-[var(--color-bg-surface)] p-5 sm:flex-row sm:items-center sm:p-6">
      <SkeletonBlock circular className="size-12 shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-7 w-56" />
        <SkeletonBlock className="h-4 w-80 max-w-full" />
      </div>
      <SkeletonBlock className="h-9 w-32" />
    </div>
    <TicketSkeleton compact={false} className="min-h-[14rem]" />
    <div className="flex flex-wrap gap-3">
      <SkeletonBlock className="h-11 w-32" />
      <SkeletonBlock className="h-11 w-44" />
      <SkeletonBlock className="h-11 w-48" />
    </div>
  </SkeletonRegion>
)
