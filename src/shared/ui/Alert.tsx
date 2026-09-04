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
    info: 'bg-[#dce1ff] border-[#b6c4ff] text-[#1d3989]',
    success: 'bg-[#beeeca] border-[#a2d2af] text-[#244f34]',
    warning: 'bg-[#ffdad2] border-[#ffa996] text-[#822713]',
    error: 'bg-[#ffdad6] border-[#ffb4a3] text-[#93000a]',
  }[variant]

  const titleStyles = {
    info: 'text-[#00164e]',
    success: 'text-[#00210f]',
    warning: 'text-[#3d0600]',
    error: 'text-[#410002]',
  }[variant]

  return (
    <div
      role="alert"
      className={`p-4 rounded-lg border flex items-start gap-3 text-sm ${variantStyles} ${className}`}
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
