import React from 'react'
import {
  SkeletonBlock,
  SkeletonRegion,
  TicketSkeleton,
} from '../../../../shared/ui'

/** Detalhe do evento: o ingresso com os dados e o cartão de inscrição. */
export const EventDetailSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Carregando detalhes do evento"
    className="flex flex-col gap-6"
  >
    <TicketSkeleton compact={false} className="min-h-[15rem]" />
    <div className="rounded-md bg-[var(--color-bg-surface)] p-6 space-y-5">
      <SkeletonBlock className="h-6 w-32" />
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i}>
          <SkeletonBlock className="mb-2 h-3.5 w-28" />
          <SkeletonBlock className="h-11 w-full rounded-sm" />
        </div>
      ))}
      <SkeletonBlock className="h-11 w-full" />
    </div>
  </SkeletonRegion>
)
