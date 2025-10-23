import type { PropsWithChildren, ReactNode } from 'react'
import { Button } from './Button'

type ModalProps = PropsWithChildren<{
  open: boolean
  title?: ReactNode
  onClose: () => void
  footer?: ReactNode
}>

export const Modal = ({ open, title, onClose, footer, children }: ModalProps) => {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
