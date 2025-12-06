/**
 * Task Types
 * Type definitions for task management system
 * Phase 3 Sprint 3.1 - Task Management System
 */

import type { BaseEntity } from '../../../shared/types/common.types'

/**
 * Task Status Enum
 */
export enum TaskStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

/**
 * Task Priority Enum
 */
export enum TaskPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
}

/**
 * Reminder Interface
 */
export interface Reminder extends BaseEntity {
  dateTime: string // ISO 8601 timestamp
  notified: boolean
}

/**
 * Task Interface
 */
export interface Task extends BaseEntity {
  spaceId: string // Space this task belongs to
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string // ISO 8601 date
  completedAt?: string // ISO 8601 timestamp
  order: number // Display order
  subtasks?: Task[] // Nested subtasks
  reminders?: Reminder[]
  calendarEventId?: string // External calendar integration
}

/**
 * Task creation input (excludes generated fields)
 */
export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks' | 'reminders'>

/**
 * Task update input (all fields optional except id)
 */
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt' | 'spaceId'>> & { id: string }

/**
 * Task filter options
 */
export interface TaskFilters {
  spaceId?: string
  status?: TaskStatus
  priority?: TaskPriority
  search?: string
  dueBefore?: string
  dueAfter?: string
}

/**
 * Task statistics
 */
export interface TaskStats {
  total: number
  completed: number
  pending: number
  inProgress: number
  cancelled: number
  overdue: number
  completionRate: number
}
