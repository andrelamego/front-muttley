import React from 'react'

/** Ausência de resultados ou falha: ilustração, o que houve e o que fazer. */
export const EstadoVazio: React.FC<{
  ilustracao: React.ReactElement<{ className?: string }>
  titulo: string
  descricao?: string
  /** Ações, como "Limpar busca" ou "Tentar novamente". */
  children?: React.ReactNode
}> = ({ ilustracao, titulo, descricao, children }) => (
  <div className="rounded-md bg-[var(--color-bg-surface)] px-6 py-10 text-center">
    <div className="mx-auto flex max-w-md flex-col items-center gap-2">
      {React.cloneElement(ilustracao, { className: 'mb-2 h-auto w-36' })}
      <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
        {titulo}
      </h2>
      {descricao && (
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {descricao}
        </p>
      )}
      {children && (
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {children}
        </div>
      )}
    </div>
  </div>
)
