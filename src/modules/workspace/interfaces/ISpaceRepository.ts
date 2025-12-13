/**
 * ISpaceRepository Interface
 * Space repository interface for dependency injection
 * Phase 5.5 Sprint 5.5.1 - Dependency Injection Infrastructure
 */

import type { Result } from '../../../shared/types/common.types'
import type { Space, SpaceFilters } from '../types/workspace.types'

export interface ISpaceRepository {
  /**
   * Find all spaces with optional filters
   */
  findAll(filters?: SpaceFilters): Promise<Result<Space[]>>

  /**
   * Find space by ID
   */
  findById(id: string): Promise<Result<Space | null>>

  /**
   * Create new space
   */
  create(space: Space): Promise<Result<Space>>

  /**
   * Update existing space
   */
  update(id: string, space: Partial<Space>): Promise<Result<Space>>

  /**
   * Delete space
   */
  delete(id: string): Promise<Result<void>>

  /**
   * Check if space exists
   */
  exists(id: string): Promise<boolean>
}
