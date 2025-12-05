/**
 * SpaceService Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SpaceService } from '../../../../src/modules/workspace/services/SpaceService'
import {
  Space,
  CreateSpaceDto,
  UpdateSpaceDto,
  CreateResourceDto,
  SpaceExport
} from '../../../../src/modules/workspace/types/workspace.types'

// No mocking needed - we'll use actual dependency injection

describe('SpaceService', () => {
  let service: SpaceService
  let mockRepository: any
  let mockFileSystem: any
  let mockBackupService: any
  let mockEventBus: any

  // Mock data
  const mockSpace: Space = {
    id: 'space-1',
    name: 'Test Space',
    description: 'Test description',
    icon: 'icon-test',
    color: '#FF5733',
    resources: [
      {
        id: 'res-1',
        type: 'application',
        name: 'VS Code',
        path: '/usr/bin/code',
        enabled: true,
        order: 0,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      }
    ],
    executionOrder: 'sequential',
    autoExecute: false,
    tags: ['development'],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  }

  const mockCreateDto: CreateSpaceDto = {
    name: 'New Space',
    description: 'New description',
    icon: 'icon-new',
    color: '#00FF00',
    resources: [
      {
        type: 'url',
        name: 'GitHub',
        path: 'https://github.com',
        enabled: true,
        order: 0
      }
    ],
    executionOrder: 'parallel',
    autoExecute: false,
    tags: ['productivity']
  }

  beforeEach(() => {
    // Create mock instances
    mockFileSystem = {
      getBasePath: vi.fn().mockReturnValue('/test/path'),
      exists: vi.fn().mockResolvedValue(true),
      readFile: vi.fn(),
      writeFile: vi.fn()
    } as any

    mockBackupService = {
      isAutoBackupEnabled: vi.fn().mockReturnValue(false),
      createBackup: vi.fn().mockResolvedValue({ success: true })
    } as any

    mockEventBus = {
      emitSync: vi.fn(),
      emit: vi.fn()
    } as any

    // Mock repository methods
    mockRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findAllSorted: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
      nameExists: vi.fn(),
      getAllTags: vi.fn(),
      generateId: vi.fn().mockReturnValue('generated-id'),
      getFilePath: vi.fn().mockReturnValue('data/spaces.json')
    }

    // Create service instance
    service = new SpaceService(mockFileSystem, mockBackupService, mockEventBus)

    // Override the private repository with our mock
    ;(service as any).repository = mockRepository
  })

  describe('constructor', () => {
    it('should initialize with required dependencies', () => {
      expect(service).toBeDefined()
      expect((service as any).repository).toBeDefined()
      expect((service as any).backupService).toBe(mockBackupService)
      expect((service as any).eventBus).toBe(mockEventBus)
    })
  })

  describe('getAllSpaces', () => {
    it('should return all spaces without sorting', async () => {
      const spaces = [mockSpace]
      mockRepository.findAll.mockResolvedValue(spaces)

      const result = await service.getAllSpaces()

      expect(result).toEqual(spaces)
      expect(mockRepository.findAll).toHaveBeenCalled()
    })

    it('should return sorted spaces when sort options provided', async () => {
      const spaces = [mockSpace]
      mockRepository.findAllSorted.mockResolvedValue(spaces)

      const result = await service.getAllSpaces({ field: 'name', order: 'asc' })

      expect(result).toEqual(spaces)
      expect(mockRepository.findAllSorted).toHaveBeenCalledWith('name', 'asc')
    })

    it('should map resourceCount field to resources for sorting', async () => {
      const spaces = [mockSpace]
      mockRepository.findAllSorted.mockResolvedValue(spaces)

      await service.getAllSpaces({ field: 'resourceCount', order: 'desc' })

      expect(mockRepository.findAllSorted).toHaveBeenCalledWith('resources', 'desc')
    })

    it('should return empty array on error', async () => {
      mockRepository.findAll.mockRejectedValue(new Error('Database error'))

      const result = await service.getAllSpaces()

      expect(result).toEqual([])
    })
  })

  describe('getSpaceById', () => {
    it('should return space when found', async () => {
      mockRepository.findById.mockResolvedValue(mockSpace)

      const result = await service.getSpaceById('space-1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockSpace)
      expect(mockRepository.findById).toHaveBeenCalledWith('space-1')
    })

    it('should return error when space not found', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const result = await service.getSpaceById('non-existent')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Space not found')
    })

    it('should handle repository errors', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Database error'))

      const result = await service.getSpaceById('space-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to retrieve space')
    })
  })

  describe('createSpace', () => {
    it('should create space successfully', async () => {
      mockRepository.nameExists.mockResolvedValue(false)
      mockRepository.create.mockResolvedValue({ success: true, data: mockSpace })

      const result = await service.createSpace(mockCreateDto)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockSpace)
      expect(mockRepository.nameExists).toHaveBeenCalledWith('New Space')
      expect(mockRepository.create).toHaveBeenCalled()
      expect(mockEventBus.emitSync).toHaveBeenCalledWith('space:created', { spaceId: mockSpace.id })
    })

    it('should sanitize input data', async () => {
      mockRepository.nameExists.mockResolvedValue(false)
      mockRepository.create.mockResolvedValue({ success: true, data: mockSpace })

      const dirtyDto: CreateSpaceDto = {
        ...mockCreateDto,
        name: '  Dirty Name  ',
        description: '  Test description  '
      }

      await service.createSpace(dirtyDto)

      const createCall = mockRepository.create.mock.calls[0][0]
      expect(createCall.name).toBe('Dirty Name')
      expect(createCall.description).toBe('Test description')
    })

    it('should reject invalid space name', async () => {
      const invalidDto: CreateSpaceDto = {
        ...mockCreateDto,
        name: ''  // Empty name is invalid even after sanitization
      }

      const result = await service.createSpace(invalidDto)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Validation failed')
      expect(result.code).toBe('VALIDATION_FAILED')
      // Should not check for name existence due to validation failure
      expect(mockRepository.nameExists).not.toHaveBeenCalled()
    })

    it('should reject duplicate space name', async () => {
      mockRepository.nameExists.mockResolvedValue(true)

      const result = await service.createSpace(mockCreateDto)

      expect(result.success).toBe(false)
      expect(result.error).toContain('already exists')
      expect(result.code).toBe('DUPLICATE_NAME')
    })

    it('should transform CreateResourceDto to Resource with IDs', async () => {
      mockRepository.nameExists.mockResolvedValue(false)
      mockRepository.create.mockResolvedValue({ success: true, data: mockSpace })

      await service.createSpace(mockCreateDto)

      const createCall = mockRepository.create.mock.calls[0][0]
      expect(createCall.resources[0]).toHaveProperty('id')
      expect(createCall.resources[0]).toHaveProperty('createdAt')
      expect(createCall.resources[0]).toHaveProperty('updatedAt')
    })

    it('should handle repository creation errors', async () => {
      mockRepository.nameExists.mockResolvedValue(false)
      mockRepository.create.mockResolvedValue({ success: false, error: 'Creation failed' })

      const result = await service.createSpace(mockCreateDto)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Creation failed')
    })
  })

  describe('updateSpace', () => {
    it('should update space successfully', async () => {
      mockRepository.exists.mockResolvedValue(true)
      mockRepository.nameExists.mockResolvedValue(false)
      mockRepository.update.mockResolvedValue({ success: true, data: mockSpace })

      const updates: UpdateSpaceDto = { name: 'Updated Name' }
      const result = await service.updateSpace('space-1', updates)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockSpace)
      expect(mockRepository.update).toHaveBeenCalledWith('space-1', expect.objectContaining({ name: 'Updated Name' }))
      expect(mockEventBus.emitSync).toHaveBeenCalledWith('space:updated', { spaceId: 'space-1' })
    })

    it('should return error when space not found', async () => {
      mockRepository.exists.mockResolvedValue(false)

      const result = await service.updateSpace('non-existent', { name: 'New Name' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Space not found')
    })

    it('should check name uniqueness when updating name', async () => {
      mockRepository.exists.mockResolvedValue(true)
      mockRepository.nameExists.mockResolvedValue(true)

      const result = await service.updateSpace('space-1', { name: 'Duplicate Name' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('already exists')
      expect(result.code).toBe('DUPLICATE_NAME')
    })

    it('should sanitize update data', async () => {
      mockRepository.exists.mockResolvedValue(true)
      mockRepository.nameExists.mockResolvedValue(false)
      mockRepository.update.mockResolvedValue({ success: true, data: mockSpace })

      await service.updateSpace('space-1', {
        name: '  Trimmed  ',
        description: '  Updated description  '
      })

      const updateCall = mockRepository.update.mock.calls[0][1]
      expect(updateCall.name).toBe('Trimmed')
      expect(updateCall.description).toBe('Updated description')
    })
  })

  describe('deleteSpace', () => {
    it('should delete space successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockSpace)
      mockRepository.delete.mockResolvedValue({ success: true })

      const result = await service.deleteSpace('space-1')

      expect(result.success).toBe(true)
      expect(mockRepository.delete).toHaveBeenCalledWith('space-1')
      expect(mockEventBus.emitSync).toHaveBeenCalledWith('space:deleted', {
        spaceId: 'space-1',
        spaceName: mockSpace.name
      })
    })

    it('should return error when space not found', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const result = await service.deleteSpace('non-existent')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Space not found')
    })

    it('should create backup when auto-backup is enabled', async () => {
      mockRepository.findById.mockResolvedValue(mockSpace)
      mockRepository.delete.mockResolvedValue({ success: true })
      mockBackupService.isAutoBackupEnabled.mockReturnValue(true)
      ;(mockRepository as any).getFilePath = vi.fn().mockReturnValue('data/spaces.json')

      await service.deleteSpace('space-1')

      expect(mockBackupService.createBackup).toHaveBeenCalledWith(
        'data/spaces.json',
        expect.stringContaining('Test Space')
      )
    })

    it('should not create backup when auto-backup is disabled', async () => {
      mockRepository.findById.mockResolvedValue(mockSpace)
      mockRepository.delete.mockResolvedValue({ success: true })
      mockBackupService.isAutoBackupEnabled.mockReturnValue(false)

      await service.deleteSpace('space-1')

      expect(mockBackupService.createBackup).not.toHaveBeenCalled()
    })
  })

  describe('duplicateSpace', () => {
    it('should duplicate space with default name', async () => {
      mockRepository.findById.mockResolvedValue(mockSpace)
      mockRepository.nameExists.mockResolvedValue(false)
      mockRepository.create.mockResolvedValue({ success: true, data: { ...mockSpace, id: 'space-2' } })

      const result = await service.duplicateSpace('space-1')

      expect(result.success).toBe(true)
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Space - Copy'
        })
      )
    })

    it('should duplicate space with custom name', async () => {
      mockRepository.findById.mockResolvedValue(mockSpace)
      mockRepository.nameExists.mockResolvedValue(false)
      mockRepository.create.mockResolvedValue({ success: true, data: { ...mockSpace, id: 'space-2' } })

      await service.duplicateSpace('space-1', 'Custom Name')

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Custom Name'
        })
      )
    })

    it('should not copy autoExecute setting', async () => {
      const autoExecuteSpace = { ...mockSpace, autoExecute: true }
      mockRepository.findById.mockResolvedValue(autoExecuteSpace)
      mockRepository.nameExists.mockResolvedValue(false)
      mockRepository.create.mockResolvedValue({ success: true, data: { ...mockSpace, id: 'space-2' } })

      await service.duplicateSpace('space-1')

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          autoExecute: false
        })
      )
    })

    it('should return error when original space not found', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const result = await service.duplicateSpace('non-existent')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Space not found')
    })
  })

  describe('addResource', () => {
    it('should add resource to space successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockSpace)
      mockRepository.exists.mockResolvedValue(true)
      mockRepository.nameExists.mockResolvedValue(false)
      mockRepository.update.mockResolvedValue({ success: true, data: mockSpace })

      const newResource: CreateResourceDto = {
        type: 'file',
        name: 'Document',
        path: '/path/to/doc.pdf',
        enabled: true,
        order: 1
      }

      const result = await service.addResource('space-1', newResource)

      expect(result.success).toBe(true)
      expect(mockRepository.update).toHaveBeenCalled()
    })

    it('should validate resource before adding', async () => {
      mockRepository.findById.mockResolvedValue(mockSpace)

      const invalidResource: CreateResourceDto = {
        type: 'file',
        name: '',
        path: '',
        enabled: true,
        order: 0
      }

      const result = await service.addResource('space-1', invalidResource)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Validation failed')
      expect(result.code).toBe('VALIDATION_FAILED')
    })

    it('should return error when space not found', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const resource: CreateResourceDto = {
        type: 'url',
        name: 'Test',
        path: 'https://test.com',
        enabled: true,
        order: 0
      }

      const result = await service.addResource('non-existent', resource)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Space not found')
    })

    it('should generate ID and timestamps for new resource', async () => {
      mockRepository.findById.mockResolvedValue(mockSpace)
      mockRepository.exists.mockResolvedValue(true)
      mockRepository.nameExists.mockResolvedValue(false)
      mockRepository.update.mockResolvedValue({ success: true, data: mockSpace })

      const resource: CreateResourceDto = {
        type: 'url',
        name: 'Test',
        path: 'https://test.com',
        enabled: true,
        order: 0
      }

      await service.addResource('space-1', resource)

      const updateCall = mockRepository.update.mock.calls[0][1]
      const addedResource = updateCall.resources[updateCall.resources.length - 1]
      expect(addedResource).toHaveProperty('id')
      expect(addedResource).toHaveProperty('createdAt')
      expect(addedResource).toHaveProperty('updatedAt')
    })
  })

  describe('searchSpaces', () => {
    it('should search by query string', async () => {
      const spaces = [
        mockSpace,
        { ...mockSpace, id: 'space-2', name: 'Another Space', description: 'Different description' }
      ]
      mockRepository.findAll.mockResolvedValue(spaces)

      const result = await service.searchSpaces({ query: 'test' })

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Test Space')
    })

    it('should search by tags', async () => {
      const spaces = [
        mockSpace,
        { ...mockSpace, id: 'space-2', tags: ['production'] }
      ]
      mockRepository.findAll.mockResolvedValue(spaces)

      const result = await service.searchSpaces({ tags: ['development'] })

      expect(result).toHaveLength(1)
      expect(result[0].tags).toContain('development')
    })

    it('should filter by hasResources', async () => {
      const spaces = [
        mockSpace,
        { ...mockSpace, id: 'space-2', resources: [] }
      ]
      mockRepository.findAll.mockResolvedValue(spaces)

      const result = await service.searchSpaces({ hasResources: true })

      expect(result).toHaveLength(1)
      expect(result[0].resources.length).toBeGreaterThan(0)
    })

    it('should filter by executionOrder', async () => {
      const spaces = [
        mockSpace,
        { ...mockSpace, id: 'space-2', executionOrder: 'parallel' as const }
      ]
      mockRepository.findAll.mockResolvedValue(spaces)

      const result = await service.searchSpaces({ executionOrder: 'sequential' })

      expect(result).toHaveLength(1)
      expect(result[0].executionOrder).toBe('sequential')
    })

    it('should return empty array on error', async () => {
      mockRepository.findAll.mockRejectedValue(new Error('Database error'))

      const result = await service.searchSpaces({ query: 'test' })

      expect(result).toEqual([])
    })
  })

  describe('getStatistics', () => {
    it('should calculate statistics correctly', async () => {
      const space1 = {
        ...mockSpace,
        resources: [mockSpace.resources[0]]
      }
      const space2 = {
        ...mockSpace,
        id: 'space-2',
        name: 'Space 2',
        autoExecute: true,
        resources: [
          {
            ...mockSpace.resources[0],
            id: 'res-2',
            type: 'url' as const,
            name: 'URL Resource',
            path: 'https://example.com'
          }
        ]
      }
      mockRepository.findAll.mockResolvedValue([space1, space2])

      const stats = await service.getStatistics()

      expect(stats.totalSpaces).toBe(2)
      expect(stats.totalResources).toBe(2)
      expect(stats.enabledSpaces).toBe(1)
      expect(stats.disabledSpaces).toBe(1)
      expect(stats.resourcesByType.application).toBe(1)
      expect(stats.resourcesByType.url).toBe(1)
    })

    it('should return zero stats on error', async () => {
      mockRepository.findAll.mockRejectedValue(new Error('Database error'))

      const stats = await service.getStatistics()

      expect(stats.totalSpaces).toBe(0)
      expect(stats.totalResources).toBe(0)
    })
  })

  describe('exportSpace', () => {
    it('should export space successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockSpace)

      const result = await service.exportSpace('space-1')

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('version')
      expect(result.data).toHaveProperty('exportedAt')
      expect(result.data?.space).toEqual(mockSpace)
    })

    it('should return error when space not found', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const result = await service.exportSpace('non-existent')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Space not found')
    })
  })

  describe('importSpace', () => {
    it('should import space successfully', async () => {
      const exportData: SpaceExport = {
        version: '1.0.0',
        exportedAt: '2025-01-01T00:00:00.000Z',
        space: mockSpace
      }
      mockRepository.nameExists.mockResolvedValue(false)
      mockRepository.create.mockResolvedValue({ success: true, data: { ...mockSpace, id: 'imported-space' } })

      const result = await service.importSpace(exportData)

      expect(result.success).toBe(true)
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining('Imported')
        })
      )
    })

    it('should reject invalid export format', async () => {
      const invalidExport = {
        version: '1.0.0'
      } as any

      const result = await service.importSpace(invalidExport)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid export format')
    })

    it('should add Imported suffix to space name', async () => {
      const exportData: SpaceExport = {
        version: '1.0.0',
        exportedAt: '2025-01-01T00:00:00.000Z',
        space: mockSpace
      }
      mockRepository.nameExists.mockResolvedValue(false)
      mockRepository.create.mockResolvedValue({ success: true, data: { ...mockSpace, id: 'imported-space' } })

      const result = await service.importSpace(exportData)

      expect(result.success).toBe(true)
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining('Imported')
        })
      )
    })
  })

  describe('getAllTags', () => {
    it('should return all unique tags', async () => {
      const tags = ['development', 'production', 'testing']
      mockRepository.getAllTags.mockResolvedValue(tags)

      const result = await service.getAllTags()

      expect(result).toEqual(tags)
      expect(mockRepository.getAllTags).toHaveBeenCalled()
    })

    it('should return empty array on error', async () => {
      mockRepository.getAllTags.mockRejectedValue(new Error('Database error'))

      const result = await service.getAllTags()

      expect(result).toEqual([])
    })
  })
})
