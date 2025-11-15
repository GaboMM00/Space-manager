/**
 * Servicio de base de datos SQLite
 */

import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { createLogger } from '@shared/utils';

const logger = createLogger('DatabaseService');

export class DatabaseService {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor(dbName: string = 'analytics.db') {
    const userDataPath = app.getPath('userData');
    const dataDir = path.join(userDataPath, 'data');

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.dbPath = path.join(dataDir, dbName);
  }

  /**
   * Inicializa la base de datos
   */
  async initialize(): Promise<void> {
    logger.info(`Initializing database at: ${this.dbPath}`);

    this.db = new Database(this.dbPath);

    // Configuraciones de performance
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = -64000');
    this.db.pragma('temp_store = MEMORY');
    this.db.pragma('foreign_keys = ON');

    // Crear tablas iniciales
    await this.createTables();

    logger.info('Database initialized successfully');
  }

  /**
   * Crea las tablas de la base de datos
   */
  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    this.db.exec(`
      -- Tabla de ejecuciones
      CREATE TABLE IF NOT EXISTS execution_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        space_id TEXT NOT NULL,
        space_name TEXT NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        duration_ms INTEGER,
        success INTEGER NOT NULL,
        error_message TEXT,
        resources_total INTEGER NOT NULL,
        resources_success INTEGER NOT NULL,
        resources_failed INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_execution_logs_space_id
        ON execution_logs(space_id);
      CREATE INDEX IF NOT EXISTS idx_execution_logs_started_at
        ON execution_logs(started_at);
      CREATE INDEX IF NOT EXISTS idx_execution_logs_success
        ON execution_logs(success);

      -- Tabla de métricas diarias
      CREATE TABLE IF NOT EXISTS daily_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        space_id TEXT NOT NULL,
        date TEXT NOT NULL,
        execution_count INTEGER DEFAULT 0,
        success_count INTEGER DEFAULT 0,
        failure_count INTEGER DEFAULT 0,
        avg_duration_ms INTEGER DEFAULT 0,
        total_duration_ms INTEGER DEFAULT 0,
        min_duration_ms INTEGER,
        max_duration_ms INTEGER,
        UNIQUE(space_id, date)
      );

      CREATE INDEX IF NOT EXISTS idx_daily_metrics_space_date
        ON daily_metrics(space_id, date);

      -- Tabla de estadísticas de recursos
      CREATE TABLE IF NOT EXISTS resource_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        space_id TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_path TEXT NOT NULL,
        execution_count INTEGER DEFAULT 0,
        success_count INTEGER DEFAULT 0,
        failure_count INTEGER DEFAULT 0,
        last_executed_at TEXT,
        avg_execution_time_ms INTEGER,
        UNIQUE(space_id, resource_type, resource_path)
      );

      CREATE INDEX IF NOT EXISTS idx_resource_stats_space_id
        ON resource_stats(space_id);

      -- Tabla de logs de errores
      CREATE TABLE IF NOT EXISTS error_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        space_id TEXT NOT NULL,
        execution_log_id INTEGER,
        error_type TEXT NOT NULL,
        error_code TEXT,
        error_message TEXT NOT NULL,
        stack_trace TEXT,
        resource_type TEXT,
        resource_path TEXT,
        context TEXT,
        occurred_at TEXT NOT NULL,
        FOREIGN KEY (execution_log_id) REFERENCES execution_logs(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_error_logs_space_id
        ON error_logs(space_id);
      CREATE INDEX IF NOT EXISTS idx_error_logs_error_type
        ON error_logs(error_type);
      CREATE INDEX IF NOT EXISTS idx_error_logs_occurred_at
        ON error_logs(occurred_at);

      -- Tabla de versiones de esquema
      CREATE TABLE IF NOT EXISTS schema_versions (
        version INTEGER PRIMARY KEY,
        applied_at TEXT DEFAULT (datetime('now'))
      );

      -- Insertar versión inicial si no existe
      INSERT OR IGNORE INTO schema_versions (version) VALUES (1);
    `);

    logger.debug('Database tables created');
  }

  /**
   * Obtiene la instancia de la base de datos
   */
  getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first');
    }
    return this.db;
  }

  /**
   * Ejecuta una query simple
   */
  get<T = any>(sql: string, params: any[] = []): T | undefined {
    return this.getDatabase().prepare(sql).get(...params) as T | undefined;
  }

  /**
   * Ejecuta una query que retorna múltiples resultados
   */
  all<T = any>(sql: string, params: any[] = []): T[] {
    return this.getDatabase().prepare(sql).all(...params) as T[];
  }

  /**
   * Ejecuta una query de modificación (INSERT, UPDATE, DELETE)
   */
  run(sql: string, params: any[] = []): Database.RunResult {
    return this.getDatabase().prepare(sql).run(...params);
  }

  /**
   * Ejecuta una transacción
   */
  transaction<T>(fn: () => T): T {
    const db = this.getDatabase();
    const txn = db.transaction(fn);
    return txn();
  }

  /**
   * Verifica salud de la base de datos
   */
  checkHealth(): { healthy: boolean; error?: string } {
    try {
      const result = this.get<{ ok: number }>('SELECT 1 as ok');
      return { healthy: result?.ok === 1 };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cierra la conexión de la base de datos
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      logger.info('Database connection closed');
    }
  }
}

// Singleton instance
let instance: DatabaseService | null = null;

export function getDatabaseService(): DatabaseService {
  if (!instance) {
    instance = new DatabaseService();
  }
  return instance;
}
