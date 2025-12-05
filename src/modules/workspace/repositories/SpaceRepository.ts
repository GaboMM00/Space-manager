/**
 * SpaceRepository
 * Repository for managing Space entities
 */

import { BaseRepository } from '../../../main/services/DataStoreService'
import { FileSystemService } from '../../../main/services/FileSystemService'
import { JSONSchema } from '../../../shared/types/data-store.types'
import { Space } from '../types/workspace.types'
import spaceSchema from '../../../main/schemas/space.schema.json'

/**
 * SpaceRepository class
 * Implements Repository pattern for Space entities
 */
export class SpaceRepository extends BaseRepository<Space> {
  private static readonly SPACE_FILE_PATH = 'data/spaces.json'

  constructor(fileSystem: FileSystemService) {
    super(fileSystem, spaceSchema as JSONSchema)
  }

  /**
   * Get the file path for spaces data
   */
  protected getFilePath(): string {
    return SpaceRepository.SPACE_FILE_PATH
  }

  /**
   * Find spaces by tag
   */
  async findByTag(tag: string): Promise<Space[]> {
    const allSpaces = await this.findAll()
    return allSpaces.filter((space) => space.tags && space.tags.includes(tag))
  }

  /**
   * Find spaces by name (case-insensitive partial match)
   */
  async findByName(name: string): Promise<Space[]> {
    const allSpaces = await this.findAll()
    const lowerName = name.toLowerCase()
    return allSpaces.filter((space) => space.name.toLowerCase().includes(lowerName))
  }

  /**
   * Find space by exact name (case-insensitive)
   */
  async findByExactName(name: string): Promise<Space | null> {
    const allSpaces = await this.findAll()
    const lowerName = name.toLowerCase()
    return allSpaces.find((space) => space.name.toLowerCase() === lowerName) || null
  }

  /**
   * Check if space name exists (case-insensitive)
   */
  async nameExists(name: string, excludeId?: string): Promise<boolean> {
    const allSpaces = await this.findAll()
    const lowerName = name.toLowerCase()
    return allSpaces.some(
      (space) => space.name.toLowerCase() === lowerName && space.id !== excludeId
    )
  }

  /**
   * Get all unique tags
   */
  async getAllTags(): Promise<string[]> {
    const allSpaces = await this.findAll()
    const tagsSet = new Set<string>()

    allSpaces.forEach((space) => {
      if (space.tags) {
        space.tags.forEach((tag) => tagsSet.add(tag))
      }
    })

    return Array.from(tagsSet).sort()
  }

  /**
   * Get spaces with auto-execute enabled
   */
  async findAutoExecute(): Promise<Space[]> {
    const allSpaces = await this.findAll()
    return allSpaces.filter((space) => space.autoExecute === true)
  }

  /**
   * Count total resources across all spaces
   */
  async countTotalResources(): Promise<number> {
    const allSpaces = await this.findAll()
    return allSpaces.reduce((total, space) => total + space.resources.length, 0)
  }

  /**
   * Get spaces sorted by field
   */
  async findAllSorted(field: keyof Space = 'name', order: 'asc' | 'desc' = 'asc'): Promise<Space[]> {
    const allSpaces = await this.findAll()

    return allSpaces.sort((a, b) => {
      const aValue = a[field]
      const bValue = b[field]

      // Handle different types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue)
        return order === 'asc' ? comparison : -comparison
      }

      if (Array.isArray(aValue) && Array.isArray(bValue)) {
        const comparison = aValue.length - bValue.length
        return order === 'asc' ? comparison : -comparison
      }

      // Default comparison with undefined handling
      if (aValue === undefined && bValue === undefined) return 0
      if (aValue === undefined) return order === 'asc' ? 1 : -1
      if (bValue === undefined) return order === 'asc' ? -1 : 1
      if (aValue < bValue) return order === 'asc' ? -1 : 1
      if (aValue > bValue) return order === 'asc' ? 1 : -1
      return 0
    })
  }
}

/**
 * Create SpaceRepository instance
 */
export function createSpaceRepository(fileSystem: FileSystemService): SpaceRepository {
  return new SpaceRepository(fileSystem)
}
