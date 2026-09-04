import React from 'react'
import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import { useLocation } from 'react-router-dom'
import { motionTransition } from './motionTokens'

export const PageTransition: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <m.div
        key={location.pathname}
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -2 }}
        transition={motionTransition.composition}
      >
        {children}
      </m.div>
    </AnimatePresence>
  )
}
