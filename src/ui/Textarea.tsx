import type { TextareaHTMLAttributes } from 'react'

export type TextareaSize = 'sm' | 'md' | 'lg'
export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> & {
  uiSize?: TextareaSize
  className?: string
}

export const Textarea = ({ uiSize = 'md', className = '', ...rest }: TextareaProps) => (
  <textarea {...rest} className={[`textarea`, `input--${uiSize}`, className].join(' ').trim()} />
)
