/**
 * Data Persistence Integration Tests
 * Tests the complete data persistence flow with all services
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { FileSystemService } from '../../src/main/services/FileSystemService'
import { BackupService } from '../../src/main/services/BackupService'
import { BaseRepository } from '../../src/main/services/DataStoreService'
import { Space } from '../../src/shared/types/data-store.types'
import spaceSchema from '../../src/main/schemas/space.schema.json'

/**
 * Test repository implementation
 */
class TestSpaceRepository extends BaseRepository<Space> {
  protected getFilePath(): string {
    return 'data/spaces.json'
  }
}

describe('Data Persistence Integration', () => {
  let testDir: string
  let fileSystem: FileSystemService
  let backupService: BackupService
  let repository: TestSpaceRepository

  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(os.tmpdir(), `integration-test-${Date.now()}`)
    await fs.promises.mkdir(testDir, { recursive: true })

    // Initialize services
    fileSystem = new FileSystemService(testDir)
    backupService = new BackupService(fileSystem)
    repository = new TestSpaceRepository(fileSystem, spaceSchema)
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
      const createResult = await repository.create({
        name: 'Test Space',
        description: 'A test workspace',
        icon: '🚀',
        color: '#667eea',
        resources: [],
        executionOrder: 'sequential',
        autoExecute: false,
        tags: ['test', 'development']
      })

      expect(createResult.success).toBe(true)
      expect(createResult.data).toBeDefined()
      const createdSpace = createResult.data!

      // READ ALL
      const allSpaces = await repository.findAll()
      expect(allSpaces).toHaveLength(1)
      expect(allSpaces[0].id).toBe(createdSpace.id)

      // READ BY ID
      const foundSpace = await repository.findById(createdSpace.id)
      expect(foundSpace).toBeDefined()
      expect(foundSpace!.name).toBe('Test Space')

      // UPDATE
      const updateResult = await repository.update(createdSpace.id, {
        name: 'Updated Space',
        description: 'Updated description'
      })

      expect(updateResult.success).toBe(true)
      expect(updateResult.data!.name).toBe('Updated Space')
      expect(updateResult.data!.description).toBe('Updated description')
      expect(updateResult.data!.createdAt).toBe(createdSpace.createdAt) // Should preserve
      expect(updateResult.data!.updatedAt).not.toBe(createdSpace.updatedAt) // Should update

      // DELETE
      const deleteResult = await repository.delete(createdSpace.id)
      expect(deleteResult.success).toBe(true)

      const afterDelete = await repository.findAll()
      expect(afterDelete).toHaveLength(0)
    })

    it('should handle multiple spaces', async () => {
      // Create multiple spaces
      const space1 = await repository.create({
        name: 'Space 1',
        resources: [],
        executionOrder: 'sequential'
      })

      const space2 = await repository.create({
        name: 'Space 2',
        resources: [],
        executionOrder: 'parallel'
      })

      const space3 = await repository.create({
        name: 'Space 3',
        resources: [],
        executionOrder: 'sequential'
      })

      expect(space1.success).toBe(true)
      expect(space2.success).toBe(true)
      expect(space3.success).toBe(true)

      // Read all
      const allSpaces = await repository.findAll()
      expect(allSpaces).toHaveLength(3)

      // Count
      const count = await repository.count()
      expect(count).toBe(3)

      // Delete one
      await repository.delete(space2.data!.id)

      const afterDelete = await repository.findAll()
      expect(afterDelete).toHaveLength(2)
      expect(afterDelete.find((s) => s.id === space2.data!.id)).toBeUndefined()
    })
  })

  describe('Backup Integration', () => {
    it('should create backups of data files', async () => {
      // Create a space
      await repository.create({
        name: 'Backup Test',
        resources: [],
        executionOrder: 'sequential'
      })

      // Create backup
      const backupResult = await backupService.createBackup(
        'data/spaces.json',
        'Test backup'
      )

      expect(backupResult.success).toBe(true)
      expect(backupResult.data).toBeDefined()

      // List backups
      const listResult = await backupService.listBackups()
      expect(listResult.success).toBe(true)
      expect(listResult.data).toHaveLength(1)
      expect(listResult.data![0].description).toBe('Test backup')
    })

    it('should restore from backup', async () => {
      // Create original data
      await repository.create({
        name: 'Original Space',
        resources: [],
        executionOrder: 'sequential'
      })

      // Create backup
      const backupResult = await backupService.createBackup('data/spaces.json')
      expect(backupResult.success).toBe(true)

      // Modify data
      await repository.create({
        name: 'New Space',
        resources: [],
        executionOrder: 'parallel'
      })

      let spaces = await repository.findAll()
      expect(spaces).toHaveLength(2)

      // Restore backup
      const restoreResult = await backupService.restoreBackup(
        backupResult.data!.fileName,
        'data/spaces.json'
      )
      expect(restoreResult.success).toBe(true)

      // Verify restored data
      spaces = await repository.findAll()
      expect(spaces).toHaveLength(1)
      expect(spaces[0].name).toBe('Original Space')
    })
  })

  describe('Validation', () => {
    it('should validate data against schema', async () => {
      // Valid space should succeed
      const validResult = await repository.create({
        name: 'Valid Space',
        resources: [],
        executionOrder: 'sequential'
      })

      expect(validResult.success).toBe(true)
    })

    it('should reject invalid execution order', async () => {
      const invalidResult = await repository.create({
        name: 'Invalid Space',
        resources: [],
        executionOrder: 'invalid' as any
      })

      expect(invalidResult.success).toBe(false)
      expect(invalidResult.code).toBe('VALIDATION_FAILED')
    })
  })

  describe('Error Handling', () => {
    it('should handle non-existent item gracefully', async () => {
      const result = await repository.findById('non-existent-id')
      expect(result).toBeNull()
    })

    it('should return error when updating non-existent item', async () => {
      const result = await repository.update('non-existent-id', { name: 'Test' })
      expect(result.success).toBe(false)
    })

    it('should return error when deleting non-existent item', async () => {
      const result = await repository.delete('non-existent-id')
      expect(result.success).toBe(false)
    })

    it('should check if item exists', async () => {
      const createResult = await repository.create({
        name: 'Test',
        resources: [],
        executionOrder: 'sequential'
      })

      const exists = await repository.exists(createResult.data!.id)
      expect(exists).toBe(true)

      const notExists = await repository.exists('non-existent')
      expect(notExists).toBe(false)
    })
  })

  describe('Data Persistence', () => {
    it('should persist data across repository instances', async () => {
      // Create space with first instance
      const createResult = await repository.create({
        name: 'Persistent Space',
        resources: [],
        executionOrder: 'sequential'
      })

      expect(createResult.success).toBe(true)

      // Create new repository instance
      const newRepository = new TestSpaceRepository(fileSystem, spaceSchema)

      // Should be able to read data created by first instance
      const spaces = await newRepository.findAll()
      expect(spaces).toHaveLength(1)
      expect(spaces[0].name).toBe('Persistent Space')
    })
  })
})
