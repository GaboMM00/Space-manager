/**
 * Component Types
 * Shared types for UI components
 * Phase 2 Sprint 2.1 - Base Components
 */

import type { ReactNode } from 'react'

/**
 * Base component props
 */
export interface BaseComponentProps {
  className?: string
  children?: ReactNode
}

/**
 * Size variants
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Button variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'

/**
 * Color variants for badges, alerts, etc.
 */
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'

/**
 * Input types
 */
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'

/**
 * Tooltip positions
 */
export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left'

/**
 * Dropdown alignment
 */
export type DropdownAlign = 'start' | 'center' | 'end'
