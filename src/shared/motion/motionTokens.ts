export const motionTransition = {
  instant: { duration: 0.12, ease: [0.2, 0, 0, 1] as const },
  interface: { duration: 0.18, ease: [0.2, 0, 0, 1] as const },
  composition: { duration: 0.22, ease: [0.2, 0, 0, 1] as const },
  exit: { duration: 0.1, ease: [0.4, 0, 1, 1] as const },
} as const
