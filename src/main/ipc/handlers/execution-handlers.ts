/**
 * Execution IPC Handlers
 * Handles IPC communication for space execution
 * Phase 1 Sprint 1.4 - Execution Engine
 * Updated Phase 5.5 Sprint 5.5.2 - Using DI Container
 */

import { ipcMain, createSuccessResult, createErrorResult } from '../ipc-main'
import { IPC_CHANNELS } from '../../../shared/types/ipc.types'
import { Result } from '../../../shared/types/common.types'
import { ExecutionResult } from '../../../modules/execution/types/execution.types'
import { ExecutionOrchestrator } from '../../../modules/execution/services/ExecutionOrchestrator'
import { EventBus } from '../../../shared/utils/event-bus'
import { AnalyticsService } from '../../../modules/analytics/services/AnalyticsService'
import { SpaceService } from '../../../modules/workspace/services/SpaceService'
import { logger } from '../../../shared/utils/logger'
import { container, ServiceNames } from '../../../shared/di'

/**
 * Get services from DI container
 * Note: Using concrete types since ExecutionOrchestrator expects specific classes
 */
function getSpaceService(): SpaceService {
  return container().resolve<SpaceService>(ServiceNames.SPACE_SERVICE)
}

function getEventBus(): EventBus {
  return container().resolve<EventBus>(ServiceNames.EVENT_BUS)
}

function getAnalyticsService(): AnalyticsService {
  return container().resolve<AnalyticsService>(ServiceNames.ANALYTICS_SERVICE)
}

/**
 * Initialize ExecutionOrchestrator with DI
 * Note: ExecutionOrchestrator is created per request since it manages state
 */
function createOrchestrator(): ExecutionOrchestrator {
  const eventBus = getEventBus()
  const analyticsService = getAnalyticsService()
  return new ExecutionOrchestrator(eventBus, analyticsService)
}

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
        const spaceService = getSpaceService()
        const spaceResult = await spaceService.getSpaceById(spaceId)
        if (!spaceResult.success || !spaceResult.data) {
          return createErrorResult<ExecutionResult>(
            spaceResult.error || 'Space not found',
            'SPACE_NOT_FOUND'
          )
        }

        const space = spaceResult.data

        // Execute the space
        const orchestrator = createOrchestrator()
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
