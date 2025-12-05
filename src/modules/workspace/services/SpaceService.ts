/**
 * SpaceService
 * Business logic for managing workspaces
 */

import { logger } from '../../../shared/utils/logger'
import { EventBus } from '../../../shared/utils/event-bus'
import { Result } from '../../../shared/types/common.types'
import { FileSystemService } from '../../../main/services/FileSystemService'
import { BackupService } from '../../../main/services/BackupService'
import { SpaceRepository } from '../repositories/SpaceRepository'
import {
  Space,
  Resource,
  CreateSpaceDto,
  UpdateSpaceDto,
  CreateResourceDto,
  SpaceStats,
  SpaceSearchFilters,
  SpaceSortOptions,
  SpaceExport
} from '../types/workspace.types'
import {
  validateCreateSpace,
  validateUpdateSpace,
  validateResource,
  sanitizeSpaceName,
  sanitizeDescription
} from '../validators/space-validator'

/**
 * SpaceService class
 */
export class SpaceService {
  private repository: SpaceRepository
  private eventBus: EventBus
  private backupService: BackupService

  constructor(
    fileSystem: FileSystemService,
    backupService: BackupService,
    eventBus: EventBus
  ) {
    this.repository = new SpaceRepository(fileSystem)
    this.backupService = backupService
    this.eventBus = eventBus
    logger.info('SpaceService initialized')
  }

  /**
   * Get all spaces
   */
  async getAllSpaces(sortOptions?: SpaceSortOptions): Promise<Space[]> {
    try {
      if (sortOptions) {
        // Map 'resourceCount' to 'resources' for sorting
        const field = sortOptions.field === 'resourceCount' ? 'resources' : sortOptions.field
        return await this.repository.findAllSorted(field as keyof Space, sortOptions.order)
      }
      return await this.repository.findAll()
    } catch (error) {
      logger.error('Failed to get all spaces', error)
      return []
    }
  }

  /**
   * Get space by ID
   */
  async getSpaceById(id: string): Promise<Result<Space>> {
    try {
      const space = await this.repository.findById(id)

      if (!space) {
        return {
          success: false,
          error: `Space not found with id: ${id}`
        }
      }

      return { success: true, data: space }
    } catch (error) {
      logger.error('Failed to get space by ID', error, { id })
      return {
        success: false,
        error: 'Failed to retrieve space'
      }
    }
  }

  /**
   * Create new space
   */
  async createSpace(data: CreateSpaceDto): Promise<Result<Space>> {
    try {
      // Sanitize input
      const sanitized: CreateSpaceDto = {
        ...data,
        name: sanitizeSpaceName(data.name),
        description: data.description ? sanitizeDescription(data.description) : undefined
      }

      // Validate
      const validation = validateCreateSpace(sanitized)
      if (!validation.valid) {
        const errorMessage = validation.errors.map((e) => e.message).join(', ')
        return {
          success: false,
          error: `Validation failed: ${errorMessage}`,
          code: 'VALIDATION_FAILED'
        }
      }

      // Check name uniqueness
      const nameExists = await this.repository.nameExists(sanitized.name)
      if (nameExists) {
        return {
          success: false,
          error: `A space with the name "${sanitized.name}" already exists`,
          code: 'DUPLICATE_NAME'
        }
      }

      // Transform CreateResourceDto to Resource with IDs and timestamps
      const now = new Date().toISOString()
      const resourcesWithIds: Resource[] = sanitized.resources.map((resource) => ({
        ...resource,
        id: this.repository['generateId'](),
        createdAt: now,
        updatedAt: now
      }))

      // Create space with transformed resources
      const spaceToCreate = {
        ...sanitized,
        resources: resourcesWithIds
      }

      // Create space
      const result = await this.repository.create(spaceToCreate)

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Failed to create space'
        }
      }

      // Emit event
      this.eventBus.emitSync('space:created', { spaceId: result.data.id })

      logger.info('Space created', { spaceId: result.data.id, name: result.data.name })

      return { success: true, data: result.data }
    } catch (error) {
      logger.error('Failed to create space', error)
      return {
        success: false,
        error: 'Failed to create space'
      }
    }
  }

  /**
   * Update existing space
   */
  async updateSpace(id: string, updates: UpdateSpaceDto): Promise<Result<Space>> {
    try {
      // Check if space exists
      const exists = await this.repository.exists(id)
      if (!exists) {
        return {
          success: false,
          error: `Space not found with id: ${id}`
        }
      }

      // Sanitize input
      const sanitized: UpdateSpaceDto = {
        ...updates
      }

      if (updates.name) {
        sanitized.name = sanitizeSpaceName(updates.name)
      }

      if (updates.description) {
        sanitized.description = sanitizeDescription(updates.description)
      }

      // Validate
      const validation = validateUpdateSpace(sanitized)
      if (!validation.valid) {
        const errorMessage = validation.errors.map((e) => e.message).join(', ')
        return {
          success: false,
          error: `Validation failed: ${errorMessage}`,
          code: 'VALIDATION_FAILED'
        }
      }

      // Check name uniqueness if name is being updated
      if (sanitized.name) {
        const nameExists = await this.repository.nameExists(sanitized.name, id)
        if (nameExists) {
          return {
            success: false,
            error: `A space with the name "${sanitized.name}" already exists`,
            code: 'DUPLICATE_NAME'
          }
        }
      }

      // Update space
      const result = await this.repository.update(id, sanitized)

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Failed to update space'
        }
      }

      // Emit event
      this.eventBus.emitSync('space:updated', { spaceId: id })

      logger.info('Space updated', { spaceId: id })

      return { success: true, data: result.data }
    } catch (error) {
      logger.error('Failed to update space', error, { id })
      return {
        success: false,
        error: 'Failed to update space'
      }
    }
  }

  /**
   * Delete space
   */
  async deleteSpace(id: string): Promise<Result<void>> {
    try {
      // Check if space exists
      const space = await this.repository.findById(id)
      if (!space) {
        return {
          success: false,
          error: `Space not found with id: ${id}`
        }
      }

      // Create backup before deletion
      if (this.backupService.isAutoBackupEnabled()) {
        await this.backupService.createBackup(
          this.repository['getFilePath'](),
          `Before deleting space: ${space.name}`
        )
      }

      // Delete space
      const result = await this.repository.delete(id)

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to delete space'
        }
      }

      // Emit event
      this.eventBus.emitSync('space:deleted', { spaceId: id, spaceName: space.name })

      logger.info('Space deleted', { spaceId: id, name: space.name })

      return { success: true }
    } catch (error) {
      logger.error('Failed to delete space', error, { id })
      return {
        success: false,
        error: 'Failed to delete space'
      }
    }
  }

  /**
   * Duplicate space
   */
  async duplicateSpace(id: string, newName?: string): Promise<Result<Space>> {
    try {
      // Get original space
      const original = await this.repository.findById(id)
      if (!original) {
        return {
          success: false,
          error: `Space not found with id: ${id}`
        }
      }

      // Generate new name
      const duplicateName = newName || `${original.name} - Copy`

      // Create duplicate
      const duplicateData: CreateSpaceDto = {
        name: duplicateName,
        description: original.description,
        icon: original.icon,
        color: original.color,
        resources: original.resources.map((resource) => ({ ...resource })),
        executionOrder: original.executionOrder,
        autoExecute: false, // Don't copy auto-execute
        tags: original.tags ? [...original.tags] : undefined
      }

      return await this.createSpace(duplicateData)
    } catch (error) {
      logger.error('Failed to duplicate space', error, { id })
      return {
        success: false,
        error: 'Failed to duplicate space'
      }
    }
  }

  /**
   * Add resource to space
   */
  async addResource(spaceId: string, resource: CreateResourceDto): Promise<Result<Space>> {
    try {
      // Validate resource
      const validation = validateResource(resource)
      if (!validation.valid) {
        const errorMessage = validation.errors.map((e) => e.message).join(', ')
        return {
          success: false,
          error: `Validation failed: ${errorMessage}`,
          code: 'VALIDATION_FAILED'
        }
      }

      // Get space
      const space = await this.repository.findById(spaceId)
      if (!space) {
        return {
          success: false,
          error: `Space not found with id: ${spaceId}`
        }
      }

      // Add resource with auto-generated ID and timestamps
      const now = new Date().toISOString()
      const newResource: Resource = {
        ...resource,
        id: this.repository['generateId'](),
        createdAt: now,
        updatedAt: now
      }

      space.resources.push(newResource)

      // Update space
      return await this.updateSpace(spaceId, { resources: space.resources })
    } catch (error) {
      logger.error('Failed to add resource', error, { spaceId })
      return {
        success: false,
        error: 'Failed to add resource'
      }
    }
  }

  /**
   * Search spaces
   */
  async searchSpaces(filters: SpaceSearchFilters): Promise<Space[]> {
    try {
      let spaces = await this.repository.findAll()

      // Apply query filter
      if (filters.query) {
        const query = filters.query.toLowerCase()
        spaces = spaces.filter(
          (space) =>
            space.name.toLowerCase().includes(query) ||
            (space.description && space.description.toLowerCase().includes(query))
        )
      }

      // Apply tags filter
      if (filters.tags && filters.tags.length > 0) {
        spaces = spaces.filter((space) =>
          space.tags ? filters.tags!.some((tag) => space.tags!.includes(tag)) : false
        )
      }

      // Apply hasResources filter
      if (filters.hasResources !== undefined) {
        spaces = spaces.filter((space) =>
          filters.hasResources ? space.resources.length > 0 : space.resources.length === 0
        )
      }

      // Apply executionOrder filter
      if (filters.executionOrder) {
        spaces = spaces.filter((space) => space.executionOrder === filters.executionOrder)
      }

      return spaces
    } catch (error) {
      logger.error('Failed to search spaces', error)
      return []
    }
  }

  /**
   * Get space statistics
   */
  async getStatistics(): Promise<SpaceStats> {
    try {
      const spaces = await this.repository.findAll()

      const stats: SpaceStats = {
        totalSpaces: spaces.length,
        totalResources: 0,
        enabledSpaces: 0,
        disabledSpaces: 0,
        resourcesByType: {
          application: 0,
          url: 0,
          file: 0,
          script: 0
        }
      }

      spaces.forEach((space) => {
        stats.totalResources += space.resources.length
        stats.enabledSpaces += space.autoExecute ? 1 : 0

        space.resources.forEach((resource) => {
          stats.resourcesByType[resource.type]++
        })
      })

      stats.disabledSpaces = stats.totalSpaces - stats.enabledSpaces

      return stats
    } catch (error) {
      logger.error('Failed to get statistics', error)
      return {
        totalSpaces: 0,
        totalResources: 0,
        enabledSpaces: 0,
        disabledSpaces: 0,
        resourcesByType: {
          application: 0,
          url: 0,
          file: 0,
          script: 0
        }
      }
    }
  }

  /**
   * Export space
   */
  async exportSpace(id: string): Promise<Result<SpaceExport>> {
    try {
      const space = await this.repository.findById(id)
      if (!space) {
        return {
          success: false,
          error: `Space not found with id: ${id}`
        }
      }

      const exportData: SpaceExport = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        space
      }

      logger.info('Space exported', { spaceId: id, name: space.name })

      return { success: true, data: exportData }
    } catch (error) {
      logger.error('Failed to export space', error, { id })
      return {
        success: false,
        error: 'Failed to export space'
      }
    }
  }

  /**
   * Import space
   */
  async importSpace(exportData: SpaceExport): Promise<Result<Space>> {
    try {
      // Validate export format
      if (!exportData.space || !exportData.version) {
        return {
          success: false,
          error: 'Invalid export format'
        }
      }

      // Extract space data without IDs and timestamps
      const { id, createdAt, updatedAt, ...spaceData } = exportData.space

      // Remove resource IDs and timestamps
      const cleanedResources: CreateResourceDto[] = spaceData.resources.map((resource) => {
        const { id: resourceId, createdAt: resourceCreatedAt, updatedAt: resourceUpdatedAt, ...resourceData } = resource
        return resourceData as CreateResourceDto
      })

      // Create new space with imported data
      const importData: CreateSpaceDto = {
        ...spaceData,
        name: `${spaceData.name} (Imported)`, // Add suffix to avoid conflicts
        resources: cleanedResources
      }

      const result = await this.createSpace(importData)

      if (result.success && result.data) {
        logger.info('Space imported', { spaceId: result.data.id, name: result.data.name })
      }

      return result
    } catch (error) {
      logger.error('Failed to import space', error)
      return {
        success: false,
        error: 'Failed to import space'
      }
    }
  }

  /**
   * Get all tags
   */
  async getAllTags(): Promise<string[]> {
    try {
      return await this.repository.getAllTags()
    } catch (error) {
      logger.error('Failed to get all tags', error)
      return []
    }
  }
}

/**
 * Create SpaceService instance
 */
export function createSpaceService(
  fileSystem: FileSystemService,
  backupService: BackupService,
  eventBus: EventBus
): SpaceService {
  return new SpaceService(fileSystem, backupService, eventBus)
}
