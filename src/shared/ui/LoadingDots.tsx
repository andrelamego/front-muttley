import React from 'react'

export interface LoadingDotsProps {
  label?: string
  className?: string
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  label = 'Processando',
  className = '',
}) => (
  <span
    role="status"
    aria-label={label}
    className={`loading-dots ${className}`}
  >
    <span aria-hidden="true" />
    <span aria-hidden="true" />
    <span aria-hidden="true" />
    <span className="sr-only">{label}</span>
  </span>
)
