import { useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export type Toast = {
  id: string
  message: string
  type: ToastType
  duration?: number
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])
  
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])
  
  const addToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    const id = `${Date.now()}-${Math.random()}`
    const toast: Toast = { id, message, type, duration }
    
    setToasts((prev) => [...prev, toast])
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])
  
  const success = useCallback((message: string, duration?: number) => {
    addToast(message, 'success', duration)
  }, [addToast])
  
  const error = useCallback((message: string, duration = 5000) => {
    addToast(message, 'error', duration)
  }, [addToast])
  
  const warning = useCallback((message: string, duration?: number) => {
    addToast(message, 'warning', duration)
  }, [addToast])
  
  const info = useCallback((message: string, duration?: number) => {
    addToast(message, 'info', duration)
  }, [addToast])
  
  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}
