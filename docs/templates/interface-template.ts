/**
 * TEMPLATE: Service Interface
 * Phase 5.5 Sprint 5.5.1 - Dependency Injection Infrastructure
 *
 * Copy this template when creating new service interfaces
 */

import type { Result } from '@/shared/types/common.types'
// Import other types as needed...

/**
 * IExampleService Interface
 * Contract for ExampleService implementations
 */
export interface IExampleService {
  /**
   * Example method description
   * @param input - Input parameter description
   * @returns Result with output description
   */
  doSomething(input: string): Promise<Result<string>>

  /**
   * Another example method
   * @param id - Entity ID
   * @returns Result with entity data
   */
  getById(id: string): Promise<Result<any>>

  /**
   * Create method example
   * @param data - Creation data
   * @returns Result with created entity
   */
  create(data: any): Promise<Result<any>>

  /**
   * Update method example
   * @param id - Entity ID
   * @param data - Update data
   * @returns Result with updated entity
   */
  update(id: string, data: any): Promise<Result<any>>

  /**
   * Delete method example
   * @param id - Entity ID
   * @returns Result indicating success
   */
  delete(id: string): Promise<Result<void>>
}
