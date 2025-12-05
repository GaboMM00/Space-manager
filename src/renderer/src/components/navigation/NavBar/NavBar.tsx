/**
 * NavBar Component
 * Navigation bar component
 * Phase 2 Sprint 2.1 - Base Components
 */

import React from 'react'
import { cn } from '../../../utils/cn'
import type { BaseComponentProps } from '../../../types/component.types'

export interface NavBarProps extends BaseComponentProps {
  /**
   * Brand/logo content
   */
  brand?: React.ReactNode
  /**
   * Left navigation items
   */
  left?: React.ReactNode
  /**
   * Right navigation items
   */
  right?: React.ReactNode
}

export interface NavItemProps extends BaseComponentProps, React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Whether the item is active
   */
  active?: boolean
  /**
   * Icon to display before the item text
   */
  icon?: React.ReactNode
}

/**
 * NavBar Component
 */
export const NavBar: React.FC<NavBarProps> = ({ brand, left, right, className, children }) => {
  return (
    <nav className={cn('flex items-center justify-between h-14 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700', className)}>
      {/* Brand */}
      {brand && <div className="flex-shrink-0">{brand}</div>}

      {/* Left navigation */}
      {left && <div className="flex items-center gap-2 flex-1">{left}</div>}

      {/* Center content (if no left/right) */}
      {!left && !right && children && <div className="flex items-center gap-2 flex-1">{children}</div>}

      {/* Right navigation */}
      {right && <div className="flex items-center gap-2 flex-shrink-0">{right}</div>}
    </nav>
  )
}

/**
 * NavItem Component
 */
export const NavItem: React.FC<NavItemProps> = ({ active = false, icon, className, children, ...props }) => {
  return (
    <a
      className={cn(
        'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
        active
          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
        className
      )}
      {...props}
    >
      {icon && <span className="inline-flex">{icon}</span>}
      {children}
    </a>
  )
}
