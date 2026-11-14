import React from 'react'
import { SkeletonRegion, TicketSkeleton } from '../../../../shared/ui'

export const EventListSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Buscando eventos disponíveis"
    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
  >
    <div className="contents">
      {Array.from({ length: 6 }, (_, index) => (
        <TicketSkeleton key={index} />
      ))}
    </div>
  </SkeletonRegion>
)
