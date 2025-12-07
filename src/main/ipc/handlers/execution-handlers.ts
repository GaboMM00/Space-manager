/**
 * Execution IPC Handlers
 * Handles IPC communication for space execution
 * Phase 1 Sprint 1.4 - Execution Engine
 */

import { ipcMain, createSuccessResult, createErrorResult } from '../ipc-main'
import { IPC_CHANNELS } from '../../../shared/types/ipc.types'
import { Result } from '../../../shared/types/common.types'
import { ExecutionResult } from '../../../modules/execution/types/execution.types'
import { ExecutionOrchestrator } from '../../../modules/execution/services/ExecutionOrchestrator'
import { getFileSystemService } from '../../services/FileSystemService'
import { createBackupService } from '../../services/BackupService'
import { createEventBus } from '../../../shared/utils/event-bus'
import { createSpaceService } from '../../../modules/workspace/services/SpaceService'
import { getSQLiteService } from '../../services/SQLiteService'
import { createAnalyticsService } from '../../../modules/analytics/services/AnalyticsService'
import { SpaceRepository } from '../../../modules/workspace/repositories/SpaceRepository'
import { TaskRepository } from '../../../modules/tasks/repositories/TaskRepository'
import { logger } from '../../../shared/utils/logger'

/**
 * Initialize services
 */
const fileSystem = getFileSystemService()
const backupService = createBackupService(fileSystem)
const eventBus = createEventBus()
const sqliteService = getSQLiteService()
const spaceRepository = new SpaceRepository(fileSystem)
const taskRepository = new TaskRepository(fileSystem)
const analyticsService = createAnalyticsService(sqliteService, spaceRepository, taskRepository)
const spaceService = createSpaceService(fileSystem, backupService, eventBus)
const orchestrator = new ExecutionOrchestrator(eventBus, analyticsService)

/**
 * Register execution IPC handlers
 */
export function registerExecutionHandlers(): void {
  logger.info('Registering execution IPC handlers')

  /**
   * Execute a space
   */
  ipcMain.handle(
    IPC_CHANNELS.SPACES_EXECUTE,
    async (_event, spaceId: string): Promise<Result<ExecutionResult>> => {
      try {
        logger.info('Executing space', { spaceId })

        // Get the space
        const spaceResult = await spaceService.getSpaceById(spaceId)
        if (!spaceResult.success || !spaceResult.data) {
          return createErrorResult<ExecutionResult>(
            spaceResult.error || 'Space not found',
            'SPACE_NOT_FOUND'
          )
        }

        const space = spaceResult.data

        // Execute the space
        const result = await orchestrator.executeSpace(space)

        return createSuccessResult(result)
      } catch (error) {
        logger.error('Failed to execute space', { error, spaceId })
        return createErrorResult<ExecutionResult>(
          (error as Error).message,
          'EXECUTION_FAILED'
        )
      }
    }
  )

  logger.info('Execution IPC handlers registered')
}
