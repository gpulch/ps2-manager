import type { ReactNode } from 'react'

type Props = {
  title: string
  children: ReactNode
  actions?: ReactNode
}

export const PageLayout = ({ title, children, actions }: Props) => (
  <div className="page-container">
    <div className="page-header">
      <h2>{title}</h2>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
    <div className="page-content">
      {children}
    </div>
  </div>
)
