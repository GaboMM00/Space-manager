/**
 * Card Component
 * Container component with consistent styling
 * Phase 2 Sprint 2.1 - Base Components
 */

import React, { forwardRef } from 'react'
import { cn } from '../../../utils/cn'
import type { BaseComponentProps } from '../../../types/component.types'

export interface CardProps extends BaseComponentProps, React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the card has padding
   */
  padding?: boolean
  /**
   * Whether the card is hoverable
   */
  hoverable?: boolean
  /**
   * Whether the card is clickable (shows pointer cursor)
   */
  clickable?: boolean
}

export interface CardHeaderProps extends BaseComponentProps, React.HTMLAttributes<HTMLDivElement> {}

export interface CardBodyProps extends BaseComponentProps, React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the body has padding
   */
  padding?: boolean
}

export interface CardFooterProps extends BaseComponentProps, React.HTMLAttributes<HTMLDivElement> {}

/**
 * Card Component
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ padding = true, hoverable = false, clickable = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-shadow',
          padding && 'p-6',
          hoverable && 'hover:shadow-md',
          clickable && 'cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

/**
 * Card Header Component
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 mb-4', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

/**
 * Card Title Component
 */
export const CardTitle = forwardRef<HTMLHeadingElement, BaseComponentProps & React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn('text-2xl font-semibold text-gray-900 dark:text-white', className)}
        {...props}
      >
        {children}
      </h3>
    )
  }
)

CardTitle.displayName = 'CardTitle'

/**
 * Card Description Component
 */
export const CardDescription = forwardRef<HTMLParagraphElement, BaseComponentProps & React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
        {...props}
      >
        {children}
      </p>
    )
  }
)

CardDescription.displayName = 'CardDescription'

/**
 * Card Body Component
 */
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ padding = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(padding && 'px-6 py-4', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardBody.displayName = 'CardBody'

/**
 * Card Footer Component
 */
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'
