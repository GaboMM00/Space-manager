/**
 * Toast Context
 * Global toast notification provider
 * Phase 2 Sprint 2.3 - UX y Accesibilidad
 */

import React, { createContext, useContext } from 'react'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/ui/Toast'
import type { ToastProps } from '../components/ui/Toast/Toast'

/**
 * Toast context type
 */
interface ToastContextType {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
  success: (message: string, duration?: number) => string
  error: (message: string, duration?: number) => string
  warning: (message: string, duration?: number) => string
  info: (message: string, duration?: number) => string
}

/**
 * Toast context
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined)

/**
 * Toast Provider
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useToast()

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </ToastContext.Provider>
  )
}

/**
 * useToastContext Hook
 */
export const useToastContext = (): ToastContextType => {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider')
  }

  return context
}
