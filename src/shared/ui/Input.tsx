import React, { useId } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  rightElement?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  rightElement,
  id,
  className = '',
  disabled,
  required,
  ...props
}) => {
  const generatedId = useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`

  const hasError = Boolean(error)

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--color-text-primary)] flex items-center justify-between font-sans"
        >
          <span>
            {label}
            {required && (
              <span
                className="text-[var(--color-danger)] ml-1"
                aria-label="campo obrigatório"
              >
                *
              </span>
            )}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        <input
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? errorId : helperText ? helperId : undefined
          }
          className={`w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-none border bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-[var(--color-bg-subtle)] disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed ${
            hasError
              ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
              : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]'
          } ${rightElement ? 'pr-11' : ''} ${className}`}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-2 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>

      {hasError && (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium text-[var(--color-danger)]"
        >
          {error}
        </p>
      )}

      {!hasError && helperText && (
        <p id={helperId} className="text-xs text-[var(--color-text-muted)]">
          {helperText}
        </p>
      )}
    </div>
  )
}
