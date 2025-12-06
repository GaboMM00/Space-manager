/**
 * Analytics Service
 * Business logic for analytics and metrics
 * Phase 3 Sprint 3.2 - Analytics y Métricas
 */

import { logger } from '../../../shared/utils/logger'
import { Result } from '../../../shared/types/common.types'
import { SQLiteService } from '../../../main/services/SQLiteService'
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

  constructor(db: SQLiteService) {
    this.db = db
    logger.info('AnalyticsService initialized')
  }

  /**
   * Record execution log
   */
  async recordExecution(data: CreateExecutionLogInput): Promise<Result<ExecutionLog>> {
    try {
      logger.debug('Recording execution', { spaceId: data.spaceId })

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

      const executionLog = this.db.get<ExecutionLog>(
        'SELECT * FROM execution_logs WHERE id = ?',
        [result.lastInsertRowid]
      )

      if (!executionLog) {
        return {
          success: false,
          error: 'Failed to retrieve created execution log'
        }
      }

      logger.info('Execution recorded successfully', { id: executionLog.id })
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

      const executionLog = this.db.get<ExecutionLog>(
        'SELECT * FROM execution_logs WHERE id = ?',
        [id]
      )

      if (!executionLog) {
        return {
          success: false,
          error: `Execution log not found with id: ${id}`
        }
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

      const logs = this.db.all<ExecutionLog>(query, params)
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
   * Get recent trends (last 30 days)
   */
  async getRecentTrends(): Promise<RecentTrend[]> {
    try {
      const trends = this.db.all<RecentTrend>('SELECT * FROM v_recent_trends')
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
      let query = 'SELECT * FROM execution_logs WHERE 1=1'
      const params: unknown[] = []

      if (dateRange) {
        query += ' AND started_at >= ? AND started_at <= ?'
        params.push(dateRange.start, dateRange.end)
      }

      const logs = this.db.all<ExecutionLog>(query, params)

      const totalExecutions = logs.length
      const successfulExecutions = logs.filter((l) => l.success).length
      const failedExecutions = totalExecutions - successfulExecutions
      const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0

      const durations = logs.filter((l) => l.durationMs).map((l) => l.durationMs!)
      const totalDurationMs = durations.reduce((sum, d) => sum + d, 0)
      const avgDurationMs = durations.length > 0 ? totalDurationMs / durations.length : 0

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
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        successRate: Math.round(successRate * 100) / 100,
        avgDurationMs: Math.round(avgDurationMs),
        totalDurationMs,
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
export function createAnalyticsService(db: SQLiteService): AnalyticsService {
  return new AnalyticsService(db)
}
