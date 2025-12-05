/**
 * Badge Component
 * Small status or label indicator
 * Phase 2 Sprint 2.1 - Base Components
 */

import React, { forwardRef } from 'react'
import { cn } from '../../../utils/cn'
import type { ColorVariant, Size } from '../../../types/component.types'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Color variant of the badge
   */
  variant?: ColorVariant
  /**
   * Size of the badge
   */
  size?: Exclude<Size, 'xl'>
  /**
   * Whether badge is outlined
   */
  outline?: boolean
  /**
   * Icon to display before the badge text
   */
  leftIcon?: React.ReactNode
  /**
   * Icon to display after the badge text
   */
  rightIcon?: React.ReactNode
  /**
   * Whether badge is rounded (pill shape)
   */
  rounded?: boolean
}

/**
 * Variant styles - filled
 */
const variantStyles: Record<ColorVariant, string> = {
  primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
  secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-300',
  success: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300',
  warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300',
  error: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-300',
  info: 'bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-300'
}

/**
 * Variant styles - outlined
 */
const outlineVariantStyles: Record<ColorVariant, string> = {
  primary: 'border-primary-300 text-primary-700 dark:border-primary-700 dark:text-primary-300',
  secondary: 'border-secondary-300 text-secondary-700 dark:border-secondary-700 dark:text-secondary-300',
  success: 'border-success-300 text-success-700 dark:border-success-700 dark:text-success-300',
  warning: 'border-warning-300 text-warning-700 dark:border-warning-700 dark:text-warning-300',
  error: 'border-error-300 text-error-700 dark:border-error-700 dark:text-error-300',
  info: 'border-info-300 text-info-700 dark:border-info-700 dark:text-info-300'
}

/**
 * Size styles
 */
const sizeStyles: Record<Exclude<Size, 'xl'>, string> = {
  xs: 'text-xs px-1.5 py-0.5 gap-0.5',
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-0.5 gap-1',
  lg: 'text-base px-3 py-1 gap-1.5'
}

/**
 * Badge Component
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      outline = false,
      leftIcon,
      rightIcon,
      rounded = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium',
          outline ? `border ${outlineVariantStyles[variant]}` : variantStyles[variant],
          sizeStyles[size],
          rounded ? 'rounded-full' : 'rounded',
          className
        )}
        {...props}
      >
        {leftIcon && <span className="inline-flex">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
