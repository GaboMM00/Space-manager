/**
 * IPC Channel types and message definitions
 * Typed communication between Main and Renderer processes
 */

import { Result } from './common.types'
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
    return: Result<Space | null>
  }
  [IPC_CHANNELS.SPACES_LIST]: {
    args: [SpaceFilters?]
    return: Result<Space[]>
  }
  [IPC_CHANNELS.SPACES_EXECUTE]: {
    args: [string]
    return: Result<ExecutionResult>
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
  [IPC_EVENTS.EXECUTION_PROGRESS]: ExecutionProgress
  [IPC_EVENTS.EXECUTION_COMPLETE]: ExecutionComplete
  [IPC_EVENTS.EXECUTION_ERROR]: ExecutionError
  [IPC_EVENTS.SPACE_UPDATED]: SpaceUpdated
  [IPC_EVENTS.TASK_UPDATED]: TaskUpdated
  [IPC_EVENTS.METRICS_UPDATED]: MetricsUpdated
}

// ============================================================================
// Data Transfer Objects (DTOs)
// ============================================================================

/**
 * Space-related types
 */
export interface Space {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  resources: Resource[]
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSpaceDto {
  name: string
  description?: string
  icon?: string
  color?: string
}

export interface UpdateSpaceDto {
  name?: string
  description?: string
  icon?: string
  color?: string
  enabled?: boolean
}

export interface SpaceFilters {
  enabled?: boolean
  search?: string
}

/**
 * Resource types
 */
export type ResourceType = 'application' | 'url' | 'script' | 'file'

export interface Resource {
  id: string
  spaceId: string
  type: ResourceType
  name: string
  path: string
  arguments?: string[]
  enabled: boolean
  order: number
}

/**
 * Execution types
 */
export interface ExecutionResult {
  spaceId: string
  success: boolean
  startedAt: string
  completedAt: string
  duration: number
  resourcesTotal: number
  resourcesSuccess: number
  resourcesFailed: number
  errors: ExecutionError[]
}

export interface ExecutionProgress {
  spaceId: string
  resourceId: string
  resourceName: string
  progress: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  message?: string
}

export interface ExecutionComplete {
  spaceId: string
  result: ExecutionResult
}

export interface ExecutionError {
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
