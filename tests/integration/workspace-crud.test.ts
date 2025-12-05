/**
 * Workspace CRUD Integration Tests
 * Tests the complete workspace CRUD flow with all services
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { FileSystemService } from '../../src/main/services/FileSystemService'
import { BackupService } from '../../src/main/services/BackupService'
import { createEventBus } from '../../src/shared/utils/event-bus'
import { SpaceService } from '../../src/modules/workspace/services/SpaceService'
import { CreateSpaceDto, CreateResourceDto } from '../../src/modules/workspace/types/workspace.types'

describe('Workspace CRUD Integration', () => {
  let testDir: string
  let fileSystem: FileSystemService
  let backupService: BackupService
  let spaceService: SpaceService

  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(os.tmpdir(), `workspace-integration-test-${Date.now()}`)
    await fs.promises.mkdir(testDir, { recursive: true })

    // Initialize services
    fileSystem = new FileSystemService(testDir)
    backupService = new BackupService(fileSystem)
    const eventBus = createEventBus()
    spaceService = new SpaceService(fileSystem, backupService, eventBus)
  })

  afterEach(async () => {
    // Cleanup
    try {
      await fs.promises.rm(testDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  describe('Complete CRUD Flow', () => {
    it('should create, read, update, and delete a space', async () => {
      // CREATE
      const createDto: CreateSpaceDto = {
        name: 'Development Space',
        description: 'My development workspace',
        icon: '💻',
        color: '#3B82F6',
        resources: [
          {
            type: 'application',
            name: 'VS Code',
            path: '/usr/local/bin/code',
            enabled: true,
            order: 0
          },
          {
            type: 'url',
            name: 'GitHub',
            path: 'https://github.com',
            enabled: true,
            order: 1
          }
        ],
        executionOrder: 'sequential',
        autoExecute: false,
        tags: ['development', 'work']
      }

      const createResult = await spaceService.createSpace(createDto)
      expect(createResult.success).toBe(true)
      expect(createResult.data).toBeDefined()
      const createdSpace = createResult.data!

      expect(createdSpace.id).toBeDefined()
      expect(createdSpace.name).toBe('Development Space')
      expect(createdSpace.resources).toHaveLength(2)
      expect(createdSpace.resources[0].id).toBeDefined()
      expect(createdSpace.resources[1].id).toBeDefined()
      expect(createdSpace.createdAt).toBeDefined()
      expect(createdSpace.updatedAt).toBeDefined()

      // READ ALL
      const allSpaces = await spaceService.getAllSpaces()
      expect(allSpaces).toHaveLength(1)
      expect(allSpaces[0].id).toBe(createdSpace.id)

      // READ BY ID
      const getResult = await spaceService.getSpaceById(createdSpace.id)
      expect(getResult.success).toBe(true)
      expect(getResult.data).toBeDefined()
      expect(getResult.data!.name).toBe('Development Space')

      // UPDATE
      const updateResult = await spaceService.updateSpace(createdSpace.id, {
        name: 'Updated Development Space',
        description: 'Updated description',
        color: '#10B981'
      })

      expect(updateResult.success).toBe(true)
      expect(updateResult.data!.name).toBe('Updated Development Space')
      expect(updateResult.data!.description).toBe('Updated description')
      expect(updateResult.data!.color).toBe('#10B981')
      expect(updateResult.data!.resources).toHaveLength(2) // Resources unchanged

      // DELETE
      const deleteResult = await spaceService.deleteSpace(createdSpace.id)
      expect(deleteResult.success).toBe(true)

      // Verify deletion
      const afterDelete = await spaceService.getAllSpaces()
      expect(afterDelete).toHaveLength(0)
    })

    it('should prevent duplicate space names', async () => {
      const dto1: CreateSpaceDto = {
        name: 'Unique Space',
        resources: [],
        executionOrder: 'sequential'
      }

      const dto2: CreateSpaceDto = {
        name: 'Unique Space',
        resources: [],
        executionOrder: 'parallel'
      }

      const result1 = await spaceService.createSpace(dto1)
      expect(result1.success).toBe(true)

      const result2 = await spaceService.createSpace(dto2)
      expect(result2.success).toBe(false)
      expect(result2.code).toBe('DUPLICATE_NAME')
      expect(result2.error).toContain('already exists')
    })

    it('should validate space data', async () => {
      const invalidDto: CreateSpaceDto = {
        name: '',
        resources: [],
        executionOrder: 'sequential'
      }

      const result = await spaceService.createSpace(invalidDto)
      expect(result.success).toBe(false)
      expect(result.code).toBe('VALIDATION_FAILED')
      expect(result.error).toContain('Validation failed')
    })
  })

  describe('Resource Management', () => {
    it('should add resources to existing space', async () => {
      // Create initial space
      const createResult = await spaceService.createSpace({
        name: 'Test Space',
        resources: [],
        executionOrder: 'sequential'
      })

      expect(createResult.success).toBe(true)
      const spaceId = createResult.data!.id

      // Add first resource
      const resource1: CreateResourceDto = {
        type: 'application',
        name: 'Terminal',
        path: '/usr/bin/bash',
        enabled: true,
        order: 0
      }

      const addResult1 = await spaceService.addResource(spaceId, resource1)
      expect(addResult1.success).toBe(true)
      expect(addResult1.data!.resources).toHaveLength(1)
      expect(addResult1.data!.resources[0].name).toBe('Terminal')

      // Add second resource
      const resource2: CreateResourceDto = {
        type: 'url',
        name: 'Documentation',
        path: 'https://docs.example.com',
        enabled: true,
        order: 1
      }

      const addResult2 = await spaceService.addResource(spaceId, resource2)
      expect(addResult2.success).toBe(true)
      expect(addResult2.data!.resources).toHaveLength(2)
    })

    it('should validate resources before adding', async () => {
      const createResult = await spaceService.createSpace({
        name: 'Test Space',
        resources: [],
        executionOrder: 'sequential'
      })

      const spaceId = createResult.data!.id

      const invalidResource: CreateResourceDto = {
        type: 'application',
        name: '',
        path: '',
        enabled: true,
        order: 0
      }

      const result = await spaceService.addResource(spaceId, invalidResource)
      expect(result.success).toBe(false)
      expect(result.code).toBe('VALIDATION_FAILED')
    })
  })

  describe('Search and Filter', () => {
    beforeEach(async () => {
      // Create multiple spaces for search testing
      await spaceService.createSpace({
        name: 'Development',
        description: 'Dev workspace',
        resources: [
          {
            type: 'application',
            name: 'VS Code',
            path: '/usr/bin/code',
            enabled: true,
            order: 0
          }
        ],
        executionOrder: 'sequential',
        tags: ['dev', 'coding']
      })

      await spaceService.createSpace({
        name: 'Production',
        description: 'Prod environment',
        resources: [],
        executionOrder: 'parallel',
        autoExecute: true,
        tags: ['prod', 'deploy']
      })

      await spaceService.createSpace({
        name: 'Testing',
        description: 'QA workspace',
        resources: [],
        executionOrder: 'sequential',
        tags: ['test', 'qa']
      })
    })

    it('should search by query string', async () => {
      const results = await spaceService.searchSpaces({ query: 'dev' })
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Development')
    })

    it('should filter by tags', async () => {
      const results = await spaceService.searchSpaces({ tags: ['prod'] })
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Production')
    })

    it('should filter by execution order', async () => {
      const results = await spaceService.searchSpaces({ executionOrder: 'parallel' })
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Production')
    })

    it('should filter by resource presence', async () => {
      const results = await spaceService.searchSpaces({ hasResources: true })
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Development')
    })

    it('should sort spaces by name', async () => {
      const results = await spaceService.getAllSpaces({ field: 'name', order: 'asc' })
      expect(results[0].name).toBe('Development')
      expect(results[1].name).toBe('Production')
      expect(results[2].name).toBe('Testing')
    })
  })

  describe('Duplicate Space', () => {
    it('should duplicate space with new name', async () => {
      const original = await spaceService.createSpace({
        name: 'Original Space',
        description: 'Original description',
        resources: [
          {
            type: 'url',
            name: 'Example',
            path: 'https://example.com',
            enabled: true,
            order: 0
          }
        ],
        executionOrder: 'sequential',
        autoExecute: true,
        tags: ['tag1']
      })

      const duplicateResult = await spaceService.duplicateSpace(original.data!.id, 'Duplicated Space')
      expect(duplicateResult.success).toBe(true)
      expect(duplicateResult.data!.name).toBe('Duplicated Space')
      expect(duplicateResult.data!.description).toBe('Original description')
      expect(duplicateResult.data!.resources).toHaveLength(1)
      expect(duplicateResult.data!.autoExecute).toBe(false) // Should not copy autoExecute

      const allSpaces = await spaceService.getAllSpaces()
      expect(allSpaces).toHaveLength(2)
    })

    it('should duplicate with default copy name', async () => {
      const original = await spaceService.createSpace({
        name: 'Original',
        resources: [],
        executionOrder: 'sequential'
      })

      const duplicateResult = await spaceService.duplicateSpace(original.data!.id)
      expect(duplicateResult.success).toBe(true)
      expect(duplicateResult.data!.name).toContain('Copy')
    })
  })

  describe('Import and Export', () => {
    it('should export and import space', async () => {
      const original = await spaceService.createSpace({
        name: 'Export Test',
        description: 'Test export',
        resources: [
          {
            type: 'application',
            name: 'App',
            path: '/usr/bin/app',
            enabled: true,
            order: 0
          }
        ],
        executionOrder: 'sequential',
        tags: ['test']
      })

      // Export
      const exportResult = await spaceService.exportSpace(original.data!.id)
      expect(exportResult.success).toBe(true)
      expect(exportResult.data).toBeDefined()
      expect(exportResult.data!.version).toBeDefined()
      expect(exportResult.data!.exportedAt).toBeDefined()
      expect(exportResult.data!.space).toBeDefined()

      // Import
      const importResult = await spaceService.importSpace(exportResult.data!)
      expect(importResult.success).toBe(true)
      expect(importResult.data!.name).toContain('Imported')
      expect(importResult.data!.resources).toHaveLength(1)

      const allSpaces = await spaceService.getAllSpaces()
      expect(allSpaces).toHaveLength(2)
    })
  })

  describe('Statistics', () => {
    beforeEach(async () => {
      await spaceService.createSpace({
        name: 'Space 1',
        resources: [
          { type: 'application', name: 'App1', path: '/app1', enabled: true, order: 0 },
          { type: 'url', name: 'URL1', path: 'https://url1.com', enabled: true, order: 1 }
        ],
        executionOrder: 'sequential',
        autoExecute: true,
        tags: ['tag1', 'tag2']
      })

      await spaceService.createSpace({
        name: 'Space 2',
        resources: [
          { type: 'file', name: 'File1', path: '/file1', enabled: true, order: 0 }
        ],
        executionOrder: 'parallel',
        tags: ['tag2', 'tag3']
      })
    })

    it('should calculate correct statistics', async () => {
      const stats = await spaceService.getStatistics()

      expect(stats.totalSpaces).toBe(2)
      expect(stats.totalResources).toBe(3)
      expect(stats.enabledSpaces).toBe(1) // Only Space 1 has autoExecute
      expect(stats.disabledSpaces).toBe(1)
      expect(stats.resourcesByType.application).toBe(1)
      expect(stats.resourcesByType.url).toBe(1)
      expect(stats.resourcesByType.file).toBe(1)
    })
  })

  describe('Get All Tags', () => {
    it('should return all unique tags', async () => {
      await spaceService.createSpace({
        name: 'Space 1',
        resources: [],
        executionOrder: 'sequential',
        tags: ['dev', 'test']
      })

      await spaceService.createSpace({
        name: 'Space 2',
        resources: [],
        executionOrder: 'sequential',
        tags: ['test', 'prod']
      })

      const tags = await spaceService.getAllTags()
      expect(tags).toHaveLength(3)
      expect(tags).toContain('dev')
      expect(tags).toContain('test')
      expect(tags).toContain('prod')
    })
  })

  describe('Data Persistence', () => {
    it('should persist data across service instances', async () => {
      // Create space with first service instance
      const createResult = await spaceService.createSpace({
        name: 'Persistent Space',
        description: 'Should persist',
        resources: [],
        executionOrder: 'sequential'
      })

      expect(createResult.success).toBe(true)
      const spaceId = createResult.data!.id

      // Create new service instance with same filesystem
      const eventBus2 = createEventBus()
      const spaceService2 = new SpaceService(fileSystem, backupService, eventBus2)

      // Verify data persisted
      const getResult = await spaceService2.getSpaceById(spaceId)
      expect(getResult.success).toBe(true)
      expect(getResult.data!.name).toBe('Persistent Space')

      const allSpaces = await spaceService2.getAllSpaces()
      expect(allSpaces).toHaveLength(1)
    })

    it('should handle concurrent updates safely', async () => {
      const createResult = await spaceService.createSpace({
        name: 'Concurrent Test',
        resources: [],
        executionOrder: 'sequential'
      })

      const spaceId = createResult.data!.id

      // Perform concurrent updates
      const updates = await Promise.all([
        spaceService.updateSpace(spaceId, { description: 'Update 1' }),
        spaceService.updateSpace(spaceId, { description: 'Update 2' }),
        spaceService.updateSpace(spaceId, { description: 'Update 3' })
      ])

      // All updates should succeed
      updates.forEach(result => {
        expect(result.success).toBe(true)
      })

      // Verify final state
      const finalSpace = await spaceService.getSpaceById(spaceId)
      expect(finalSpace.success).toBe(true)
      expect(finalSpace.data!.description).toBeDefined()
    })
  })
})
