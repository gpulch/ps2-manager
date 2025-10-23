import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = PropsWithChildren<{
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}> & ButtonHTMLAttributes<HTMLButtonElement>

export const Button = ({ variant = 'primary', size = 'md', className = '', children, ...rest }: ButtonProps) => (
  <button {...rest} className={[`btn`, `btn--${size}`, `btn--${variant}`, className].join(' ').trim()}>
    {children}
  </button>
)
