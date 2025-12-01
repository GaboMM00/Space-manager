/**
 * BackupService
 * Handles automatic backups of data store files
 */

import * as path from 'path'
import { logger } from '../../shared/utils/logger'
import { Result } from '../../shared/types/common.types'
import { BackupMetadata } from '../../shared/types/data-store.types'
import { FileSystemService } from './FileSystemService'

/**
 * Backup configuration
 */
export interface BackupConfig {
  maxBackups?: number // Maximum number of backups to keep
  backupDir?: string // Relative path to backup directory
  autoBackup?: boolean // Enable automatic backups
}

/**
 * Default backup configuration
 */
const DEFAULT_BACKUP_CONFIG: Required<BackupConfig> = {
  maxBackups: 10,
  backupDir: 'backups',
  autoBackup: true
}

/**
 * BackupService class
 */
export class BackupService {
  private config: Required<BackupConfig>

  constructor(
    private fileSystem: FileSystemService,
    config: BackupConfig = {}
  ) {
    this.config = { ...DEFAULT_BACKUP_CONFIG, ...config }
    logger.info('BackupService initialized', { config: this.config })
    this.initializeBackupDirectory()
  }

  /**
   * Initialize backup directory
   */
  private async initializeBackupDirectory(): Promise<void> {
    const exists = await this.fileSystem.exists(this.config.backupDir)
    if (!exists) {
      await this.fileSystem.createDirectory(this.config.backupDir)
      logger.info('Backup directory created', { path: this.config.backupDir })
    }
  }

  /**
   * Generate backup filename
   */
  private generateBackupFilename(originalPath: string): string {
    const timestamp = Date.now()
    const basename = path.basename(originalPath, path.extname(originalPath))
    const extension = path.extname(originalPath)
    return `${basename}.${timestamp}${extension}`
  }

  /**
   * Create backup of a file
   */
  async createBackup(
    filePath: string,
    description?: string
  ): Promise<Result<BackupMetadata>> {
    try {
      // Check if source file exists
      const exists = await this.fileSystem.exists(filePath)
      if (!exists) {
        return {
          success: false,
          error: `Source file not found: ${filePath}`
        }
      }

      // Generate backup filename
      const backupFilename = this.generateBackupFilename(filePath)
      const backupPath = path.join(this.config.backupDir, backupFilename)

      // Copy file to backup location
      const copyResult = await this.fileSystem.copyFile(filePath, backupPath)

      if (!copyResult.success) {
        return {
          success: false,
          error: `Failed to create backup: ${copyResult.error}`
        }
      }

      // Get file stats for metadata
      const statsResult = await this.fileSystem.getStats(backupPath)
      const size = statsResult.success && statsResult.data ? statsResult.data.size : 0

      // Create backup metadata
      const metadata: BackupMetadata = {
        id: `backup-${Date.now()}`,
        fileName: backupFilename,
        filePath: backupPath,
        originalPath: filePath,
        timestamp: Date.now(),
        size,
        description
      }

      logger.info('Backup created successfully', {
        original: filePath,
        backup: backupPath,
        size
      })

      // Clean up old backups
      await this.cleanupOldBackups()

      return { success: true, data: metadata }
    } catch (error) {
      logger.error('Failed to create backup', error, { filePath })
      return {
        success: false,
        error: 'Failed to create backup'
      }
    }
  }

  /**
   * Restore backup
   */
  async restoreBackup(backupFilename: string, targetPath?: string): Promise<Result<void>> {
    try {
      const backupPath = path.join(this.config.backupDir, backupFilename)

      // Check if backup exists
      const exists = await this.fileSystem.exists(backupPath)
      if (!exists) {
        return {
          success: false,
          error: `Backup not found: ${backupFilename}`
        }
      }

      // Determine target path
      let restorePath: string
      if (targetPath) {
        restorePath = targetPath
      } else {
        // Extract original filename from backup filename
        const match = backupFilename.match(/^(.+)\.\d+(\.\w+)$/)
        if (match) {
          restorePath = `${match[1]}${match[2]}`
        } else {
          return {
            success: false,
            error: 'Cannot determine restore path'
          }
        }
      }

      // Create backup of current file before restoring
      const currentExists = await this.fileSystem.exists(restorePath)
      if (currentExists) {
        await this.createBackup(restorePath, 'Pre-restore backup')
      }

      // Copy backup file to target location
      const copyResult = await this.fileSystem.copyFile(backupPath, restorePath)

      if (!copyResult.success) {
        return {
          success: false,
          error: `Failed to restore backup: ${copyResult.error}`
        }
      }

      logger.info('Backup restored successfully', {
        backup: backupPath,
        target: restorePath
      })

      return { success: true }
    } catch (error) {
      logger.error('Failed to restore backup', error, { backupFilename })
      return {
        success: false,
        error: 'Failed to restore backup'
      }
    }
  }

  /**
   * List all backups
   */
  async listBackups(): Promise<Result<BackupMetadata[]>> {
    try {
      const listResult = await this.fileSystem.listFiles(this.config.backupDir)

      if (!listResult.success || !listResult.data) {
        return {
          success: false,
          error: listResult.error || 'Failed to list backups'
        }
      }

      const backups: BackupMetadata[] = []

      for (const filename of listResult.data) {
        const filePath = path.join(this.config.backupDir, filename)
        const statsResult = await this.fileSystem.getStats(filePath)

        // Parse timestamp from filename
        const match = filename.match(/\.(\d+)\.\w+$/)
        const timestamp = match ? parseInt(match[1], 10) : 0

        // Extract original filename
        const originalMatch = filename.match(/^(.+)\.\d+(\.\w+)$/)
        const originalPath = originalMatch ? `${originalMatch[1]}${originalMatch[2]}` : filename

        backups.push({
          id: `backup-${timestamp}`,
          fileName: filename,
          filePath,
          originalPath,
          timestamp,
          size: statsResult.success && statsResult.data ? statsResult.data.size : 0
        })
      }

      // Sort by timestamp (newest first)
      backups.sort((a, b) => b.timestamp - a.timestamp)

      return { success: true, data: backups }
    } catch (error) {
      logger.error('Failed to list backups', error)
      return {
        success: false,
        error: 'Failed to list backups'
      }
    }
  }

  /**
   * Delete specific backup
   */
  async deleteBackup(backupFilename: string): Promise<Result<void>> {
    const backupPath = path.join(this.config.backupDir, backupFilename)
    const result = await this.fileSystem.deleteFile(backupPath)

    if (result.success) {
      logger.info('Backup deleted', { backup: backupFilename })
    }

    return result
  }

  /**
   * Clean up old backups (keep only maxBackups)
   */
  async cleanupOldBackups(): Promise<Result<void>> {
    try {
      const listResult = await this.listBackups()

      if (!listResult.success || !listResult.data) {
        return {
          success: false,
          error: listResult.error
        }
      }

      const backups = listResult.data
      const maxBackups = this.config.maxBackups

      if (backups.length <= maxBackups) {
        return { success: true }
      }

      // Delete oldest backups
      const backupsToDelete = backups.slice(maxBackups)

      for (const backup of backupsToDelete) {
        await this.deleteBackup(backup.fileName)
      }

      logger.info('Old backups cleaned up', {
        deleted: backupsToDelete.length,
        remaining: maxBackups
      })

      return { success: true }
    } catch (error) {
      logger.error('Failed to cleanup old backups', error)
      return {
        success: false,
        error: 'Failed to cleanup old backups'
      }
    }
  }

  /**
   * Get backup metadata by filename
   */
  async getBackupMetadata(backupFilename: string): Promise<Result<BackupMetadata>> {
    const listResult = await this.listBackups()

    if (!listResult.success || !listResult.data) {
      return {
        success: false,
        error: listResult.error
      }
    }

    const backup = listResult.data.find((b) => b.fileName === backupFilename)

    if (!backup) {
      return {
        success: false,
        error: `Backup not found: ${backupFilename}`
      }
    }

    return { success: true, data: backup }
  }

  /**
   * Check if auto-backup is enabled
   */
  isAutoBackupEnabled(): boolean {
    return this.config.autoBackup
  }

  /**
   * Set auto-backup status
   */
  setAutoBackup(enabled: boolean): void {
    this.config.autoBackup = enabled
    logger.info('Auto-backup status changed', { enabled })
  }

  /**
   * Get backup configuration
   */
  getConfig(): Required<BackupConfig> {
    return { ...this.config }
  }
}

/**
 * Create BackupService instance
 */
export function createBackupService(
  fileSystem: FileSystemService,
  config?: BackupConfig
): BackupService {
  return new BackupService(fileSystem, config)
}
