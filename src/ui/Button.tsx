import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { joinClasses } from '../utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = PropsWithChildren<{
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}> & ButtonHTMLAttributes<HTMLButtonElement>

export const Button = ({ variant = 'primary', size = 'md', className = '', children, ...rest }: ButtonProps) => (
  <button {...rest} className={joinClasses('btn', `btn--${size}`, `btn--${variant}`, className)}>
    {children}
  </button>
)
