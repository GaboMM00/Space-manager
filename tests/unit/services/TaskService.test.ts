/**
 * TaskService Unit Tests
 * Demonstrates DI pattern with mocks
 * Phase 5.5 Sprint 5.5.3 - Testing Suite Completion
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert'
import { TaskService } from '../../../src/modules/tasks/services/TaskService'
import type { ITaskRepository } from '../../../src/modules/tasks/interfaces/ITaskRepository'
import type { IEventBus } from '../../../src/shared/interfaces/IEventBus'
import type { FileSystemService } from '../../../src/main/services/FileSystemService'
import { TaskStatus } from '../../../src/modules/tasks/types/task.types'

describe('TaskService with DI', () => {
  let mockFileSystem: FileSystemService
  let mockEventBus: IEventBus
  let taskService: TaskService

  beforeEach(() => {
    // Create mocks
    mockFileSystem = {} as FileSystemService

    mockEventBus = {
      emit: mock.fn(),
      on: mock.fn(),
      off: mock.fn(),
      once: mock.fn(),
      removeAllListeners: mock.fn()
    } as unknown as IEventBus

    // Create service with mocked dependencies
    taskService = new TaskService(mockFileSystem, mockEventBus)
  })

  it('should create instance with injected dependencies', () => {
    assert.ok(taskService)
    assert.ok(mockEventBus)
    assert.ok(mockFileSystem)
  })

  it('should have getAllTasks method', () => {
    assert.strictEqual(typeof taskService.getAllTasks, 'function')
  })

  it('should have createTask method', () => {
    assert.strictEqual(typeof taskService.createTask, 'function')
  })

  it('should have updateTask method', () => {
    assert.strictEqual(typeof taskService.updateTask, 'function')
  })

  it('should have deleteTask method', () => {
    assert.strictEqual(typeof taskService.deleteTask, 'function')
  })

  it('should have toggleTaskStatus method', () => {
    assert.strictEqual(typeof taskService.toggleTaskStatus, 'function')
  })

  it('should have getTaskStats method', () => {
    assert.strictEqual(typeof taskService.getTaskStats, 'function')
  })

  it('should have reorderTasks method', () => {
    assert.strictEqual(typeof taskService.reorderTasks, 'function')
  })
})
