import React from 'react'
import { Link } from 'react-router-dom'

export interface TicketProps {
  dia: string
  mes: string
  horario?: string | null
  compact?: boolean
  /** Destaca o canhoto e mostra o carimbo "Presente" (após confirmar a presença). */
  stamped?: boolean
  /** Torna o ingresso inteiro um link. O conteúdo não deve conter outros links ou botões. */
  to?: string
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
  to,
  className = '',
  children,
}) => {
  const ticket = (
    <div
      className={`ticket ${compact ? 'ticket--compact' : ''} ${stamped ? 'ticket--stamped' : ''}`}
    >
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
        {stamped ? (
          <span className="ticket-stamp">Presente</span>
        ) : (
          horario && <span className="ticket-time">{horario}</span>
        )}
      </div>
    </div>
  )

  // A máscara dos recortes corta box-shadow; a sombra fica no invólucro como drop-shadow.
  return to ? (
    <Link to={to} className={`ticket-shadow ticket-link ${className}`}>
      {ticket}
    </Link>
  ) : (
    <div className={`ticket-shadow ${className}`}>{ticket}</div>
  )
}
