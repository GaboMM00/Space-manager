/**
 * Toast Notification Component
 * Phase 2 Sprint 2.3 - UX y Accesibilidad
 */

import React from 'react'
import { cn } from '../../../utils/cn'

/**
 * Toast variant types
 */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

/**
 * Toast props
 */
export interface ToastProps {
  id: string
  message: string
  variant?: ToastVariant
  duration?: number
  onClose?: (id: string) => void
}

/**
 * Toast icons by variant
 */
const ToastIcons: Record<ToastVariant, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

/**
 * Variant styles
 */
const variantStyles: Record<ToastVariant, string> = {
  success:
    'bg-success-50 dark:bg-success-900/20 text-success-800 dark:text-success-200 border-success-200 dark:border-success-800',
  error:
    'bg-error-50 dark:bg-error-900/20 text-error-800 dark:text-error-200 border-error-200 dark:border-error-800',
  warning:
    'bg-warning-50 dark:bg-warning-900/20 text-warning-800 dark:text-warning-200 border-warning-200 dark:border-warning-800',
  info: 'bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 border-primary-200 dark:border-primary-800'
}

/**
 * Toast Component
 */
export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  variant = 'info',
  onClose
}) => {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-center gap-3 p-4 rounded-lg border shadow-lg',
        'animate-slide-in-right',
        'min-w-[300px] max-w-[500px]',
        variantStyles[variant]
      )}
    >
      <div className="flex-shrink-0">{ToastIcons[variant]}</div>
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
