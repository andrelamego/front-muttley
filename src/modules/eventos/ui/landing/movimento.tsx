import React, { useEffect, useRef, useState } from 'react'
import { animate, m, useInView, useReducedMotion } from 'motion/react'

const SAIDA = [0.23, 1, 0.32, 1] as const

/** Sobe e aparece uma vez, quando chega à tela. Com movimento reduzido, só aparece. */
export const Revelar: React.FC<{
  children: React.ReactNode
  atraso?: number
  className?: string
}> = ({ children, atraso = 0, className }) => (
  <m.div
    className={className}
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, ease: SAIDA, delay: atraso }}
  >
    {children}
  </m.div>
)

/** Número que conta do zero até o valor quando aparece na tela. */
export const Contador: React.FC<{ ate: number; className?: string }> = ({
  ate,
  className,
}) => {
  const ref = useRef<HTMLSpanElement>(null)
  const visivel = useInView(ref, { once: true, amount: 0.6 })
  const reduzido = useReducedMotion()
  const [valor, setValor] = useState(0)

  useEffect(() => {
    if (!visivel || reduzido) return
    const controle = animate(0, ate, {
      duration: 1.6,
      ease: SAIDA,
      onUpdate: (v) => setValor(Math.round(v)),
    })
    return () => controle.stop()
  }, [visivel, reduzido, ate])

  return (
    <span ref={ref} className={className}>
      {reduzido && visivel ? ate : valor}
    </span>
  )
}
