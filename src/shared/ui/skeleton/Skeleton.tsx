import React from 'react'

interface SkeletonBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  circular?: boolean
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  circular = false,
  className = '',
  ...props
}) => (
  <div
    aria-hidden="true"
    className={`skeleton-shape ${circular ? 'rounded-full' : 'rounded-none'} ${className}`}
    {...props}
  />
)

interface SkeletonTextProps {
  lines?: number
  widths?: string[]
  className?: string
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 1,
  widths = [],
  className = '',
}) => (
  <div aria-hidden="true" className={`flex flex-col gap-2 ${className}`}>
    {Array.from({ length: lines }, (_, index) => (
      <SkeletonBlock
        key={index}
        className="h-3"
        style={{
          width: widths[index] || (index === lines - 1 ? '72%' : '100%'),
        }}
      />
    ))}
  </div>
)

interface SkeletonRegionProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
}

export const SkeletonRegion: React.FC<SkeletonRegionProps> = ({
  label,
  className = '',
  children,
  ...props
}) => (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    className={className}
    {...props}
  >
    <span className="sr-only">{label}</span>
    <div aria-hidden="true" className="contents">
      {children}
    </div>
  </div>
)
