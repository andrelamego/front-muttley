import React from 'react'
import { useTheme } from '../theme'
import { MoonIcon, SunIcon } from './icons'

export interface ThemeToggleProps {
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme()
  const nextThemeLabel = theme === 'light' ? 'escuro' : 'claro'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-none border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-primary-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] ${className}`}
      aria-label={`Ativar tema ${nextThemeLabel}`}
      aria-pressed={theme === 'dark'}
      title={`Ativar tema ${nextThemeLabel}`}
    >
      {theme === 'light' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
    </button>
  )
}
