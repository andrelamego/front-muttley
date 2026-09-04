import React from 'react'
import {
  SkeletonBlock,
  SkeletonRegion,
  SkeletonText,
} from '../../../../shared/ui'

export const MedalGridSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Buscando suas conquistas"
    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
  >
    <div className="contents">
      {Array.from({ length: 6 }, (_, index) => (
        <article
          key={index}
          className="surface-depth flex min-h-72 flex-col items-center border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 text-center"
        >
          <SkeletonBlock circular className="mb-5 h-20 w-20" />
          <SkeletonBlock className="mb-3 h-6 w-3/4" />
          <SkeletonBlock className="mb-4 h-5 w-20" />
          <SkeletonText
            lines={3}
            widths={['100%', '88%', '64%']}
            className="w-full items-center"
          />
          <SkeletonBlock className="mt-auto h-4 w-2/3" />
        </article>
      ))}
    </div>
  </SkeletonRegion>
)
