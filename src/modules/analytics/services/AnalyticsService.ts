/**
 * Analytics Service
 * Business logic for analytics and metrics
 * Phase 3 Sprint 3.2 - Analytics y Métricas
 */

import { logger } from '../../../shared/utils/logger'
import { Result } from '../../../shared/types/common.types'
import { SQLiteService } from '../../../main/services/SQLiteService'
import { SpaceRepository } from '../../workspace/repositories/SpaceRepository'
import { TaskRepository } from '../../tasks/repositories/TaskRepository'
import {
  ExecutionLog,
  CreateExecutionLogInput,
  CreateErrorLogInput,
  DailyMetric,
  ResourceStat,
  ErrorLog,
  SpaceUsageSummary,
  RecentTrend,
  TopError,
  ResourcePerformance,
  AnalyticsFilters,
  AnalyticsStats,
  DateRange
} from '../types/analytics.types'

/**
 * Analytics Service class
 */
export class AnalyticsService {
  private db: SQLiteService
  private spaceRepository: SpaceRepository
  private taskRepository: TaskRepository

  constructor(
    db: SQLiteService,
    spaceRepository: SpaceRepository,
    taskRepository: TaskRepository
  ) {
    this.db = db
    this.spaceRepository = spaceRepository
    this.taskRepository = taskRepository
    logger.info('AnalyticsService initialized')
  }

  /**
   * Record execution log
   */
  async recordExecution(data: CreateExecutionLogInput): Promise<Result<ExecutionLog>> {
    try {
      logger.info('Recording execution START', {
        spaceId: data.spaceId,
        spaceName: data.spaceName,
        startedAt: data.startedAt,
        resourcesTotal: data.resourcesTotal
      })

      const result = this.db.run(
        `
        INSERT INTO execution_logs (
          space_id, space_name, started_at, completed_at, duration_ms,
          success, error_message, resources_total, resources_success, resources_failed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          data.spaceId,
          data.spaceName,
          data.startedAt,
          data.completedAt || null,
          data.durationMs || null,
          data.success ? 1 : 0,
          data.errorMessage || null,
          data.resourcesTotal,
          data.resourcesSuccess,
          data.resourcesFailed
        ]
      )

      const row = this.db.get<any>(
        'SELECT * FROM execution_logs WHERE id = ?',
        [result.lastInsertRowid]
      )

      if (!row) {
        return {
          success: false,
          error: 'Failed to retrieve created execution log'
        }
      }

      // Convert snake_case to camelCase
      const executionLog: ExecutionLog = {
        id: row.id,
        spaceId: row.space_id,
        spaceName: row.space_name,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        durationMs: row.duration_ms,
        success: Boolean(row.success),
        errorMessage: row.error_message,
        resourcesTotal: row.resources_total,
        resourcesSuccess: row.resources_success,
        resourcesFailed: row.resources_failed,
        createdAt: row.created_at
      }

      logger.info('Execution recorded successfully', {
        id: executionLog.id,
        spaceId: executionLog.spaceId,
        spaceName: executionLog.spaceName
      })
      return { success: true, data: executionLog }
    } catch (error) {
      logger.error('Failed to record execution', error)
      return {
        success: false,
        error: 'Failed to record execution'
      }
    }
  }

  /**
   * Update execution log when completed
   */
  async completeExecution(
    id: number,
    completedAt: number,
    durationMs: number,
    success: boolean,
    errorMessage?: string
  ): Promise<Result<ExecutionLog>> {
    try {
      logger.debug('Completing execution', { id })

      this.db.run(
        `
        UPDATE execution_logs
        SET completed_at = ?, duration_ms = ?, success = ?, error_message = ?
        WHERE id = ?
      `,
        [completedAt, durationMs, success ? 1 : 0, errorMessage || null, id]
      )

      const row = this.db.get<any>(
        'SELECT * FROM execution_logs WHERE id = ?',
        [id]
      )

      if (!row) {
        return {
          success: false,
          error: `Execution log not found with id: ${id}`
        }
      }

      // Manually update daily_metrics (workaround for trigger not firing)
      const date = new Date(row.started_at)
      const dateInt = parseInt(
        `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
      )

      logger.debug('Updating daily_metrics manually', {
        spaceId: row.space_id,
        date: dateInt,
        success: row.success,
        durationMs: row.duration_ms
      })

      this.db.run(
        `
        INSERT INTO daily_metrics (
          space_id, date, execution_count, success_count, failure_count,
          total_duration_ms, avg_duration_ms, min_duration_ms, max_duration_ms, updated_at
        ) VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(space_id, date) DO UPDATE SET
          execution_count = execution_count + 1,
          success_count = success_count + ?,
          failure_count = failure_count + ?,
          total_duration_ms = total_duration_ms + ?,
          avg_duration_ms = CAST((total_duration_ms + ?) AS REAL) / (execution_count + 1),
          min_duration_ms = MIN(COALESCE(min_duration_ms, ?), ?),
          max_duration_ms = MAX(COALESCE(max_duration_ms, ?), ?),
          updated_at = ?
      `,
        [
          row.space_id,
          dateInt,
          row.success, // success_count for INSERT
          row.success === 0 ? 1 : 0, // failure_count for INSERT
          row.duration_ms || 0, // total_duration_ms for INSERT
          row.duration_ms || 0, // avg_duration_ms for INSERT
          row.duration_ms, // min_duration_ms for INSERT
          row.duration_ms, // max_duration_ms for INSERT
          completedAt, // updated_at for INSERT
          row.success, // success_count for UPDATE
          row.success === 0 ? 1 : 0, // failure_count for UPDATE
          row.duration_ms || 0, // total_duration_ms for UPDATE
          row.duration_ms || 0, // for avg calculation
          row.duration_ms, // for min comparison
          row.duration_ms, // for min value
          row.duration_ms, // for max comparison
          row.duration_ms, // for max value
          completedAt // updated_at for UPDATE
        ]
      )

      logger.info('Daily metrics updated manually', { spaceId: row.space_id, date: dateInt })

      // Convert snake_case to camelCase
      const executionLog: ExecutionLog = {
        id: row.id,
        spaceId: row.space_id,
        spaceName: row.space_name,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        durationMs: row.duration_ms,
        success: Boolean(row.success),
        errorMessage: row.error_message,
        resourcesTotal: row.resources_total,
        resourcesSuccess: row.resources_success,
        resourcesFailed: row.resources_failed,
        createdAt: row.created_at
      }

      logger.info('Execution completed successfully', { id })
      return { success: true, data: executionLog }
    } catch (error) {
      logger.error('Failed to complete execution', error, { id })
      return {
        success: false,
        error: 'Failed to complete execution'
      }
    }
  }

  /**
   * Record error log
   */
  async recordError(data: CreateErrorLogInput): Promise<Result<ErrorLog>> {
    try {
      logger.debug('Recording error', { spaceId: data.spaceId, errorType: data.errorType })

      const context = data.context ? JSON.stringify(data.context) : null

      const result = this.db.run(
        `
        INSERT INTO error_logs (
          space_id, execution_log_id, error_type, error_code, error_message,
          stack_trace, resource_type, resource_path, context
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          data.spaceId,
          data.executionLogId || null,
          data.errorType,
          data.errorCode || null,
          data.errorMessage,
          data.stackTrace || null,
          data.resourceType || null,
          data.resourcePath || null,
          context
        ]
      )

      const errorLog = this.db.get<ErrorLog>('SELECT * FROM error_logs WHERE id = ?', [
        result.lastInsertRowid
      ])

      if (!errorLog) {
        return {
          success: false,
          error: 'Failed to retrieve created error log'
        }
      }

      logger.info('Error recorded successfully', { id: errorLog.id })
      return { success: true, data: errorLog }
    } catch (error) {
      logger.error('Failed to record error', error)
      return {
        success: false,
        error: 'Failed to record error'
      }
    }
  }

  /**
   * Update resource statistics
   */
  async updateResourceStat(
    spaceId: string,
    resourceType: 'application' | 'url' | 'file' | 'script',
    resourcePath: string,
    success: boolean,
    executionTimeMs?: number
  ): Promise<Result<void>> {
    try {
      logger.debug('Updating resource stat', { spaceId, resourceType, resourcePath })

      const now = Date.now()

      // Check if stat exists
      const existing = this.db.get<ResourceStat>(
        `
        SELECT * FROM resource_stats
        WHERE space_id = ? AND resource_type = ? AND resource_path = ?
      `,
        [spaceId, resourceType, resourcePath]
      )

      if (existing) {
        // Update existing
        const newExecutionCount = existing.executionCount + 1
        const newSuccessCount = existing.successCount + (success ? 1 : 0)
        const newFailureCount = existing.failureCount + (success ? 0 : 1)
        const newTotalTime = existing.totalExecutionTimeMs + (executionTimeMs || 0)
        const newAvgTime = Math.round(newTotalTime / newExecutionCount)

        this.db.run(
          `
          UPDATE resource_stats
          SET execution_count = ?, success_count = ?, failure_count = ?,
              last_executed_at = ?, avg_execution_time_ms = ?, total_execution_time_ms = ?,
              updated_at = ?
          WHERE id = ?
        `,
          [
            newExecutionCount,
            newSuccessCount,
            newFailureCount,
            now,
            newAvgTime,
            newTotalTime,
            now,
            existing.id
          ]
        )
      } else {
        // Create new
        this.db.run(
          `
          INSERT INTO resource_stats (
            space_id, resource_type, resource_path, execution_count,
            success_count, failure_count, last_executed_at,
            avg_execution_time_ms, total_execution_time_ms
          ) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?)
        `,
          [
            spaceId,
            resourceType,
            resourcePath,
            success ? 1 : 0,
            success ? 0 : 1,
            now,
            executionTimeMs || 0,
            executionTimeMs || 0
          ]
        )
      }

      logger.info('Resource stat updated successfully')
      return { success: true }
    } catch (error) {
      logger.error('Failed to update resource stat', error)
      return {
        success: false,
        error: 'Failed to update resource stat'
      }
    }
  }

  /**
   * Get execution logs with filters
   */
  async getExecutionLogs(filters?: AnalyticsFilters): Promise<ExecutionLog[]> {
    try {
      logger.info('Getting execution logs', { filters })
      let query = 'SELECT * FROM execution_logs WHERE 1=1'
      const params: unknown[] = []

      if (filters?.spaceId) {
        query += ' AND space_id = ?'
        params.push(filters.spaceId)
      }

      if (filters?.startDate) {
        query += ' AND started_at >= ?'
        params.push(filters.startDate)
      }

      if (filters?.endDate) {
        query += ' AND started_at <= ?'
        params.push(filters.endDate)
      }

      if (filters?.success !== undefined) {
        query += ' AND success = ?'
        params.push(filters.success ? 1 : 0)
      }

      query += ' ORDER BY started_at DESC'

      // Add limit if provided
      if (filters && 'limit' in filters && typeof (filters as any).limit === 'number') {
        query += ' LIMIT ?'
        params.push((filters as any).limit)
      }

      const rows = this.db.all<any>(query, params)
      logger.info('Execution logs retrieved from DB', { count: rows.length, query, params })

      // Convert snake_case to camelCase
      const logs: ExecutionLog[] = rows.map((row) => ({
        id: row.id,
        spaceId: row.space_id,
        spaceName: row.space_name,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        durationMs: row.duration_ms,
        success: Boolean(row.success),
        errorMessage: row.error_message,
        resourcesTotal: row.resources_total,
        resourcesSuccess: row.resources_success,
        resourcesFailed: row.resources_failed,
        createdAt: row.created_at
      }))

      logger.info('Execution logs converted to camelCase', {
        count: logs.length,
        firstLog: logs[0] ? {
          id: logs[0].id,
          spaceName: logs[0].spaceName,
          spaceId: logs[0].spaceId
        } : null
      })

      return logs
    } catch (error) {
      logger.error('Failed to get execution logs', error)
      return []
    }
  }

  /**
   * Get space usage summary
   */
  async getSpaceUsageSummary(): Promise<SpaceUsageSummary[]> {
    try {
      const summaries = this.db.all<SpaceUsageSummary>('SELECT * FROM v_space_usage_summary')
      return summaries
    } catch (error) {
      logger.error('Failed to get space usage summary', error)
      return []
    }
  }

  /**
   * Get recent trends
   */
  async getRecentTrends(days: number = 30): Promise<RecentTrend[]> {
    try {
      logger.info('Getting recent trends', { days })

      // Calculate date range in YYYYMMDD format
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const endDateInt = parseInt(
        `${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, '0')}${String(endDate.getDate()).padStart(2, '0')}`
      )
      const startDateInt = parseInt(
        `${startDate.getFullYear()}${String(startDate.getMonth() + 1).padStart(2, '0')}${String(startDate.getDate()).padStart(2, '0')}`
      )

      // Query daily_metrics directly with date range
      const rows = this.db.all<any>(
        `
        SELECT
          date,
          SUM(execution_count) as total_executions,
          SUM(success_count) as total_success,
          SUM(failure_count) as total_failures,
          ROUND(AVG(avg_duration_ms), 2) as avg_duration,
          COUNT(DISTINCT space_id) as active_spaces,
          ROUND(CAST(SUM(success_count) AS REAL) / SUM(execution_count) * 100, 2) as success_rate_percent
        FROM daily_metrics
        WHERE date >= ? AND date <= ?
        GROUP BY date
        ORDER BY date ASC
      `,
        [startDateInt, endDateInt]
      )

      logger.info('Recent trends retrieved', {
        count: rows.length,
        startDateInt,
        endDateInt,
        firstRow: rows[0],
        lastRow: rows[rows.length - 1]
      })

      // Convert snake_case to camelCase
      const trends: RecentTrend[] = rows.map((row) => ({
        date: row.date,
        totalExecutions: row.total_executions || 0,
        totalSuccess: row.total_success || 0,
        totalFailures: row.total_failures || 0,
        avgDuration: row.avg_duration || 0,
        activeSpaces: row.active_spaces || 0,
        successRatePercent: row.success_rate_percent || 0
      }))

      logger.info('Trends converted to camelCase', {
        count: trends.length,
        firstTrend: trends[0],
        lastTrend: trends[trends.length - 1]
      })

      return trends
    } catch (error) {
      logger.error('Failed to get recent trends', error)
      return []
    }
  }

  /**
   * Get top errors (last 7 days)
   */
  async getTopErrors(): Promise<TopError[]> {
    try {
      const errors = this.db.all<TopError>('SELECT * FROM v_top_errors')
      return errors
    } catch (error) {
      logger.error('Failed to get top errors', error)
      return []
    }
  }

  /**
   * Get resource performance
   */
  async getResourcePerformance(): Promise<ResourcePerformance[]> {
    try {
      const performance = this.db.all<ResourcePerformance>('SELECT * FROM v_resource_performance')
      return performance
    } catch (error) {
      logger.error('Failed to get resource performance', error)
      return []
    }
  }

  /**
   * Get daily metrics for a space
   */
  async getDailyMetrics(spaceId: string, days: number = 30): Promise<DailyMetric[]> {
    try {
      const startDate = this.getDateNDaysAgo(days)

      const metrics = this.db.all<DailyMetric>(
        `
        SELECT * FROM daily_metrics
        WHERE space_id = ? AND date >= ?
        ORDER BY date DESC
      `,
        [spaceId, startDate]
      )

      return metrics
    } catch (error) {
      logger.error('Failed to get daily metrics', error, { spaceId })
      return []
    }
  }

  /**
   * Get resource stats for a space
   */
  async getResourceStats(spaceId: string): Promise<ResourceStat[]> {
    try {
      const stats = this.db.all<ResourceStat>(
        `
        SELECT * FROM resource_stats
        WHERE space_id = ?
        ORDER BY execution_count DESC
      `,
        [spaceId]
      )

      return stats
    } catch (error) {
      logger.error('Failed to get resource stats', error, { spaceId })
      return []
    }
  }

  /**
   * Get analytics stats summary
   */
  async getAnalyticsStats(dateRange?: DateRange): Promise<Result<AnalyticsStats>> {
    try {
      // Get total spaces and tasks from repositories
      const spaces = await this.spaceRepository.findAll()
      const tasks = await this.taskRepository.findAll()
      const totalSpaces = spaces.length
      const totalTasks = tasks.length

      // Get execution logs
      let query = 'SELECT * FROM execution_logs WHERE 1=1'
      const params: unknown[] = []

      if (dateRange) {
        query += ' AND started_at >= ? AND started_at <= ?'
        params.push(dateRange.start, dateRange.end)
      }

      const rows = this.db.all<any>(query, params)

      // Convert snake_case to camelCase
      const logs: ExecutionLog[] = rows.map((row) => ({
        id: row.id,
        spaceId: row.space_id,
        spaceName: row.space_name,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        durationMs: row.duration_ms,
        success: Boolean(row.success),
        errorMessage: row.error_message,
        resourcesTotal: row.resources_total,
        resourcesSuccess: row.resources_success,
        resourcesFailed: row.resources_failed,
        createdAt: row.created_at
      }))

      const totalExecutions = logs.length
      const successfulExecutions = logs.filter((l) => l.success).length
      const failedExecutions = totalExecutions - successfulExecutions
      const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0

      const durations = logs.filter((l) => l.durationMs).map((l) => l.durationMs!)
      const totalDurationMs = durations.reduce((sum, d) => sum + d, 0)
      const avgDurationMs = durations.length > 0 ? totalDurationMs / durations.length : 0

      // Calculate execution trend (compare current period vs previous period)
      let executionTrend: { value: number; direction: 'up' | 'down' } | undefined
      if (dateRange) {
        const periodDuration = dateRange.end - dateRange.start
        const previousStart = dateRange.start - periodDuration
        const previousEnd = dateRange.start

        const previousRows = this.db.all<any>(
          'SELECT * FROM execution_logs WHERE started_at >= ? AND started_at < ?',
          [previousStart, previousEnd]
        )

        const previousCount = previousRows.length
        if (previousCount > 0) {
          const trendValue = Math.round(
            ((totalExecutions - previousCount) / previousCount) * 100
          )
          executionTrend = {
            value: Math.abs(trendValue),
            direction: trendValue >= 0 ? 'up' : 'down'
          }
        }
      }

      // Most used space
      const spaceCounts = new Map<string, { name: string; count: number }>()
      logs.forEach((log) => {
        const existing = spaceCounts.get(log.spaceId)
        if (existing) {
          existing.count++
        } else {
          spaceCounts.set(log.spaceId, { name: log.spaceName, count: 1 })
        }
      })

      let mostUsedSpace: { spaceId: string; spaceName: string; count: number } | null = null
      let maxCount = 0
      spaceCounts.forEach((value, spaceId) => {
        if (value.count > maxCount) {
          maxCount = value.count
          mostUsedSpace = {
            spaceId,
            spaceName: value.name,
            count: value.count
          }
        }
      })

      // Most failed resource
      const resourceStats = this.db.all<ResourceStat>(
        'SELECT * FROM resource_stats ORDER BY failure_count DESC LIMIT 1'
      )

      const mostFailedResource =
        resourceStats.length > 0
          ? {
              resourceType: resourceStats[0].resourceType,
              resourcePath: resourceStats[0].resourcePath,
              failureCount: resourceStats[0].failureCount
            }
          : null

      const stats: AnalyticsStats = {
        totalSpaces,
        totalTasks,
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        successRate: Math.round(successRate * 100) / 100,
        avgDurationMs: Math.round(avgDurationMs),
        totalDurationMs,
        executionTrend,
        mostUsedSpace,
        mostFailedResource
      }

      return { success: true, data: stats }
    } catch (error) {
      logger.error('Failed to get analytics stats', error)
      return {
        success: false,
        error: 'Failed to get analytics stats'
      }
    }
  }

  /**
   * Delete old execution logs (cleanup)
   */
  async deleteOldLogs(daysToKeep: number = 90): Promise<Result<number>> {
    try {
      const cutoffDate = Date.now() - daysToKeep * 24 * 60 * 60 * 1000

      const result = this.db.run('DELETE FROM execution_logs WHERE started_at < ?', [cutoffDate])

      logger.info('Old logs deleted', { deletedCount: result.changes })
      return { success: true, data: result.changes }
    } catch (error) {
      logger.error('Failed to delete old logs', error)
      return {
        success: false,
        error: 'Failed to delete old logs'
      }
    }
  }

  /**
   * Helper: Get date N days ago in YYYYMMDD format
   */
  private getDateNDaysAgo(days: number): number {
    const date = new Date()
    date.setDate(date.getDate() - days)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return parseInt(`${year}${month}${day}`)
  }
}

/**
 * Factory function to create AnalyticsService instance
 */
export function createAnalyticsService(
  db: SQLiteService,
  spaceRepository: SpaceRepository,
  taskRepository: TaskRepository
): AnalyticsService {
  return new AnalyticsService(db, spaceRepository, taskRepository)
}
