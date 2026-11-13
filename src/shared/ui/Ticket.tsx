import React from 'react'
import { m, useReducedMotion } from 'motion/react'

export interface TicketProps {
  dia: string
  mes: string
  horario?: string | null
  compact?: boolean
  /** Mostra o carimbo "Presente" no canhoto (após confirmar a presença). */
  stamped?: boolean
  className?: string
  children: React.ReactNode
}

/** Ingresso: corpo com o conteúdo do evento e canhoto com a data. Só para eventos concretos. */
export const Ticket: React.FC<TicketProps> = ({
  dia,
  mes,
  horario,
  compact = false,
  stamped = false,
  className = '',
  children,
}) => {
  const reduceMotion = useReducedMotion()

  return (
    // A máscara dos recortes corta box-shadow; a sombra fica no invólucro como drop-shadow.
    <div className={`ticket-shadow ${className}`}>
      <div className={`ticket ${compact ? 'ticket--compact' : ''}`}>
        <div className="ticket-body">{children}</div>
        <div className="ticket-stub">
          <span className="sr-only">
            {dia} de {mes}
          </span>
          <span className="ticket-day" aria-hidden="true">
            {dia}
          </span>
          <span className="ticket-month" aria-hidden="true">
            {mes}
          </span>
          {horario && <span className="ticket-time">{horario}</span>}
          {stamped && (
            <m.span
              className="ticket-stamp"
              initial={
                reduceMotion ? false : { scale: 1.15, opacity: 0, rotate: -8 }
              }
              animate={{ scale: 1, opacity: 1, rotate: -8 }}
              transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
            >
              Presente
            </m.span>
          )}
        </div>
      </div>
    </div>
  )
}
