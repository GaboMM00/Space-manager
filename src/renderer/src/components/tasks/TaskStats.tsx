/**
 * TaskStats Component
 * Displays task statistics and overview
 * Phase 5 Sprint 5.3.1 - Task Management UI Integration
 */

import React from 'react'
import { Card, CardBody } from '../ui/Card'
import type { Task } from '../../../../modules/tasks/types/task.types'

export interface TaskStatsProps {
  tasks: Task[]
}

/**
 * Calculate task statistics from task list
 */
const calculateStats = (tasks: Task[]) => {
  const total = tasks.length
  const pending = tasks.filter((t) => t.status === 'pending').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const cancelled = tasks.filter((t) => t.status === 'cancelled').length

  // Overdue tasks (not completed and due date passed)
  const now = new Date()
  const overdue = tasks.filter(
    (t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now
  ).length

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    total,
    pending,
    inProgress,
    completed,
    cancelled,
    overdue,
    completionRate
  }
}

/**
 * TaskStats Component
 */
export const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
  const stats = calculateStats(tasks)

  return (
    <Card>
      <CardBody padding>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Task Statistics
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Total */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Total
            </div>
          </div>

          {/* Pending */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.pending}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Pending
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.inProgress}
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
              Active
            </div>
          </div>

          {/* Completed */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.completed}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              Done
            </div>
          </div>
        </div>

        {/* Completion Progress Bar */}
        {stats.total > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats.completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        )}

        {/* Overdue Warning */}
        {stats.overdue > 0 && (
          <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-error-600 dark:text-error-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-medium text-error-700 dark:text-error-300">
              {stats.overdue} task{stats.overdue > 1 ? 's' : ''} overdue
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
