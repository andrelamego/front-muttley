import React from 'react'
import {
  SkeletonBlock,
  SkeletonRegion,
  SkeletonText,
} from '../../../../shared/ui'

export const CertificateListSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Buscando seus certificados"
    className="grid grid-cols-1 gap-4 md:grid-cols-2"
  >
    <div className="contents">
      {Array.from({ length: 4 }, (_, index) => (
        <article
          key={index}
          className="surface-depth flex min-h-72 flex-col justify-between border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
        >
          <div>
            <div className="flex justify-between gap-3 border-b border-[var(--color-border-subtle)] p-4">
              <SkeletonBlock className="h-6 w-36" />
              <SkeletonBlock className="h-4 w-20" />
            </div>
            <div className="space-y-4 p-5">
              <SkeletonBlock className="h-6 w-4/5" />
              <SkeletonText lines={2} widths={['68%', '48%']} />
              <div className="flex items-center justify-between gap-3 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3">
                <div className="flex-1 space-y-2">
                  <SkeletonBlock className="h-2.5 w-28" />
                  <SkeletonBlock className="h-4 w-3/4" />
                </div>
                <SkeletonBlock className="h-9 w-10" />
              </div>
            </div>
          </div>
          <div className="flex justify-between gap-3 border-t border-[var(--color-border-subtle)] p-4">
            <div className="flex gap-2">
              <SkeletonBlock className="h-9 w-24" />
              <SkeletonBlock className="h-9 w-20" />
            </div>
            <SkeletonBlock className="h-8 w-20" />
          </div>
        </article>
      ))}
    </div>
  </SkeletonRegion>
)
