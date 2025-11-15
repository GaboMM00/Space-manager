/**
 * Tipos relacionados con Analytics
 */

/**
 * Log de ejecución
 */
export interface ExecutionLog {
  id?: number;
  spaceId: string;
  spaceName: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  success: boolean;
  errorMessage?: string;
  resourcesTotal: number;
  resourcesSuccess: number;
  resourcesFailed: number;
}

/**
 * Métrica diaria
 */
export interface DailyMetric {
  id?: number;
  spaceId: string;
  date: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  avgDurationMs: number;
  totalDurationMs: number;
  minDurationMs?: number;
  maxDurationMs?: number;
}

/**
 * Estadística de recurso
 */
export interface ResourceStat {
  id?: number;
  spaceId: string;
  resourceType: 'application' | 'url' | 'file' | 'script';
  resourcePath: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  lastExecutedAt?: string;
  avgExecutionTimeMs?: number;
}

/**
 * Log de error
 */
export interface ErrorLog {
  id?: number;
  spaceId: string;
  executionLogId?: number;
  errorType: string;
  errorCode?: string;
  errorMessage: string;
  stackTrace?: string;
  resourceType?: string;
  resourcePath?: string;
  context?: Record<string, any>;
  occurredAt?: string;
}

/**
 * Resumen de uso de espacio
 */
export interface SpaceUsageSummary {
  spaceId: string;
  spaceName: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  avgDuration: number;
  lastExecutedAt?: string;
  firstExecutedAt?: string;
}

/**
 * Tendencia
 */
export interface Trend {
  date: string;
  totalExecutions: number;
  totalSuccess: number;
  totalFailures: number;
  avgDuration: number;
  activeSpaces: number;
}

/**
 * Error más frecuente
 */
export interface TopError {
  errorType: string;
  errorCode: string;
  errorMessage: string;
  occurrenceCount: number;
  lastOccurred: string;
  affectedSpaces: number;
}

/**
 * Resumen completo de analytics
 */
export interface AnalyticsSummary {
  spaceUsage: SpaceUsageSummary[];
  recentTrends: Trend[];
  mostUsedSpaces: SpaceUsageSummary[];
  topErrors: TopError[];
}

/**
 * Filtros para logs de ejecución
 */
export interface ExecutionLogFilters {
  spaceId?: string;
  success?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
