/**
 * FileSystemService Unit Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import {
  FileSystemService,
  FileSystemErrorCode
} from '../../../src/main/services/FileSystemService'

describe('FileSystemService', () => {
  let service: FileSystemService
  let testDir: string

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = path.join(os.tmpdir(), `fs-test-${Date.now()}`)
    service = new FileSystemService(testDir)
    await fs.promises.mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    // Cleanup test directory
    try {
      await fs.promises.rm(testDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  describe('constructor', () => {
    it('should initialize with provided base path', () => {
      expect(service.getBasePath()).toBe(testDir)
    })
  })

  describe('exists', () => {
    it('should return true for existing file', async () => {
      const filePath = 'test.txt'
      await fs.promises.writeFile(path.join(testDir, filePath), 'test content')

      const exists = await service.exists(filePath)
      expect(exists).toBe(true)
    })

    it('should return false for non-existing file', async () => {
      const exists = await service.exists('non-existent.txt')
      expect(exists).toBe(false)
    })
  })

  describe('createDirectory', () => {
    it('should create directory successfully', async () => {
      const result = await service.createDirectory('new-dir')

      expect(result.success).toBe(true)
      const exists = await service.exists('new-dir')
      expect(exists).toBe(true)
    })

    it('should create nested directories', async () => {
      const result = await service.createDirectory('parent/child/grandchild')

      expect(result.success).toBe(true)
      const exists = await service.exists('parent/child/grandchild')
      expect(exists).toBe(true)
    })
  })

  describe('readFile', () => {
    it('should read file successfully', async () => {
      const filePath = 'test.txt'
      const content = 'Hello, World!'
      await fs.promises.writeFile(path.join(testDir, filePath), content)

      const result = await service.readFile(filePath)

      expect(result.success).toBe(true)
      expect(result.data).toBe(content)
    })

    it('should return error for non-existent file', async () => {
      const result = await service.readFile('non-existent.txt')

      expect(result.success).toBe(false)
      expect(result.code).toBe(FileSystemErrorCode.FILE_NOT_FOUND)
    })
  })

  describe('writeFile', () => {
    it('should write file successfully', async () => {
      const filePath = 'test.txt'
      const content = 'Test content'

      const result = await service.writeFile(filePath, content)

      expect(result.success).toBe(true)
      const fileContent = await fs.promises.readFile(path.join(testDir, filePath), 'utf-8')
      expect(fileContent).toBe(content)
    })

    it('should create parent directories automatically', async () => {
      const filePath = 'parent/child/test.txt'
      const content = 'Test content'

      const result = await service.writeFile(filePath, content)

      expect(result.success).toBe(true)
      const exists = await service.exists(filePath)
      expect(exists).toBe(true)
    })

    it('should not overwrite if overwrite is false and file exists', async () => {
      const filePath = 'test.txt'
      await fs.promises.writeFile(path.join(testDir, filePath), 'original')

      const result = await service.writeFile(filePath, 'new content', { overwrite: false })

      expect(result.success).toBe(false)
      const content = await fs.promises.readFile(path.join(testDir, filePath), 'utf-8')
      expect(content).toBe('original')
    })
  })

  describe('readJSON', () => {
    it('should read and parse JSON file', async () => {
      const filePath = 'data.json'
      const data = { name: 'Test', value: 123 }
      await fs.promises.writeFile(path.join(testDir, filePath), JSON.stringify(data))

      const result = await service.readJSON<typeof data>(filePath)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(data)
    })

    it('should return error for invalid JSON', async () => {
      const filePath = 'invalid.json'
      await fs.promises.writeFile(path.join(testDir, filePath), 'not valid json{')

      const result = await service.readJSON(filePath)

      expect(result.success).toBe(false)
      expect(result.code).toBe(FileSystemErrorCode.PARSE_ERROR)
    })
  })

  describe('writeJSON', () => {
    it('should write JSON file with formatting', async () => {
      const filePath = 'data.json'
      const data = { name: 'Test', value: 123 }

      const result = await service.writeJSON(filePath, data)

      expect(result.success).toBe(true)
      const content = await fs.promises.readFile(path.join(testDir, filePath), 'utf-8')
      const parsed = JSON.parse(content)
      expect(parsed).toEqual(data)
    })
  })

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const filePath = 'test.txt'
      await fs.promises.writeFile(path.join(testDir, filePath), 'content')

      const result = await service.deleteFile(filePath)

      expect(result.success).toBe(true)
      const exists = await service.exists(filePath)
      expect(exists).toBe(false)
    })

    it('should return error for non-existent file', async () => {
      const result = await service.deleteFile('non-existent.txt')

      expect(result.success).toBe(false)
      expect(result.code).toBe(FileSystemErrorCode.FILE_NOT_FOUND)
    })
  })

  describe('deleteDirectory', () => {
    it('should delete directory and contents', async () => {
      const dirPath = 'test-dir'
      await service.createDirectory(dirPath)
      await service.writeFile(`${dirPath}/file.txt`, 'content')

      const result = await service.deleteDirectory(dirPath)

      expect(result.success).toBe(true)
      const exists = await service.exists(dirPath)
      expect(exists).toBe(false)
    })
  })

  describe('copyFile', () => {
    it('should copy file successfully', async () => {
      const sourcePath = 'source.txt'
      const destPath = 'dest.txt'
      const content = 'Test content'
      await fs.promises.writeFile(path.join(testDir, sourcePath), content)

      const result = await service.copyFile(sourcePath, destPath)

      expect(result.success).toBe(true)
      const destContent = await fs.promises.readFile(path.join(testDir, destPath), 'utf-8')
      expect(destContent).toBe(content)
    })

    it('should return error for non-existent source', async () => {
      const result = await service.copyFile('non-existent.txt', 'dest.txt')

      expect(result.success).toBe(false)
      expect(result.code).toBe(FileSystemErrorCode.FILE_NOT_FOUND)
    })
  })

  describe('getStats', () => {
    it('should return file stats', async () => {
      const filePath = 'test.txt'
      const content = 'Test content'
      await fs.promises.writeFile(path.join(testDir, filePath), content)

      const result = await service.getStats(filePath)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data!.size).toBe(content.length)
    })

    it('should return error for non-existent file', async () => {
      const result = await service.getStats('non-existent.txt')

      expect(result.success).toBe(false)
      expect(result.code).toBe(FileSystemErrorCode.FILE_NOT_FOUND)
    })
  })

  describe('listFiles', () => {
    it('should list files in directory', async () => {
      await service.writeFile('file1.txt', 'content1')
      await service.writeFile('file2.txt', 'content2')

      const result = await service.listFiles('.')

      expect(result.success).toBe(true)
      expect(result.data).toContain('file1.txt')
      expect(result.data).toContain('file2.txt')
    })

    it('should return error for non-existent directory', async () => {
      const result = await service.listFiles('non-existent-dir')

      expect(result.success).toBe(false)
      expect(result.code).toBe(FileSystemErrorCode.DIRECTORY_NOT_FOUND)
    })
  })
})
