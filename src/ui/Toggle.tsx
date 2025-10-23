import type { InputHTMLAttributes } from 'react'

export type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
}

export const Toggle = ({ label, ...rest }: ToggleProps) => (
  <label className="toggle">
    <input type="checkbox" {...rest} />
    <span className="toggle-slider" />
    {label && <span className="toggle-label">{label}</span>}
  </label>
)
