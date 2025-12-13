/**
 * IFileSystemService Interface
 * File system service interface for dependency injection
 * Phase 5.5 Sprint 5.5.1 - Dependency Injection Infrastructure
 */

import type { Result } from '../types/common.types'

export interface IFileSystemService {
  /**
   * Read file from disk
   */
  readFile(filePath: string): Promise<Result<string>>

  /**
   * Write file to disk
   */
  writeFile(filePath: string, data: string): Promise<Result<void>>

  /**
   * Check if file exists
   */
  fileExists(filePath: string): Promise<boolean>

  /**
   * Create directory
   */
  createDirectory(dirPath: string): Promise<Result<void>>

  /**
   * Delete file
   */
  deleteFile(filePath: string): Promise<Result<void>>

  /**
   * Copy file
   */
  copyFile(sourcePath: string, destPath: string): Promise<Result<void>>

  /**
   * List files in directory
   */
  listFiles(dirPath: string): Promise<Result<string[]>>
}
