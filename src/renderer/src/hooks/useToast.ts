/**
 * useToast Hook
 * Toast notification management
 * Phase 2 Sprint 2.3 - UX y Accesibilidad
 */

import { useState, useCallback } from 'react'
import type { ToastProps } from '../components/ui/Toast/Toast'

/**
 * Toast without internal props
 */
type ToastInput = Omit<ToastProps, 'id' | 'onClose'>

/**
 * useToast Hook
 */
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  /**
   * Add a toast
   */
  const addToast = useCallback(
    ({ message, variant = 'info', duration = 5000 }: ToastInput) => {
      const id = `toast-${Date.now()}-${Math.random()}`

      const toast: ToastProps = {
        id,
        message,
        variant,
        duration
      }

      setToasts((prev) => [...prev, toast])

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }

      return id
    },
    []
  )

  /**
   * Remove a toast
   */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  /**
   * Remove all toasts
   */
  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  /**
   * Convenience methods
   */
  const success = useCallback(
    (message: string, duration?: number) => {
      return addToast({ message, variant: 'success', duration })
    },
    [addToast]
  )

  const error = useCallback(
    (message: string, duration?: number) => {
      return addToast({ message, variant: 'error', duration })
    },
    [addToast]
  )

  const warning = useCallback(
    (message: string, duration?: number) => {
      return addToast({ message, variant: 'warning', duration })
    },
    [addToast]
  )

  const info = useCallback(
    (message: string, duration?: number) => {
      return addToast({ message, variant: 'info', duration })
    },
    [addToast]
  )

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  }
}
