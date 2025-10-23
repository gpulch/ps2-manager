import type { PropsWithChildren } from 'react'

export const Card = ({ children }: PropsWithChildren) => (
  <div className="card-ui">{children}</div>
)
