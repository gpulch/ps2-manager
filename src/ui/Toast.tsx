import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react'

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

const uid = () => Math.random().toString(36).slice(2)

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show = useCallback((text: string, variant: ToastVariant = 'info', ttlMs = 3500) => {
    const id = uid()
    setToasts(prev => [...prev, { id, text, variant, ttlMs }])
    window.setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), ttlMs)
  }, [])

  const value = useMemo(() => ({ show }), [show])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={[`toast`, `toast--${t.variant}`].join(' ')}>{t.text}</div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
