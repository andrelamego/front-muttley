import React from 'react'
import {
  SkeletonBlock,
  SkeletonRegion,
  TicketSkeleton,
} from '../../../../shared/ui'

const LinhaSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 rounded-md bg-[var(--color-bg-surface)] p-3">
    <SkeletonBlock className="h-12 w-12 shrink-0" />
    <div className="flex-1 space-y-2">
      <SkeletonBlock className="h-4 w-3/4" />
      <SkeletonBlock className="h-3 w-1/2" />
    </div>
  </div>
)

export const ParticipantDashboardSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Carregando seus compromissos"
    className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8"
  >
    <div className="flex flex-col gap-6 lg:col-span-7">
      <TicketSkeleton compact={false} className="min-h-[15rem]" />
      <div className="flex flex-col gap-2">
        <SkeletonBlock className="mb-1 h-6 w-32" />
        <LinhaSkeleton />
      </div>
    </div>
    <div className="flex flex-col gap-2 lg:col-span-5 lg:mt-16">
      <SkeletonBlock className="mb-1 h-6 w-32" />
      <LinhaSkeleton />
      <LinhaSkeleton />
      <LinhaSkeleton />
    </div>
  </SkeletonRegion>
)
