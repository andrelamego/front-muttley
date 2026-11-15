import React from 'react'

// Família de ilustrações dos estados vazios: traço de 2px na cor do texto,
// preenchimentos de superfície, e um único detalhe amarelo por desenho.
// Só variáveis de cor, para acompanhar o tema escuro sem nada a mais.
const TINTA = 'var(--color-text-primary)'
const PAPEL = 'var(--color-bg-surface)'
const AZUL = 'var(--color-primary-subtle)'
const SINAL = 'var(--color-signal)'

type Props = { className?: string }

/** Ingresso com recortes nas laterais, centrados na altura. */
const ingresso = (x: number, y: number, w: number, h: number, n = 6) => {
  const c = y + h / 2
  return `M${x} ${y}H${x + w}V${c - n}A${n} ${n} 0 0 0 ${x + w} ${c + n}V${y + h}H${x}V${c + n}A${n} ${n} 0 0 0 ${x} ${c - n}Z`
}

/** Borda rasgada em zigue-zague, de baixo para cima, alternando x e x + dente. */
const rasgo = (x: number, yBaixo: number, yTopo: number, dente: number) => {
  let d = ''
  for (let y = yBaixo, i = 0; y > yTopo; y -= 6, i += 1)
    d += `L${i % 2 ? x + dente : x} ${Math.max(y - 6, yTopo)}`
  return d
}

const Svg: React.FC<Props & { children: React.ReactNode }> = ({
  className = '',
  children,
}) => (
  <svg
    viewBox="0 0 160 120"
    aria-hidden="true"
    className={className}
    fill="none"
    stroke={TINTA}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
)

const Sombra: React.FC<{ cx?: number; rx?: number }> = ({
  cx = 80,
  rx = 44,
}) => <ellipse cx={cx} cy="110" rx={rx} ry="4" fill={AZUL} stroke="none" />

/** Canhoto de ingresso rasgado, sozinho. */
export const IlustracaoSemEventos: React.FC<Props> = ({ className }) => (
  <Svg className={className}>
    <Sombra rx={34} />
    <g transform="rotate(-8 80 60)">
      <path
        d={`M56 22H108V55A6 6 0 0 0 108 67V100H56${rasgo(56, 100, 22, 4)}Z`}
        fill={PAPEL}
      />
      <rect
        x="70"
        y="36"
        width="26"
        height="16"
        rx="3"
        fill={AZUL}
        stroke="none"
      />
      <path d="M70 62H96M74 70H92" />
      <rect x="70" y="80" width="26" height="10" rx="5" fill={SINAL} />
    </g>
    <path d="M38 48l6-3 1 6zM34 72l5 1-3 5z" fill={PAPEL} />
  </Svg>
)

/** Folha de certificado em branco com o carimbo ainda no ar. */
export const IlustracaoSemCertificados: React.FC<Props> = ({ className }) => (
  <Svg className={className}>
    <Sombra />
    <rect x="34" y="44" width="92" height="62" rx="4" fill={PAPEL} />
    <path d="M50 60H110M58 72H102M64 80H96" />
    <circle cx="80" cy="94" r="6" strokeDasharray="3 3" />
    <rect x="72" y="4" width="16" height="13" rx="6.5" fill={AZUL} />
    <path d="M80 17V23" />
    <rect x="64" y="23" width="32" height="8" rx="2" fill={PAPEL} />
    <rect x="66" y="31" width="28" height="4" rx="1" fill={SINAL} />
    <path d="M56 28H50M104 28H110" />
  </Svg>
)

const DENTES = 28
const serrilha = Array.from({ length: DENTES * 2 }, (_, i) => {
  const a = (i / (DENTES * 2)) * Math.PI * 2 - Math.PI / 2
  const r = i % 2 ? 26.5 : 29.5
  return `${(80 + r * Math.cos(a)).toFixed(1)},${(46 + r * Math.sin(a)).toFixed(1)}`
}).join(' ')

/** Moeda ainda sem cunhagem, com a fita dobrada. */
export const IlustracaoSemMedalhas: React.FC<Props> = ({ className }) => (
  <Svg className={className}>
    <Sombra rx={30} />
    <path d="M70 66L60 104L68 98L74 106L80 70Z" fill={SINAL} />
    <path d="M90 66L100 104L92 98L86 106L80 70Z" fill={SINAL} />
    <polygon points={serrilha} fill={PAPEL} />
    <circle cx="80" cy="46" r="19" fill={AZUL} />
    <path d="M70 38A12 12 0 0 1 78 33" stroke={PAPEL} strokeWidth="3" />
  </Svg>
)

/** Ingresso com o campo vazio, visto pela lupa. */
export const IlustracaoBuscaVazia: React.FC<Props> = ({ className }) => (
  <Svg className={className}>
    <Sombra />
    <path d={ingresso(22, 30, 100, 54)} fill={PAPEL} />
    <path d="M96 32V82" strokeDasharray="3 4" />
    <rect x="34" y="46" width="46" height="9" rx="2" strokeDasharray="3 3" />
    <path d="M34 66H62" />
    <path d="M121 88L136 103" strokeWidth="6" />
    <circle cx="110" cy="76" r="17" fill={AZUL} />
    <path d="M100 71A11 11 0 0 1 106 65" stroke={SINAL} strokeWidth="3" />
  </Svg>
)

/** Dois ingressos empilhados com o nome em branco. */
export const IlustracaoSemPessoas: React.FC<Props> = ({ className }) => (
  <Svg className={className}>
    <Sombra />
    <path
      d={ingresso(38, 22, 92, 48)}
      fill={AZUL}
      transform="rotate(6 84 46)"
    />
    <g transform="rotate(-4 76 68)">
      <path d={ingresso(28, 44, 96, 50)} fill={PAPEL} />
      <path d="M100 46V92" strokeDasharray="3 4" />
      <circle cx="48" cy="69" r="9" strokeDasharray="3 3" />
      <rect x="64" y="62" width="28" height="6" rx="2" strokeDasharray="3 3" />
      <path d="M64 76H86" />
      <rect x="106" y="64" width="12" height="9" rx="4.5" fill={SINAL} />
    </g>
  </Svg>
)

/** Ingresso rasgado no picote, com o canhoto solto. */
export const IlustracaoErro: React.FC<Props> = ({ className }) => (
  <Svg className={className}>
    <Sombra />
    <path
      d={`M86 30H20V54A6 6 0 0 1 20 66V90H86${rasgo(86, 90, 30, -4)}Z`}
      fill={PAPEL}
    />
    <path d="M32 48H70M32 58H62M32 74H54" />
    <g transform="rotate(14 116 60)">
      <path
        d={`M98 30H132V54A6 6 0 0 0 132 66V90H98${rasgo(98, 90, 30, 4)}Z`}
        fill={PAPEL}
      />
      <rect x="106" y="64" width="20" height="9" rx="4.5" fill={SINAL} />
      <path d="M108 44H124" />
    </g>
  </Svg>
)
