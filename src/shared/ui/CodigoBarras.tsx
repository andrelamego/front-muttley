import React from 'react'
import { barrasDoCodigo } from '../lib/codigoBarras'

/** Código de barras decorativo, sempre o mesmo para a mesma semente. */
export const CodigoBarras: React.FC<{
  semente: number
  className?: string
}> = ({ semente, className = '' }) => {
  const barras = barrasDoCodigo(semente)
  const ultima = barras[barras.length - 1]
  return (
    <svg
      viewBox={`0 0 ${ultima.x + ultima.largura} 24`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      {barras.map((b) => (
        <rect
          key={b.x}
          x={b.x}
          width={b.largura}
          height={b.guia ? 24 : 20}
          fill="currentColor"
        />
      ))}
    </svg>
  )
}
