import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from './utils'

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: 'article' | 'section' | 'div'
  interactive?: boolean
  elevated?: boolean
  children: ReactNode
}

export function Card({
  as: Component = 'article',
  interactive,
  elevated,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Component
      className={cx(
        'ui-card',
        interactive && 'ui-card--interactive',
        elevated && 'ui-card--elevated',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
