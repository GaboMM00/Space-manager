/**
 * SQLite Service
 * Database service for analytics using better-sqlite3
 * Phase 3 Sprint 3.2 - Analytics y Métricas
 */

import Database from 'better-sqlite3'
import { join } from 'path'
import { app } from 'electron'
import { logger } from '../../shared/utils/logger'
import { ANALYTICS_SCHEMA } from '../schemas/analytics.schema'

/**
 * SQLite Service class
 * Manages SQLite database connection and initialization
 */
export class SQLiteService {
  private db: Database.Database | null = null
  private dbPath: string

  constructor() {
    const userDataPath = app.getPath('userData')
    this.dbPath = join(userDataPath, 'analytics.db')
    logger.info('SQLiteService initialized', { dbPath: this.dbPath })
  }

  /**
   * Get database instance (singleton pattern)
   */
  getDatabase(): Database.Database {
    if (!this.db) {
      this.connect()
    }
    return this.db!
  }

  /**
   * Connect to database
   */
  private connect(): void {
    try {
      logger.debug('Connecting to SQLite database', { path: this.dbPath })

      this.db = new Database(this.dbPath, {
        verbose:
          process.env.NODE_ENV === 'development'
            ? (message: unknown): void => {
                logger.debug(String(message))
              }
            : undefined
      })

      // Configure pragmas
      this.configurePragmas()

      // Initialize schema
      this.initializeSchema()

      logger.info('SQLite database connected successfully')
    } catch (error) {
      logger.error('Failed to connect to SQLite database', error)
      throw error
    }
  }

  /**
   * Configure SQLite pragmas for performance
   */
  private configurePragmas(): void {
    if (!this.db) return

    try {
      this.db.pragma('foreign_keys = ON')
      this.db.pragma('journal_mode = WAL')
      this.db.pragma('synchronous = NORMAL')
      this.db.pragma('cache_size = -64000') // 64MB cache
      this.db.pragma('temp_store = MEMORY')

      logger.debug('SQLite pragmas configured')
    } catch (error) {
      logger.error('Failed to configure SQLite pragmas', error)
      throw error
    }
  }

  /**
   * Initialize database schema
   */
  private initializeSchema(): void {
    if (!this.db) return

    try {
      // Check if schema is already initialized
      const versionResult = this.db
        .prepare(
          `
        SELECT name FROM sqlite_master
        WHERE type='table' AND name='schema_versions'
      `
        )
        .get()

      if (versionResult) {
        logger.debug('Database schema already initialized')
        return
      }

      // Execute schema from imported constant
      this.db.exec(ANALYTICS_SCHEMA)

      logger.info('Database schema initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize database schema', error)
      throw error
    }
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      try {
        this.db.close()
        this.db = null
        logger.info('SQLite database connection closed')
      } catch (error) {
        logger.error('Failed to close SQLite database', error)
      }
    }
  }

  /**
   * Run a query (for INSERT, UPDATE, DELETE)
   */
  run(sql: string, params?: unknown[]): Database.RunResult {
    const db = this.getDatabase()
    try {
      const stmt = db.prepare(sql)
      return stmt.run(...(params || []))
    } catch (error) {
      logger.error('Failed to run SQL query', error, { sql, params })
      throw error
    }
  }

  /**
   * Get a single row
   */
  get<T>(sql: string, params?: unknown[]): T | undefined {
    const db = this.getDatabase()
    try {
      const stmt = db.prepare(sql)
      return stmt.get(...(params || [])) as T | undefined
    } catch (error) {
      logger.error('Failed to get SQL row', error, { sql, params })
      throw error
    }
  }

  /**
   * Get all rows
   */
  all<T>(sql: string, params?: unknown[]): T[] {
    const db = this.getDatabase()
    try {
      const stmt = db.prepare(sql)
      return stmt.all(...(params || [])) as T[]
    } catch (error) {
      logger.error('Failed to get all SQL rows', error, { sql, params })
      throw error
    }
  }

  /**
   * Execute a transaction
   */
  transaction<T>(fn: () => T): T {
    const db = this.getDatabase()
    try {
      const transaction = db.transaction(fn)
      return transaction()
    } catch (error) {
      logger.error('Failed to execute transaction', error)
      throw error
    }
  }

  /**
   * Prepare a statement for reuse
   */
  prepare(sql: string): Database.Statement {
    const db = this.getDatabase()
    return db.prepare(sql)
  }
}

/**
 * Singleton instance
 */
let sqliteServiceInstance: SQLiteService | null = null

/**
 * Factory function to get SQLiteService instance
 */
export function getSQLiteService(): SQLiteService {
  if (!sqliteServiceInstance) {
    sqliteServiceInstance = new SQLiteService()
  }
  return sqliteServiceInstance
}

/**
 * Close SQLite connection (call on app quit)
 */
export function closeSQLiteConnection(): void {
  if (sqliteServiceInstance) {
    sqliteServiceInstance.close()
    sqliteServiceInstance = null
  }
}
