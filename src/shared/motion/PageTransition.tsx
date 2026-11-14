import React from 'react'
import { AnimatePresence, m } from 'motion/react'
import { useLocation } from 'react-router-dom'
import { motionTransition } from './motionTokens'

export const PageTransition: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const location = useLocation()

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <m.div
        key={location.pathname}
        // Só o fade da troca: quem se move são os blocos da página (.entrada-rota no index.css).
        className="entrada-rota"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={motionTransition.composition}
      >
        {children}
      </m.div>
    </AnimatePresence>
  )
}
