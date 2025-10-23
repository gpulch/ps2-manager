import type { InputHTMLAttributes } from 'react'
import { joinClasses } from '../utils'

export type InputSize = 'sm' | 'md' | 'lg'
export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  uiSize?: InputSize
  className?: string
}

export const Input = ({ uiSize = 'md', className = '', ...rest }: InputProps) => (
  <input {...rest} className={joinClasses('input', `input--${uiSize}`, className)} />
)
