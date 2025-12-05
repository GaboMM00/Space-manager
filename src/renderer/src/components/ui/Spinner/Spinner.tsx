/**
 * Spinner Component
 * Loading indicator
 * Phase 2 Sprint 2.3 - UX y Accesibilidad
 */

import React from 'react'
import { cn } from '../../../utils/cn'

/**
 * Spinner Props
 */
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'white'
  className?: string
}

/**
 * Size classes
 */
const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
  xl: 'w-16 h-16 border-4'
}

/**
 * Variant classes
 */
const variantClasses = {
  primary: 'border-primary-600 border-t-transparent',
  secondary: 'border-gray-600 border-t-transparent',
  white: 'border-white border-t-transparent'
}

/**
 * Spinner Component
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className
}) => {
  return (
    <div
      className={cn(
        'inline-block rounded-full animate-spin',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}
