import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '../ui/icons'

export interface HistoryBackButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'onClick'
> {
  label?: string
}

export const HistoryBackButton: React.FC<HistoryBackButtonProps> = ({
  label = 'Voltar',
  className = '',
  ...props
}) => {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className={`inline-flex flex-row flex-nowrap items-center gap-1.5 text-xs font-semibold text-[var(--color-primary-text)] transition-colors hover:text-[var(--color-primary-text-hover)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] ${className}`}
      {...props}
    >
      <ArrowLeftIcon size={15} className="shrink-0" />
      <span>{label}</span>
    </button>
  )
}
