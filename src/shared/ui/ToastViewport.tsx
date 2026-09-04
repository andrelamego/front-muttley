import React, { useEffect, useState } from 'react'
import { CheckCircleIcon, AlertCircleIcon, XIcon } from './icons'
import { TOAST_EVENT, type ToastItem } from './toastService'

export const ToastViewport: React.FC = () => {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    const handleToast = (event: Event) => {
      const item = (event as CustomEvent<ToastItem>).detail
      setItems((current) => [...current.slice(-3), item])
      window.setTimeout(() => {
        setItems((current) =>
          current.filter((toastItem) => toastItem.id !== item.id)
        )
      }, item.duration)
    }

    window.addEventListener(TOAST_EVENT, handleToast)
    return () => window.removeEventListener(TOAST_EVENT, handleToast)
  }, [])

  const dismiss = (id: number) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  if (items.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
      aria-atomic="true"
    >
      {items.map((item) => {
        const styles = {
          success: 'bg-emerald-50 text-emerald-900 border-emerald-300',
          warning: 'bg-amber-50 text-amber-900 border-amber-300',
          error: 'bg-red-50 text-red-900 border-red-300',
          info: 'bg-sky-50 text-sky-900 border-sky-300',
        }[item.type]

        const iconColor = {
          success: 'text-emerald-600',
          warning: 'text-amber-600',
          error: 'text-red-600',
          info: 'text-sky-600',
        }[item.type]

        return (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg text-xs font-medium transition-all animate-in slide-in-from-bottom-2 ${styles}`}
            role={item.type === 'error' ? 'alert' : 'status'}
          >
            <div className={`shrink-0 mt-0.5 ${iconColor}`}>
              {item.type === 'success' && <CheckCircleIcon size={16} />}
              {item.type === 'warning' && <AlertCircleIcon size={16} />}
              {item.type === 'error' && <AlertCircleIcon size={16} />}
              {item.type === 'info' && <AlertCircleIcon size={16} />}
            </div>

            <p className="flex-1 leading-relaxed">{item.message}</p>

            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="shrink-0 p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
              aria-label="Fechar notificação"
            >
              <XIcon size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
