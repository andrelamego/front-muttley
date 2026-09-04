import React from 'react'
import {
  SkeletonBlock,
  SkeletonRegion,
  SkeletonText,
} from '../../../../shared/ui'

export const PublicCertificateSkeleton: React.FC = () => (
  <SkeletonRegion label="Consultando registro do certificado">
    <div className="surface-depth border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <div className="flex flex-wrap justify-between gap-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-4">
        <div className="flex gap-3">
          <SkeletonBlock className="h-6 w-36" />
          <SkeletonBlock className="h-4 w-28" />
        </div>
        <SkeletonBlock className="h-9 w-36" />
      </div>
      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="space-y-4 border-b border-[var(--color-border-subtle)] py-4 text-center">
          <SkeletonBlock className="mx-auto h-3 w-72 max-w-full" />
          <SkeletonBlock className="mx-auto h-9 w-3/5" />
          <SkeletonText
            lines={2}
            widths={['80%', '58%']}
            className="mx-auto max-w-xl items-center"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-4 sm:grid-cols-2">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonBlock className="h-3 w-40" />
              <SkeletonBlock className="h-4 w-4/5" />
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <SkeletonBlock className="h-11 w-full sm:w-52" />
          <SkeletonBlock className="h-11 w-full sm:w-48" />
          <SkeletonBlock className="h-11 w-full sm:w-48" />
        </div>
      </div>
    </div>
  </SkeletonRegion>
)
