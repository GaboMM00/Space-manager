/**
 * IPC Channel types and message definitions
 * Typed communication between Main and Renderer processes
 */

import { Result } from './common.types'
import {
  Space,
  CreateSpaceDto,
  UpdateSpaceDto,
  SpaceSearchFilters,
  SpaceSortOptions,
  SpaceStats,
  SpaceExport,
  CreateResourceDto
} from '../../modules/workspace/types/workspace.types'
import {
  ExecutionResult as ModuleExecutionResult,
  ExecutionProgress as ModuleExecutionProgress
} from '../../modules/execution/types/execution.types'
import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  TaskStats
} from '../../modules/tasks/types/task.types'
import {
  SpaceUsageSummary,
  RecentTrend,
  TopError,
  ResourcePerformance,
  AnalyticsStats,
  DailyMetric,
  ResourceStat,
  ExecutionLog,
  AnalyticsFilters,
  DateRange
} from '../../modules/analytics/types/analytics.types'
// Note: PaginatedResponse will be used in future sprints
// import { PaginatedResponse } from './common.types'

/**
 * IPC Channel names
 */
export const IPC_CHANNELS = {
  // Spaces
  SPACES_CREATE: 'spaces:create',
  SPACES_UPDATE: 'spaces:update',
  SPACES_DELETE: 'spaces:delete',
  SPACES_GET: 'spaces:get',
  SPACES_LIST: 'spaces:list',
  SPACES_DUPLICATE: 'spaces:duplicate',
  SPACES_SEARCH: 'spaces:search',
  SPACES_STATS: 'spaces:stats',
  SPACES_EXPORT: 'spaces:export',
  SPACES_IMPORT: 'spaces:import',
  SPACES_ADD_RESOURCE: 'spaces:addResource',
  SPACES_GET_TAGS: 'spaces:getTags',
  SPACES_EXECUTE: 'spaces:execute',

  // Tasks
  TASKS_CREATE: 'tasks:create',
  TASKS_UPDATE: 'tasks:update',
  TASKS_DELETE: 'tasks:delete',
  TASKS_GET: 'tasks:get',
  TASKS_LIST: 'tasks:list',
  TASKS_TOGGLE: 'tasks:toggle',
  TASKS_STATS: 'tasks:stats',
  TASKS_REORDER: 'tasks:reorder',

  // Analytics
  ANALYTICS_SPACE_USAGE: 'analytics:spaceUsage',
  ANALYTICS_RECENT_TRENDS: 'analytics:recentTrends',
  ANALYTICS_TOP_ERRORS: 'analytics:topErrors',
  ANALYTICS_RESOURCE_PERFORMANCE: 'analytics:resourcePerformance',
  ANALYTICS_STATS: 'analytics:stats',
  ANALYTICS_DAILY_METRICS: 'analytics:dailyMetrics',
  ANALYTICS_RESOURCE_STATS: 'analytics:resourceStats',
  ANALYTICS_EXECUTION_LOGS: 'analytics:executionLogs',
  ANALYTICS_DELETE_OLD_LOGS: 'analytics:deleteOldLogs',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_UPDATE: 'settings:update',

  // System
  SYSTEM_INFO: 'system:info',
  SYSTEM_PING: 'system:ping',

  // Auto-Updater
  UPDATER_CHECK_FOR_UPDATES: 'updater:checkForUpdates',
  UPDATER_DOWNLOAD_UPDATE: 'updater:downloadUpdate',
  UPDATER_QUIT_AND_INSTALL: 'updater:quitAndInstall'
} as const

/**
 * IPC Event names (Main → Renderer)
 */
export const IPC_EVENTS = {
  EXECUTION_PROGRESS: 'execution:progress',
  EXECUTION_COMPLETE: 'execution:complete',
  EXECUTION_ERROR: 'execution:error',
  SPACE_UPDATED: 'space:updated',
  TASK_UPDATED: 'task:updated',
  METRICS_UPDATED: 'metrics:updated',
  // Auto-Updater events
  UPDATE_AVAILABLE: 'update-available',
  UPDATE_NOT_AVAILABLE: 'update-not-available',
  UPDATE_DOWNLOAD_PROGRESS: 'update-download-progress',
  UPDATE_DOWNLOADED: 'update-downloaded',
  UPDATE_ERROR: 'update-error',
  UPDATE_STATUS: 'update-status'
} as const

/**
 * Type-safe IPC invoke signature
 */
export interface IPCInvokeMap {
  // Spaces
  [IPC_CHANNELS.SPACES_CREATE]: {
    args: [CreateSpaceDto]
    return: Result<Space>
  }
  [IPC_CHANNELS.SPACES_UPDATE]: {
    args: [string, UpdateSpaceDto]
    return: Result<Space>
  }
  [IPC_CHANNELS.SPACES_DELETE]: {
    args: [string]
    return: Result<void>
  }
  [IPC_CHANNELS.SPACES_GET]: {
    args: [string]
    return: Result<Space>
  }
  [IPC_CHANNELS.SPACES_LIST]: {
    args: [SpaceSortOptions?]
    return: Result<Space[]>
  }
  [IPC_CHANNELS.SPACES_DUPLICATE]: {
    args: [string, string?]
    return: Result<Space>
  }
  [IPC_CHANNELS.SPACES_SEARCH]: {
    args: [SpaceSearchFilters]
    return: Result<Space[]>
  }
  [IPC_CHANNELS.SPACES_STATS]: {
    args: []
    return: Result<SpaceStats>
  }
  [IPC_CHANNELS.SPACES_EXPORT]: {
    args: [string]
    return: Result<SpaceExport>
  }
  [IPC_CHANNELS.SPACES_IMPORT]: {
    args: [SpaceExport]
    return: Result<Space>
  }
  [IPC_CHANNELS.SPACES_ADD_RESOURCE]: {
    args: [string, CreateResourceDto]
    return: Result<Space>
  }
  [IPC_CHANNELS.SPACES_GET_TAGS]: {
    args: []
    return: Result<string[]>
  }
  [IPC_CHANNELS.SPACES_EXECUTE]: {
    args: [string]
    return: Result<ModuleExecutionResult>
  }

  // Tasks
  [IPC_CHANNELS.TASKS_CREATE]: {
    args: [CreateTaskInput]
    return: Result<Task>
  }
  [IPC_CHANNELS.TASKS_UPDATE]: {
    args: [string, UpdateTaskInput]
    return: Result<Task>
  }
  [IPC_CHANNELS.TASKS_DELETE]: {
    args: [string]
    return: Result<void>
  }
  [IPC_CHANNELS.TASKS_GET]: {
    args: [string]
    return: Result<Task>
  }
  [IPC_CHANNELS.TASKS_LIST]: {
    args: [TaskFilters?]
    return: Result<Task[]>
  }
  [IPC_CHANNELS.TASKS_TOGGLE]: {
    args: [string]
    return: Result<Task>
  }
  [IPC_CHANNELS.TASKS_STATS]: {
    args: [string]
    return: Result<TaskStats>
  }
  [IPC_CHANNELS.TASKS_REORDER]: {
    args: [string[]]
    return: Result<void>
  }

  // Analytics
  [IPC_CHANNELS.ANALYTICS_SPACE_USAGE]: {
    args: []
    return: Result<SpaceUsageSummary[]>
  }
  [IPC_CHANNELS.ANALYTICS_RECENT_TRENDS]: {
    args: []
    return: Result<RecentTrend[]>
  }
  [IPC_CHANNELS.ANALYTICS_TOP_ERRORS]: {
    args: []
    return: Result<TopError[]>
  }
  [IPC_CHANNELS.ANALYTICS_RESOURCE_PERFORMANCE]: {
    args: []
    return: Result<ResourcePerformance[]>
  }
  [IPC_CHANNELS.ANALYTICS_STATS]: {
    args: [DateRange?]
    return: Result<AnalyticsStats>
  }
  [IPC_CHANNELS.ANALYTICS_DAILY_METRICS]: {
    args: [string, number?]
    return: Result<DailyMetric[]>
  }
  [IPC_CHANNELS.ANALYTICS_RESOURCE_STATS]: {
    args: [string]
    return: Result<ResourceStat[]>
  }
  [IPC_CHANNELS.ANALYTICS_EXECUTION_LOGS]: {
    args: [AnalyticsFilters?]
    return: Result<ExecutionLog[]>
  }
  [IPC_CHANNELS.ANALYTICS_DELETE_OLD_LOGS]: {
    args: [number?]
    return: Result<number>
  }

  // System
  [IPC_CHANNELS.SYSTEM_INFO]: {
    args: []
    return: Result<SystemInfo>
  }
  [IPC_CHANNELS.SYSTEM_PING]: {
    args: []
    return: Result<{ pong: boolean; timestamp: number }>
  }

  // Auto-Updater
  [IPC_CHANNELS.UPDATER_CHECK_FOR_UPDATES]: {
    args: []
    return: Result<void>
  }
  [IPC_CHANNELS.UPDATER_DOWNLOAD_UPDATE]: {
    args: []
    return: Result<void>
  }
  [IPC_CHANNELS.UPDATER_QUIT_AND_INSTALL]: {
    args: []
    return: Result<void>
  }
}

/**
 * Type-safe IPC event listener signature
 */
export interface IPCEventMap {
  [IPC_EVENTS.EXECUTION_PROGRESS]: ModuleExecutionProgress
  [IPC_EVENTS.EXECUTION_COMPLETE]: ExecutionComplete
  [IPC_EVENTS.EXECUTION_ERROR]: ExecutionError
  [IPC_EVENTS.SPACE_UPDATED]: SpaceUpdated
  [IPC_EVENTS.TASK_UPDATED]: TaskUpdated
  [IPC_EVENTS.METRICS_UPDATED]: MetricsUpdated
}

// ============================================================================
// IPC Event Payload Types
// ============================================================================

export interface ExecutionComplete {
  spaceId: string
  result: ModuleExecutionResult
}

export interface ExecutionError {
  spaceId: string
  resourceId: string
  resourceName: string
  error: string
  timestamp: string
}

export interface SpaceUpdated {
  space: Space
  action: 'created' | 'updated' | 'deleted'
}

export interface TaskUpdated {
  taskId: string
  action: 'created' | 'updated' | 'deleted' | 'toggled'
}

export interface MetricsUpdated {
  spaceId?: string
  timestamp: string
}

/**
 * System info
 */
export interface SystemInfo {
  platform: NodeJS.Platform
  arch: string
  version: string
  electronVersion: string
  chromeVersion: string
  nodeVersion: string
}
