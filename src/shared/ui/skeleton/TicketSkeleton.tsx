import React from 'react'
import { SkeletonBlock } from './Skeleton'

/** Esqueleto com a forma do ingresso compacto, para listas e grades de eventos. */
export const TicketSkeleton: React.FC<{
  className?: string
  compact?: boolean
}> = ({ className = '', compact = true }) => (
  <div className={`ticket-shadow ${className}`}>
    <div className={`ticket h-full ${compact ? 'ticket--compact' : ''}`}>
      <div className="ticket-body flex flex-col gap-3">
        <SkeletonBlock className="h-5 w-28 rounded-full" />
        <SkeletonBlock className="h-5 w-4/5" />
        <SkeletonBlock className="h-4 w-1/2" />
        <SkeletonBlock className="h-4 w-36 mt-2" />
      </div>
      <div className="ticket-stub">
        <SkeletonBlock className="h-8 w-9" />
        <SkeletonBlock className="h-3 w-7 mt-1" />
        <SkeletonBlock className="h-5 w-10 mt-2 rounded-full" />
      </div>
    </div>
  </div>
)
