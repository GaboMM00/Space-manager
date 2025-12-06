/**
 * TaskCard Component
 * Individual task card with status toggle, metadata, and actions
 * Phase 5 Sprint 5.3.1 - Task Management UI Integration
 */

import React from 'react'
import { format } from 'date-fns'
import { cn } from '../../utils/cn'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Dropdown, DropdownItem, DropdownDivider } from '../ui/Dropdown'
import type { Task, TaskPriority } from '../../../../modules/tasks/types/task.types'

export interface TaskCardProps {
  task: Task
  onToggleStatus: (taskId: string) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  spaceName?: string
}

/**
 * Priority badge color mapping
 */
const priorityConfig: Record<TaskPriority, { variant: 'error' | 'warning' | 'secondary'; label: string; icon: string }> = {
  high: { variant: 'error', label: 'High', icon: '🔴' },
  medium: { variant: 'warning', label: 'Medium', icon: '🟡' },
  low: { variant: 'secondary', label: 'Low', icon: '🔵' }
}

/**
 * TaskCard Component
 */
export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  spaceName
}) => {
  const isCompleted = task.status === 'completed'
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted
  const priorityInfo = priorityConfig[task.priority]

  // Icons
  const EditIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )

  const DeleteIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )

  const MenuIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  )

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border transition-all',
        isCompleted
          ? 'border-gray-200 dark:border-gray-700 opacity-75'
          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md'
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => onToggleStatus(task.id)}
            className={cn(
              'flex-shrink-0 w-5 h-5 rounded border-2 transition-all mt-0.5',
              isCompleted
                ? 'bg-primary-600 border-primary-600 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
            )}
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted && (
              <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and Priority */}
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={cn(
                  'font-medium text-gray-900 dark:text-white flex-1',
                  isCompleted && 'line-through text-gray-500 dark:text-gray-400'
                )}
              >
                {task.title}
              </h3>
              <Badge variant={priorityInfo.variant} size="sm">
                {priorityInfo.icon} {priorityInfo.label}
              </Badge>
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {/* Space */}
              {spaceName && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  {spaceName}
                </span>
              )}

              {/* Due Date */}
              {task.dueDate && (
                <span
                  className={cn(
                    'flex items-center gap-1',
                    isOverdue && 'text-error-600 dark:text-error-400 font-medium'
                  )}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  {isOverdue && ' ⚠️'}
                </span>
              )}

              {/* Completed */}
              {isCompleted && task.completedAt && (
                <span className="flex items-center gap-1 text-success-600 dark:text-success-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Completed {format(new Date(task.completedAt), 'MMM d')}
                </span>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <Dropdown
            trigger={
              <Button variant="ghost" size="sm">
                {MenuIcon}
              </Button>
            }
            align="end"
          >
            <DropdownItem onClick={() => onEdit(task)}>
              {EditIcon}
              Edit
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem destructive onClick={() => onDelete(task.id)}>
              {DeleteIcon}
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </div>
  )
}
