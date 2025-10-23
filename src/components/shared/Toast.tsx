import { useToast } from '../../hooks/useToast'

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <span className="toast-icon">
            {toast.type === 'success' && '✅'}
            {toast.type === 'error' && '❌'}
            {toast.type === 'warning' && '⚠️'}
            {toast.type === 'info' && 'ℹ️'}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button
            className="toast-close"
            onClick={(e) => {
              e.stopPropagation()
              removeToast(toast.id)
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
