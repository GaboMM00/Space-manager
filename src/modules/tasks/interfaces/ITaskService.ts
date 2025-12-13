/**
 * ITaskService Interface
 * Task service interface for dependency injection
 * Phase 5.5 Sprint 5.5.1 - Dependency Injection Infrastructure
 */

import type { Result } from '../../../shared/types/common.types'
import type { Task, TaskFilters, CreateTaskInput, UpdateTaskInput, TaskStats } from '../types/task.types'

export interface ITaskService {
  /**
   * Get all tasks with optional filters
   */
  getAllTasks(filters?: TaskFilters): Promise<Task[]>

  /**
   * Get task by ID
   */
  getTaskById(id: string): Promise<Result<Task>>

  /**
   * Create new task
   */
  createTask(data: CreateTaskInput): Promise<Result<Task>>

  /**
   * Update existing task
   */
  updateTask(id: string, updates: Partial<UpdateTaskInput>): Promise<Result<Task>>

  /**
   * Delete task
   */
  deleteTask(id: string): Promise<Result<void>>

  /**
   * Toggle task status (pending <-> completed)
   */
  toggleTaskStatus(id: string): Promise<Result<Task>>

  /**
   * Get task statistics for a space
   */
  getTaskStats(spaceId: string): Promise<Result<TaskStats>>

  /**
   * Reorder tasks
   */
  reorderTasks(taskIds: string[]): Promise<Result<void>>
}
