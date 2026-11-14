import React from 'react'
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
import { motionTransition } from './motionTokens'

export const MotionPreferences: React.FC<React.PropsWithChildren> = ({
  children,
}) => (
  <MotionConfig reducedMotion="user" transition={motionTransition.interface}>
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  </MotionConfig>
)
