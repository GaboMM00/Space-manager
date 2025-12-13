/**
 * ISpaceService Interface
 * Space service interface for dependency injection
 * Phase 5.5 Sprint 5.5.1 - Dependency Injection Infrastructure
 */

import type { Result } from '../../../shared/types/common.types'
import type { Space, SpaceFilters, CreateSpaceInput, UpdateSpaceInput } from '../types/workspace.types'

export interface ISpaceService {
  /**
   * List all spaces with optional filters
   */
  listSpaces(filters?: SpaceFilters): Promise<Result<Space[]>>

  /**
   * Get space by ID
   */
  getSpace(id: string): Promise<Result<Space>>

  /**
   * Create new space
   */
  createSpace(input: CreateSpaceInput): Promise<Result<Space>>

  /**
   * Update existing space
   */
  updateSpace(id: string, input: UpdateSpaceInput): Promise<Result<Space>>

  /**
   * Delete space
   */
  deleteSpace(id: string): Promise<Result<void>>

  /**
   * Duplicate space
   */
  duplicateSpace(id: string, newName?: string): Promise<Result<Space>>

  /**
   * Search spaces
   */
  searchSpaces(query: string): Promise<Result<Space[]>>

  /**
   * Export space
   */
  exportSpace(id: string): Promise<Result<string>>

  /**
   * Import space
   */
  importSpace(data: string): Promise<Result<Space>>

  /**
   * Get space statistics
   */
  getSpaceStats(id: string): Promise<Result<any>>
}
