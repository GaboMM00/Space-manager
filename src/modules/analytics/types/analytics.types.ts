/**
 * Analytics Types
 * Type definitions for analytics and metrics system
 * Phase 3 Sprint 3.2 - Analytics y Métricas
 */

/**
 * Execution Log
 * Records every execution of a space
 */
export interface ExecutionLog {
  id: number // SQLite auto-increment ID
  spaceId: string
  spaceName: string
  startedAt: number // Unix timestamp in milliseconds
  completedAt?: number // Unix timestamp in milliseconds
  durationMs?: number // Duration in milliseconds
  success: boolean
  errorMessage?: string
  resourcesTotal: number
  resourcesSuccess: number
  resourcesFailed: number
  createdAt: number // Unix timestamp in milliseconds
}

/**
 * Input for creating execution log
 */
export interface CreateExecutionLogInput {
  spaceId: string
  spaceName: string
  startedAt: number
  completedAt?: number
  durationMs?: number
  success: boolean
  errorMessage?: string
  resourcesTotal: number
  resourcesSuccess: number
  resourcesFailed: number
}

/**
 * Daily Metrics
 * Aggregated metrics per day (auto-updated by triggers)
 */
export interface DailyMetric {
  id: number
  spaceId: string
  date: number // Format: YYYYMMDD (e.g., 20251205)
  executionCount: number
  successCount: number
  failureCount: number
  avgDurationMs: number
  totalDurationMs: number
  minDurationMs?: number
  maxDurationMs?: number
  updatedAt: number
}

/**
 * Resource Statistics
 * Statistics per individual resource
 */
export interface ResourceStat {
  id: number
  spaceId: string
  resourceType: 'application' | 'url' | 'file' | 'script'
  resourcePath: string
  executionCount: number
  successCount: number
  failureCount: number
  lastExecutedAt?: number
  avgExecutionTimeMs?: number
  totalExecutionTimeMs: number
  createdAt: number
  updatedAt: number
}

/**
 * Error Log
 * Detailed error tracking
 */
export interface ErrorLog {
  id: number
  spaceId: string
  executionLogId?: number
  errorType: 'resource_error' | 'system_error' | 'validation_error' | 'timeout_error' | 'permission_error'
  errorCode?: string
  errorMessage: string
  stackTrace?: string
  resourceType?: 'application' | 'url' | 'file' | 'script'
  resourcePath?: string
  context?: string // JSON string with additional information
  occurredAt: number
}

/**
 * Input for creating error log
 */
export interface CreateErrorLogInput {
  spaceId: string
  executionLogId?: number
  errorType: 'resource_error' | 'system_error' | 'validation_error' | 'timeout_error' | 'permission_error'
  errorCode?: string
  errorMessage: string
  stackTrace?: string
  resourceType?: 'application' | 'url' | 'file' | 'script'
  resourcePath?: string
  context?: Record<string, unknown>
}

/**
 * System Metrics (Optional)
 * System metrics during executions
 */
export interface SystemMetric {
  id: number
  executionLogId: number
  cpuUsage?: number // 0-100
  memoryUsageMb?: number
  diskReadMb?: number
  diskWriteMb?: number
  networkSentKb?: number
  networkReceivedKb?: number
  recordedAt: number
}

/**
 * Space Usage Summary (View)
 */
export interface SpaceUsageSummary {
  spaceId: string
  spaceName: string
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  successRatePercent: number
  avgDurationMs: number
  lastExecutedAt: number
  firstExecutedAt: number
}

/**
 * Recent Trends (View)
 * Last 30 days trends
 */
export interface RecentTrend {
  date: number // YYYYMMDD
  totalExecutions: number
  totalSuccess: number
  totalFailures: number
  avgDuration: number
  activeSpaces: number
  successRatePercent: number
}

/**
 * Top Error (View)
 * Top errors in last 7 days
 */
export interface TopError {
  errorType: string
  errorMessage: string
  occurrenceCount: number
  lastOccurredAt: number
  firstOccurredAt: number
  affectedSpaces: number
}

/**
 * Resource Performance (View)
 */
export interface ResourcePerformance {
  resourceType: string
  totalResources: number
  totalExecutions: number
  totalSuccess: number
  totalFailures: number
  successRatePercent: number
  avgTimeMs: number
}

/**
 * Analytics Query Filters
 */
export interface AnalyticsFilters {
  spaceId?: string
  startDate?: number // Unix timestamp
  endDate?: number // Unix timestamp
  resourceType?: 'application' | 'url' | 'file' | 'script'
  success?: boolean
}

/**
 * Date Range Query
 */
export interface DateRange {
  start: number // Unix timestamp in milliseconds
  end: number // Unix timestamp in milliseconds
}

/**
 * Analytics Stats Summary
 */
export interface AnalyticsStats {
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  successRate: number
  avgDurationMs: number
  totalDurationMs: number
  mostUsedSpace: {
    spaceId: string
    spaceName: string
    count: number
  } | null
  mostFailedResource: {
    resourceType: string
    resourcePath: string
    failureCount: number
  } | null
}

/**
 * Export Report Options
 */
export interface ExportReportOptions {
  format: 'csv' | 'json' | 'pdf'
  dateRange: DateRange
  spaceIds?: string[]
  includeCharts?: boolean // For PDF
}
