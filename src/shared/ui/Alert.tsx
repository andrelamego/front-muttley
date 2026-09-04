import React from 'react'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  onClose?: () => void
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  onClose,
  className = '',
  ...props
}) => {
  const variantStyles = {
    info: 'bg-[var(--color-info-bg)] border-[var(--color-info-border)] text-[var(--color-info-text)]',
    success:
      'bg-[var(--color-success-bg)] border-[var(--color-success-border)] text-[var(--color-success-text)]',
    warning:
      'bg-[var(--color-primary-subtle)] border-[var(--color-warning-border)] text-[var(--color-warning-text)]',
    error:
      'bg-[var(--color-danger-bg)] border-[var(--color-danger-border)] text-[var(--color-danger-text)]',
  }[variant]

  const titleStyles = {
    info: 'text-[var(--color-info-text)]',
    success: 'text-[var(--color-success-text)]',
    warning: 'text-[var(--color-primary-active)]',
    error: 'text-[var(--color-danger-text)]',
  }[variant]

  return (
    <div
      role="alert"
      className={`p-4 rounded-none border flex items-start gap-3 text-sm ${variantStyles} ${className}`}
      {...props}
    >
      <div className="flex-1 flex flex-col gap-0.5">
        {title && (
          <p className={`font-semibold text-sm ${titleStyles}`}>{title}</p>
        )}
        <div className="text-sm leading-relaxed">{children}</div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar alerta"
          className="p-1 rounded-none hover:bg-black/5 active:bg-black/10 transition-colors -mr-1 -mt-1 cursor-pointer focus-visible:ring-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
