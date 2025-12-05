/**
 * Toast Container Component
 * Manages toast notifications display
 * Phase 2 Sprint 2.3 - UX y Accesibilidad
 */

import React from 'react'
import { Toast, ToastProps } from './Toast'

/**
 * Toast Container Props
 */
export interface ToastContainerProps {
  toasts: ToastProps[]
  onClose: (id: string) => void
}

/**
 * Toast Container Component
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) {
    return null
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
      aria-label="Notifications"
      role="region"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  )
}
