import { memo } from 'react'
import type { ReactNode } from 'react'

type Props = {
  show: boolean
  message?: string
  children?: ReactNode
}

export const LoadingOverlay = memo(({ show, message = 'Loading...', children }: Props) => {
  if (!show) return null

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner" />
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 500 }}>
            {message}
          </p>
          {children && (
            <div style={{ fontSize: '14px', opacity: 0.8 }}>
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
