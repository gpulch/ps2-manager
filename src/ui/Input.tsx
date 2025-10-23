import type { InputHTMLAttributes } from 'react'

export type InputSize = 'sm' | 'md' | 'lg'
export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  uiSize?: InputSize
  className?: string
}

export const Input = ({ uiSize = 'md', className = '', ...rest }: InputProps) => (
  <input {...rest} className={[`input`, `input--${uiSize}`, className].join(' ').trim()} />
)
