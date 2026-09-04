export type ToastType = 'success' | 'warning' | 'error' | 'info'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
  duration: number
}

export const TOAST_EVENT = 'muttley:toast'
let nextToastId = 1

const showToast = (message: string, type: ToastType, duration = 4500) => {
  if (!message || typeof window === 'undefined') return

  window.dispatchEvent(
    new CustomEvent<ToastItem>(TOAST_EVENT, {
      detail: { id: nextToastId++, message, type, duration },
    })
  )
}

export const toast = {
  success: (message: string, duration?: number) =>
    showToast(message, 'success', duration),
  warning: (message: string, duration?: number) =>
    showToast(message, 'warning', duration),
  error: (message: string, duration?: number) =>
    showToast(message, 'error', duration),
  info: (message: string, duration?: number) =>
    showToast(message, 'info', duration),
}
