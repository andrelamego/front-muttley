import React, { useId } from 'react'
import {
  emblema,
  progresso,
  type Nivel,
  type Trilha,
} from '../domain/conquistas'

// Metal de cada nível: luz, corpo e sombra do gradiente radial, e a tinta da gravação.
const METAL: Record<
  Nivel,
  { luz: string; corpo: string; sombra: string; gravura: string }
> = {
  BRONZE: {
    luz: '#ffd7b0',
    corpo: '#cd7f43',
    sombra: '#7a3f1c',
    gravura: '#5c2c10',
  },
  PRATA: {
    luz: '#ffffff',
    corpo: '#c3c8e4',
    sombra: '#6f769e',
    gravura: '#3d4366',
  },
  OURO: {
    luz: '#fff6c4',
    corpo: '#ffcf1f',
    sombra: '#a87400',
    gravura: '#6b4a00',
  },
}

const SERRILHA = Array.from({ length: 40 }, (_, i) => i * 9)

/**
 * Moeda cunhada da trilha, com um anel que mostra o caminho até o próximo metal.
 * Sem nível ainda, aparece só o molde tracejado.
 */
export const MoedaTrilha: React.FC<{
  trilha: Trilha
  tamanho?: number
  /** Sem o anel de progresso, para vitrines onde só a medalha importa. */
  semAnel?: boolean
}> = ({ trilha, tamanho = 88, semAnel = false }) => {
  const id = useId().replace(/:/g, '')
  const metal = trilha.nivel ? METAL[trilha.nivel] : null
  const proximo = trilha.proximoNivel ? METAL[trilha.proximoNivel] : METAL.OURO
  const fracao = progresso(trilha)
  const raioAnel = 41
  const volta = 2 * Math.PI * raioAnel
  const texto = emblema(trilha)

  return (
    <svg
      // Sem anel, recorta a área dele para a moeda ocupar todo o tamanho pedido.
      viewBox={semAnel ? '14 14 68 68' : '0 0 96 96'}
      width={tamanho}
      height={tamanho}
      className="shrink-0 overflow-visible"
      aria-hidden
    >
      <defs>
        {metal && (
          <>
            <radialGradient id={`${id}-metal`} cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor={metal.luz} />
              <stop offset="45%" stopColor={metal.corpo} />
              <stop offset="100%" stopColor={metal.sombra} />
            </radialGradient>
            <linearGradient id={`${id}-borda`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={metal.sombra} />
              <stop offset="50%" stopColor={metal.luz} />
              <stop offset="100%" stopColor={metal.sombra} />
            </linearGradient>
          </>
        )}
      </defs>

      {!semAnel && (
        <>
          {/* Anel de progresso até o próximo metal */}
          <circle
            cx="48"
            cy="48"
            r={raioAnel}
            fill="none"
            stroke="var(--color-bg-muted)"
            strokeWidth="5"
          />
          {fracao > 0 && (
            <circle
              cx="48"
              cy="48"
              r={raioAnel}
              fill="none"
              stroke={proximo.corpo}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${volta * fracao} ${volta}`}
              transform="rotate(-90 48 48)"
              className="moeda-anel"
            />
          )}
        </>
      )}

      {metal ? (
        <g className="moeda">
          {/* Serrilha da borda, como numa moeda cunhada */}
          {SERRILHA.map((angulo) => (
            <rect
              key={angulo}
              x="47"
              y="13"
              width="2"
              height="4"
              rx="1"
              fill={metal.sombra}
              transform={`rotate(${angulo} 48 48)`}
            />
          ))}
          <circle cx="48" cy="48" r="32" fill={`url(#${id}-borda)`} />
          <circle cx="48" cy="48" r="28" fill={`url(#${id}-metal)`} />
          <circle
            cx="48"
            cy="48"
            r="23.5"
            fill="none"
            stroke={metal.sombra}
            strokeOpacity="0.45"
            strokeWidth="1"
          />
          {/* Gravação em relevo: luz um pixel abaixo, tinta por cima */}
          <text
            x="48"
            y="49.5"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="var(--font-display)"
            fontWeight="800"
            fontSize={texto.length > 1 ? 19 : 24}
            fill={metal.luz}
            opacity="0.8"
          >
            {texto}
          </text>
          <text
            x="48"
            y="48"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="var(--font-display)"
            fontWeight="800"
            fontSize={texto.length > 1 ? 19 : 24}
            fill={metal.gravura}
          >
            {texto}
          </text>
          {/* Reflexo */}
          <ellipse
            cx="38"
            cy="33"
            rx="11"
            ry="6"
            fill="#ffffff"
            opacity="0.35"
            transform="rotate(-30 38 33)"
          />
        </g>
      ) : (
        <g>
          <circle
            cx="48"
            cy="48"
            r="30"
            fill="none"
            stroke="var(--color-border-strong)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <text
            x="48"
            y="48"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="var(--font-display)"
            fontWeight="800"
            fontSize={texto.length > 1 ? 19 : 24}
            fill="var(--color-text-subtle)"
          >
            {texto}
          </text>
        </g>
      )}
    </svg>
  )
}
