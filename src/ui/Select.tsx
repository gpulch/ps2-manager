import type { SelectHTMLAttributes, PropsWithChildren } from 'react'

export type SelectSize = 'sm' | 'md' | 'lg'
export type SelectProps = PropsWithChildren<{
  uiSize?: SelectSize
  className?: string
}> & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>

export const Select = ({ uiSize = 'md', className = '', children, ...rest }: SelectProps) => (
  <select {...rest} className={[`select`, `input--${uiSize}`, className].join(' ').trim()}>
    {children}
  </select>
)
