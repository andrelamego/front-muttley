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
          className="text-sm font-medium text-[#1c1c1a] flex items-center justify-between font-sans"
        >
          <span>
            {label}
            {required && (
              <span
                className="text-[#ba1a1a] ml-1"
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
          className={`w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded border bg-white text-[#1c1c1a] placeholder:text-[#8a726c] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-[#f6f3ef] disabled:text-[#8a726c] disabled:cursor-not-allowed ${
            hasError
              ? 'border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-[#ba1a1a]'
              : 'border-[#ddc0ba] focus:border-[#6b1705] focus:ring-[#6b1705]'
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
          className="text-xs font-medium text-red-600"
        >
          {error}
        </p>
      )}

      {!hasError && helperText && (
        <p id={helperId} className="text-xs text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  )
}
