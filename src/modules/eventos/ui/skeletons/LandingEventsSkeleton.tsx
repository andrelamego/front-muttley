import React from 'react'
import { SkeletonRegion, TicketSkeleton } from '../../../../shared/ui'

export const LandingEventsSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Carregando calendário acadêmico"
    className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
  >
    <div className="contents">
      {Array.from({ length: 3 }, (_, index) => (
        <TicketSkeleton
          key={index}
          className={`${index > 0 ? 'hidden md:block' : ''} ${index > 1 ? 'md:hidden lg:block' : ''}`}
        />
      ))}
    </div>
  </SkeletonRegion>
)
