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
// Note: PaginatedResponse and DateRange will be used in future sprints
// import { PaginatedResponse, DateRange } from './common.types'

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
  TASKS_LIST: 'tasks:list',
  TASKS_TOGGLE: 'tasks:toggle',

  // Analytics
  ANALYTICS_GET_METRICS: 'analytics:getMetrics',
  ANALYTICS_EXPORT: 'analytics:export',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_UPDATE: 'settings:update',

  // System
  SYSTEM_INFO: 'system:info',
  SYSTEM_PING: 'system:ping'
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
  METRICS_UPDATED: 'metrics:updated'
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

  // System
  [IPC_CHANNELS.SYSTEM_INFO]: {
    args: []
    return: Result<SystemInfo>
  }
  [IPC_CHANNELS.SYSTEM_PING]: {
    args: []
    return: Result<{ pong: boolean; timestamp: number }>
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
