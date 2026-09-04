import React from 'react'
import { Spinner } from './Spinner'

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
    'inline-flex items-center justify-center font-medium rounded transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none box-border border text-center font-sans'

  // Alturas padronizadas: no mobile, alvos de toque respeitam o minimo recomendado (44px)
  const sizeStyles = {
    sm: 'min-h-[40px] sm:min-h-[36px] h-10 sm:h-9 px-3 text-xs gap-1.5 leading-none',
    md: 'min-h-[44px] h-11 px-4 text-sm gap-2 leading-none',
    lg: 'min-h-[48px] h-12 px-6 text-base gap-2.5 leading-none font-semibold',
  }[size]

  const variantStyles = {
    primary:
      'border-transparent bg-[#6b1705] text-white hover:bg-[#8b2e19] active:bg-[#3d0600] focus-visible:ring-[#6b1705] focus-visible:ring-offset-white shadow-xs',
    secondary:
      'border-transparent bg-[#f0edea] text-[#1c1c1a] hover:bg-[#ebe8e4] active:bg-[#e5e2de] focus-visible:ring-[#6b1705] focus-visible:ring-offset-white',
    outline:
      'border-[#ddc0ba] text-[#1c1c1a] bg-white hover:bg-[#f6f3ef] active:bg-[#f0edea] focus-visible:ring-[#6b1705] focus-visible:ring-offset-white shadow-xs',
    ghost:
      'border-transparent text-[#57423d] hover:bg-[#f0edea] hover:text-[#1c1c1a] active:bg-[#e5e2de] focus-visible:ring-[#6b1705] focus-visible:ring-offset-white',
    danger:
      'border-transparent bg-[#ba1a1a] text-white hover:bg-[#93000a] active:bg-[#680005] focus-visible:ring-[#ba1a1a] focus-visible:ring-offset-white shadow-xs',
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
        <span className="inline-flex items-center justify-center gap-2">
          <Spinner size="sm" className="text-current shrink-0" />
          <span>{loadingText || children}</span>
        </span>
      ) : (
        <span className="inline-flex items-center justify-center gap-2">
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
