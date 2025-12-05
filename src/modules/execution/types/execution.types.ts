/**
 * Execution Module Type Definitions
 * Phase 1 Sprint 1.4 - Execution Engine
 */

import type { Resource } from '../../workspace/types/workspace.types'

/**
 * Execution context for a space
 */
export interface ExecutionContext {
  spaceId: string
  startTime: number
  resources: Resource[]
  stopOnError?: boolean
  onProgress?: (progress: ExecutionProgress) => void
  onResourceComplete?: (result: ResourceExecutionResult) => void
}

/**
 * Execution configuration
 */
export interface ExecutionConfig {
  stopOnError: boolean
  maxConcurrent: number
  defaultTimeout: number
  retryAttempts: number
  retryDelay: number
}

/**
 * Execution progress data
 */
export interface ExecutionProgress {
  spaceId: string
  current: number
  total: number
  resourceName: string
  percentage: number
}

/**
 * Result of executing a single resource
 */
export interface ResourceExecutionResult {
  resourceId: string
  resourceName: string
  resourceType: string
  success: boolean
  startTime: string
  endTime: string
  duration: number
  error?: string
  retryCount?: number
}

/**
 * Result of executing an entire space
 */
export interface ExecutionResult {
  spaceId: string
  success: boolean
  results: ResourceExecutionResult[]
  startTime: string
  endTime: string
  duration: number
  totalResources: number
  successfulResources: number
  failedResources: number
  errors: string[]
}

/**
 * Validation result for a resource
 */
export interface ValidationResult {
  valid: boolean
  error?: string
  warnings?: string[]
}

/**
 * Execution status
 */
export type ExecutionStatus = 'idle' | 'running' | 'completed' | 'failed' | 'cancelled'

/**
 * Queue item for execution
 */
export interface ExecutionQueueItem {
  id: string
  spaceId: string
  spaceName: string
  status: ExecutionStatus
  priority: number
  createdAt: number
  startedAt?: number
  completedAt?: number
  result?: ExecutionResult
}

/**
 * Executor interface - all executors must implement this
 */
export interface IExecutor {
  /**
   * Execute a resource
   */
  execute(resource: Resource): Promise<void>

  /**
   * Validate a resource before execution
   */
  validate(resource: Resource): Promise<ValidationResult>

  /**
   * Check if this executor can execute the resource on current platform
   */
  canExecute(resource: Resource): boolean

  /**
   * Get executor type
   */
  getType(): string
}

/**
 * Execution strategy type
 */
export type ExecutionStrategy = 'sequential' | 'parallel'

/**
 * Execution events
 */
export interface ExecutionEvents {
  'execution:started': ExecutionStartedEvent
  'execution:progress': ExecutionProgressEvent
  'execution:resource-started': ResourceStartedEvent
  'execution:resource-completed': ResourceCompletedEvent
  'execution:completed': ExecutionCompletedEvent
  'execution:failed': ExecutionFailedEvent
  'execution:cancelled': ExecutionCancelledEvent
}

export interface ExecutionStartedEvent {
  spaceId: string
  spaceName: string
  totalResources: number
  timestamp: number
}

export interface ExecutionProgressEvent {
  spaceId: string
  current: number
  total: number
  resourceName: string
  percentage: number
  timestamp: number
}

export interface ResourceStartedEvent {
  spaceId: string
  resourceId: string
  resourceName: string
  resourceType: string
  timestamp: number
}

export interface ResourceCompletedEvent {
  spaceId: string
  resourceId: string
  resourceName: string
  success: boolean
  duration: number
  error?: string
  timestamp: number
}

export interface ExecutionCompletedEvent {
  spaceId: string
  success: boolean
  duration: number
  totalResources: number
  successfulResources: number
  failedResources: number
  timestamp: number
}

export interface ExecutionFailedEvent {
  spaceId: string
  error: string
  timestamp: number
}

export interface ExecutionCancelledEvent {
  spaceId: string
  timestamp: number
  resourcesExecuted: number
  resourcesPending: number
}

/**
 * Execution options for individual resource
 */
export interface ResourceExecutionOptions {
  timeout?: number
  retryCount?: number
  retryDelay?: number
  workingDirectory?: string
  args?: string[]
  env?: Record<string, string>
}

/**
 * Execution statistics
 */
export interface ExecutionStats {
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  averageDuration: number
  lastExecutionTime?: number
  lastExecutionSuccess?: boolean
}
