import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
  }[size]

  const variantStyles = {
    default:
      'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
    success:
      'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)]',
    warning:
      'bg-[var(--color-primary-subtle)] text-[var(--color-warning-text)] border-[var(--color-warning-border)]',
    danger:
      'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border-[var(--color-danger-border)]',
    info: 'bg-[var(--color-info-bg)] text-[var(--color-info-text)] border-[var(--color-info-border)]',
  }[variant]

  return (
    <span
      className={`inline-flex items-center rounded-none border ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
