/**
 * Task Service
 * Business logic for task management
 * Phase 3 Sprint 3.1 - Task Management System
 */

import { logger } from '../../../shared/utils/logger'
import { EventBus } from '../../../shared/utils/event-bus'
import { Result } from '../../../shared/types/common.types'
import { FileSystemService } from '../../../main/services/FileSystemService'
import { TaskRepository } from '../repositories/TaskRepository'
import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  TaskStats,
  TaskStatus
} from '../types/task.types'

/**
 * Task Service class
 */
export class TaskService {
  private repository: TaskRepository
  private eventBus: EventBus

  constructor(fileSystem: FileSystemService, eventBus: EventBus) {
    this.repository = new TaskRepository(fileSystem)
    this.eventBus = eventBus
    logger.info('TaskService initialized')
  }

  /**
   * Get all tasks with optional filters
   */
  async getAllTasks(filters?: TaskFilters): Promise<Task[]> {
    try {
      let tasks = await this.repository.findAll()

      // Apply filters
      if (filters) {
        if (filters.spaceId) {
          tasks = tasks.filter((task) => task.spaceId === filters.spaceId)
        }
        if (filters.status) {
          tasks = tasks.filter((task) => task.status === filters.status)
        }
        if (filters.priority) {
          tasks = tasks.filter((task) => task.priority === filters.priority)
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          tasks = tasks.filter(
            (task) =>
              task.title.toLowerCase().includes(searchLower) ||
              task.description?.toLowerCase().includes(searchLower)
          )
        }
        if (filters.dueBefore) {
          tasks = tasks.filter((task) => task.dueDate && task.dueDate <= filters.dueBefore!)
        }
        if (filters.dueAfter) {
          tasks = tasks.filter((task) => task.dueDate && task.dueDate >= filters.dueAfter!)
        }
      }

      // Sort by order
      tasks.sort((a, b) => a.order - b.order)

      return tasks
    } catch (error) {
      logger.error('Failed to get all tasks', error)
      return []
    }
  }

  /**
   * Get task by ID
   */
  async getTaskById(id: string): Promise<Result<Task>> {
    try {
      const task = await this.repository.findById(id)

      if (!task) {
        return {
          success: false,
          error: `Task not found with id: ${id}`
        }
      }

      return { success: true, data: task }
    } catch (error) {
      logger.error('Failed to get task by ID', error, { id })
      return {
        success: false,
        error: 'Failed to retrieve task'
      }
    }
  }

  /**
   * Create new task
   */
  async createTask(data: CreateTaskInput): Promise<Result<Task>> {
    try {
      logger.debug('Creating task', { spaceId: data.spaceId, title: data.title })

      // Use repository's create method with the data only (without base entity fields)
      const result = await this.repository.create(data as any)

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to save task'
        }
      }

      // Use the task returned by repository (with its generated ID and timestamps)
      const createdTask = result.data!

      // Emit event
      this.eventBus.emit('task:created', createdTask)

      logger.info('Task created successfully', { id: createdTask.id })
      return { success: true, data: createdTask }
    } catch (error) {
      logger.error('Failed to create task', error)
      return {
        success: false,
        error: 'Failed to create task'
      }
    }
  }

  /**
   * Update task
   */
  async updateTask(id: string, updates: Partial<UpdateTaskInput>): Promise<Result<Task>> {
    try {
      logger.debug('Updating task', { id })

      const existing = await this.repository.findById(id)
      if (!existing) {
        return {
          success: false,
          error: `Task not found with id: ${id}`
        }
      }

      const now = new Date().toISOString()
      const updatedTask: Task = {
        ...existing,
        ...updates,
        id, // Ensure id doesn't change
        spaceId: existing.spaceId, // Ensure spaceId doesn't change
        createdAt: existing.createdAt, // Preserve creation date
        updatedAt: now
      }

      // If status is completed, set completedAt
      if (updates.status === 'completed' && !updatedTask.completedAt) {
        updatedTask.completedAt = now
      }

      // If status is not completed, clear completedAt
      if (updates.status && updates.status !== 'completed') {
        updatedTask.completedAt = undefined
      }

      await this.repository.update(id, updatedTask)

      // Emit event
      this.eventBus.emit('task:updated', updatedTask)

      logger.info('Task updated successfully', { id })
      return { success: true, data: updatedTask }
    } catch (error) {
      logger.error('Failed to update task', error, { id })
      return {
        success: false,
        error: 'Failed to update task'
      }
    }
  }

  /**
   * Delete task
   */
  async deleteTask(id: string): Promise<Result<void>> {
    try {
      logger.debug('Deleting task', { id })

      const existing = await this.repository.findById(id)
      if (!existing) {
        return {
          success: false,
          error: `Task not found with id: ${id}`
        }
      }

      await this.repository.delete(id)

      // Emit event
      this.eventBus.emit('task:deleted', { id })

      logger.info('Task deleted successfully', { id })
      return { success: true }
    } catch (error) {
      logger.error('Failed to delete task', error, { id })
      return {
        success: false,
        error: 'Failed to delete task'
      }
    }
  }

  /**
   * Toggle task status (pending <-> completed)
   */
  async toggleTaskStatus(id: string): Promise<Result<Task>> {
    try {
      logger.debug('Toggling task status', { id })

      const existing = await this.repository.findById(id)
      if (!existing) {
        return {
          success: false,
          error: `Task not found with id: ${id}`
        }
      }

      const newStatus: TaskStatus =
        existing.status === TaskStatus.Completed ? TaskStatus.Pending : TaskStatus.Completed

      return await this.updateTask(id, { status: newStatus })
    } catch (error) {
      logger.error('Failed to toggle task status', error, { id })
      return {
        success: false,
        error: 'Failed to toggle task status'
      }
    }
  }

  /**
   * Get task statistics for a space
   */
  async getTaskStats(spaceId: string): Promise<Result<TaskStats>> {
    try {
      logger.debug('Getting task stats', { spaceId })

      const tasks = await this.repository.findBySpaceId(spaceId)

      const total = tasks.length
      const completed = tasks.filter((t) => t.status === 'completed').length
      const pending = tasks.filter((t) => t.status === 'pending').length
      const inProgress = tasks.filter((t) => t.status === 'in_progress').length
      const cancelled = tasks.filter((t) => t.status === 'cancelled').length

      // Count overdue tasks
      const now = new Date().toISOString().split('T')[0]
      const overdue = tasks.filter(
        (t) =>
          t.status !== 'completed' &&
          t.status !== 'cancelled' &&
          t.dueDate &&
          t.dueDate < now
      ).length

      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

      const stats: TaskStats = {
        total,
        completed,
        pending,
        inProgress,
        cancelled,
        overdue,
        completionRate
      }

      return { success: true, data: stats }
    } catch (error) {
      logger.error('Failed to get task stats', error, { spaceId })
      return {
        success: false,
        error: 'Failed to get task statistics'
      }
    }
  }

  /**
   * Reorder tasks
   */
  async reorderTasks(taskIds: string[]): Promise<Result<void>> {
    try {
      logger.debug('Reordering tasks', { count: taskIds.length })

      for (let i = 0; i < taskIds.length; i++) {
        await this.updateTask(taskIds[i], { order: i })
      }

      logger.info('Tasks reordered successfully')
      return { success: true }
    } catch (error) {
      logger.error('Failed to reorder tasks', error)
      return {
        success: false,
        error: 'Failed to reorder tasks'
      }
    }
  }
}

/**
 * Factory function to create TaskService instance
 */
export function createTaskService(
  fileSystem: FileSystemService,
  eventBus: EventBus
): TaskService {
  return new TaskService(fileSystem, eventBus)
}
