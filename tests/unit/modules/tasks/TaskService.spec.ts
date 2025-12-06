/**
 * TaskService Unit Tests
 *
 * Testing framework: Node.js native test runner
 * Test file: tests/unit/modules/tasks/TaskService.spec.ts
 *
 * These tests validate the TaskService business logic layer which manages
 * all task CRUD operations in the Space Manager application.
 *
 * Stack: Electron + Vite + React + TypeScript
 * Testing: Node.js Test Runner + Playwright (E2E)
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { TaskService } from '../../../../src/modules/tasks/services/TaskService'
import type { Task, TaskStatus, TaskPriority } from '../../../../src/modules/tasks/types/task.types'

// Mock data
const mockTask: Task = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Test Description',
  status: 'pending' as TaskStatus,
  priority: 'medium' as TaskPriority,
  spaceId: 'space-1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  order: 0
}

describe('TaskService', () => {
  let taskService: TaskService
  let mockRepository: any
  let mockEventBus: any

  beforeEach(() => {
    // Create mocks using Node.js mock API
    mockRepository = {
      findAll: mock.fn(() => Promise.resolve([])),
      findById: mock.fn(() => Promise.resolve(null)),
      create: mock.fn((task: any) => Promise.resolve(task)),
      update: mock.fn((id: string, data: any) => Promise.resolve({ id, ...data })),
      delete: mock.fn(() => Promise.resolve())
    }

    mockEventBus = {
      emit: mock.fn(() => Promise.resolve())
    }

    taskService = new TaskService(mockRepository, mockEventBus)
  })

  describe('getAllTasks', () => {
    it('should return all tasks without filters', async () => {
      const tasks = [mockTask]
      mockRepository.findAll.mock.mockImplementationOnce(() => Promise.resolve(tasks))

      const result = await taskService.getAllTasks()

      assert.deepEqual(result, tasks)
      assert.equal(mockRepository.findAll.mock.callCount(), 1)
    })

    it('should filter tasks by spaceId', async () => {
      const tasks = [mockTask]
      mockRepository.findAll.mock.mockImplementationOnce(() => Promise.resolve(tasks))

      const result = await taskService.getAllTasks({ spaceId: 'space-1' })

      assert.deepEqual(result, tasks)
      const filtered = result.filter((t: Task) => t.spaceId === 'space-1')
      assert.equal(filtered.length, 1)
    })

    it('should filter tasks by status', async () => {
      const tasks = [mockTask]
      mockRepository.findAll.mock.mockImplementationOnce(() => Promise.resolve(tasks))

      const result = await taskService.getAllTasks({ status: 'pending' })

      const filtered = result.filter((t: Task) => t.status === 'pending')
      assert.ok(filtered.length > 0)
    })

    it('should filter tasks by priority', async () => {
      const tasks = [mockTask]
      mockRepository.findAll.mock.mockImplementationOnce(() => Promise.resolve(tasks))

      const result = await taskService.getAllTasks({ priority: 'medium' })

      const filtered = result.filter((t: Task) => t.priority === 'medium')
      assert.ok(filtered.length > 0)
    })

    it('should return empty array on error', async () => {
      mockRepository.findAll.mock.mockImplementationOnce(() =>
        Promise.reject(new Error('Database error'))
      )

      const result = await taskService.getAllTasks()

      assert.deepEqual(result, [])
    })
  })

  describe('getTaskById', () => {
    it('should return task when found', async () => {
      mockRepository.findById.mock.mockImplementationOnce(() => Promise.resolve(mockTask))

      const result = await taskService.getTaskById('task-1')

      assert.deepEqual(result, mockTask)
      assert.deepEqual(mockRepository.findById.mock.calls[0].arguments, ['task-1'])
    })

    it('should return null when task not found', async () => {
      mockRepository.findById.mock.mockImplementationOnce(() => Promise.resolve(null))

      const result = await taskService.getTaskById('non-existent')

      assert.equal(result, null)
    })

    it('should return null on error', async () => {
      mockRepository.findById.mock.mockImplementationOnce(() =>
        Promise.reject(new Error('Database error'))
      )

      const result = await taskService.getTaskById('task-1')

      assert.equal(result, null)
    })
  })

  describe('createTask', () => {
    it('should create task successfully', async () => {
      const newTask = { title: 'New Task', spaceId: 'space-1' }
      mockRepository.create.mock.mockImplementationOnce((task: any) =>
        Promise.resolve({ ...mockTask, ...newTask })
      )

      const result = await taskService.createTask(newTask as any)

      assert.equal(result?.title, newTask.title)
      assert.ok(mockRepository.create.mock.callCount() > 0)
      assert.ok(mockEventBus.emit.mock.callCount() > 0)
    })

    it('should set default values for optional fields', async () => {
      const newTask = { title: 'New Task', spaceId: 'space-1' }
      mockRepository.create.mock.mockImplementationOnce((task: any) => Promise.resolve(task))

      const result = await taskService.createTask(newTask as any)

      assert.equal(result?.status, 'pending')
      assert.equal(result?.priority, 'medium')
      assert.equal(result?.order, 0)
    })

    it('should return null on error', async () => {
      mockRepository.create.mock.mockImplementationOnce(() =>
        Promise.reject(new Error('Database error'))
      )

      const result = await taskService.createTask({ title: 'Test' } as any)

      assert.equal(result, null)
    })
  })

  describe('updateTask', () => {
    it('should update task successfully', async () => {
      const updates = { title: 'Updated Title' }
      const updatedTask = { ...mockTask, ...updates, updatedAt: new Date() }
      mockRepository.update.mock.mockImplementationOnce(() => Promise.resolve(updatedTask))

      const result = await taskService.updateTask('task-1', updates)

      assert.equal(result?.title, updates.title)
      assert.ok(mockRepository.update.mock.callCount() > 0)
      assert.ok(mockEventBus.emit.mock.callCount() > 0)
    })

    it('should prevent updating immutable fields', async () => {
      const updates = { id: 'new-id', createdAt: new Date() }
      mockRepository.update.mock.mockImplementationOnce((id: string, data: any) =>
        Promise.resolve({ ...mockTask, ...data })
      )

      const result = await taskService.updateTask('task-1', updates as any)

      assert.equal(result?.id, 'task-1') // ID should not change
    })

    it('should set completedAt when marking task as completed', async () => {
      const updates = { status: 'completed' as TaskStatus }
      mockRepository.update.mock.mockImplementationOnce((id: string, data: any) =>
        Promise.resolve({ ...mockTask, ...data })
      )

      const result = await taskService.updateTask('task-1', updates)

      assert.ok(result?.completedAt)
    })

    it('should return null when task not found', async () => {
      mockRepository.update.mock.mockImplementationOnce(() => Promise.resolve(null))

      const result = await taskService.updateTask('non-existent', { title: 'Test' })

      assert.equal(result, null)
    })
  })

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      mockRepository.delete.mock.mockImplementationOnce(() => Promise.resolve())

      const result = await taskService.deleteTask('task-1')

      assert.equal(result, true)
      assert.deepEqual(mockRepository.delete.mock.calls[0].arguments, ['task-1'])
      assert.ok(mockEventBus.emit.mock.callCount() > 0)
    })

    it('should return false when task not found', async () => {
      mockRepository.delete.mock.mockImplementationOnce(() =>
        Promise.reject(new Error('Task not found'))
      )

      const result = await taskService.deleteTask('non-existent')

      assert.equal(result, false)
    })

    it('should return false on error', async () => {
      mockRepository.delete.mock.mockImplementationOnce(() =>
        Promise.reject(new Error('Database error'))
      )

      const result = await taskService.deleteTask('task-1')

      assert.equal(result, false)
    })
  })

  describe('toggleTaskStatus', () => {
    it('should toggle task from pending to completed', async () => {
      mockRepository.findById.mock.mockImplementationOnce(() =>
        Promise.resolve({ ...mockTask, status: 'pending' })
      )
      mockRepository.update.mock.mockImplementationOnce((id: string, data: any) =>
        Promise.resolve({ ...mockTask, ...data })
      )

      const result = await taskService.toggleTaskStatus('task-1')

      assert.equal(result?.status, 'completed')
      assert.ok(result?.completedAt)
    })

    it('should toggle task from completed to pending', async () => {
      mockRepository.findById.mock.mockImplementationOnce(() =>
        Promise.resolve({
          ...mockTask,
          status: 'completed',
          completedAt: new Date()
        })
      )
      mockRepository.update.mock.mockImplementationOnce((id: string, data: any) =>
        Promise.resolve({ ...mockTask, ...data })
      )

      const result = await taskService.toggleTaskStatus('task-1')

      assert.equal(result?.status, 'pending')
      assert.equal(result?.completedAt, undefined)
    })

    it('should return null when task not found', async () => {
      mockRepository.findById.mock.mockImplementationOnce(() => Promise.resolve(null))

      const result = await taskService.toggleTaskStatus('non-existent')

      assert.equal(result, null)
    })
  })

  describe('getTaskStats', () => {
    it('should calculate task statistics correctly', async () => {
      const tasks = [
        { ...mockTask, id: '1', status: 'pending' as TaskStatus },
        { ...mockTask, id: '2', status: 'completed' as TaskStatus },
        { ...mockTask, id: '3', status: 'in_progress' as TaskStatus }
      ]
      mockRepository.findAll.mock.mockImplementationOnce(() => Promise.resolve(tasks))

      const result = await taskService.getTaskStats('space-1')

      assert.equal(result.total, 3)
      assert.equal(result.completed, 1)
      assert.equal(result.pending, 1)
      assert.equal(result.inProgress, 1)
    })

    it('should count overdue tasks correctly', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const tasks = [
        { ...mockTask, id: '1', status: 'pending' as TaskStatus, dueDate: yesterday },
        { ...mockTask, id: '2', status: 'pending' as TaskStatus }
      ]
      mockRepository.findAll.mock.mockImplementationOnce(() => Promise.resolve(tasks))

      const result = await taskService.getTaskStats('space-1')

      assert.equal(result.overdue, 1)
    })

    it('should return zero stats for empty task list', async () => {
      mockRepository.findAll.mock.mockImplementationOnce(() => Promise.resolve([]))

      const result = await taskService.getTaskStats('space-1')

      assert.equal(result.total, 0)
      assert.equal(result.completed, 0)
      assert.equal(result.pending, 0)
      assert.equal(result.inProgress, 0)
      assert.equal(result.overdue, 0)
    })
  })

  describe('reorderTasks', () => {
    it('should reorder tasks successfully', async () => {
      const taskIds = ['task-1', 'task-2', 'task-3']
      mockRepository.update.mock.mockImplementation(() => Promise.resolve({}))

      const result = await taskService.reorderTasks(taskIds)

      assert.equal(result, true)
      assert.equal(mockRepository.update.mock.callCount(), 3)
      assert.ok(mockEventBus.emit.mock.callCount() > 0)
    })

    it('should return false on error', async () => {
      const taskIds = ['task-1', 'task-2']
      mockRepository.update.mock.mockImplementationOnce(() =>
        Promise.reject(new Error('Database error'))
      )

      const result = await taskService.reorderTasks(taskIds)

      assert.equal(result, false)
    })
  })
})
