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
   * Get execution logs with filters (returns array directly, not wrapped in Result)
   */
  getExecutionLogs(filters?: AnalyticsFilters): Promise<ExecutionLog[]>

  /**
   * Get space usage summary (returns array directly, not wrapped in Result)
   */
  getSpaceUsageSummary(): Promise<SpaceUsageSummary[]>

  /**
   * Get recent trends (returns array directly, not wrapped in Result)
   */
  getRecentTrends(days?: number): Promise<RecentTrend[]>

  /**
   * Get top errors (returns array directly, not wrapped in Result)
   */
  getTopErrors(days?: number): Promise<TopError[]>

  /**
   * Get resource performance (returns array directly, not wrapped in Result)
   */
  getResourcePerformance(): Promise<ResourcePerformance[]>

  /**
   * Get daily metrics for a space (returns array directly, not wrapped in Result)
   */
  getDailyMetrics(spaceId: string, days?: number): Promise<DailyMetric[]>

  /**
   * Get resource stats for a space (returns array directly, not wrapped in Result)
   */
  getResourceStats(spaceId: string): Promise<ResourceStat[]>

  /**
   * Get analytics stats summary
   */
  getAnalyticsStats(dateRange?: { start: number; end: number }): Promise<Result<AnalyticsStats>>

  /**
   * Delete old logs
   */
  deleteOldLogs(daysToKeep?: number): Promise<Result<number>>
}
