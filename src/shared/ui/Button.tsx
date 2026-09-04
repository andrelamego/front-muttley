import React from 'react'
import { LoadingDots } from './LoadingDots'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  loadingText?: string
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  type = 'button',
  ...props
}) => {
  // Borda reservada em todas as variantes (border) garante geometria identica e sem saltos de layout
  const baseStyles =
    'inline-flex flex-row flex-nowrap items-center justify-center font-medium rounded-none transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none box-border border text-center font-sans'

  // Alturas padronizadas: no mobile, alvos de toque respeitam o minimo recomendado (44px)
  const sizeStyles = {
    sm: 'min-h-[40px] sm:min-h-[36px] h-10 sm:h-9 px-3 text-xs gap-1.5 leading-none',
    md: 'min-h-[44px] h-11 px-4 text-sm gap-2 leading-none',
    lg: 'min-h-[48px] h-12 px-6 text-base gap-2.5 leading-none font-semibold',
  }[size]

  const variantStyles = {
    primary:
      'border-transparent bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)] focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-[var(--color-bg-surface)] shadow-xs',
    secondary:
      'border-transparent bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] active:bg-[var(--color-bg-active)] focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-[var(--color-bg-surface)]',
    outline:
      'border-[var(--color-border)] text-[var(--color-text-primary)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-subtle)] active:bg-[var(--color-bg-muted)] focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-[var(--color-bg-surface)] shadow-xs',
    ghost:
      'border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)] active:bg-[var(--color-bg-active)] focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-[var(--color-bg-surface)]',
    danger:
      'border-transparent bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger-text)] active:bg-[var(--color-danger)] focus-visible:ring-[var(--color-danger)] focus-visible:ring-offset-[var(--color-bg-surface)] shadow-xs',
  }[variant]

  const widthStyle = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex flex-row flex-nowrap items-center justify-center gap-2">
          <LoadingDots label={loadingText || 'Processando'} />
          <span>{loadingText || children}</span>
        </span>
      ) : (
        <span className="inline-flex flex-row flex-nowrap items-center justify-center gap-2">
          {leftIcon && (
            <span
              aria-hidden="true"
              className="shrink-0 inline-flex items-center"
            >
              {leftIcon}
            </span>
          )}
          <span>{children}</span>
          {rightIcon && (
            <span
              aria-hidden="true"
              className="shrink-0 inline-flex items-center"
            >
              {rightIcon}
            </span>
          )}
        </span>
      )}
    </button>
  )
}
