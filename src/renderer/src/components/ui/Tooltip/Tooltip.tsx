/**
 * Tooltip Component
 * Hoverable tooltip component
 * Phase 2 Sprint 2.1 - Base Components
 */

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../../utils/cn'
import type { TooltipPosition } from '../../../types/component.types'

export interface TooltipProps {
  /**
   * Content to display in tooltip
   */
  content: React.ReactNode
  /**
   * Position of the tooltip
   */
  position?: TooltipPosition
  /**
   * Delay before showing tooltip (ms)
   */
  delay?: number
  /**
   * Children element that triggers the tooltip
   */
  children: React.ReactElement
  /**
   * Custom className for tooltip
   */
  className?: string
  /**
   * Whether tooltip is disabled
   */
  disabled?: boolean
}

/**
 * Position offset styles
 */
const positionOffsets: Record<TooltipPosition, { top: number; left: number }> = {
  top: { top: -8, left: 0 },
  right: { top: 0, left: 8 },
  bottom: { top: 8, left: 0 },
  left: { top: 0, left: -8 }
}

/**
 * Tooltip Component
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  delay = 200,
  children,
  className,
  disabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const showTooltip = (): void => {
    if (disabled) return

    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        const offset = positionOffsets[position]

        let top = 0
        let left = 0

        switch (position) {
          case 'top':
            top = rect.top + window.scrollY + offset.top
            left = rect.left + window.scrollX + rect.width / 2
            break
          case 'bottom':
            top = rect.bottom + window.scrollY + offset.top
            left = rect.left + window.scrollX + rect.width / 2
            break
          case 'left':
            top = rect.top + window.scrollY + rect.height / 2
            left = rect.left + window.scrollX + offset.left
            break
          case 'right':
            top = rect.top + window.scrollY + rect.height / 2
            left = rect.right + window.scrollX + offset.left
            break
        }

        setCoords({ top, left })
        setIsVisible(true)
      }
    }, delay)
  }

  const hideTooltip = (): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const childWithRef = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: () => {
      showTooltip()
      children.props.onMouseEnter?.()
    },
    onMouseLeave: () => {
      hideTooltip()
      children.props.onMouseLeave?.()
    },
    onFocus: () => {
      showTooltip()
      children.props.onFocus?.()
    },
    onBlur: () => {
      hideTooltip()
      children.props.onBlur?.()
    }
  })

  return (
    <>
      {childWithRef}
      {isVisible &&
        !disabled &&
        createPortal(
          <div
            className={cn(
              'fixed z-[1070] px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-700 rounded-md shadow-lg pointer-events-none transform',
              position === 'top' && '-translate-x-1/2 -translate-y-full',
              position === 'bottom' && '-translate-x-1/2',
              position === 'left' && '-translate-x-full -translate-y-1/2',
              position === 'right' && '-translate-y-1/2',
              className
            )}
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`
            }}
            role="tooltip"
          >
            {content}
            {/* Arrow */}
            <div
              className={cn(
                'absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45',
                position === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
                position === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
                position === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2',
                position === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2'
              )}
            />
          </div>,
          document.body
        )}
    </>
  )
}
