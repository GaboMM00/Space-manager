/**
 * Input Component
 * Reusable text input with validation and states
 * Phase 2 Sprint 2.1 - Base Components
 */

import React, { forwardRef } from 'react'
import { cn } from '../../../utils/cn'
import type { InputType, Size } from '../../../types/component.types'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input size
   */
  size?: Size
  /**
   * Input type
   */
  type?: InputType
  /**
   * Error message to display
   */
  error?: string
  /**
   * Helper text to display below input
   */
  helperText?: string
  /**
   * Label for the input
   */
  label?: string
  /**
   * Whether the input is required
   */
  required?: boolean
  /**
   * Icon to display before the input
   */
  leftIcon?: React.ReactNode
  /**
   * Icon to display after the input
   */
  rightIcon?: React.ReactNode
  /**
   * Whether the input should take full width
   */
  fullWidth?: boolean
}

/**
 * Base input styles
 */
const baseStyles =
  'block border border-gray-300 bg-white text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-500'

/**
 * Size styles
 */
const sizeStyles: Record<Size, string> = {
  xs: 'text-xs px-2 py-1 rounded',
  sm: 'text-sm px-2.5 py-1.5 rounded-md',
  md: 'text-base px-3 py-2 rounded-md',
  lg: 'text-lg px-4 py-2.5 rounded-lg',
  xl: 'text-xl px-5 py-3 rounded-lg'
}

/**
 * Input Component
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      type = 'text',
      error,
      helperText,
      label,
      required,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              baseStyles,
              sizeStyles[size],
              error && 'border-error-500 focus:ring-error-500',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              fullWidth && 'w-full',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-sm text-error-600 dark:text-error-400">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
