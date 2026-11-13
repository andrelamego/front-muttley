import React from 'react'
import { Logo, ThemeToggle } from '../../../shared/ui'
import { HistoryBackButton } from '../../../shared/navigation'

/** Moldura das telas de acesso (login, cadastro, convite). */
export const AuthLayout: React.FC<{
  titulo: string
  subtitulo: string
  children: React.ReactNode
}> = ({ titulo, subtitulo, children }) => (
  <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
    <HistoryBackButton
      label="Voltar"
      className="fixed left-4 top-4 sm:left-6 sm:top-6"
    />
    <ThemeToggle className="fixed right-4 top-4 sm:right-6 sm:top-6" />
    <div className="w-full max-w-md">
      <div className="text-center mb-6 flex flex-col items-center">
        <div className="inline-flex items-center p-1 mb-2">
          <Logo className="h-9 w-auto" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
          {titulo}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {subtitulo}
        </p>
      </div>
      {children}
      <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
        Muttley &copy; {new Date().getFullYear()}
      </p>
    </div>
  </div>
)
