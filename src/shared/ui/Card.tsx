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
    default: 'bg-white border border-slate-200 shadow-sm',
    subtle: 'bg-slate-50 border border-slate-200',
    outline: 'bg-transparent border border-slate-200',
  }[variant]

  return (
    <div
      className={`rounded-xl overflow-hidden transition-all ${variantStyles} ${className}`}
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
    className={`px-5 py-4 border-b border-slate-100 flex flex-col gap-1 ${className}`}
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
      className={`text-lg font-semibold text-slate-900 tracking-tight ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}

export const CardDescription: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-slate-500 ${className}`} {...props}>
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
    className={`px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between ${className}`}
    {...props}
  >
    {children}
  </div>
)
