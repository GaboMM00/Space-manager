/**
 * MigrationService
 * Handles data migrations for schema versioning
 */

import { logger } from '../../shared/utils/logger'
import { Result } from '../../shared/types/common.types'
import { Migration, MigrationStatus } from '../../shared/types/data-store.types'
import { FileSystemService } from './FileSystemService'
import { BackupService } from './BackupService'

/**
 * Migration history entry
 */
interface MigrationHistoryEntry {
  version: number
  description: string
  appliedAt: string
  success: boolean
  error?: string
}

/**
 * Migration history file structure
 */
interface MigrationHistory {
  currentVersion: number
  migrations: MigrationHistoryEntry[]
}

/**
 * MigrationService class
 */
export class MigrationService {
  private migrations: Map<number, Migration> = new Map()
  private historyFilePath = 'migrations/history.json'

  constructor(
    private fileSystem: FileSystemService,
    private backupService: BackupService
  ) {
    logger.info('MigrationService initialized')
  }

  /**
   * Register a migration
   */
  registerMigration(migration: Migration): void {
    if (this.migrations.has(migration.version)) {
      logger.warn('Migration already registered, overwriting', {
        version: migration.version
      })
    }

    this.migrations.set(migration.version, migration)
    logger.debug('Migration registered', {
      version: migration.version,
      description: migration.description
    })
  }

  /**
   * Register multiple migrations
   */
  registerMigrations(migrations: Migration[]): void {
    migrations.forEach((migration) => this.registerMigration(migration))
    logger.info('Migrations registered', { count: migrations.length })
  }

  /**
   * Get migration history
   */
  private async getMigrationHistory(): Promise<MigrationHistory> {
    const exists = await this.fileSystem.exists(this.historyFilePath)

    if (!exists) {
      return {
        currentVersion: 0,
        migrations: []
      }
    }

    const result = await this.fileSystem.readJSON<MigrationHistory>(this.historyFilePath)

    if (!result.success || !result.data) {
      logger.warn('Failed to read migration history, starting fresh')
      return {
        currentVersion: 0,
        migrations: []
      }
    }

    return result.data
  }

  /**
   * Save migration history
   */
  private async saveMigrationHistory(history: MigrationHistory): Promise<Result<void>> {
    return await this.fileSystem.writeJSON(this.historyFilePath, history, {
      createDirectories: true
    })
  }

  /**
   * Get current migration status
   */
  async getStatus(): Promise<MigrationStatus> {
    const history = await this.getMigrationHistory()
    const allVersions = Array.from(this.migrations.keys()).sort((a, b) => a - b)
    const targetVersion = allVersions.length > 0 ? Math.max(...allVersions) : 0

    const appliedMigrations = history.migrations
      .filter((m) => m.success)
      .map((m) => m.version)
      .sort((a, b) => a - b)

    const lastMigration = history.migrations.length > 0 ? history.migrations[history.migrations.length - 1] : undefined

    return {
      currentVersion: history.currentVersion,
      targetVersion,
      appliedMigrations,
      lastMigration: lastMigration
        ? {
            version: lastMigration.version,
            appliedAt: lastMigration.appliedAt,
            description: lastMigration.description
          }
        : undefined
    }
  }

  /**
   * Check if migrations are pending
   */
  async hasPendingMigrations(): Promise<boolean> {
    const status = await this.getStatus()
    return status.currentVersion < status.targetVersion
  }

  /**
   * Run a single migration
   */
  private async runMigration(
    migration: Migration,
    dataFilePath: string
  ): Promise<Result<any>> {
    try {
      logger.info('Running migration', {
        version: migration.version,
        description: migration.description
      })

      // Create backup before migration
      if (await this.fileSystem.exists(dataFilePath)) {
        await this.backupService.createBackup(
          dataFilePath,
          `Before migration v${migration.version}`
        )
      }

      // Read current data
      const dataResult = await this.fileSystem.readJSON<any>(dataFilePath)
      let currentData = dataResult.success && dataResult.data ? dataResult.data : null

      // Run migration
      const migratedData = await migration.up(currentData)

      // Save migrated data
      const saveResult = await this.fileSystem.writeJSON(dataFilePath, migratedData, {
        createDirectories: true
      })

      if (!saveResult.success) {
        throw new Error(`Failed to save migrated data: ${saveResult.error}`)
      }

      logger.info('Migration completed successfully', {
        version: migration.version
      })

      return { success: true, data: migratedData }
    } catch (error) {
      logger.error('Migration failed', error, {
        version: migration.version
      })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Migration failed'
      }
    }
  }

  /**
   * Run all pending migrations for a data file
   */
  async migrate(dataFilePath: string, targetVersion?: number): Promise<Result<void>> {
    try {
      const history = await this.getMigrationHistory()
      const currentVersion = history.currentVersion

      // Get migrations to run
      const allVersions = Array.from(this.migrations.keys()).sort((a, b) => a - b)
      const target = targetVersion || (allVersions.length > 0 ? Math.max(...allVersions) : 0)

      const pendingVersions = allVersions.filter(
        (v) => v > currentVersion && v <= target
      )

      if (pendingVersions.length === 0) {
        logger.info('No pending migrations', { currentVersion, targetVersion: target })
        return { success: true }
      }

      logger.info('Starting migrations', {
        currentVersion,
        targetVersion: target,
        pendingCount: pendingVersions.length
      })

      // Run migrations in order
      for (const version of pendingVersions) {
        const migration = this.migrations.get(version)
        if (!migration) continue

        const result = await this.runMigration(migration, dataFilePath)

        // Record migration in history
        const historyEntry: MigrationHistoryEntry = {
          version: migration.version,
          description: migration.description,
          appliedAt: new Date().toISOString(),
          success: result.success,
          error: result.error
        }

        history.migrations.push(historyEntry)

        if (result.success) {
          history.currentVersion = version
        } else {
          // Migration failed, stop here
          await this.saveMigrationHistory(history)
          return {
            success: false,
            error: `Migration v${version} failed: ${result.error}`
          }
        }
      }

      // Save migration history
      await this.saveMigrationHistory(history)

      logger.info('All migrations completed successfully', {
        fromVersion: currentVersion,
        toVersion: history.currentVersion
      })

      return { success: true }
    } catch (error) {
      logger.error('Migration process failed', error)
      return {
        success: false,
        error: 'Migration process failed'
      }
    }
  }

  /**
   * Rollback to a specific version
   */
  async rollback(dataFilePath: string, targetVersion: number): Promise<Result<void>> {
    try {
      const history = await this.getMigrationHistory()
      const currentVersion = history.currentVersion

      if (targetVersion >= currentVersion) {
        return {
          success: false,
          error: 'Target version must be less than current version'
        }
      }

      // Get migrations to rollback (in reverse order)
      const versionsToRollback = Array.from(this.migrations.keys())
        .filter((v) => v > targetVersion && v <= currentVersion)
        .sort((a, b) => b - a) // Descending order

      logger.info('Starting rollback', {
        currentVersion,
        targetVersion,
        rollbackCount: versionsToRollback.length
      })

      // Create backup before rollback
      if (await this.fileSystem.exists(dataFilePath)) {
        await this.backupService.createBackup(
          dataFilePath,
          `Before rollback to v${targetVersion}`
        )
      }

      // Run rollbacks in reverse order
      let currentData: any = null
      const dataResult = await this.fileSystem.readJSON<any>(dataFilePath)
      if (dataResult.success && dataResult.data) {
        currentData = dataResult.data
      }

      for (const version of versionsToRollback) {
        const migration = this.migrations.get(version)
        if (!migration || !migration.down) {
          return {
            success: false,
            error: `Migration v${version} does not support rollback`
          }
        }

        try {
          currentData = await migration.down(currentData)
          history.currentVersion = version - 1
        } catch (error) {
          logger.error('Rollback failed', error, { version })
          return {
            success: false,
            error: `Rollback failed at version ${version}`
          }
        }
      }

      // Save rolled back data
      const saveResult = await this.fileSystem.writeJSON(dataFilePath, currentData, {
        createDirectories: true
      })

      if (!saveResult.success) {
        return {
          success: false,
          error: `Failed to save rolled back data: ${saveResult.error}`
        }
      }

      // Update history
      history.currentVersion = targetVersion
      await this.saveMigrationHistory(history)

      logger.info('Rollback completed successfully', {
        fromVersion: currentVersion,
        toVersion: targetVersion
      })

      return { success: true }
    } catch (error) {
      logger.error('Rollback process failed', error)
      return {
        success: false,
        error: 'Rollback process failed'
      }
    }
  }

  /**
   * Reset migration history (for testing)
   */
  async resetHistory(): Promise<Result<void>> {
    const history: MigrationHistory = {
      currentVersion: 0,
      migrations: []
    }
    return await this.saveMigrationHistory(history)
  }

  /**
   * Get list of registered migrations
   */
  getRegisteredMigrations(): Migration[] {
    return Array.from(this.migrations.values()).sort((a, b) => a.version - b.version)
  }
}

/**
 * Create MigrationService instance
 */
export function createMigrationService(
  fileSystem: FileSystemService,
  backupService: BackupService
): MigrationService {
  return new MigrationService(fileSystem, backupService)
}
