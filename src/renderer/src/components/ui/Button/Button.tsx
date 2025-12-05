/**
 * Button Component
 * Reusable button with multiple variants and sizes
 * Phase 2 Sprint 2.1 - Base Components
 */

import React, { forwardRef } from 'react'
import { cn } from '../../../utils/cn'
import type { ButtonVariant, Size } from '../../../types/component.types'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant of the button
   */
  variant?: ButtonVariant
  /**
   * Size of the button
   */
  size?: Size
  /**
   * Whether the button is in a loading state
   */
  loading?: boolean
  /**
   * Icon to display before the button text
   */
  leftIcon?: React.ReactNode
  /**
   * Icon to display after the button text
   */
  rightIcon?: React.ReactNode
  /**
   * Whether the button should take full width
   */
  fullWidth?: boolean
}

/**
 * Base button styles
 */
const baseStyles =
  'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

/**
 * Variant styles
 */
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600',
  secondary:
    'bg-secondary-600 text-white hover:bg-secondary-700 focus-visible:ring-secondary-500 dark:bg-secondary-500 dark:hover:bg-secondary-600',
  outline:
    'border-2 border-gray-300 bg-transparent hover:bg-gray-50 focus-visible:ring-gray-500 dark:border-gray-600 dark:hover:bg-gray-800',
  ghost:
    'bg-transparent hover:bg-gray-100 focus-visible:ring-gray-500 dark:hover:bg-gray-800',
  danger:
    'bg-error-600 text-white hover:bg-error-700 focus-visible:ring-error-500 dark:bg-error-500 dark:hover:bg-error-600'
}

/**
 * Size styles
 */
const sizeStyles: Record<Size, string> = {
  xs: 'text-xs px-2.5 py-1.5 rounded gap-1',
  sm: 'text-sm px-3 py-2 rounded-md gap-1.5',
  md: 'text-base px-4 py-2.5 rounded-md gap-2',
  lg: 'text-lg px-5 py-3 rounded-lg gap-2',
  xl: 'text-xl px-6 py-3.5 rounded-lg gap-2.5'
}

/**
 * Button Component
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
