/**
 * TEMPLATE: Service Implementation with Dependency Injection
 * Phase 5.5 Sprint 5.5.1 - Dependency Injection Infrastructure
 *
 * Copy this template when creating new services
 */

import type { Result } from '@/shared/types/common.types'
import type { ILogger } from '@/shared/interfaces'
// Import other dependencies interfaces...

/**
 * Example Service
 * Manages example functionality
 */
export class ExampleService {
  constructor(
    private readonly logger: ILogger
    // Add other dependencies here...
    // private readonly eventBus: IEventBus,
    // private readonly repository: IExampleRepository,
  ) {
    this.logger.info('ExampleService initialized')
  }

  /**
   * Example method
   * @param input - Input parameter
   * @returns Result with output
   */
  async doSomething(input: string): Promise<Result<string>> {
    try {
      this.logger.debug('ExampleService.doSomething called', { input })

      // Business logic here...
      const result = `Processed: ${input}`

      this.logger.info('ExampleService.doSomething completed successfully')
      return {
        success: true,
        data: result
      }
    } catch (error) {
      this.logger.error('Failed to do something', error, { input })
      return {
        success: false,
        error: 'Failed to do something'
      }
    }
  }
}

/**
 * Factory function for creating ExampleService with dependencies
 * Use this in service container registration
 */
export function createExampleService(logger: ILogger): ExampleService {
  return new ExampleService(logger)
}
