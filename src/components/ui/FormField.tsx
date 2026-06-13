import type { ReactNode } from 'react'
import { cx } from './utils'

type FormFieldProps = {
  label: string
  htmlFor?: string
  required?: boolean
  help?: string
  error?: string
  className?: string
  children: ReactNode
}

export function FormField({
  label,
  htmlFor,
  required,
  help,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <label className={cx('ui-form-field', className)} htmlFor={htmlFor}>
      <span>
        {label}
        {required && <b aria-hidden="true">*</b>}
      </span>
      {children}
      {help && !error && <small>{help}</small>}
      {error && <small className="ui-form-field__error">{error}</small>}
    </label>
  )
}
