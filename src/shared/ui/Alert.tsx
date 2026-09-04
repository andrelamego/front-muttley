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
    info: 'bg-sky-50 border-sky-200 text-sky-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    error: 'bg-red-50 border-red-200 text-red-900',
  }[variant]

  const titleStyles = {
    info: 'text-sky-950',
    success: 'text-emerald-950',
    warning: 'text-amber-950',
    error: 'text-red-950',
  }[variant]

  return (
    <div
      role="alert"
      className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${variantStyles} ${className}`}
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
          className="p-1 rounded-md hover:bg-black/5 active:bg-black/10 transition-colors -mr-1 -mt-1 cursor-pointer focus-visible:ring-2"
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
