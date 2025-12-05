/**
 * Executor Factory
 * Creates and manages executor instances
 * Phase 1 Sprint 1.4 - Execution Engine
 */

import type { IExecutor } from '../types/execution.types'
import { ApplicationExecutor } from './ApplicationExecutor'
import { URLExecutor } from './URLExecutor'
import { ScriptExecutor } from './ScriptExecutor'
import { FileExecutor } from './FileExecutor'
import { logger } from '../../../shared/utils/logger'

/**
 * Factory for creating executors based on resource type
 * Implements the Factory Pattern
 */
export class ExecutorFactory {
  private readonly logger = logger
  private executors: Map<string, IExecutor> = new Map()

  constructor() {
    this.registerDefaultExecutors()
  }

  /**
   * Register default executors
   */
  private registerDefaultExecutors(): void {
    this.registerExecutor(new ApplicationExecutor())
    this.registerExecutor(new URLExecutor())
    this.registerExecutor(new ScriptExecutor())
    this.registerExecutor(new FileExecutor())

    this.logger.info('Default executors registered', {
      types: Array.from(this.executors.keys())
    })
  }

  /**
   * Register a custom executor
   */
  public registerExecutor(executor: IExecutor): void {
    const type = executor.getType()

    if (this.executors.has(type)) {
      this.logger.warn(`Executor for type '${type}' already exists. Overwriting...`)
    }

    this.executors.set(type, executor)
    this.logger.debug(`Executor registered for type: ${type}`)
  }

  /**
   * Get executor for a specific resource type
   */
  public getExecutor(type: string): IExecutor {
    const executor = this.executors.get(type)

    if (!executor) {
      const availableTypes = Array.from(this.executors.keys()).join(', ')
      throw new Error(
        `No executor found for resource type '${type}'. Available types: ${availableTypes}`
      )
    }

    return executor
  }

  /**
   * Check if executor exists for a resource type
   */
  public hasExecutor(type: string): boolean {
    return this.executors.has(type)
  }

  /**
   * Get all registered executor types
   */
  public getRegisteredTypes(): string[] {
    return Array.from(this.executors.keys())
  }

  /**
   * Unregister an executor
   */
  public unregisterExecutor(type: string): boolean {
    if (!this.executors.has(type)) {
      this.logger.warn(`Cannot unregister executor for type '${type}': not found`)
      return false
    }

    this.executors.delete(type)
    this.logger.info(`Executor unregistered for type: ${type}`)
    return true
  }

  /**
   * Clear all executors
   */
  public clearExecutors(): void {
    this.executors.clear()
    this.logger.info('All executors cleared')
  }

  /**
   * Reset to default executors
   */
  public reset(): void {
    this.clearExecutors()
    this.registerDefaultExecutors()
    this.logger.info('Executor factory reset to defaults')
  }
}
