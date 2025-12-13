/**
 * ISpaceService Interface
 * Space service interface for dependency injection
 * Phase 5.5 Sprint 5.5.1 - Dependency Injection Infrastructure
 */

import type { Result } from '../../../shared/types/common.types'
import type {
  Space,
  CreateSpaceDto,
  UpdateSpaceDto,
  SpaceSearchFilters,
  SpaceSortOptions,
  SpaceStats,
  SpaceExport
} from '../types/workspace.types'

export interface ISpaceService {
  /**
   * Get all spaces with optional sorting
   */
  getAllSpaces(sortOptions?: SpaceSortOptions): Promise<Space[]>

  /**
   * Get space by ID
   */
  getSpaceById(id: string): Promise<Result<Space>>

  /**
   * Create new space
   */
  createSpace(data: CreateSpaceDto): Promise<Result<Space>>

  /**
   * Update existing space
   */
  updateSpace(id: string, updates: UpdateSpaceDto): Promise<Result<Space>>

  /**
   * Delete space
   */
  deleteSpace(id: string): Promise<Result<void>>

  /**
   * Duplicate space
   */
  duplicateSpace(id: string, newName?: string): Promise<Result<Space>>

  /**
   * Search spaces with filters
   */
  searchSpaces(filters: SpaceSearchFilters): Promise<Space[]>

  /**
   * Get space statistics
   */
  getStatistics(): Promise<SpaceStats>

  /**
   * Export space
   */
  exportSpace(id: string): Promise<Result<SpaceExport>>

  /**
   * Import space
   */
  importSpace(exportData: SpaceExport): Promise<Result<Space>>

  /**
   * Add resource to space
   */
  addResource(spaceId: string, resource: any): Promise<Result<Space>>

  /**
   * Get all tags
   */
  getAllTags(): Promise<string[]>
}
