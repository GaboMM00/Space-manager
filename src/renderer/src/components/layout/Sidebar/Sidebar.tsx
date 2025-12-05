/**
 * Sidebar Component
 * Navigation sidebar for the application
 * Phase 2 Sprint 2.1 - Base Components
 */

import React from 'react'
import { cn } from '../../../utils/cn'
import type { BaseComponentProps } from '../../../types/component.types'

export interface SidebarProps extends BaseComponentProps {
  /**
   * Header content for the sidebar
   */
  header?: React.ReactNode
  /**
   * Footer content for the sidebar
   */
  footer?: React.ReactNode
}

export interface SidebarItemProps extends BaseComponentProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Icon to display before the item text
   */
  icon?: React.ReactNode
  /**
   * Whether the item is active
   */
  active?: boolean
  /**
   * Badge or counter to display
   */
  badge?: React.ReactNode
}

export interface SidebarSectionProps extends BaseComponentProps {
  /**
   * Title for the section
   */
  title?: string
}

/**
 * Sidebar Component
 */
export const Sidebar: React.FC<SidebarProps> = ({ header, footer, className, children }) => {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      {header && <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">{header}</div>}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">{children}</nav>

      {/* Footer */}
      {footer && <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">{footer}</div>}
    </div>
  )
}

/**
 * Sidebar Item Component
 */
export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  active = false,
  badge,
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
        active
          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {icon && <span className="inline-flex flex-shrink-0">{icon}</span>}
      <span className="flex-1 text-left">{children}</span>
      {badge && <span className="flex-shrink-0">{badge}</span>}
    </button>
  )
}

/**
 * Sidebar Section Component
 */
export const SidebarSection: React.FC<SidebarSectionProps> = ({ title, className, children }) => {
  return (
    <div className={cn('mb-4', className)}>
      {title && (
        <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  )
}

/**
 * Sidebar Divider Component
 */
export const SidebarDivider: React.FC<BaseComponentProps> = ({ className }) => {
  return <hr className={cn('my-3 border-gray-200 dark:border-gray-700', className)} />
}
