/**
 * ITaskRepository Interface
 * Task repository interface for dependency injection
 * Phase 5.5 Sprint 5.5.1 - Dependency Injection Infrastructure
 */

import type { Result } from '../../../shared/types/common.types'
import type { Task, TaskFilters } from '../types/task.types'

export interface ITaskRepository {
  /**
   * Find all tasks with optional filters
   */
  findAll(filters?: TaskFilters): Promise<Result<Task[]>>

  /**
   * Find task by ID
   */
  findById(id: string): Promise<Result<Task | null>>

  /**
   * Create new task
   */
  create(task: Task): Promise<Result<Task>>

  /**
   * Update existing task
   */
  update(id: string, task: Partial<Task>): Promise<Result<Task>>

  /**
   * Delete task
   */
  delete(id: string): Promise<Result<void>>

  /**
   * Check if task exists
   */
  exists(id: string): Promise<boolean>
}
