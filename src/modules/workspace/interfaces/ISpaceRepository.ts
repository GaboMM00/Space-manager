/**
 * ISpaceRepository Interface
 * Space repository interface for dependency injection
 * Phase 5.5 Sprint 5.5.1 - Dependency Injection Infrastructure
 */

import type { Result } from '../../../shared/types/common.types'
import type { Space } from '../types/workspace.types'

export interface ISpaceRepository {
  /**
   * Find all spaces
   */
  findAll(): Promise<Space[]>

  /**
   * Find all spaces sorted by field
   */
  findAllSorted(field: keyof Space, order: 'asc' | 'desc'): Promise<Space[]>

  /**
   * Find space by ID
   */
  findById(id: string): Promise<Space | null>

  /**
   * Create new space
   */
  create(space: any): Promise<Result<Space>>

  /**
   * Update existing space
   */
  update(id: string, space: Partial<any>): Promise<Result<Space>>

  /**
   * Delete space
   */
  delete(id: string): Promise<Result<void>>

  /**
   * Check if space exists
   */
  exists(id: string): Promise<boolean>

  /**
   * Check if name exists
   */
  nameExists(name: string, excludeId?: string): Promise<boolean>

  /**
   * Get all unique tags
   */
  getAllTags(): Promise<string[]>
}
