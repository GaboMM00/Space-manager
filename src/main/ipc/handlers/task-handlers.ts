/**
 * Task IPC Handlers
 * Handles IPC communication for task operations
 * Phase 3 Sprint 3.1 - Task Management System
 * Updated Phase 5.5 Sprint 5.5.2 - Using DI Container
 */

import { ipcMain, createSuccessResult, createErrorResult } from '../ipc-main'
import { IPC_CHANNELS } from '../../../shared/types/ipc.types'
import { Result } from '../../../shared/types/common.types'
import { Task } from '../../../modules/tasks/types/task.types'
import { logger } from '../../../shared/utils/logger'
import { container, ServiceNames } from '../../../shared/di'
import type { ITaskService } from '../../../modules/tasks/interfaces'

/**
 * Get TaskService from DI container
 */
function getTaskService(): ITaskService {
  return container().resolve<ITaskService>(ServiceNames.TASK_SERVICE)
}

/**
 * Register all task-related IPC handlers
 */
export function registerTaskHandlers(): void {
  logger.info('Registering task IPC handlers')

  // CREATE Task
  ipcMain.handle(IPC_CHANNELS.TASKS_CREATE, async (_event, data): Promise<Result<Task>> => {
    logger.debug('Handling TASKS_CREATE', { spaceId: data.spaceId })
    const taskService = getTaskService()
    const result = await taskService.createTask(data)
    if (result.success && result.data) {
      return createSuccessResult(result.data)
    }
    return createErrorResult<Task>(result.error || 'Failed to create task', result.code)
  })

  // UPDATE Task
  ipcMain.handle(IPC_CHANNELS.TASKS_UPDATE, async (_event, id, updates): Promise<Result<Task>> => {
    logger.debug('Handling TASKS_UPDATE', { id })
    const taskService = getTaskService()
    const result = await taskService.updateTask(id, updates)
    if (result.success && result.data) {
      return createSuccessResult(result.data)
    }
    return createErrorResult<Task>(result.error || 'Failed to update task', result.code)
  })

  // DELETE Task
  ipcMain.handle(IPC_CHANNELS.TASKS_DELETE, async (_event, id): Promise<Result<void>> => {
    logger.debug('Handling TASKS_DELETE', { id })
    const taskService = getTaskService()
    const result = await taskService.deleteTask(id)
    if (result.success) {
      return createSuccessResult()
    }
    return createErrorResult(result.error || 'Failed to delete task', result.code)
  })

  // GET Task
  ipcMain.handle(IPC_CHANNELS.TASKS_GET, async (_event, id): Promise<Result<Task>> => {
    logger.debug('Handling TASKS_GET', { id })
    const taskService = getTaskService()
    const result = await taskService.getTaskById(id)
    if (result.success && result.data) {
      return createSuccessResult(result.data)
    }
    return createErrorResult<Task>(result.error || 'Failed to get task', result.code)
  })

  // LIST Tasks
  ipcMain.handle(IPC_CHANNELS.TASKS_LIST, async (_event, filters): Promise<Result<Task[]>> => {
    logger.debug('Handling TASKS_LIST', { filters })
    const taskService = getTaskService()
    const tasks = await taskService.getAllTasks(filters)
    return createSuccessResult(tasks)
  })

  // TOGGLE Task Status
  ipcMain.handle(IPC_CHANNELS.TASKS_TOGGLE, async (_event, id): Promise<Result<Task>> => {
    logger.debug('Handling TASKS_TOGGLE', { id })
    const taskService = getTaskService()
    const result = await taskService.toggleTaskStatus(id)
    if (result.success && result.data) {
      return createSuccessResult(result.data)
    }
    return createErrorResult<Task>(result.error || 'Failed to toggle task status', result.code)
  })

  // GET Task Stats
  ipcMain.handle(IPC_CHANNELS.TASKS_STATS, async (_event, spaceId): Promise<Result<any>> => {
    logger.debug('Handling TASKS_STATS', { spaceId })
    const taskService = getTaskService()
    const result = await taskService.getTaskStats(spaceId)
    if (result.success && result.data) {
      return createSuccessResult(result.data)
    }
    return createErrorResult(result.error || 'Failed to get task stats', result.code)
  })

  // REORDER Tasks
  ipcMain.handle(IPC_CHANNELS.TASKS_REORDER, async (_event, taskIds): Promise<Result<void>> => {
    logger.debug('Handling TASKS_REORDER', { count: taskIds.length })
    const taskService = getTaskService()
    const result = await taskService.reorderTasks(taskIds)
    if (result.success) {
      return createSuccessResult()
    }
    return createErrorResult(result.error || 'Failed to reorder tasks', result.code)
  })

  logger.info('Task IPC handlers registered successfully')
}
