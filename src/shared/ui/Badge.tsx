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
    default: 'bg-[#f0edea] text-[#57423d] border-[#ddc0ba]',
    success: 'bg-[#beeeca] text-[#244f34] border-[#a2d2af]',
    warning: 'bg-[#ffdad2] text-[#822713] border-[#ffa996]',
    danger: 'bg-[#ffdad6] text-[#93000a] border-[#ffb4a3]',
    info: 'bg-[#dce1ff] text-[#1d3989] border-[#b6c4ff]',
  }[variant]

  return (
    <span
      className={`inline-flex items-center rounded border ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
