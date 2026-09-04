import React, { useEffect, useState } from 'react'
import { CheckCircleIcon, AlertCircleIcon, XIcon } from './icons'
import { TOAST_EVENT, type ToastItem } from './toastService'
import { AnimatePresence, m } from 'motion/react'
import { motionTransition } from '../motion'

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

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item) => {
          const styles = {
            success:
              'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)]',
            warning:
              'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-border)]',
            error:
              'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border-[var(--color-danger-border)]',
            info: 'bg-sky-50 text-sky-900 border-sky-300',
          }[item.type]

          const iconColor = {
            success: 'text-[var(--color-success-text)]',
            warning: 'text-[var(--color-warning-text)]',
            error: 'text-[var(--color-danger)]',
            info: 'text-sky-600',
          }[item.type]

          return (
            <m.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={motionTransition.interface}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-none border shadow-lg text-xs font-medium ${styles}`}
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
                className="shrink-0 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] rounded-none transition-colors"
                aria-label="Fechar notificação"
              >
                <XIcon size={14} />
              </button>
            </m.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
