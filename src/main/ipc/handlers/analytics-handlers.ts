/**
 * Analytics IPC Handlers
 * Handles IPC communication for analytics operations
 * Phase 3 Sprint 3.2 - Analytics y Métricas
 */

import { ipcMain, createSuccessResult, createErrorResult } from '../ipc-main'
import { IPC_CHANNELS } from '../../../shared/types/ipc.types'
import { Result } from '../../../shared/types/common.types'
import { getSQLiteService } from '../../services/SQLiteService'
import { getFileSystemService } from '../../services/FileSystemService'
import { createAnalyticsService } from '../../../modules/analytics/services/AnalyticsService'
import { SpaceRepository } from '../../../modules/workspace/repositories/SpaceRepository'
import { TaskRepository } from '../../../modules/tasks/repositories/TaskRepository'
import { logger } from '../../../shared/utils/logger'
import type {
  SpaceUsageSummary,
  RecentTrend,
  TopError,
  ResourcePerformance,
  AnalyticsStats,
  DailyMetric,
  ResourceStat,
  ExecutionLog
} from '../../../modules/analytics/types/analytics.types'

/**
 * Initialize services
 */
const sqliteService = getSQLiteService()
const fileSystemService = getFileSystemService()
const spaceRepository = new SpaceRepository(fileSystemService)
const taskRepository = new TaskRepository(fileSystemService)
const analyticsService = createAnalyticsService(sqliteService, spaceRepository, taskRepository)

/**
 * Register all analytics-related IPC handlers
 */
export function registerAnalyticsHandlers(): void {
  logger.info('Registering analytics IPC handlers')

  // GET Space Usage Summary
  ipcMain.handle(
    IPC_CHANNELS.ANALYTICS_SPACE_USAGE,
    async (): Promise<Result<SpaceUsageSummary[]>> => {
      logger.debug('Handling ANALYTICS_SPACE_USAGE')
      const summary = await analyticsService.getSpaceUsageSummary()
      return createSuccessResult(summary)
    }
  )

  // GET Recent Trends
  ipcMain.handle(
    IPC_CHANNELS.ANALYTICS_RECENT_TRENDS,
    async (_event, days?: number): Promise<Result<RecentTrend[]>> => {
      logger.debug('Handling ANALYTICS_RECENT_TRENDS', { days })
      const trends = await analyticsService.getRecentTrends(days)
      return createSuccessResult(trends)
    }
  )

  // GET Top Errors
  ipcMain.handle(IPC_CHANNELS.ANALYTICS_TOP_ERRORS, async (): Promise<Result<TopError[]>> => {
    logger.debug('Handling ANALYTICS_TOP_ERRORS')
    const errors = await analyticsService.getTopErrors()
    return createSuccessResult(errors)
  })

  // GET Resource Performance
  ipcMain.handle(
    IPC_CHANNELS.ANALYTICS_RESOURCE_PERFORMANCE,
    async (): Promise<Result<ResourcePerformance[]>> => {
      logger.debug('Handling ANALYTICS_RESOURCE_PERFORMANCE')
      const performance = await analyticsService.getResourcePerformance()
      return createSuccessResult(performance)
    }
  )

  // GET Analytics Stats
  ipcMain.handle(
    IPC_CHANNELS.ANALYTICS_STATS,
    async (_event, dateRange): Promise<Result<AnalyticsStats>> => {
      logger.debug('Handling ANALYTICS_STATS', { dateRange })
      const result = await analyticsService.getAnalyticsStats(dateRange)
      if (result.success && result.data) {
        return createSuccessResult(result.data)
      }
      return createErrorResult(result.error || 'Failed to get analytics stats', result.code)
    }
  )

  // GET Daily Metrics for Space
  ipcMain.handle(
    IPC_CHANNELS.ANALYTICS_DAILY_METRICS,
    async (_event, spaceId, days): Promise<Result<DailyMetric[]>> => {
      logger.debug('Handling ANALYTICS_DAILY_METRICS', { spaceId, days })
      const metrics = await analyticsService.getDailyMetrics(spaceId, days)
      return createSuccessResult(metrics)
    }
  )

  // GET Resource Stats for Space
  ipcMain.handle(
    IPC_CHANNELS.ANALYTICS_RESOURCE_STATS,
    async (_event, spaceId): Promise<Result<ResourceStat[]>> => {
      logger.debug('Handling ANALYTICS_RESOURCE_STATS', { spaceId })
      const stats = await analyticsService.getResourceStats(spaceId)
      return createSuccessResult(stats)
    }
  )

  // GET Execution Logs
  ipcMain.handle(
    IPC_CHANNELS.ANALYTICS_EXECUTION_LOGS,
    async (_event, filters): Promise<Result<ExecutionLog[]>> => {
      logger.debug('Handling ANALYTICS_EXECUTION_LOGS', { filters })
      const logs = await analyticsService.getExecutionLogs(filters)
      return createSuccessResult(logs)
    }
  )

  // DELETE Old Logs
  ipcMain.handle(
    IPC_CHANNELS.ANALYTICS_DELETE_OLD_LOGS,
    async (_event, daysToKeep): Promise<Result<number>> => {
      logger.debug('Handling ANALYTICS_DELETE_OLD_LOGS', { daysToKeep })
      const result = await analyticsService.deleteOldLogs(daysToKeep)
      if (result.success && result.data !== undefined) {
        return createSuccessResult(result.data)
      }
      return createErrorResult<number>(result.error || 'Failed to delete old logs', result.code)
    }
  )

  logger.info('Analytics IPC handlers registered successfully')
}

/**
 * Export analyticsService for use in other modules (like execution-handlers)
 */
export { analyticsService }
