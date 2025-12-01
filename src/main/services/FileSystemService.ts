/**
 * FileSystemService
 * Handles all file system operations with robust error handling
 */

import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'
import { logger } from '../../shared/utils/logger'
import { Result } from '../../shared/types/common.types'
import { FileSystemOptions } from '../../shared/types/data-store.types'

/**
 * File system error codes
 */
export enum FileSystemErrorCode {
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  DIRECTORY_NOT_FOUND = 'DIRECTORY_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_PATH = 'INVALID_PATH',
  PARSE_ERROR = 'PARSE_ERROR',
  WRITE_ERROR = 'WRITE_ERROR',
  READ_ERROR = 'READ_ERROR',
  DELETE_ERROR = 'DELETE_ERROR'
}

/**
 * FileSystemService class
 * Provides abstraction over Node.js file system with error handling
 */
export class FileSystemService {
  private basePath: string

  constructor(basePath?: string) {
    // Use Electron's userData directory by default
    this.basePath = basePath || app.getPath('userData')
    logger.info('FileSystemService initialized', { basePath: this.basePath })
  }

  /**
   * Get the base path for all operations
   */
  getBasePath(): string {
    return this.basePath
  }

  /**
   * Get full path by joining with base path
   */
  getFullPath(relativePath: string): string {
    return path.join(this.basePath, relativePath)
  }

  /**
   * Check if a file or directory exists
   */
  async exists(filePath: string): Promise<boolean> {
    const fullPath = this.getFullPath(filePath)
    try {
      await fs.promises.access(fullPath, fs.constants.F_OK)
      return true
    } catch {
      return false
    }
  }

  /**
   * Create directory (recursive by default)
   */
  async createDirectory(dirPath: string): Promise<Result<void>> {
    const fullPath = this.getFullPath(dirPath)
    try {
      await fs.promises.mkdir(fullPath, { recursive: true })
      logger.debug('Directory created', { path: fullPath })
      return { success: true }
    } catch (error) {
      logger.error('Failed to create directory', error, { path: fullPath })
      return {
        success: false,
        error: 'Failed to create directory',
        code: FileSystemErrorCode.WRITE_ERROR
      }
    }
  }

  /**
   * Read file as string
   */
  async readFile(
    filePath: string,
    options: FileSystemOptions = {}
  ): Promise<Result<string>> {
    const fullPath = this.getFullPath(filePath)
    const encoding = options.encoding || 'utf-8'

    try {
      const content = await fs.promises.readFile(fullPath, encoding)
      logger.debug('File read successfully', { path: fullPath })
      return { success: true, data: content }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.warn('File not found', { path: fullPath })
        return {
          success: false,
          error: `File not found: ${filePath}`,
          code: FileSystemErrorCode.FILE_NOT_FOUND
        }
      }

      if (error.code === 'EACCES' || error.code === 'EPERM') {
        logger.error('Permission denied reading file', error, { path: fullPath })
        return {
          success: false,
          error: 'Permission denied',
          code: FileSystemErrorCode.PERMISSION_DENIED
        }
      }

      logger.error('Failed to read file', error, { path: fullPath })
      return {
        success: false,
        error: 'Failed to read file',
        code: FileSystemErrorCode.READ_ERROR
      }
    }
  }

  /**
   * Write file as string
   */
  async writeFile(
    filePath: string,
    content: string,
    options: FileSystemOptions = {}
  ): Promise<Result<void>> {
    const fullPath = this.getFullPath(filePath)
    const encoding = options.encoding || 'utf-8'

    try {
      // Create parent directory if needed
      if (options.createDirectories !== false) {
        const dirPath = path.dirname(fullPath)
        await fs.promises.mkdir(dirPath, { recursive: true })
      }

      // Check if file exists and overwrite is false
      if (options.overwrite === false && (await this.exists(filePath))) {
        return {
          success: false,
          error: 'File already exists',
          code: FileSystemErrorCode.WRITE_ERROR
        }
      }

      await fs.promises.writeFile(fullPath, content, encoding)
      logger.debug('File written successfully', { path: fullPath })
      return { success: true }
    } catch (error: any) {
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        logger.error('Permission denied writing file', error, { path: fullPath })
        return {
          success: false,
          error: 'Permission denied',
          code: FileSystemErrorCode.PERMISSION_DENIED
        }
      }

      logger.error('Failed to write file', error, { path: fullPath })
      return {
        success: false,
        error: 'Failed to write file',
        code: FileSystemErrorCode.WRITE_ERROR
      }
    }
  }

  /**
   * Read JSON file
   */
  async readJSON<T>(filePath: string): Promise<Result<T>> {
    const result = await this.readFile(filePath)

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error,
        code: result.code
      }
    }

    try {
      const data = JSON.parse(result.data) as T
      logger.debug('JSON file parsed successfully', { path: filePath })
      return { success: true, data }
    } catch (error) {
      logger.error('Failed to parse JSON file', error, { path: filePath })
      return {
        success: false,
        error: 'Invalid JSON format',
        code: FileSystemErrorCode.PARSE_ERROR
      }
    }
  }

  /**
   * Write JSON file
   */
  async writeJSON(
    filePath: string,
    data: any,
    options: FileSystemOptions = {}
  ): Promise<Result<void>> {
    try {
      const content = JSON.stringify(data, null, 2)
      return await this.writeFile(filePath, content, options)
    } catch (error) {
      logger.error('Failed to stringify JSON', error, { path: filePath })
      return {
        success: false,
        error: 'Failed to serialize JSON',
        code: FileSystemErrorCode.WRITE_ERROR
      }
    }
  }

  /**
   * Delete file
   */
  async deleteFile(filePath: string): Promise<Result<void>> {
    const fullPath = this.getFullPath(filePath)

    try {
      await fs.promises.unlink(fullPath)
      logger.debug('File deleted successfully', { path: fullPath })
      return { success: true }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.warn('File not found for deletion', { path: fullPath })
        return {
          success: false,
          error: `File not found: ${filePath}`,
          code: FileSystemErrorCode.FILE_NOT_FOUND
        }
      }

      logger.error('Failed to delete file', error, { path: fullPath })
      return {
        success: false,
        error: 'Failed to delete file',
        code: FileSystemErrorCode.DELETE_ERROR
      }
    }
  }

  /**
   * Delete directory (recursive)
   */
  async deleteDirectory(dirPath: string): Promise<Result<void>> {
    const fullPath = this.getFullPath(dirPath)

    try {
      await fs.promises.rm(fullPath, { recursive: true, force: true })
      logger.debug('Directory deleted successfully', { path: fullPath })
      return { success: true }
    } catch (error: any) {
      logger.error('Failed to delete directory', error, { path: fullPath })
      return {
        success: false,
        error: 'Failed to delete directory',
        code: FileSystemErrorCode.DELETE_ERROR
      }
    }
  }

  /**
   * Copy file
   */
  async copyFile(sourcePath: string, destPath: string): Promise<Result<void>> {
    const fullSourcePath = this.getFullPath(sourcePath)
    const fullDestPath = this.getFullPath(destPath)

    try {
      // Create destination directory if needed
      const destDir = path.dirname(fullDestPath)
      await fs.promises.mkdir(destDir, { recursive: true })

      await fs.promises.copyFile(fullSourcePath, fullDestPath)
      logger.debug('File copied successfully', {
        source: fullSourcePath,
        dest: fullDestPath
      })
      return { success: true }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return {
          success: false,
          error: `Source file not found: ${sourcePath}`,
          code: FileSystemErrorCode.FILE_NOT_FOUND
        }
      }

      logger.error('Failed to copy file', error, { source: sourcePath, dest: destPath })
      return {
        success: false,
        error: 'Failed to copy file',
        code: FileSystemErrorCode.WRITE_ERROR
      }
    }
  }

  /**
   * Get file stats
   */
  async getStats(filePath: string): Promise<Result<fs.Stats>> {
    const fullPath = this.getFullPath(filePath)

    try {
      const stats = await fs.promises.stat(fullPath)
      return { success: true, data: stats }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return {
          success: false,
          error: `File not found: ${filePath}`,
          code: FileSystemErrorCode.FILE_NOT_FOUND
        }
      }

      logger.error('Failed to get file stats', error, { path: fullPath })
      return {
        success: false,
        error: 'Failed to get file stats',
        code: FileSystemErrorCode.READ_ERROR
      }
    }
  }

  /**
   * List files in directory
   */
  async listFiles(dirPath: string): Promise<Result<string[]>> {
    const fullPath = this.getFullPath(dirPath)

    try {
      const files = await fs.promises.readdir(fullPath)
      return { success: true, data: files }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return {
          success: false,
          error: `Directory not found: ${dirPath}`,
          code: FileSystemErrorCode.DIRECTORY_NOT_FOUND
        }
      }

      logger.error('Failed to list directory', error, { path: fullPath })
      return {
        success: false,
        error: 'Failed to list directory',
        code: FileSystemErrorCode.READ_ERROR
      }
    }
  }
}

/**
 * Create singleton instance
 */
let instance: FileSystemService | null = null

export function createFileSystemService(basePath?: string): FileSystemService {
  if (!instance) {
    instance = new FileSystemService(basePath)
  }
  return instance
}

export function getFileSystemService(): FileSystemService {
  if (!instance) {
    instance = new FileSystemService()
  }
  return instance
}
