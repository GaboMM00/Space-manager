/**
 * Modal Component
 * Overlay dialog component
 * Phase 2 Sprint 2.1 - Base Components
 */

import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../../utils/cn'
import type { BaseComponentProps, Size } from '../../../types/component.types'

export interface ModalProps extends BaseComponentProps {
  /**
   * Whether the modal is open
   */
  open: boolean
  /**
   * Callback when the modal should close
   */
  onClose: () => void
  /**
   * Size of the modal
   */
  size?: Size | 'full'
  /**
   * Whether clicking the backdrop closes the modal
   */
  closeOnBackdropClick?: boolean
  /**
   * Whether pressing ESC closes the modal
   */
  closeOnEsc?: boolean
  /**
   * Whether to show the close button
   */
  showCloseButton?: boolean
}

export interface ModalHeaderProps extends BaseComponentProps, React.HTMLAttributes<HTMLDivElement> {}

export interface ModalBodyProps extends BaseComponentProps, React.HTMLAttributes<HTMLDivElement> {}

export interface ModalFooterProps extends BaseComponentProps, React.HTMLAttributes<HTMLDivElement> {}

/**
 * Modal size styles
 */
const sizeStyles: Record<Size | 'full', string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4'
}

/**
 * Modal Component
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  className,
  children
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle ESC key
  useEffect(() => {
    if (!open || !closeOnEsc) return

    const handleEsc = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, closeOnEsc, onClose])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }

    return undefined
  }, [open])

  // Focus trap
  useEffect(() => {
    if (open && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      firstElement?.focus()

      const handleTab = (e: KeyboardEvent): void => {
        if (e.key !== 'Tab') return

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }

      document.addEventListener('keydown', handleTab)
      return () => document.removeEventListener('keydown', handleTab)
    }

    return undefined
  }, [open])

  if (!open) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[1040] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        className={cn(
          'relative w-full bg-white dark:bg-gray-800 rounded-lg shadow-2xl transform transition-all z-[1050]',
          sizeStyles[size],
          className
        )}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  )
}

/**
 * Modal Header Component
 */
export const ModalHeader: React.FC<ModalHeaderProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn('px-6 py-4 border-b border-gray-200 dark:border-gray-700', className)}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Modal Title Component
 */
export const ModalTitle: React.FC<BaseComponentProps & React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => {
  return (
    <h2
      className={cn('text-xl font-semibold text-gray-900 dark:text-white', className)}
      {...props}
    >
      {children}
    </h2>
  )
}

/**
 * Modal Body Component
 */
export const ModalBody: React.FC<ModalBodyProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  )
}

/**
 * Modal Footer Component
 */
export const ModalFooter: React.FC<ModalFooterProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
