import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cx } from './utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const buttonClass = (
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string
) => cx('ui-button', `ui-button--${variant}`, `ui-button--${size}`, className)

type NativeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: NativeButtonProps) {
  return (
    <button className={buttonClass(variant, size, className)} {...props}>
      {icon}
      <span>{children}</span>
    </button>
  )
}

type ButtonLinkProps = LinkProps & {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {icon}
      <span>{children}</span>
    </Link>
  )
}

type ButtonAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
}

export function ButtonAnchor({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: ButtonAnchorProps) {
  return (
    <a className={buttonClass(variant, size, className)} {...props}>
      {icon}
      <span>{children}</span>
    </a>
  )
}
