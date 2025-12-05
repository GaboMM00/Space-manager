/**
 * Header Component
 * Application header with title and actions
 * Phase 2 Sprint 2.1 - Base Components
 */

import React from 'react'
import { cn } from '../../../utils/cn'
import type { BaseComponentProps } from '../../../types/component.types'

export interface HeaderProps extends BaseComponentProps {
  /**
   * Title to display in the header
   */
  title?: string
  /**
   * Left content (before title)
   */
  left?: React.ReactNode
  /**
   * Right content (actions, user menu, etc.)
   */
  right?: React.ReactNode
}

/**
 * Header Component
 */
export const Header: React.FC<HeaderProps> = ({ title, left, right, className, children }) => {
  return (
    <div className={cn('flex items-center justify-between h-16 px-6', className)}>
      {/* Left section */}
      <div className="flex items-center gap-4">
        {left}
        {title && <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>}
        {children && !title && children}
      </div>

      {/* Right section */}
      {right && <div className="flex items-center gap-3">{right}</div>}
    </div>
  )
}
