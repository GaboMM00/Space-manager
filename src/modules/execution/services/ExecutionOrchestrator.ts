/**
 * Execution Orchestrator
 * Main coordinator for space execution
 * Phase 1 Sprint 1.4 - Execution Engine
 */

import type { Resource, Space } from '../../workspace/types/workspace.types'
import type {
  ExecutionContext,
  ExecutionConfig,
  ExecutionResult,
  ResourceExecutionResult,
  ExecutionProgress
} from '../types/execution.types'
import { ExecutorFactory } from '../executors/ExecutorFactory'
import { logger } from '../../../shared/utils/logger'
import type { EventBus } from '../../../shared/utils/event-bus'
import type { AnalyticsService } from '../../analytics/services/AnalyticsService'

/**
 * Orchestrates the execution of spaces and their resources
 */
export class ExecutionOrchestrator {
  private readonly logger = logger
  private readonly factory: ExecutorFactory
  private activeExecutions: Map<string, boolean> = new Map()
  private executionLogIds: Map<string, number> = new Map()

  constructor(
    private eventBus: EventBus,
    private analyticsService?: AnalyticsService,
    private config: ExecutionConfig = {
      stopOnError: false,
      maxConcurrent: 3,
      defaultTimeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    }
  ) {
    this.factory = new ExecutorFactory()
    this.logger.info('ExecutionOrchestrator initialized', { config })
  }

  /**
   * Execute a complete space
   */
  public async executeSpace(space: Space): Promise<ExecutionResult> {
    const startTime = Date.now()
    const context: ExecutionContext = {
      spaceId: space.id,
      startTime,
      resources: space.resources.filter((r) => r.enabled),
      stopOnError: this.config.stopOnError
    }

    this.logger.info(`Starting execution for space: ${space.name}`, {
      spaceId: space.id,
      resourceCount: context.resources.length,
      executionOrder: space.executionOrder
    })

    // Emit started event
    this.eventBus.emit('execution:started', {
      spaceId: space.id,
      spaceName: space.name,
      totalResources: context.resources.length,
      timestamp: startTime
    })

    this.activeExecutions.set(space.id, true)

    // Record execution start in analytics
    let executionLogId: number | undefined
    if (this.analyticsService) {
      const logResult = await this.analyticsService.recordExecution({
        spaceId: space.id,
        spaceName: space.name,
        startedAt: startTime,
        success: false,
        resourcesTotal: context.resources.length,
        resourcesSuccess: 0,
        resourcesFailed: 0
      })
      if (logResult.success && logResult.data) {
        executionLogId = logResult.data.id
        this.executionLogIds.set(space.id, executionLogId)
      }
    }

    try {
      let results: ResourceExecutionResult[]

      // Execute based on execution order strategy
      if (space.executionOrder === 'parallel') {
        results = await this.executeParallel(context, space.name)
      } else {
        results = await this.executeSequential(context, space.name)
      }

      const endTime = Date.now()
      const duration = endTime - startTime
      const successfulResources = results.filter((r) => r.success).length
      const failedResources = results.filter((r) => !r.success).length
      const success = failedResources === 0

      const result: ExecutionResult = {
        spaceId: space.id,
        success,
        results,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration,
        totalResources: results.length,
        successfulResources,
        failedResources,
        errors: results.filter((r) => r.error).map((r) => r.error!)
      }

      // Update execution log in analytics
      if (this.analyticsService && executionLogId) {
        await this.analyticsService.completeExecution(
          executionLogId,
          endTime,
          duration,
          success,
          result.errors.length > 0 ? result.errors.join('; ') : undefined
        )
      }

      // Emit completed event
      this.eventBus.emit('execution:completed', {
        spaceId: space.id,
        success,
        duration,
        totalResources: results.length,
        successfulResources,
        failedResources,
        timestamp: endTime
      })

      this.logger.info(`Execution completed for space: ${space.name}`, {
        spaceId: space.id,
        success,
        duration,
        successfulResources,
        failedResources
      })

      return result
    } catch (error) {
      const endTime = Date.now()
      const errorMessage = (error as Error).message
      const duration = endTime - startTime

      this.logger.error(`Execution failed for space: ${space.name}`, {
        spaceId: space.id,
        error
      })

      // Update execution log with error
      if (this.analyticsService && executionLogId) {
        await this.analyticsService.completeExecution(
          executionLogId,
          endTime,
          duration,
          false,
          errorMessage
        )

        // Record error in error logs
        await this.analyticsService.recordError({
          spaceId: space.id,
          executionLogId,
          errorType: 'system_error',
          errorMessage,
          stackTrace: (error as Error).stack
        })
      }

      // Emit failed event
      this.eventBus.emit('execution:failed', {
        spaceId: space.id,
        error: errorMessage,
        timestamp: endTime
      })

      throw error
    } finally {
      this.activeExecutions.delete(space.id)
      this.executionLogIds.delete(space.id)
    }
  }

  /**
   * Execute resources sequentially
   */
  private async executeSequential(
    context: ExecutionContext,
    spaceName: string
  ): Promise<ResourceExecutionResult[]> {
    const results: ResourceExecutionResult[] = []

    for (let i = 0; i < context.resources.length; i++) {
      // Check if execution was cancelled
      if (!this.activeExecutions.get(context.spaceId)) {
        this.logger.warn('Execution cancelled', { spaceId: context.spaceId })
        break
      }

      const resource = context.resources[i]

      // Emit progress
      this.emitProgress(context, i, spaceName, resource.name)

      // Execute resource
      const result = await this.executeResource(context.spaceId, resource)
      results.push(result)

      // Stop on error if configured
      if (!result.success && context.stopOnError) {
        this.logger.warn('Stopping execution due to error', {
          spaceId: context.spaceId,
          resource: resource.name
        })
        break
      }

      // Apply delay if configured
      if (resource.delay) {
        await this.delay(resource.delay)
      }
    }

    return results
  }

  /**
   * Execute resources in parallel
   */
  private async executeParallel(
    context: ExecutionContext,
    _spaceName: string
  ): Promise<ResourceExecutionResult[]> {
    // Execute all resources concurrently
    const promises = context.resources.map((resource, index) => {
      // Emit progress for each resource start
      this.emitProgress(context, index, _spaceName, resource.name)
      return this.executeResource(context.spaceId, resource)
    })

    const results = await Promise.all(promises)
    return results
  }

  /**
   * Execute a single resource
   */
  private async executeResource(
    spaceId: string,
    resource: Resource
  ): Promise<ResourceExecutionResult> {
    const startTime = Date.now()

    this.logger.debug(`Executing resource: ${resource.name}`, {
      spaceId,
      resourceId: resource.id,
      type: resource.type
    })

    // Emit resource started event
    this.eventBus.emit('execution:resource-started', {
      spaceId,
      resourceId: resource.id,
      resourceName: resource.name,
      resourceType: resource.type,
      timestamp: startTime
    })

    try {
      // Get appropriate executor
      const executor = this.factory.getExecutor(resource.type)

      // Validate resource
      const validation = await executor.validate(resource)
      if (!validation.valid) {
        const result: ResourceExecutionResult = {
          resourceId: resource.id,
          resourceName: resource.name,
          resourceType: resource.type,
          success: false,
          error: validation.error,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date().toISOString(),
          duration: 0
        }

        this.emitResourceCompleted(spaceId, result)
        return result
      }

      // Check if can execute on current platform
      if (!executor.canExecute(resource)) {
        const result: ResourceExecutionResult = {
          resourceId: resource.id,
          resourceName: resource.name,
          resourceType: resource.type,
          success: false,
          error: `Resource cannot be executed on ${process.platform}`,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date().toISOString(),
          duration: 0
        }

        this.emitResourceCompleted(spaceId, result)
        return result
      }

      // Execute with retries
      const retryCount = resource.retryCount || this.config.retryAttempts
      await this.executeWithRetry(() => executor.execute(resource), retryCount)

      const endTime = Date.now()
      const duration = endTime - startTime

      const result: ResourceExecutionResult = {
        resourceId: resource.id,
        resourceName: resource.name,
        resourceType: resource.type,
        success: true,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration
      }

      // Record resource stat in analytics
      if (this.analyticsService) {
        await this.analyticsService.updateResourceStat(
          spaceId,
          resource.type,
          resource.path,
          true,
          duration
        )
      }

      this.emitResourceCompleted(spaceId, result)
      return result
    } catch (error) {
      const endTime = Date.now()
      const errorMessage = (error as Error).message
      const duration = endTime - startTime

      this.logger.error(`Resource execution failed: ${resource.name}`, {
        spaceId,
        resourceId: resource.id,
        error
      })

      const result: ResourceExecutionResult = {
        resourceId: resource.id,
        resourceName: resource.name,
        resourceType: resource.type,
        success: false,
        error: errorMessage,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration
      }

      // Record resource stat and error in analytics
      if (this.analyticsService) {
        await this.analyticsService.updateResourceStat(
          spaceId,
          resource.type,
          resource.path,
          false,
          duration
        )

        const executionLogId = this.executionLogIds.get(spaceId)
        await this.analyticsService.recordError({
          spaceId,
          executionLogId,
          errorType: 'resource_error',
          errorMessage,
          stackTrace: (error as Error).stack,
          resourceType: resource.type,
          resourcePath: resource.path
        })
      }

      this.emitResourceCompleted(spaceId, result)
      return result
    }
  }

  /**
   * Cancel execution of a space
   */
  public cancelExecution(spaceId: string): boolean {
    if (!this.activeExecutions.has(spaceId)) {
      return false
    }

    this.activeExecutions.delete(spaceId)

    this.logger.info('Execution cancelled', { spaceId })

    this.eventBus.emit('execution:cancelled', {
      spaceId,
      timestamp: Date.now(),
      resourcesExecuted: 0, // Will be updated by the execution loop
      resourcesPending: 0
    })

    return true
  }

  /**
   * Check if a space is currently executing
   */
  public isExecuting(spaceId: string): boolean {
    return this.activeExecutions.has(spaceId)
  }

  /**
   * Get current configuration
   */
  public getConfig(): ExecutionConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<ExecutionConfig>): void {
    this.config = { ...this.config, ...config }
    this.logger.info('Configuration updated', { config: this.config })
  }

  /**
   * Emit progress event
   */
  private emitProgress(
    context: ExecutionContext,
    current: number,
    _spaceName: string,
    resourceName: string
  ): void {
    const progress: ExecutionProgress = {
      spaceId: context.spaceId,
      current: current + 1,
      total: context.resources.length,
      resourceName,
      percentage: Math.round(((current + 1) / context.resources.length) * 100)
    }

    this.eventBus.emit('execution:progress', {
      ...progress,
      timestamp: Date.now()
    })

    if (context.onProgress) {
      context.onProgress(progress)
    }
  }

  /**
   * Emit resource completed event
   */
  private emitResourceCompleted(spaceId: string, result: ResourceExecutionResult): void {
    this.eventBus.emit('execution:resource-completed', {
      spaceId,
      resourceId: result.resourceId,
      resourceName: result.resourceName,
      success: result.success,
      duration: result.duration,
      error: result.error,
      timestamp: Date.now()
    })
  }

  /**
   * Execute function with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retryCount: number
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        if (attempt < retryCount) {
          this.logger.warn(`Retry attempt ${attempt + 1}/${retryCount}`, { error })
          await this.delay(this.config.retryDelay)
        }
      }
    }

    throw lastError
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
