/**
 * Main Layout Component
 * Primary application layout with sidebar and header
 * Phase 2 Sprint 2.1 - Base Components
 */

import React from 'react'
import { cn } from '../../../utils/cn'
import type { BaseComponentProps } from '../../../types/component.types'

export interface MainLayoutProps extends BaseComponentProps {
  /**
   * Sidebar component
   */
  sidebar?: React.ReactNode
  /**
   * Header component
   */
  header?: React.ReactNode
  /**
   * Whether sidebar is visible
   */
  showSidebar?: boolean
}

/**
 * Main Layout Component
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  sidebar,
  header,
  showSidebar = true,
  className,
  children
}) => {
  return (
    <div className={cn('flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900', className)}>
      {/* Sidebar */}
      {showSidebar && sidebar && (
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {sidebar}
        </aside>
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        {header && (
          <header className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            {header}
          </header>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
