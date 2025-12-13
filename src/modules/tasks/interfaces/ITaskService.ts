/**
 * ITaskService Interface
 * Task service interface for dependency injection
 * Phase 5.5 Sprint 5.5.1 - Dependency Injection Infrastructure
 */

import type { Result } from '../../../shared/types/common.types'
import type { Task, TaskFilters, CreateTaskInput, UpdateTaskInput, TaskStats } from '../types/task.types'

export interface ITaskService {
  /**
   * List all tasks with optional filters
   */
  listTasks(filters?: TaskFilters): Promise<Result<Task[]>>

  /**
   * Get task by ID
   */
  getTask(id: string): Promise<Result<Task>>

  /**
   * Create new task
   */
  createTask(input: CreateTaskInput): Promise<Result<Task>>

  /**
   * Update existing task
   */
  updateTask(id: string, input: UpdateTaskInput): Promise<Result<Task>>

  /**
   * Delete task
   */
  deleteTask(id: string): Promise<Result<void>>

  /**
   * Toggle task status (pending <-> completed)
   */
  toggleTask(id: string): Promise<Result<Task>>

  /**
   * Get task statistics for a space
   */
  getTaskStats(spaceId: string): Promise<Result<TaskStats>>

  /**
   * Reorder tasks
   */
  reorderTasks(taskIds: string[]): Promise<Result<void>>
}
