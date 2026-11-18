import React, { useLayoutEffect, useRef, useState } from 'react'
import { m, transform, useTransform, type MotionValue } from 'motion/react'
import { CodigoBarras } from '../../../../shared/ui'
import { formatarNumeroIngresso } from '../../../../shared/lib/codigoBarras'
import './IngressoDestacavel.css'

// Adaptado do TearTicket: só a geometria do picote e o canhoto se destacando.
// O destaque é guiado pela rolagem (progresso 0 → 1), não por arrastar.
const LARGURA = 440
const ALTURA = 150
const CANHOTO = 92 // mesma largura do canhoto do ingresso do site
const RAIO = 18 // --radius-lg
const RECORTE = 11 // mesmo recorte do ingresso do site
const FUROS = 9
const FURO = 4

const f = (n: number) => n.toFixed(2)

/** Contornos do corpo e do canhoto, com os furos do picote entre eles. */
const geometria = () => {
  const x = LARGURA - CANHOTO
  const r = FURO / 2
  const vao = ALTURA - 2 * RECORTE
  const ponte = (vao - FUROS * FURO) / (FUROS + 1)
  const arco = (raio: number, sentido: 0 | 1, px: number, py: number) =>
    `A${f(raio)},${f(raio)} 0 0 ${sentido} ${f(px)},${f(py)}`

  let corpo = `M${RAIO},0L${x - RECORTE},0${arco(RECORTE, 0, x, RECORTE)}`
  for (let i = 0; i < FUROS; i += 1) {
    const fim = RECORTE + (i + 1) * ponte + i * FURO
    corpo += `L${f(x)},${f(fim)}${arco(r, 0, x, fim + FURO)}`
  }
  corpo +=
    `L${f(x)},${ALTURA - RECORTE}${arco(RECORTE, 0, x - RECORTE, ALTURA)}` +
    `L${RAIO},${ALTURA}${arco(RAIO, 1, 0, ALTURA - RAIO)}L0,${RAIO}${arco(RAIO, 1, RAIO, 0)}Z`

  let canhoto =
    `M${x + RECORTE},0L${LARGURA - RAIO},0${arco(RAIO, 1, LARGURA, RAIO)}` +
    `L${LARGURA},${ALTURA - RAIO}${arco(RAIO, 1, LARGURA - RAIO, ALTURA)}` +
    `L${x + RECORTE},${ALTURA}${arco(RECORTE, 0, x, ALTURA - RECORTE)}`
  for (let i = FUROS - 1; i >= 0; i -= 1) {
    const inicio = RECORTE + (i + 1) * ponte + i * FURO
    canhoto += `L${f(x)},${f(inicio + FURO)}${arco(r, 0, x, inicio)}`
  }
  canhoto += `L${f(x)},${RECORTE}${arco(RECORTE, 0, x + RECORTE, 0)}Z`
  return { corpo, canhoto }
}

// Constante: o tamanho do ingresso é fixo, a escala vem por transform.
const { corpo, canhoto } = geometria()

const useFaixa = (p: MotionValue<number>, entrada: number[], saida: number[]) =>
  useTransform(p, (v) => transform(v, entrada, saida))

export const IngressoDestacavel: React.FC<{
  progresso: MotionValue<number>
  tema: string
  local: string
  dia: string
  mes: string
  horario: string
  numero: number
}> = ({ progresso, tema, local, dia, mes, horario, numero }) => {
  const raiz = useRef<HTMLDivElement>(null)
  const [escala, setEscala] = useState(1)

  useLayoutEffect(() => {
    const el = raiz.current
    if (!el) return
    const medir = () => setEscala(Math.min(1, el.clientWidth / LARGURA) || 1)
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Primeiro o canhoto descola por baixo, girando no recorte de cima; depois solta e cai.
  const giro = useFaixa(progresso, [0, 0.45, 1], [0, 16, 55])
  const x = useFaixa(progresso, [0, 0.45, 1], [0, 8, 46])
  const y = useFaixa(progresso, [0.45, 1], [0, 200])
  const opacidade = useFaixa(progresso, [0.7, 1], [1, 0])

  return (
    <div ref={raiz} className="destacavel" style={{ height: ALTURA * escala }}>
      <div
        className="destacavel__palco"
        style={{
          width: LARGURA,
          height: ALTURA,
          transform: `scale(${escala})`,
        }}
      >
        <div
          className="destacavel__peca"
          style={{ clipPath: `path('${corpo}')` }}
        >
          <div
            className="destacavel__corpo"
            style={{ width: LARGURA - CANHOTO }}
          >
            <p className="font-display text-xl font-bold leading-tight">
              {tema}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {local}
            </p>
            <div className="mt-auto flex items-end gap-3 text-[var(--color-text-muted)]">
              <CodigoBarras semente={numero} className="h-6 w-28" />
              <span className="font-mono text-xs tabular-nums">
                {formatarNumeroIngresso(numero)}
              </span>
            </div>
          </div>
        </div>
        <m.div
          className="destacavel__peca"
          style={{
            clipPath: `path('${canhoto}')`,
            transformOrigin: `${LARGURA - CANHOTO}px ${RECORTE}px`,
            rotate: giro,
            x,
            y,
            opacity: opacidade,
          }}
        >
          <div className="destacavel__canhoto" style={{ width: CANHOTO }}>
            <span className="ticket-day">{dia}</span>
            <span className="ticket-month">{mes}</span>
            <span className="ticket-time">{horario}</span>
          </div>
        </m.div>
      </div>
    </div>
  )
}
