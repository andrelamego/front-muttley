import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, CircleX, X } from 'lucide-react'

export type ToastType = 'success' | 'warning' | 'error'

type ToastItem = {
  id: number
  message: string
  type: ToastType
  duration: number
}

const TOAST_EVENT = 'muttley:toast'
let nextToastId = 1

const showToast = (message: string, type: ToastType, duration = 4500) => {
  if (!message || typeof window === 'undefined') return

  window.dispatchEvent(new CustomEvent<ToastItem>(TOAST_EVENT, {
    detail: { id: nextToastId++, message, type, duration },
  }))
}

export const toast = {
  success: (message: string, duration?: number) => showToast(message, 'success', duration),
  warning: (message: string, duration?: number) => showToast(message, 'warning', duration),
  error: (message: string, duration?: number) => showToast(message, 'error', duration),
}

const toastIcons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: CircleX,
}

export function ToastViewport() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    const handleToast = (event: Event) => {
      const item = (event as CustomEvent<ToastItem>).detail
      setItems((current) => [...current.slice(-3), item])
      window.setTimeout(() => {
        setItems((current) => current.filter((toastItem) => toastItem.id !== item.id))
      }, item.duration)
    }

    window.addEventListener(TOAST_EVENT, handleToast)
    return () => window.removeEventListener(TOAST_EVENT, handleToast)
  }, [])

  const dismiss = (id: number) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  return (
    <div className="toast-viewport" aria-live="polite" aria-relevant="additions">
      {items.map((item) => {
        const Icon = toastIcons[item.type]
        return (
          <div className={`app-toast app-toast--${item.type}`} role="status" key={item.id}>
            <Icon className="app-toast__icon" aria-hidden="true" />
            <p>{item.message}</p>
            <button type="button" onClick={() => dismiss(item.id)} aria-label="Fechar mensagem">
              <X aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
