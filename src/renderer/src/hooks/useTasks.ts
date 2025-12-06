/**
 * useTasks Hook (ViewModel)
 * Manages tasks state and operations
 * Phase 5 Sprint 5.3.1 - Task Management UI Integration
 */

import { useState, useEffect, useCallback } from 'react'
import type { Task, TaskFilters, TaskStats, CreateTaskInput, UpdateTaskInput } from '../../../modules/tasks/types/task.types'
import type { Result } from '../../../shared/types/common.types'

/**
 * Tasks ViewModel Hook
 */
export const useTasks = (initialFilters?: TaskFilters) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TaskFilters>(initialFilters || {})

  /**
   * Load all tasks with optional filters
   */
  const loadTasks = useCallback(async (filterOverride?: TaskFilters) => {
    setLoading(true)
    setError(null)

    try {
      const activeFilters = filterOverride || filters
      const result: Result<Task[]> = await window.api.tasks.list(activeFilters)

      if (result.success && result.data) {
        setTasks(result.data)
      } else {
        setError(result.error || 'Failed to load tasks')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [filters])

  /**
   * Create a new task
   */
  const createTask = useCallback(async (taskData: CreateTaskInput) => {
    setLoading(true)
    setError(null)

    try {
      const result: Result<Task> = await window.api.tasks.create(taskData)

      if (result.success && result.data) {
        setTasks((prev) => [...prev, result.data!])
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to create task')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update an existing task
   */
  const updateTask = useCallback(async (id: string, updates: Partial<UpdateTaskInput>) => {
    setLoading(true)
    setError(null)

    try {
      const result: Result<Task> = await window.api.tasks.update(id, updates)

      if (result.success && result.data) {
        setTasks((prev) => prev.map((task) => (task.id === id ? result.data! : task)))
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to update task')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const result: Result<void> = await window.api.tasks.delete(id)

      if (result.success) {
        setTasks((prev) => prev.filter((task) => task.id !== id))
        return { success: true }
      } else {
        setError(result.error || 'Failed to delete task')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Toggle task status (pending <-> completed)
   */
  const toggleTask = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const result: Result<Task> = await window.api.tasks.toggle(id)

      if (result.success && result.data) {
        setTasks((prev) => prev.map((task) => (task.id === id ? result.data! : task)))
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to toggle task')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Get task statistics for a space
   */
  const getTaskStats = useCallback(async (spaceId: string) => {
    setLoading(true)
    setError(null)

    try {
      const result: Result<TaskStats> = await window.api.tasks.stats(spaceId)

      if (result.success && result.data) {
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to get task stats')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Reorder tasks
   */
  const reorderTasks = useCallback(async (taskIds: string[]) => {
    setLoading(true)
    setError(null)

    try {
      const result: Result<void> = await window.api.tasks.reorder(taskIds)

      if (result.success) {
        // Update local state to reflect new order
        const orderedTasks = taskIds.map((id) => tasks.find((t) => t.id === id)).filter(Boolean) as Task[]
        setTasks(orderedTasks)
        return { success: true }
      } else {
        setError(result.error || 'Failed to reorder tasks')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [tasks])

  /**
   * Update filters and reload
   */
  const updateFilters = useCallback((newFilters: TaskFilters) => {
    setFilters(newFilters)
    loadTasks(newFilters)
  }, [loadTasks])

  // Load tasks on mount and when filters change
  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  return {
    tasks,
    loading,
    error,
    filters,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    getTaskStats,
    reorderTasks,
    updateFilters
  }
}
