/**
 * IAnalyticsService Interface
 * Analytics service interface for dependency injection
 * Phase 5.5 Sprint 5.5.1 - Dependency Injection Infrastructure
 */

import type { Result } from '../../../shared/types/common.types'
import type {
  ExecutionLog,
  CreateExecutionLogInput,
  CreateErrorLogInput,
  SpaceUsageSummary,
  RecentTrend,
  TopError,
  ResourcePerformance,
  DailyMetric,
  ResourceStat,
  AnalyticsStats,
  AnalyticsFilters
} from '../types/analytics.types'

export interface IAnalyticsService {
  /**
   * Record execution log
   */
  recordExecution(data: CreateExecutionLogInput): Promise<Result<ExecutionLog>>

  /**
   * Complete execution log
   */
  completeExecution(
    id: number,
    completedAt: number,
    durationMs: number,
    success: boolean,
    errorMessage?: string
  ): Promise<Result<ExecutionLog>>

  /**
   * Record error log
   */
  recordError(data: CreateErrorLogInput): Promise<Result<void>>

  /**
   * Update resource stat
   */
  updateResourceStat(
    spaceId: string,
    resourceType: string,
    resourcePath: string,
    success: boolean,
    executionTimeMs: number
  ): Promise<Result<void>>

  /**
   * Get execution logs with filters
   */
  getExecutionLogs(filters?: AnalyticsFilters): Promise<Result<ExecutionLog[]>>

  /**
   * Get space usage summary
   */
  getSpaceUsageSummary(): Promise<Result<SpaceUsageSummary[]>>

  /**
   * Get recent trends
   */
  getRecentTrends(days?: number): Promise<Result<RecentTrend[]>>

  /**
   * Get top errors
   */
  getTopErrors(days?: number): Promise<Result<TopError[]>>

  /**
   * Get resource performance
   */
  getResourcePerformance(): Promise<Result<ResourcePerformance[]>>

  /**
   * Get daily metrics for a space
   */
  getDailyMetrics(spaceId: string, days?: number): Promise<Result<DailyMetric[]>>

  /**
   * Get resource stats for a space
   */
  getResourceStats(spaceId: string): Promise<Result<ResourceStat[]>>

  /**
   * Get analytics stats summary
   */
  getAnalyticsStats(dateRange?: { start: number; end: number }): Promise<Result<AnalyticsStats>>

  /**
   * Delete old logs
   */
  deleteOldLogs(daysToKeep?: number): Promise<Result<number>>
}
