import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useReducedMotion } from 'motion/react'
import type { EventoPublico } from '../../domain/eventoTypes'
import { formatModalidade, getTicketDateParts } from '../../domain/ticketFormat'
import { Ticket } from '../../../../shared/ui'
import './ParedeIngressos.css'

// Adaptado do DriftWall: colunas de ingressos subindo e descendo num plano
// inclinado. Aqui é só fundo: sem hover, sem foco e escondido do leitor de tela.
const COLUNAS = 6
const LARGURA = 340 // mínimo para o ingresso completo (corpo + canhoto de 92px) caber
const ALTURA = 130
const ESPACO = 15
const VELOCIDADE = 42 // px/s
const VARIACAO = 0.45
const INCLINACAO = 8
const GIRO = -14
const PROFUNDIDADE = 120
const PARALLAX = 0.3

/** Velocidade de cada coluna: varia sem aleatório, para não mudar a cada render. */
const fatorColuna = (i: number) =>
  1 + VARIACAO * (((i * 0.6180339887 + 0.35) % 1) * 2 - 1)

/** O mesmo ingresso do app; o número e as barras saem do id do evento (decorativos). */
const Ingresso: React.FC<{ evento: EventoPublico }> = ({ evento }) => {
  const p = getTicketDateParts(evento.data, evento.horarioInicio)
  return (
    <Ticket dia={p.dia} mes={p.mes} horario={p.horario} numero={evento.id}>
      <p className="font-display text-lg font-bold leading-tight line-clamp-1">
        {evento.tema}
      </p>
      <p className="mt-1 truncate text-sm text-[var(--color-text-secondary)]">
        {[evento.local, formatModalidade(evento.modalidade)]
          .filter(Boolean)
          .join(' · ')}
      </p>
    </Ticket>
  )
}

export const ParedeIngressos: React.FC<{ eventos: EventoPublico[] }> = ({
  eventos,
}) => {
  const raiz = useRef<HTMLDivElement>(null)
  const plano = useRef<HTMLDivElement>(null)
  const trilhas = useRef<(HTMLDivElement | null)[]>([])
  const reduzido = useReducedMotion()
  const [altura, setAltura] = useState(800)

  // Em diagonal: cada coluna começa um evento à frente e percorre a lista, então
  // uma coluna só repete um evento depois de mostrar todos os outros.
  const colunas = useMemo(() => {
    if (eventos.length === 0) return []
    const linhas = Math.max(4, Math.ceil(eventos.length / COLUNAS))
    return Array.from({ length: COLUNAS }, (_, c) =>
      Array.from(
        { length: linhas },
        (_, l) => eventos[(c * linhas + l) % eventos.length]
      )
    )
  }, [eventos])

  const meta = useMemo(() => {
    const unidade = ALTURA + ESPACO
    return colunas.map((col) => {
      const copia = col.length * unidade
      return {
        copia,
        copias: Math.max(2, Math.ceil((altura * 1.6) / copia) + 1),
      }
    })
  }, [colunas, altura])

  useLayoutEffect(() => {
    const el = raiz.current
    if (!el) return
    const ro = new ResizeObserver(([e]) =>
      setAltura(e.contentRect.height || 800)
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = raiz.current
    if (!el || meta.length === 0) return
    const deslocamentos = meta.map((m, c) => m.copia * ((c * 0.37) % 1))
    const ponteiro = { x: 0, y: 0 }
    const suave = { x: 0, y: 0 }
    let visivel = true
    let quadro = 0
    let anterior: number | null = null

    const posicionar = () => {
      if (plano.current)
        plano.current.style.transform =
          `translate(-50%, -50%) scale(1.18) rotateX(${INCLINACAO + suave.y}deg) ` +
          `rotateY(${GIRO + suave.x}deg) translateZ(${-PROFUNDIDADE}px)`
      trilhas.current.forEach((t, c) => {
        if (t) t.style.transform = `translate3d(0, ${-deslocamentos[c]}px, 0)`
      })
    }

    if (reduzido) {
      posicionar()
      return
    }

    const passo = (agora: number) => {
      const dt = Math.min(
        0.05,
        anterior === null ? 0 : (agora - anterior) / 1000
      )
      anterior = agora
      const amortece = 1 - Math.exp(-dt / 0.12)
      suave.x += (ponteiro.x * PARALLAX * 8 - suave.x) * amortece
      suave.y += (-ponteiro.y * PARALLAX * 8 - suave.y) * amortece
      meta.forEach((m, c) => {
        const sentido = c % 2 === 0 ? 1 : -1
        const proximo =
          deslocamentos[c] + VELOCIDADE * fatorColuna(c) * sentido * dt
        deslocamentos[c] = ((proximo % m.copia) + m.copia) % m.copia
      })
      posicionar()
      quadro = visivel ? requestAnimationFrame(passo) : 0
    }

    // O texto fica por cima da parede: o parallax lê o ponteiro na janela.
    const mover = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      ponteiro.x = (e.clientX - r.left) / r.width - 0.5
      ponteiro.y = (e.clientY - r.top) / r.height - 0.5
    }
    // Fora da tela, para de animar.
    const io = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting
      if (visivel && !quadro) {
        anterior = null
        quadro = requestAnimationFrame(passo)
      }
    })
    io.observe(el)
    window.addEventListener('pointermove', mover, { passive: true })
    quadro = requestAnimationFrame(passo)
    return () => {
      cancelAnimationFrame(quadro)
      io.disconnect()
      window.removeEventListener('pointermove', mover)
    }
  }, [meta, reduzido])

  if (colunas.length === 0) return null

  return (
    <div
      ref={raiz}
      aria-hidden="true"
      className="parede"
      style={
        {
          '--parede-l': `${LARGURA}px`,
          '--parede-a': `${ALTURA}px`,
          '--parede-espaco': `${ESPACO}px`,
        } as React.CSSProperties
      }
    >
      <div ref={plano} className="parede__plano">
        {colunas.map((col, c) => (
          <div className="parede__coluna" key={c}>
            <div
              className="parede__trilha"
              ref={(el) => {
                trilhas.current[c] = el
              }}
            >
              {Array.from({ length: meta[c].copias }, (_, k) =>
                col.map((evento, i) => (
                  <div className="parede__quadro" key={`${k}-${i}`}>
                    <Ingresso evento={evento} />
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
