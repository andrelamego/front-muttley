import React from 'react'
import { SkeletonBlock, SkeletonRegion } from '../../../../shared/ui'

/** Cartões de certificado: selo e data, título, evento, código e ações. */
export const CertificateListSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Buscando seus certificados"
    className="grid grid-cols-1 gap-4 md:grid-cols-2"
  >
    <div className="contents">
      {Array.from({ length: 4 }, (_, i) => (
        <article
          key={i}
          className="flex flex-col gap-4 rounded-md bg-[var(--color-bg-surface)] p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <SkeletonBlock className="h-6 w-28 rounded-full" />
            <SkeletonBlock className="h-3.5 w-20" />
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-5 w-4/5" />
            <SkeletonBlock className="h-3.5 w-1/2" />
          </div>
          <SkeletonBlock className="h-14 w-full" />
          <div className="flex gap-2">
            <SkeletonBlock className="h-9 w-28" />
            <SkeletonBlock className="h-9 w-24" />
          </div>
        </article>
      ))}
    </div>
  </SkeletonRegion>
)
