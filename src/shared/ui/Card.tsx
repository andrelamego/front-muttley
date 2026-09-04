import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'outline'
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default:
      'bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-xs',
    subtle: 'bg-[var(--color-bg-subtle)] border border-[var(--color-border)]',
    outline: 'bg-transparent border border-[var(--color-border)]',
  }[variant]

  return (
    <div
      className={`surface-depth rounded-none overflow-hidden transition-all ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className={`px-5 py-4 border-b border-[var(--color-bg-muted)] flex flex-col gap-1 ${className}`}
    {...props}
  >
    {children}
  </div>
)

export const CardTitle: React.FC<
  React.HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' }
> = ({ children, as = 'h2', className = '', ...props }) => {
  const Tag = as
  return (
    <Tag
      className={`text-lg font-semibold text-[var(--color-text-primary)] tracking-tight font-serif ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}

export const CardDescription: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({ children, className = '', ...props }) => (
  <p
    className={`text-sm text-[var(--color-text-secondary)] ${className}`}
    {...props}
  >
    {children}
  </p>
)

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
)

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className={`px-5 py-3.5 bg-[var(--color-bg-subtle)] border-t border-[var(--color-bg-muted)] flex items-center justify-between ${className}`}
    {...props}
  >
    {children}
  </div>
)
