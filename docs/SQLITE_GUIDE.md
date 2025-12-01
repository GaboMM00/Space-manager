# SQLite Analytics - Guía de Implementación

**Proyecto:** Space Manager  
**Módulo:** Analytics  
**Versión:** 1.0.0  
**Fecha:** 15 de Noviembre 2025

---

## 📋 Tabla de Contenidos

1. [¿Por qué SQLite?](#1-por-qué-sqlite)
2. [Esquema de Base de Datos](#2-esquema-de-base-de-datos)
3. [Instalación y Configuración](#3-instalación-y-configuración)
4. [Uso y Ejemplos](#4-uso-y-ejemplos)
5. [Migraciones](#5-migraciones)
6. [Performance](#6-performance)
7. [Mantenimiento](#7-mantenimiento)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. ¿Por qué SQLite?

### Decisión Arquitectónica

**Sistema Híbrido: JSON + SQLite**

```
┌─────────────────────────────────────────┐
│         Datos de Configuración          │
│              (JSON)                     │
│  ────────────────────────────────────── │
│  • Espacios (spaces.json)               │
│  • Tareas (tasks.json)                  │
│  • Settings (settings.json)             │
│  • Plugins (plugins.json)               │
│                                         │
│  ✅ Portable                            │
│  ✅ Legible por humanos                │
│  ✅ Fácil backup manual                 │
│  ✅ Volumen bajo                        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│            Analytics Data               │
│             (SQLite)                    │
│  ────────────────────────────────────── │
│  • Logs de ejecución                    │
│  • Métricas agregadas                   │
│  • Historial de errores                 │
│                                         │
│  ✅ Queries complejas eficientes        │
│  ✅ Agregaciones SQL nativas            │
│  ✅ Escalable (100k+ registros)         │
│  ✅ Embedded (0 configuración)          │
└─────────────────────────────────────────┘
```

### Ventajas sobre Alternativas

| Característica | SQLite | MongoDB | PostgreSQL |
|----------------|---------|---------|------------|
| **Instalación** | ✅ Incluido | ❌ Separada | ❌ Separada |
| **Configuración** | ✅ 0 pasos | ❌ Compleja | ❌ Compleja |
| **RAM idle** | ✅ 0 MB | ❌ 200+ MB | ❌ 50+ MB |
| **Portabilidad** | ✅ Un archivo | ❌ Complejo | ❌ Complejo |
| **Bundle size** | ✅ +600 KB | ❌ +100 MB | ❌ +50 MB |
| **Offline** | ✅ Nativo | ✅ Posible | ❌ No |
| **Queries SQL** | ✅ Completo | ❌ NoSQL | ✅ Completo |
| **Performance** | ✅ Excelente | ✅ Excelente | ✅ Excelente |

---

## 2. Esquema de Base de Datos

### 2.1 Diagrama ER

```
┌─────────────────────┐
│  execution_logs     │
├─────────────────────┤
│ id (PK)             │
│ space_id            │─────┐
│ timestamp           │     │
│ duration            │     │
│ success             │     │ 1:N
│ error_message       │     │
└─────────────────────┘     │
                            │
                            ▼
                ┌─────────────────────────┐
                │  resource_executions    │
                ├─────────────────────────┤
                │ id (PK)                 │
                │ execution_log_id (FK)   │
                │ resource_id             │
                │ resource_type           │
                │ success                 │
                │ start_time              │
                │ end_time                │
                │ error_message           │
                └─────────────────────────┘

┌─────────────────────┐         ┌─────────────────────┐
│  daily_metrics      │         │  error_summary      │
├─────────────────────┤         ├─────────────────────┤
│ id (PK)             │         │ id (PK)             │
│ space_id            │         │ resource_id         │
│ date                │         │ error_type          │
│ total_executions    │         │ error_message       │
│ successful_exec     │         │ occurrence_count    │
│ failed_exec         │         │ first_seen          │
│ total_duration      │         │ last_seen           │
│ avg_duration        │         └─────────────────────┘
└─────────────────────┘
```

### 2.2 Definición de Tablas

```sql
-- ============================================
-- Tabla: execution_logs
-- Propósito: Registro de cada ejecución de espacio
-- ============================================
CREATE TABLE execution_logs (
  id TEXT PRIMARY KEY,                    -- UUID
  space_id TEXT NOT NULL,                 -- Referencia al espacio
  timestamp INTEGER NOT NULL,             -- Unix timestamp (ms)
  duration INTEGER,                       -- Duración total en ms
  success INTEGER NOT NULL,               -- 0 = falló, 1 = éxito
  error_message TEXT,                     -- Mensaje si falló
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Índices para mejorar performance
CREATE INDEX idx_execution_logs_space_id 
  ON execution_logs(space_id);
  
CREATE INDEX idx_execution_logs_timestamp 
  ON execution_logs(timestamp);
  
CREATE INDEX idx_execution_logs_success 
  ON execution_logs(success);

-- ============================================
-- Tabla: resource_executions
-- Propósito: Detalle de ejecución de cada recurso
-- ============================================
CREATE TABLE resource_executions (
  id TEXT PRIMARY KEY,
  execution_log_id TEXT NOT NULL,         -- FK a execution_logs
  resource_id TEXT NOT NULL,              -- ID del recurso
  resource_type TEXT NOT NULL,            -- application/url/script/file
  success INTEGER NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER,
  error_message TEXT,
  
  FOREIGN KEY (execution_log_id) 
    REFERENCES execution_logs(id) 
    ON DELETE CASCADE                     -- Eliminar en cascada
);

CREATE INDEX idx_resource_executions_log_id 
  ON resource_executions(execution_log_id);
  
CREATE INDEX idx_resource_executions_resource_id 
  ON resource_executions(resource_id);

-- ============================================
-- Tabla: daily_metrics
-- Propósito: Métricas agregadas por día (precalculadas)
-- ============================================
CREATE TABLE daily_metrics (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL,
  date TEXT NOT NULL,                     -- YYYY-MM-DD
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  failed_executions INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  avg_duration INTEGER DEFAULT 0,
  
  UNIQUE(space_id, date)                  -- Un registro por espacio/día
);

CREATE INDEX idx_daily_metrics_space_date 
  ON daily_metrics(space_id, date);

-- ============================================
-- Tabla: error_summary
-- Propósito: Resumen de errores frecuentes
-- ============================================
CREATE TABLE error_summary (
  id TEXT PRIMARY KEY,
  resource_id TEXT NOT NULL,
  error_type TEXT NOT NULL,               -- Categoría del error
  error_message TEXT NOT NULL,
  occurrence_count INTEGER DEFAULT 1,
  first_seen INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  
  UNIQUE(resource_id, error_type, error_message)
);

CREATE INDEX idx_error_summary_resource 
  ON error_summary(resource_id);
  
CREATE INDEX idx_error_summary_type 
  ON error_summary(error_type);

-- ============================================
-- Tabla: schema_versions
-- Propósito: Control de versiones para migraciones
-- ============================================
CREATE TABLE schema_versions (
  version INTEGER PRIMARY KEY,
  applied_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

---

## 3. Instalación y Configuración

### 3.1 Instalar Dependencia

```bash
npm install better-sqlite3
npm install --save-dev @types/better-sqlite3
```

**Nota:** `better-sqlite3` es una binding nativa de Node.js. Se compilará automáticamente para tu plataforma durante `npm install`.

### 3.2 Configuración Inicial

```typescript
// src/main/services/SQLiteService.ts
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

export class SQLiteService {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor() {
    // Ubicación de la base de datos
    const userDataPath = app.getPath('userData');
    const dataDir = path.join(userDataPath, 'data');
    
    // Crear directorio si no existe
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    this.dbPath = path.join(dataDir, 'analytics.db');
  }

  async initialize(): Promise<void> {
    console.log(`Initializing SQLite database at: ${this.dbPath}`);
    
    this.db = new Database(this.dbPath);
    
    // Configuraciones de performance
    this.db.pragma('journal_mode = WAL');      // Write-Ahead Logging
    this.db.pragma('synchronous = NORMAL');    // Balance performance/durability
    this.db.pragma('cache_size = -64000');     // 64MB cache
    this.db.pragma('temp_store = MEMORY');     // Temp tables en RAM
    this.db.pragma('foreign_keys = ON');       // Habilitar FKs
    
    // Crear tablas
    await this.createTables();
    
    // Ejecutar migraciones
    await this.runMigrations();
    
    console.log('SQLite database initialized successfully');
  }

  private async createTables(): Promise<void> {
    // Ver SQL en sección 2.2
    this.db!.exec(`
      -- Aquí va todo el SQL de creación de tablas
    `);
  }

  getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('SQLite database closed');
    }
  }
}
```

### 3.3 Inicialización en App

```typescript
// src/main/app.ts
import { app } from 'electron';
import { SQLiteService } from './services/SQLiteService';

let sqliteService: SQLiteService;

app.whenReady().then(async () => {
  // Inicializar SQLite antes que todo lo demás
  sqliteService = new SQLiteService();
  await sqliteService.initialize();
  
  // Continuar con el resto de la app
  createWindow();
  setupServices();
});

app.on('before-quit', async () => {
  // Cerrar conexión antes de salir
  await sqliteService.close();
});
```

---

## 4. Uso y Ejemplos

### 4.1 Registrar Ejecución

```typescript
// En ExecutionService después de ejecutar un espacio
async function recordExecution(result: ExecutionResult): Promise<void> {
  const db = sqliteService.getDatabase();
  const executionId = uuid();

  // Transaction para consistencia
  const insertExecution = db.transaction((data) => {
    // 1. Log principal
    db.prepare(`
      INSERT INTO execution_logs 
        (id, space_id, timestamp, duration, success, error_message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      data.id,
      data.spaceId,
      data.timestamp,
      data.duration,
      data.success ? 1 : 0,
      data.errorMessage || null
    );

    // 2. Recursos individuales
    const insertResource = db.prepare(`
      INSERT INTO resource_executions
        (id, execution_log_id, resource_id, resource_type,
         success, start_time, end_time, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const resource of data.resources) {
      insertResource.run(
        uuid(),
        data.id,
        resource.id,
        resource.type,
        resource.success ? 1 : 0,
        resource.startTime,
        resource.endTime,
        resource.error || null
      );
    }

    // 3. Actualizar métricas diarias
    updateDailyMetrics(db, data);
  });

  // Ejecutar transaction
  insertExecution({
    id: executionId,
    spaceId: result.spaceId,
    timestamp: Date.now(),
    duration: result.duration,
    success: result.success,
    errorMessage: result.error?.message,
    resources: result.resources
  });
}
```

### 4.2 Consultar Métricas

```typescript
// Obtener métricas de un espacio
async function getSpaceMetrics(spaceId: string): Promise<any> {
  const db = sqliteService.getDatabase();

  // Resumen general
  const summary = db.prepare(`
    SELECT 
      COUNT(*) as total_executions,
      SUM(success) as successful_executions,
      SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_executions,
      AVG(duration) as avg_duration,
      MAX(timestamp) as last_executed
    FROM execution_logs
    WHERE space_id = ?
  `).get(spaceId);

  // Ejecuciones por día (últimos 30 días)
  const daily = db.prepare(`
    SELECT date, total_executions
    FROM daily_metrics
    WHERE space_id = ?
    ORDER BY date DESC
    LIMIT 30
  `).all(spaceId);

  // Top 5 recursos más usados
  const topResources = db.prepare(`
    SELECT 
      resource_id,
      COUNT(*) as executions,
      AVG(CASE WHEN success = 1 THEN 1.0 ELSE 0.0 END) as success_rate
    FROM resource_executions re
    JOIN execution_logs el ON re.execution_log_id = el.id
    WHERE el.space_id = ?
    GROUP BY resource_id
    ORDER BY executions DESC
    LIMIT 5
  `).all(spaceId);

  return {
    summary,
    daily,
    topResources
  };
}
```

### 4.3 Queries Comunes

```typescript
// Top espacios más usados
const topSpaces = db.prepare(`
  SELECT 
    space_id,
    COUNT(*) as executions,
    AVG(duration) as avg_duration
  FROM execution_logs
  WHERE timestamp > ?
  GROUP BY space_id
  ORDER BY executions DESC
  LIMIT 10
`).all(Date.now() - 30 * 24 * 60 * 60 * 1000);  // Últimos 30 días

// Tasa de éxito por tipo de recurso
const successByType = db.prepare(`
  SELECT 
    resource_type,
    COUNT(*) as total,
    SUM(success) as successful,
    CAST(SUM(success) AS FLOAT) / COUNT(*) * 100 as success_rate
  FROM resource_executions
  GROUP BY resource_type
`).all();

// Errores más frecuentes
const commonErrors = db.prepare(`
  SELECT 
    error_type,
    error_message,
    SUM(occurrence_count) as total_occurrences
  FROM error_summary
  GROUP BY error_type, error_message
  ORDER BY total_occurrences DESC
  LIMIT 10
`).all();

// Tendencia de uso (comparar semana actual vs anterior)
const trend = db.prepare(`
  SELECT 
    CASE 
      WHEN date >= date('now', '-7 days') THEN 'current_week'
      ELSE 'previous_week'
    END as week,
    SUM(total_executions) as executions
  FROM daily_metrics
  WHERE date >= date('now', '-14 days')
  GROUP BY week
`).all();
```

---

## 5. Migraciones

### 5.1 Sistema de Migraciones

```typescript
interface Migration {
  version: number;
  description: string;
  up: (db: Database.Database) => void;
  down?: (db: Database.Database) => void;
}

class MigrationManager {
  private migrations: Migration[] = [
    {
      version: 1,
      description: 'Initial schema',
      up: (db) => {
        // Creación inicial de tablas
        // Ya ejecutado en createTables()
      }
    },
    {
      version: 2,
      description: 'Add user_id column for multi-user support',
      up: (db) => {
        db.exec(`
          ALTER TABLE execution_logs ADD COLUMN user_id TEXT;
          CREATE INDEX idx_execution_logs_user_id 
            ON execution_logs(user_id);
        `);
      },
      down: (db) => {
        // SQLite no soporta DROP COLUMN fácilmente
        // Requiere recrear tabla
        db.exec(`
          CREATE TABLE execution_logs_backup AS 
            SELECT id, space_id, timestamp, duration, success, error_message, created_at
            FROM execution_logs;
          
          DROP TABLE execution_logs;
          
          ALTER TABLE execution_logs_backup 
            RENAME TO execution_logs;
        `);
      }
    }
    // Más migraciones aquí...
  ];

  getCurrentVersion(db: Database.Database): number {
    try {
      const result = db.prepare(`
        SELECT MAX(version) as version 
        FROM schema_versions
      `).get() as { version: number | null };
      
      return result?.version || 0;
    } catch {
      return 0;
    }
  }

  runMigrations(db: Database.Database): void {
    const currentVersion = this.getCurrentVersion(db);
    const pendingMigrations = this.migrations.filter(
      m => m.version > currentVersion
    );

    for (const migration of pendingMigrations) {
      console.log(`Running migration ${migration.version}: ${migration.description}`);
      
      db.transaction(() => {
        migration.up(db);
        db.prepare(`
          INSERT INTO schema_versions (version) VALUES (?)
        `).run(migration.version);
      })();
      
      console.log(`Migration ${migration.version} completed`);
    }
  }
}
```

---

## 6. Performance

### 6.1 Optimizaciones Aplicadas

```typescript
// WAL Mode - Write-Ahead Logging
// Permite lecturas concurrentes durante escrituras
db.pragma('journal_mode = WAL');

// Synchronous = NORMAL
// Balance entre performance y durabilidad
// FULL = más seguro pero más lento
// NORMAL = buen balance
// OFF = más rápido pero peligroso
db.pragma('synchronous = NORMAL');

// Cache Size
// Negativo = KB, Positivo = páginas
// -64000 = 64MB de cache
db.pragma('cache_size = -64000');

// Temp Store en memoria
db.pragma('temp_store = MEMORY');

// Foreign Keys ON
db.pragma('foreign_keys = ON');
```

### 6.2 Prepared Statements

```typescript
// ❌ MAL - Cada vez compila la query
for (const resource of resources) {
  db.prepare(`INSERT INTO ... VALUES (?, ?, ?)`).run(
    resource.id, resource.name, resource.type
  );
}

// ✅ BIEN - Compila una vez, ejecuta múltiples
const insert = db.prepare(`INSERT INTO ... VALUES (?, ?, ?)`);

for (const resource of resources) {
  insert.run(resource.id, resource.name, resource.type);
}
```

### 6.3 Transactions

```typescript
// ❌ MAL - Sin transaction (lento)
for (let i = 0; i < 1000; i++) {
  db.prepare('INSERT INTO ...').run(data);
}
// ~5 segundos

// ✅ BIEN - Con transaction
const insert = db.prepare('INSERT INTO ...');

db.transaction((items) => {
  for (const item of items) {
    insert.run(item);
  }
})(items);
// ~0.05 segundos (100x más rápido)
```

### 6.4 Índices

```sql
-- Índices en columnas frecuentemente consultadas
CREATE INDEX idx_execution_logs_space_id ON execution_logs(space_id);
CREATE INDEX idx_execution_logs_timestamp ON execution_logs(timestamp);

-- Índices compuestos para queries específicas
CREATE INDEX idx_daily_metrics_space_date 
  ON daily_metrics(space_id, date);

-- Verificar uso de índices
EXPLAIN QUERY PLAN
SELECT * FROM execution_logs WHERE space_id = '123';

-- Debe mostrar "SEARCH TABLE ... USING INDEX ..."
```

### 6.5 Benchmarks Esperados

```typescript
// Inserción de 1 ejecución con 5 recursos
// Con transaction: ~1-2 ms

// Query de métricas de 1 espacio
// Con índices: ~5-10 ms

// Agregación de 30 días de datos
// ~20-50 ms

// Query compleja (top 10 espacios, últimos 30 días)
// ~100-200 ms
```

---

## 7. Mantenimiento

### 7.1 Limpieza de Datos Antiguos

```typescript
async function cleanOldData(daysToKeep: number = 90): Promise<void> {
  const db = sqliteService.getDatabase();
  const cutoffTimestamp = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

  db.transaction(() => {
    // Eliminar logs antiguos
    const deletedLogs = db.prepare(`
      DELETE FROM execution_logs
      WHERE timestamp < ?
    `).run(cutoffTimestamp);

    // resource_executions se eliminan automáticamente (CASCADE)

    // Eliminar métricas diarias antiguas
    const deletedMetrics = db.prepare(`
      DELETE FROM daily_metrics
      WHERE date < date('now', '-${daysToKeep} days')
    `).run();

    console.log(`Cleaned ${deletedLogs.changes} old execution logs`);
    console.log(`Cleaned ${deletedMetrics.changes} old daily metrics`);
  })();
}

// Ejecutar limpieza semanal
setInterval(() => {
  cleanOldData(90);
}, 7 * 24 * 60 * 60 * 1000);  // Cada 7 días
```

### 7.2 VACUUM

```typescript
// VACUUM recupera espacio después de DELETE
// Recomendado ejecutar mensualmente
async function vacuumDatabase(): Promise<void> {
  const db = sqliteService.getDatabase();
  
  console.log('Starting VACUUM...');
  const startTime = Date.now();
  
  db.exec('VACUUM');
  
  const duration = Date.now() - startTime;
  console.log(`VACUUM completed in ${duration}ms`);
}

// Ejecutar mensualmente
setInterval(() => {
  vacuumDatabase();
}, 30 * 24 * 60 * 60 * 1000);  // Cada 30 días
```

### 7.3 Backup

```typescript
async function backupDatabase(): Promise<string> {
  const db = sqliteService.getDatabase();
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupPath = path.join(
    app.getPath('userData'),
    'backups',
    `analytics_${timestamp}.db`
  );

  // Asegurar que existe el directorio
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });

  // Backup usando API de better-sqlite3
  await db.backup(backupPath);

  console.log(`Database backed up to: ${backupPath}`);
  return backupPath;
}

// Backup automático semanal
setInterval(() => {
  backupDatabase();
}, 7 * 24 * 60 * 60 * 1000);
```

### 7.4 Análisis de Tamaño

```typescript
function getDatabaseStats(): any {
  const db = sqliteService.getDatabase();

  // Tamaño del archivo
  const stats = fs.statSync(dbPath);
  const sizeInMB = stats.size / (1024 * 1024);

  // Conteo de registros
  const counts = {
    executions: db.prepare('SELECT COUNT(*) as count FROM execution_logs').get(),
    resources: db.prepare('SELECT COUNT(*) as count FROM resource_executions').get(),
    metrics: db.prepare('SELECT COUNT(*) as count FROM daily_metrics').get(),
    errors: db.prepare('SELECT COUNT(*) as count FROM error_summary').get()
  };

  // Espacio por tabla
  const tableInfo = db.prepare(`
    SELECT 
      name,
      pgsize as size_bytes,
      pgsize / 1024.0 / 1024.0 as size_mb
    FROM dbstat
    WHERE aggregate = TRUE
    ORDER BY pgsize DESC
  `).all();

  return {
    fileSizeMB: sizeInMB.toFixed(2),
    counts,
    tableInfo
  };
}
```

---

## 8. Troubleshooting

### 8.1 Problemas Comunes

#### Error: "Database is locked"

```typescript
// Causa: Múltiples procesos accediendo simultáneamente
// Solución: Usar WAL mode (ya configurado)
db.pragma('journal_mode = WAL');

// También asegurar que solo hay una instancia de Database
// Usar Singleton pattern
```

#### Error: "Out of memory"

```typescript
// Causa: Cache muy grande o query que retorna muchos datos
// Solución: Ajustar cache size
db.pragma('cache_size = -32000');  // Reducir a 32MB

// O usar paginación en queries grandes
const page = 0;
const pageSize = 100;
const results = db.prepare(`
  SELECT * FROM execution_logs
  ORDER BY timestamp DESC
  LIMIT ? OFFSET ?
`).all(pageSize, page * pageSize);
```

#### Performance Lenta

```typescript
// 1. Verificar índices
EXPLAIN QUERY PLAN SELECT ...

// 2. Analizar estadísticas
db.pragma('analysis_limit = 1000');
db.exec('ANALYZE');

// 3. Verificar WAL checkpoint
db.pragma('wal_checkpoint(TRUNCATE)');

// 4. Ver pragmas actuales
db.pragma('cache_size');
db.pragma('page_size');
```

### 8.2 Debug Mode

```typescript
if (process.env.NODE_ENV === 'development') {
  // Logging de todas las queries
  db.on('trace', (sql) => {
    console.log('[SQLite Query]', sql);
  });

  // Logging de profile (duración)
  db.on('profile', (sql, nsecs) => {
    console.log('[SQLite Profile]', sql, `${nsecs / 1000000}ms`);
  });
}
```

### 8.3 Recuperación de Corrupción

```typescript
// Si la BD se corrompe (raro pero posible)
async function repairDatabase(): Promise<void> {
  const corruptPath = dbPath;
  const backupPath = corruptPath + '.backup';

  // 1. Cerrar conexión actual
  await sqliteService.close();

  // 2. Renombrar archivo corrupto
  fs.renameSync(corruptPath, backupPath);

  // 3. Crear nueva BD
  await sqliteService.initialize();

  // 4. Intentar recuperar datos del backup
  try {
    const backupDb = new Database(backupPath);
    const data = backupDb.prepare('SELECT * FROM execution_logs').all();
    
    // Insertar datos recuperados
    const insert = db.prepare('INSERT INTO execution_logs VALUES ...');
    db.transaction(() => {
      data.forEach(row => insert.run(row));
    })();
    
    backupDb.close();
    console.log('Database repaired successfully');
  } catch (error) {
    console.error('Could not recover data:', error);
  }
}
```

---

## 📚 Referencias

- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [SQLite Official Docs](https://www.sqlite.org/docs.html)
- [SQLite Performance Tips](https://www.sqlite.org/performance.html)
- [SQLite WAL Mode](https://www.sqlite.org/wal.html)

---

**Última Actualización:** 15 de Noviembre 2025  
**Versión:** 1.0.0
