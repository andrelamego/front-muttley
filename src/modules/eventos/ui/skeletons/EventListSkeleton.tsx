import React from 'react'
import {
  SkeletonBlock,
  SkeletonRegion,
  TicketSkeleton,
} from '../../../../shared/ui'

/** Vitrine de eventos: prateleiras com título e uma fileira de ingressos. */
export const EventListSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Buscando eventos disponíveis"
    className="flex flex-col gap-10"
  >
    {Array.from({ length: 2 }, (_, secao) => (
      <div key={secao} className="flex flex-col gap-3">
        <SkeletonBlock className="h-6 w-48" />
        <SkeletonBlock className="h-4 w-64 max-w-full" />
        <div className="-mx-4 flex gap-4 overflow-hidden px-4 sm:mx-0 sm:gap-5 sm:px-0">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="w-[82%] shrink-0 sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
            >
              <TicketSkeleton />
            </div>
          ))}
        </div>
      </div>
    ))}
  </SkeletonRegion>
)
