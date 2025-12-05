/**
 * Dropdown Component
 * Dropdown menu component
 * Phase 2 Sprint 2.1 - Base Components
 */

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '../../../utils/cn'
import type { BaseComponentProps, DropdownAlign } from '../../../types/component.types'

export interface DropdownProps extends BaseComponentProps {
  /**
   * Trigger element
   */
  trigger: React.ReactNode
  /**
   * Alignment of dropdown menu
   */
  align?: DropdownAlign
  /**
   * Whether dropdown is disabled
   */
  disabled?: boolean
}

export interface DropdownItemProps extends BaseComponentProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Icon to display before the item text
   */
  icon?: React.ReactNode
  /**
   * Whether the item represents a destructive action
   */
  destructive?: boolean
}

export interface DropdownDividerProps extends BaseComponentProps {}

/**
 * Alignment styles
 */
const alignStyles: Record<DropdownAlign, string> = {
  start: 'left-0',
  center: 'left-1/2 -translate-x-1/2',
  end: 'right-0'
}

/**
 * Dropdown Component
 */
export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  align = 'start',
  disabled = false,
  className,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return

    const handleEsc = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  const handleToggle = (): void => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      <div onClick={handleToggle} className={disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}>
        {trigger}
      </div>

      {isOpen && !disabled && (
        <div
          className={cn(
            'absolute mt-2 min-w-[12rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[1000] py-1',
            alignStyles[align]
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * Dropdown Item Component
 */
export const DropdownItem: React.FC<DropdownItemProps> = ({
  icon,
  destructive = false,
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        'w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors',
        destructive
          ? 'text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {icon && <span className="inline-flex">{icon}</span>}
      {children}
    </button>
  )
}

/**
 * Dropdown Divider Component
 */
export const DropdownDivider: React.FC<DropdownDividerProps> = ({ className }) => {
  return <hr className={cn('my-1 border-gray-200 dark:border-gray-700', className)} />
}

/**
 * Dropdown Label Component
 */
export const DropdownLabel: React.FC<BaseComponentProps> = ({ className, children }) => {
  return (
    <div className={cn('px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase', className)}>
      {children}
    </div>
  )
}
