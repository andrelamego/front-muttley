import React from 'react'
import { LoadingDots } from './LoadingDots'
import {
  classesBotao,
  type TamanhoBotao,
  type VarianteBotao,
} from './botaoEstilos'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: VarianteBotao
  size?: TamanhoBotao
  isLoading?: boolean
  loadingText?: string
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

/** Ícones e rótulo, na mesma disposição para botão e link. */
export const ConteudoBotao: React.FC<{
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
}> = ({ leftIcon, rightIcon, children }) => (
  <span className="inline-flex flex-row flex-nowrap items-center justify-center gap-2">
    {leftIcon && (
      <span aria-hidden="true" className="shrink-0 inline-flex items-center">
        {leftIcon}
      </span>
    )}
    <span className="inline-flex items-center gap-2">{children}</span>
    {rightIcon && (
      <span aria-hidden="true" className="shrink-0 inline-flex items-center">
        {rightIcon}
      </span>
    )}
  </span>
)

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
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={classesBotao({ variant, size, fullWidth, className })}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex flex-row flex-nowrap items-center justify-center gap-2">
          <LoadingDots label={loadingText || 'Processando'} />
          <span className="inline-flex items-center gap-2">
            {loadingText || children}
          </span>
        </span>
      ) : (
        <ConteudoBotao leftIcon={leftIcon} rightIcon={rightIcon}>
          {children}
        </ConteudoBotao>
      )}
    </button>
  )
}
