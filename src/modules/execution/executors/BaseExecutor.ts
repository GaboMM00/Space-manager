/**
 * Base Executor Abstract Class
 * Phase 1 Sprint 1.4 - Execution Engine
 */

import type { Resource } from '../../workspace/types/workspace.types'
import type { IExecutor, ValidationResult } from '../types/execution.types'
import { logger } from '../../../shared/utils/logger'

/**
 * Abstract base class for all executors
 * Provides common functionality for resource execution
 */
export abstract class BaseExecutor implements IExecutor {
  protected readonly logger = logger

  /**
   * Execute a resource
   * Must be implemented by concrete executors
   */
  abstract execute(resource: Resource): Promise<void>

  /**
   * Validate a resource before execution
   * Must be implemented by concrete executors
   */
  abstract validate(resource: Resource): Promise<ValidationResult>

  /**
   * Check if this executor can execute the resource on current platform
   * Must be implemented by concrete executors
   */
  abstract canExecute(resource: Resource): boolean

  /**
   * Get executor type
   * Must be implemented by concrete executors
   */
  abstract getType(): string

  /**
   * Common validation helper - check if resource matches executor type
   */
  protected validateResourceType(resource: Resource, expectedType: string): ValidationResult {
    if (resource.type !== expectedType) {
      return {
        valid: false,
        error: `Invalid resource type. Expected ${expectedType}, got ${resource.type}`
      }
    }
    return { valid: true }
  }

  /**
   * Common validation helper - check if path exists
   */
  protected async validatePathExists(filePath: string): Promise<ValidationResult> {
    try {
      const fs = await import('fs')
      await fs.promises.access(filePath)
      return { valid: true }
    } catch {
      return {
        valid: false,
        error: `Path does not exist or is not accessible: ${filePath}`
      }
    }
  }

  /**
   * Common validation helper - check if URL is valid
   */
  protected validateURL(url: string): ValidationResult {
    try {
      const parsedURL = new URL(url)

      // Only allow http and https protocols for security
      if (!['http:', 'https:'].includes(parsedURL.protocol)) {
        return {
          valid: false,
          error: `Unsupported protocol: ${parsedURL.protocol}. Only http and https are allowed.`
        }
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: `Invalid URL format: ${url}`
      }
    }
  }

  /**
   * Helper method to delay execution
   */
  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Helper method to handle retries
   */
  protected async executeWithRetry<T>(
    fn: () => Promise<T>,
    retryCount: number = 3,
    retryDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        this.logger.warn(`Execution attempt ${attempt + 1} failed`, { error })

        if (attempt < retryCount) {
          await this.delay(retryDelay)
        }
      }
    }

    throw lastError
  }
}
