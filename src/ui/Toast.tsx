/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react'
import { generateId, joinClasses } from '../utils'

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger'
export type ToastItem = {
  id: string
  text: string
  variant: ToastVariant
  ttlMs: number
}

export type ToastContextValue = {
  show: (text: string, variant?: ToastVariant, ttlMs?: number) => void
}

const Ctx = createContext<ToastContextValue | null>(null)

export const useToast = (): ToastContextValue => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('ToastProvider missing')
  return ctx
}

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show = useCallback((text: string, variant: ToastVariant = 'info', ttlMs = 3500) => {
    const id = generateId()
    setToasts(prev => [...prev, { id, text, variant, ttlMs }])
    window.setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), ttlMs)
  }, [])

  const value = useMemo(() => ({ show }), [show])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={joinClasses('toast', `toast--${t.variant}`)}>{t.text}</div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
