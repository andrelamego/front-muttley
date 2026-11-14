import React, { useId } from 'react'
import { sigla, type Especial } from '../domain/conquistas'

type Tipo = Especial['tipo']

// Paleta de cada especial: fita, borda em estrela e o metal da face.
const ESTILO: Record<
  Tipo,
  {
    fita: string
    listra: string
    estrela: string
    aro: [string, string]
    face: [string, string, string]
  }
> = {
  DIAMANTE: {
    fita: '#2236e0',
    listra: '#ffffff',
    estrela: '#3d52ff',
    aro: ['#8fb0ff', '#ffffff'],
    face: ['#7d93ff', '#2236e0', '#0b1450'],
  },
  ESPECIALISTA: {
    fita: '#0e1330',
    listra: '#ffd93b',
    estrela: '#c79400',
    aro: ['#a87400', '#fff6c4'],
    face: ['#fff6c4', '#ffcf1f', '#b07a00'],
  },
  PALESTRANTE: {
    fita: '#ffd93b',
    listra: '#0e1330',
    estrela: '#ffd93b',
    aro: ['#a87400', '#fff6c4'],
    face: ['#4a5288', '#1b2152', '#0b0f26'],
  },
}

// Borda em estrela de 24 pontas em volta da face.
const ESTRELA = Array.from({ length: 48 }, (_, i) => {
  const a = (i * Math.PI) / 24 - Math.PI / 2
  const r = i % 2 === 0 ? 46 : 39
  return `${(60 + Math.cos(a) * r).toFixed(2)},${(90 + Math.sin(a) * r).toFixed(2)}`
}).join(' ')

/** Gema lapidada, no centro do Diamante. */
const Gema = () => (
  <g
    transform="translate(40 72) scale(0.62)"
    stroke="#ffffff"
    strokeOpacity="0.8"
    strokeWidth="1.2"
    strokeLinejoin="round"
  >
    <polygon points="4,20 16,6 24,20" fill="#cfe0ff" />
    <polygon points="16,6 48,6 40,20 24,20" fill="#ffffff" />
    <polygon points="48,6 60,20 40,20" fill="#a9c4ff" />
    <polygon points="4,20 24,20 32,56" fill="#7fa0ff" />
    <polygon points="24,20 40,20 32,56" fill="#bcd2ff" />
    <polygon points="40,20 60,20 32,56" fill="#4f6fff" />
  </g>
)

/** Coroa de louros com a sigla da disciplina, no Especialista. */
const Louros: React.FC<{ texto: string }> = ({ texto }) => (
  <g>
    {Array.from({ length: 7 }, (_, i) => {
      const a = ((200 - i * 17) * Math.PI) / 180
      const x = 60 + Math.cos(a) * 21
      const y = 90 + Math.sin(a) * 21
      const graus = (a * 180) / Math.PI + 90
      return (
        <g key={i}>
          <ellipse
            cx={x}
            cy={y}
            rx="2.6"
            ry="5.5"
            fill="#7a5200"
            transform={`rotate(${graus} ${x} ${y})`}
          />
          <ellipse
            cx={120 - x}
            cy={y}
            rx="2.6"
            ry="5.5"
            fill="#7a5200"
            transform={`rotate(${-graus} ${120 - x} ${y})`}
          />
        </g>
      )
    })}
    <text
      x="60"
      y="91"
      textAnchor="middle"
      dominantBaseline="central"
      fontFamily="var(--font-display)"
      fontWeight="800"
      fontSize="17"
      fill="#5c3d00"
    >
      {texto}
    </text>
  </g>
)

/** Microfone esmaltado, no Palestrante. */
const Microfone = () => (
  <g>
    <rect x="54" y="72" width="12" height="20" rx="6" fill="#ffffff" />
    <path
      d="M54 79 h12 M54 84 h12"
      stroke="#2236e0"
      strokeOpacity="0.35"
      strokeWidth="1.4"
    />
    <path
      d="M49 86 a11 11 0 0 0 22 0"
      fill="none"
      stroke="#ffd93b"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <path
      d="M60 97 v6 M54 103 h12"
      stroke="#ffd93b"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </g>
)

/**
 * Medalha especial: a mesma família das moedas das trilhas, com fita, borda em estrela,
 * emblema próprio e um brilho que atravessa a face ao aparecer.
 */
export const MedalhaEspecial: React.FC<{
  especial: Especial
  tamanho?: number
}> = ({ especial, tamanho = 112 }) => {
  const id = useId().replace(/:/g, '')
  const e = ESTILO[especial.tipo]
  const disciplina = especial.titulo
    .replace(/^Especialista em /, '')
    .replace(/\s+\d{4}\/\d$/, '')

  return (
    <svg
      viewBox="0 0 120 140"
      width={tamanho}
      height={(tamanho * 140) / 120}
      className="shrink-0 overflow-visible"
      aria-hidden
    >
      <defs>
        <radialGradient id={`${id}-face`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={e.face[0]} />
          <stop offset="50%" stopColor={e.face[1]} />
          <stop offset="100%" stopColor={e.face[2]} />
        </radialGradient>
        <linearGradient id={`${id}-aro`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={e.aro[0]} />
          <stop offset="50%" stopColor={e.aro[1]} />
          <stop offset="100%" stopColor={e.aro[0]} />
        </linearGradient>
        <clipPath id={`${id}-recorte`}>
          <circle cx="60" cy="90" r="31" />
        </clipPath>
      </defs>

      {/* Fita em V, presa atrás da medalha */}
      <polygon points="36,0 56,0 68,62 50,66" fill={e.fita} />
      <polygon points="84,0 64,0 52,62 70,66" fill={e.fita} />
      <polygon points="44,0 49,0 60,58 56,60" fill={e.listra} opacity="0.85" />
      <polygon points="76,0 71,0 60,58 64,60" fill={e.listra} opacity="0.85" />

      <polygon points={ESTRELA} fill={e.estrela} />
      <circle cx="60" cy="90" r="36" fill={`url(#${id}-aro)`} />
      <circle cx="60" cy="90" r="31" fill={`url(#${id}-face)`} />
      <circle
        cx="60"
        cy="90"
        r="26.5"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.45"
        strokeWidth="1"
      />

      {especial.tipo === 'DIAMANTE' && <Gema />}
      {especial.tipo === 'ESPECIALISTA' && <Louros texto={sigla(disciplina)} />}
      {especial.tipo === 'PALESTRANTE' && <Microfone />}

      {/* Reflexo fixo e o brilho que passa uma vez */}
      <ellipse
        cx="48"
        cy="74"
        rx="12"
        ry="6"
        fill="#ffffff"
        opacity="0.4"
        transform="rotate(-30 48 74)"
      />
      <g clipPath={`url(#${id}-recorte)`}>
        <g className="medalha-brilho">
          <rect
            x="20"
            y="50"
            width="16"
            height="80"
            fill="#ffffff"
            opacity="0.55"
            transform="rotate(20 60 90)"
          />
        </g>
      </g>
    </svg>
  )
}
