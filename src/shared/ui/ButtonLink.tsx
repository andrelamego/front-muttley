import React from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { ConteudoBotao } from './Button'
import {
  classesBotao,
  type TamanhoBotao,
  type VarianteBotao,
} from './botaoEstilos'

interface VisualBotao {
  variant?: VarianteBotao
  size?: TamanhoBotao
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export type ButtonLinkProps = VisualBotao &
  (
    | ({ to: LinkProps['to'] } & Omit<
        LinkProps,
        'to' | 'className' | 'children'
      >)
    | ({ to?: undefined; href: string } & Omit<
        React.AnchorHTMLAttributes<HTMLAnchorElement>,
        'className' | 'children'
      >)
  )

/**
 * Link com aparência de botão. Use no lugar de <Link><Button/></Link>: um botão dentro de um link
 * cria dois elementos interativos aninhados, o que confunde teclado e leitores de tela.
 */
export const ButtonLink: React.FC<ButtonLinkProps> = ({
  variant,
  size,
  fullWidth,
  leftIcon,
  rightIcon,
  className,
  children,
  ...props
}) => {
  const classes = classesBotao({ variant, size, fullWidth, className })
  const conteudo = (
    <ConteudoBotao leftIcon={leftIcon} rightIcon={rightIcon}>
      {children}
    </ConteudoBotao>
  )
  if ('to' in props && props.to !== undefined) {
    return (
      <Link {...(props as LinkProps)} className={classes}>
        {conteudo}
      </Link>
    )
  }
  return (
    <a
      {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      className={classes}
    >
      {conteudo}
    </a>
  )
}
