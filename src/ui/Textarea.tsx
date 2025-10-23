import type { TextareaHTMLAttributes } from 'react'
import { joinClasses } from '../utils'

export type TextareaSize = 'sm' | 'md' | 'lg'
export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> & {
  uiSize?: TextareaSize
  className?: string
}

export const Textarea = ({ uiSize = 'md', className = '', ...rest }: TextareaProps) => (
  <textarea {...rest} className={joinClasses('textarea', `input--${uiSize}`, className)} />
)
