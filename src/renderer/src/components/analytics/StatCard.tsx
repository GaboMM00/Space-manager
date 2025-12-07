/**
 * StatCard Component
 * Displays a single statistic with icon, value, and optional trend
 * Phase 5 Sprint 5.3.2 - Analytics Dashboard UI Integration
 */

import React from 'react'
import { cn } from '../../utils/cn'
import { Card, CardBody } from '../ui/Card'

export interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  trend?: { value: number; direction: 'up' | 'down' }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  loading?: boolean
}

/**
 * Color variants for stat cards
 */
const colorVariants = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    value: 'text-blue-900 dark:text-blue-100'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: 'text-green-600 dark:text-green-400',
    value: 'text-green-900 dark:text-green-100'
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    icon: 'text-yellow-600 dark:text-yellow-400',
    value: 'text-yellow-900 dark:text-yellow-100'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: 'text-red-600 dark:text-red-400',
    value: 'text-red-900 dark:text-red-100'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400',
    value: 'text-purple-900 dark:text-purple-100'
  }
}

/**
 * StatCard Component
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  loading = false
}) => {
  const colors = colorVariants[color]

  return (
    <Card>
      <CardBody padding>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>

            {loading ? (
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
            ) : (
              <p className={cn('text-2xl font-bold', colors.value)}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            )}

            {trend && !loading && (
              <div className={cn(
                'flex items-center gap-1 mt-2 text-sm font-medium',
                trend.direction === 'up'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              )}>
                {trend.direction === 'up' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                <span>{trend.value}%</span>
              </div>
            )}
          </div>

          <div className={cn(
            'flex items-center justify-center w-12 h-12 rounded-lg',
            colors.bg
          )}>
            <div className={cn('w-6 h-6', colors.icon)}>
              {icon}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
