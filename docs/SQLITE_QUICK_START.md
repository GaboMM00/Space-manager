# Guía Rápida: SQLite Analytics
## Quick Start para Desarrolladores

---

## 🚀 Setup Rápido

### 1. Instalación

```bash
# Instalar dependencia
npm install better-sqlite3

# Tipos para TypeScript
npm install -D @types/better-sqlite3

# Rebuild para Electron (si es necesario)
npm run rebuild
```

### 2. Inicialización

```typescript
// En tu main process (main.ts)
import { getAnalyticsService } from './services/AnalyticsService';

async function initializeApp() {
  const analyticsService = getAnalyticsService();
  await analyticsService.initialize();
  
  console.log('✅ Analytics ready');
}
```

---

## 📝 Uso Básico

### Registrar Ejecución de Espacio

```typescript
// Método 1: Lifecycle completo
const analyticsService = getAnalyticsService();

// 1. Iniciar
const executionId = analyticsService.startExecution(
  'space-123',           // spaceId
  'My Dev Environment',  // spaceName
  5                      // total de recursos
);

// 2. Registrar recursos individuales
analyticsService.recordResourceExecution({
  spaceId: 'space-123',
  resourceType: 'application',
  resourcePath: '/usr/bin/code',
  success: true,
  executionTimeMs: 1500
});

// 3. Finalizar
analyticsService.completeExecution({
  id: executionId,
  success: true,
  resourcesSuccess: 5,
  resourcesFailed: 0
});
```

```typescript
// Método 2: Registro simple (todo de una vez)
const repository = new AnalyticsRepository(db);

repository.recordExecution({
  spaceId: 'space-123',
  spaceName: 'My Dev Environment',
  startedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  durationMs: 3000,
  success: true,
  resourcesTotal: 5,
  resourcesSuccess: 5,
  resourcesFailed: 0
});
```

### Registrar Errores

```typescript
analyticsService.recordError({
  spaceId: 'space-123',
  executionLogId: executionId,
  errorType: 'resource_error',
  errorCode: 'APP_NOT_FOUND',
  errorMessage: 'Application not found',
  stackTrace: error.stack,
  resourceType: 'application',
  resourcePath: '/path/to/app',
  context: {
    os: 'darwin',
    attemptCount: 3
  }
});
```

### Consultar Métricas

```typescript
// Resumen general
const summary = analyticsService.getSummary();
console.log(summary);
// {
//   spaceUsage: [...],
//   recentTrends: [...],
//   mostUsedSpaces: [...],
//   topErrors: [...]
// }

// Métricas de un espacio específico
const metrics = analyticsService.getSpaceMetrics('space-123', 30);
console.log(metrics);
// {
//   dailyMetrics: [...],
//   executionLogs: [...],
//   resourceStats: [...],
//   errorLogs: [...]
// }
```

---

## 🎨 Uso en UI (Renderer Process)

### Setup IPC

```typescript
// preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  analytics: {
    getSummary: () => ipcRenderer.invoke('analytics:getSummary'),
    getSpaceMetrics: (spaceId: string, days?: number) =>
      ipcRenderer.invoke('analytics:getSpaceMetrics', spaceId, days),
    getExecutionLogs: (filters) =>
      ipcRenderer.invoke('analytics:getExecutionLogs', filters),
    // ... más handlers
  }
});
```

### Componente React

```typescript
// AnalyticsDashboard.tsx
import { useEffect, useState } from 'react';

export function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      const data = await window.electronAPI.analytics.getSummary();
      setSummary(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      
      {/* Espacios más usados */}
      <section>
        <h2>Espacios más usados</h2>
        {summary.mostUsedSpaces.map(space => (
          <div key={space.spaceId}>
            <h3>{space.spaceName}</h3>
            <p>Ejecuciones: {space.executionCount}</p>
            <p>Tasa de éxito: {space.successRate}%</p>
          </div>
        ))}
      </section>

      {/* Tendencias recientes */}
      <section>
        <h2>Tendencias (30 días)</h2>
        <LineChart data={summary.recentTrends} />
      </section>

      {/* Top errores */}
      <section>
        <h2>Errores frecuentes</h2>
        {summary.topErrors.map(error => (
          <div key={error.errorMessage}>
            <p>{error.errorMessage}</p>
            <span>{error.occurrenceCount} veces</span>
          </div>
        ))}
      </section>
    </div>
  );
}
```

---

## 🔧 Queries Avanzadas

### Filtros Personalizados

```typescript
// Obtener logs de ejecución con filtros
const logs = await repository.getExecutionLogs({
  spaceId: 'space-123',       // Opcional
  success: true,              // Opcional: solo exitosos
  startDate: '2025-01-01',    // Opcional
  endDate: '2025-12-31',      // Opcional
  limit: 50,                  // Opcional
  offset: 0                   // Opcional (paginación)
});

// Métricas diarias con rango de fechas
const dailyMetrics = await repository.getDailyMetrics({
  spaceId: 'space-123',
  startDate: '2025-11-01',
  endDate: '2025-11-30'
});

// Estadísticas de recursos por tipo
const appStats = await repository.getResourceStats({
  spaceId: 'space-123',
  resourceType: 'application'
});

// Errores recientes
const recentErrors = await repository.getErrorLogs({
  spaceId: 'space-123',
  errorType: 'resource_error',
  startDate: '2025-11-01',
  limit: 20
});
```

### Queries SQL Directas (Avanzado)

```typescript
// Si necesitas hacer una query personalizada
const db = analyticsService['db']; // Acceso al DatabaseService

// Query simple
const result = db.get<{ count: number }>(`
  SELECT COUNT(*) as count 
  FROM execution_logs 
  WHERE space_id = ?
`, ['space-123']);

console.log(`Total executions: ${result.count}`);

// Query compleja con JOIN
const detailed = db.all<any>(`
  SELECT 
    el.*,
    COUNT(er.id) as error_count
  FROM execution_logs el
  LEFT JOIN error_logs er ON el.id = er.execution_log_id
  WHERE el.space_id = ?
  GROUP BY el.id
  ORDER BY el.started_at DESC
  LIMIT 10
`, ['space-123']);
```

---

## 📊 Ejemplos Prácticos

### Integración con Motor de Ejecución

```typescript
// ExecutionEngine.ts
export class ExecutionEngine {
  constructor(
    private analyticsService: AnalyticsService
  ) {}

  async executeSpace(space: Space): Promise<ExecutionResult> {
    // 1. Iniciar tracking
    const executionId = this.analyticsService.startExecution(
      space.id,
      space.name,
      space.resources.length
    );

    let successCount = 0;
    let failureCount = 0;

    // 2. Ejecutar recursos
    for (const resource of space.resources) {
      try {
        const startTime = Date.now();
        await this.executeResource(resource);
        const executionTime = Date.now() - startTime;

        // Registrar éxito
        this.analyticsService.recordResourceExecution({
          spaceId: space.id,
          resourceType: resource.type,
          resourcePath: resource.path,
          success: true,
          executionTimeMs: executionTime
        });

        successCount++;
      } catch (error) {
        // Registrar fallo
        this.analyticsService.recordResourceExecution({
          spaceId: space.id,
          resourceType: resource.type,
          resourcePath: resource.path,
          success: false
        });

        // Registrar error detallado
        this.analyticsService.recordError({
          spaceId: space.id,
          executionLogId: executionId,
          errorType: 'resource_error',
          errorCode: error.code,
          errorMessage: error.message,
          stackTrace: error.stack,
          resourceType: resource.type,
          resourcePath: resource.path
        });

        failureCount++;
      }
    }

    // 3. Finalizar tracking
    this.analyticsService.completeExecution({
      id: executionId,
      success: failureCount === 0,
      resourcesSuccess: successCount,
      resourcesFailed: failureCount,
      errorMessage: failureCount > 0 ? `${failureCount} resources failed` : undefined
    });

    return {
      success: failureCount === 0,
      resourcesSuccess: successCount,
      resourcesFailed: failureCount
    };
  }
}
```

### Dashboard con Estadísticas en Tiempo Real

```typescript
// SpaceCard.tsx - Mostrar stats de un espacio
export function SpaceCard({ space }: { space: Space }) {
  const [stats, setStats] = useState<SpaceStats | null>(null);

  useEffect(() => {
    loadStats();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [space.id]);

  async function loadStats() {
    const metrics = await window.electronAPI.analytics.getSpaceMetrics(
      space.id,
      7 // últimos 7 días
    );

    // Calcular estadísticas
    const totalExecutions = metrics.executionLogs.length;
    const successRate = totalExecutions > 0
      ? (metrics.executionLogs.filter(l => l.success).length / totalExecutions) * 100
      : 0;
    
    const avgDuration = totalExecutions > 0
      ? metrics.executionLogs.reduce((sum, l) => sum + (l.durationMs || 0), 0) / totalExecutions
      : 0;

    setStats({
      totalExecutions,
      successRate,
      avgDuration,
      lastExecuted: metrics.executionLogs[0]?.startedAt
    });
  }

  if (!stats) return <div>Loading stats...</div>;

  return (
    <div className="space-card">
      <h3>{space.name}</h3>
      
      <div className="stats">
        <div>
          <label>Ejecuciones (7d)</label>
          <span>{stats.totalExecutions}</span>
        </div>
        
        <div>
          <label>Tasa de éxito</label>
          <span>{stats.successRate.toFixed(1)}%</span>
        </div>
        
        <div>
          <label>Duración promedio</label>
          <span>{(stats.avgDuration / 1000).toFixed(1)}s</span>
        </div>
        
        {stats.lastExecuted && (
          <div>
            <label>Última ejecución</label>
            <span>{new Date(stats.lastExecuted).toLocaleString()}</span>
          </div>
        )}
      </div>
      
      <button onClick={() => executeSpace(space)}>
        Ejecutar Espacio
      </button>
    </div>
  );
}
```

---

## 🧪 Testing

### Test Unitario

```typescript
// AnalyticsRepository.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseService } from '@/main/services/DatabaseService';
import { AnalyticsRepository } from '@/modules/analytics/repositories/AnalyticsRepository';

describe('AnalyticsRepository', () => {
  let db: DatabaseService;
  let repository: AnalyticsRepository;

  beforeEach(async () => {
    db = new DatabaseService(':memory:');
    await db.initialize();
    repository = new AnalyticsRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it('should record execution successfully', () => {
    const id = repository.recordExecution({
      spaceId: 'test-space',
      spaceName: 'Test Space',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: 1000,
      success: true,
      resourcesTotal: 3,
      resourcesSuccess: 3,
      resourcesFailed: 0
    });

    expect(id).toBeGreaterThan(0);

    const logs = repository.getExecutionLogs({ spaceId: 'test-space' });
    expect(logs).toHaveLength(1);
    expect(logs[0].success).toBe(true);
  });

  it('should update daily metrics', () => {
    repository.recordExecution({
      spaceId: 'test-space',
      spaceName: 'Test Space',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: 1000,
      success: true,
      resourcesTotal: 2,
      resourcesSuccess: 2,
      resourcesFailed: 0
    });

    const today = new Date().toISOString().split('T')[0];
    const metrics = repository.getDailyMetrics({
      spaceId: 'test-space',
      startDate: today,
      endDate: today
    });

    expect(metrics).toHaveLength(1);
    expect(metrics[0].executionCount).toBe(1);
  });
});
```

---

## 🐛 Debugging

### Habilitar Logging SQL

```typescript
// Durante desarrollo
const db = new Database(dbPath, {
  verbose: console.log  // Imprime todas las queries SQL
});

// Ejemplo de output:
// SELECT * FROM execution_logs WHERE space_id = ? LIMIT 10
```

### Inspeccionar Base de Datos

```bash
# Desde terminal
sqlite3 ~/.space-manager/data/analytics.db

# Comandos útiles:
.tables                    # Listar tablas
.schema execution_logs     # Ver estructura de tabla
SELECT * FROM execution_logs LIMIT 5;
.quit
```

### Health Check

```typescript
// Verificar salud de la DB
const health = db.checkHealth();
console.log(health);
// { healthy: true } o { healthy: false, error: "..." }

// Estadísticas de la DB
const stats = db.getStats();
console.log(stats);
// {
//   size: 1048576,
//   pageCount: 256,
//   pageSize: 4096,
//   tables: 5,
//   indices: 12
// }
```

---

## 📚 Referencia Rápida

### Tipos Principales

```typescript
interface ExecutionLog {
  id?: number;
  spaceId: string;
  spaceName: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  success: boolean;
  errorMessage?: string;
  resourcesTotal: number;
  resourcesSuccess: number;
  resourcesFailed: number;
}

interface DailyMetric {
  id?: number;
  spaceId: string;
  date: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  avgDurationMs: number;
  totalDurationMs: number;
  minDurationMs?: number;
  maxDurationMs?: number;
}

interface ResourceStat {
  id?: number;
  spaceId: string;
  resourceType: 'application' | 'url' | 'file' | 'script';
  resourcePath: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  lastExecutedAt?: string;
  avgExecutionTimeMs?: number;
}

interface ErrorLog {
  id?: number;
  spaceId: string;
  executionLogId?: number;
  errorType: string;
  errorCode?: string;
  errorMessage: string;
  stackTrace?: string;
  resourceType?: string;
  resourcePath?: string;
  context?: Record<string, any>;
  occurredAt?: string;
}
```

### Métodos de Repository

```typescript
class AnalyticsRepository {
  // Execution Logs
  recordExecution(log: ExecutionLog): number
  recordExecutionStart(data): number
  updateExecutionComplete(data): void
  getExecutionLogs(filters): ExecutionLog[]
  
  // Daily Metrics
  getDailyMetrics(filters): DailyMetric[]
  
  // Resource Stats
  updateResourceStats(data): void
  getResourceStats(filters): ResourceStat[]
  
  // Error Logs
  recordError(error: ErrorLog): number
  getErrorLogs(filters): ErrorLog[]
  
  // Analytics
  getSpaceUsageSummary(): SpaceUsageSummary[]
  getRecentTrends(days): Trend[]
  getMostUsedSpaces(limit): MostUsed[]
  getTopErrors(days, limit): TopError[]
  
  // Maintenance
  cleanOldLogs(daysToKeep): number
}
```

---

## 🚨 Troubleshooting

### Error: "Database is locked"

```typescript
// Solución: Usar WAL mode
db.pragma('journal_mode = WAL');

// O esperar y reintentar
async function runWithRetry(fn: () => any, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return fn();
    } catch (error) {
      if (error.message.includes('database is locked') && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }
      throw error;
    }
  }
}
```

### Error: "Cannot find module 'better-sqlite3'"

```bash
# Reinstalar con rebuild
npm install better-sqlite3
npm run rebuild

# O instalar desde source
npm install --build-from-source better-sqlite3
```

### Performance Lento

```typescript
// 1. Verificar índices
db.exec('ANALYZE;');

// 2. Optimizar
db.optimize();

// 3. Usar transacciones para batch operations
db.transaction(() => {
  for (const item of items) {
    // ... inserts
  }
})();
```

---

## ✅ Best Practices

### DO ✅

```typescript
// ✅ Usar transacciones para múltiples inserts
db.transaction(() => {
  for (const log of logs) {
    repository.recordExecution(log);
  }
})();

// ✅ Cerrar conexión al salir
app.on('before-quit', () => {
  analyticsService.close();
});

// ✅ Manejar errores
try {
  repository.recordExecution(log);
} catch (error) {
  console.error('Failed to record execution:', error);
}

// ✅ Validar datos antes de insertar
if (!spaceId || !spaceName) {
  throw new Error('spaceId and spaceName are required');
}
```

### DON'T ❌

```typescript
// ❌ No hacer inserts individuales en loop
for (const log of logs) {
  repository.recordExecution(log);  // Lento!
}

// ❌ No olvidar cerrar la conexión
// Usar: analyticsService.close() al cerrar app

// ❌ No ignorar errores
repository.recordExecution(log);  // Sin try-catch

// ❌ No hacer queries complejas en renderer
// Usar IPC y ejecutar en main process
```

---

## 🎯 Próximos Pasos

1. Lee `SQLITE_ANALYTICS_INTEGRATION.md` para detalles completos
2. Revisa `ARCHITECTURE_UPDATE_SQLITE.md` para contexto arquitectónico
3. Explora los tests en `tests/unit/analytics/`
4. Implementa tu primer componente de analytics

---

**¿Preguntas?** Consulta la documentación completa o pregunta al equipo.

**Última Actualización:** 15 de Noviembre 2025
