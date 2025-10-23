import type { SelectHTMLAttributes, PropsWithChildren } from 'react'
import { joinClasses } from '../utils'

export type SelectSize = 'sm' | 'md' | 'lg'
export type SelectProps = PropsWithChildren<{
  uiSize?: SelectSize
  className?: string
}> & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>

export const Select = ({ uiSize = 'md', className = '', children, ...rest }: SelectProps) => (
  <select {...rest} className={joinClasses('select', `input--${uiSize}`, className)}>
    {children}
  </select>
)
