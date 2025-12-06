/**
 * TasksView Component
 * Main tasks view with filtering, sorting, and CRUD operations
 * Phase 5 Sprint 5.3.1 - Task Management UI Integration
 */

import React, { useState } from 'react'
import { useTasks } from '../../hooks/useTasks'
import { useSpaces } from '../../hooks/useSpaces'
import { useToastContext } from '../../context/ToastContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { TaskCard } from '../../components/tasks/TaskCard'
import { TaskStats } from '../../components/tasks/TaskStats'
import { TaskFormModal } from '../../components/tasks/TaskFormModal'
import type { Task, TaskFilters, CreateTaskInput } from '../../../../modules/tasks/types/task.types'
import { TaskStatus, TaskPriority } from '../../../../modules/tasks/types/task.types'

export interface TasksViewProps {
  spaceId?: string // Optional: filter by space
}

/**
 * TasksView Component
 */
export const TasksView: React.FC<TasksViewProps> = ({ spaceId }) => {
  const toast = useToastContext()
  const { spaces } = useSpaces()

  // Initialize with spaceId filter if provided
  const initialFilters: TaskFilters = spaceId ? { spaceId } : {}
  const {
    tasks,
    loading,
    error,
    filters,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    updateFilters
  } = useTasks(initialFilters)

  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')

  // Get space name for a task
  const getSpaceName = (task: Task): string => {
    return spaces.find((s) => s.id === task.spaceId)?.name || 'Unknown Space'
  }

  // Handle create task
  const handleCreateTask = async (taskData: CreateTaskInput) => {
    const result = await createTask(taskData)
    if (result.success) {
      toast.success('Task created successfully')
      setShowCreateModal(false)
      return { success: true }
    } else {
      toast.error(result.error || 'Failed to create task')
      return { success: false, error: result.error }
    }
  }

  // Handle update task
  const handleUpdateTask = async (taskData: CreateTaskInput) => {
    if (!editingTask) return { success: false }

    const result = await updateTask(editingTask.id, taskData)
    if (result.success) {
      toast.success('Task updated successfully')
      setEditingTask(undefined)
      return { success: true }
    } else {
      toast.error(result.error || 'Failed to update task')
      return { success: false, error: result.error }
    }
  }

  // Handle delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    const result = await deleteTask(taskId)
    if (result.success) {
      toast.success('Task deleted successfully')
    } else {
      toast.error(result.error || 'Failed to delete task')
    }
  }

  // Handle toggle task status
  const handleToggleTask = async (taskId: string) => {
    const result = await toggleTask(taskId)
    if (result.success) {
      toast.success('Task status updated')
    } else {
      toast.error(result.error || 'Failed to toggle task')
    }
  }

  // Handle filter changes
  const handleFilterChange = (key: keyof TaskFilters, value: any) => {
    updateFilters({ ...filters, [key]: value || undefined })
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    updateFilters({ ...filters, search: query || undefined })
  }

  // Filter and sort tasks locally for display
  const displayTasks = tasks

  // Icons
  const PlusIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )

  const SearchIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )

  // Loading state
  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Spinner size="xl" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tasks...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-error-600 dark:text-error-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tasks
            {spaceId && spaces.find((s) => s.id === spaceId) && (
              <span className="text-xl font-normal text-gray-500 dark:text-gray-400 ml-2">
                • {spaces.find((s) => s.id === spaceId)!.name}
              </span>
            )}
          </h1>
          <Button
            variant="primary"
            leftIcon={PlusIcon}
            onClick={() => setShowCreateModal(true)}
          >
            New Task
          </Button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your tasks and track progress
        </p>
      </div>

      {/* Statistics */}
      <div className="mb-6">
        <TaskStats tasks={tasks} />
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {SearchIcon}
              </div>
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Space Filter */}
          {!spaceId && (
            <div>
              <select
                value={filters.spaceId || ''}
                onChange={(e) => handleFilterChange('spaceId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Spaces</option>
                {spaces.map((space) => (
                  <option key={space.id} value={space.id}>
                    {space.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value={TaskStatus.Pending}>Pending</option>
              <option value={TaskStatus.InProgress}>In Progress</option>
              <option value={TaskStatus.Completed}>Completed</option>
              <option value={TaskStatus.Cancelled}>Cancelled</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Priorities</option>
              <option value={TaskPriority.High}>🔴 High</option>
              <option value={TaskPriority.Medium}>🟡 Medium</option>
              <option value={TaskPriority.Low}>🔵 Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto">
        {displayTasks.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="mb-4 text-gray-400 dark:text-gray-600">
                <svg className="w-24 h-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                No tasks yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first task to get started
              </p>
              <Button variant="primary" leftIcon={PlusIcon} onClick={() => setShowCreateModal(true)}>
                Create Task
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pb-6">
            {displayTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                spaceName={getSpaceName(task)}
                onToggleStatus={handleToggleTask}
                onEdit={setEditingTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <TaskFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTask}
        defaultSpaceId={spaceId}
      />

      {/* Edit Modal */}
      <TaskFormModal
        open={!!editingTask}
        onClose={() => setEditingTask(undefined)}
        onSubmit={handleUpdateTask}
        task={editingTask}
      />
    </div>
  )
}
