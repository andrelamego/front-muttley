import React from 'react'

export interface LogoProps {
  className?: string
  variant?: 'full' | 'mark'
}

// Marca: canhoto de ingresso amarelo, com o recorte da perfuração na borda direita.
const STUB_PATH =
  'M3 0h8a3 3 0 0 1 3 3v4.5a3.5 3.5 0 0 0 0 7V19a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3z'

export const Logo: React.FC<LogoProps> = ({
  className = 'h-8 w-auto',
  variant = 'full',
}) => {
  if (variant === 'mark') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-5 -1 24 24"
        className={className}
        role="img"
        aria-label="Muttley"
      >
        <path d={STUB_PATH} fill="var(--color-signal)" />
      </svg>
    )
  }

  // O texto herda a cor do contexto (currentColor), o que serve ao fundo claro e à barra lateral escura.
  // A largura termina onde termina "Muttley" (88,6): sobra à direita descentralizava o logo.
  // overflow visível: se a fonte da marca não carregar, o texto da fonte reserva não é cortado.
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 90 28"
      overflow="visible"
      className={className}
      role="img"
      aria-label="Muttley"
    >
      <path
        d={STUB_PATH}
        transform="translate(0 3)"
        fill="var(--color-signal)"
      />
      <text
        x="22"
        y="21"
        fill="currentColor"
        fontSize="22"
        fontWeight="800"
        style={{
          fontFamily: 'var(--font-display)',
          fontVariationSettings: "'wdth' 78",
          letterSpacing: '-0.02em',
        }}
      >
        Muttley
      </text>
    </svg>
  )
}
