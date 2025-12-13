# Dependency Injection Pattern

**Fase:** 5.5 Sprint 5.5.1
**Fecha:** 06 de Diciembre 2025
**Estado:** Implementado (sin romper código existente)

---

## 📋 Tabla de Contenidos

1. [Resumen](#resumen)
2. [Motivación](#motivación)
3. [Arquitectura](#arquitectura)
4. [Uso del Service Container](#uso-del-service-container)
5. [Interfaces Disponibles](#interfaces-disponibles)
6. [Ejemplo de Implementación](#ejemplo-de-implementación)
7. [Migration Strategy](#migration-strategy)
8. [Testing con DI](#testing-con-di)

---

## Resumen

Este documento describe el patrón de Dependency Injection (DI) implementado en el proyecto Space Manager. El sistema utiliza un **Service Container ligero** sin dependencias externas, siguiendo el patrón Service Locator.

**Características:**
- ✅ Sin dependencias externas (lightweight)
- ✅ Singleton pattern para el container
- ✅ Soporte para servicios singleton y transient
- ✅ Type-safe con TypeScript
- ✅ Fácil de testear con mocks

---

## Motivación

### Problemas del Código Actual

```typescript
// ❌ Problema: Hard-coded dependencies
export class TaskService {
  private repository: TaskRepository

  constructor() {
    this.repository = new TaskRepository() // Difícil de mockear
  }
}
```

**Desventajas:**
- ❌ Imposible crear unit tests con mocks reales
- ❌ Fuerte acoplamiento entre clases
- ❌ Difícil cambiar implementaciones
- ❌ Dificulta el testing

### Solución con DI

```typescript
// ✅ Solución: Dependency Injection
export class TaskService implements ITaskService {
  constructor(
    private readonly repository: ITaskRepository,
    private readonly logger: ILogger,
    private readonly eventBus: IEventBus
  ) {}
}
```

**Ventajas:**
- ✅ Fácil crear mocks para testing
- ✅ Bajo acoplamiento
- ✅ Fácil intercambiar implementaciones
- ✅ Código más mantenible

---

## Arquitectura

### Service Container

El `ServiceContainer` es un singleton que maneja el registro y resolución de servicios:

```typescript
import { container, ServiceNames } from '@/shared/di'

// Registrar servicio
container().register(ServiceNames.LOGGER, () => new Logger(), true)

// Resolver servicio
const logger = container().resolve<ILogger>(ServiceNames.LOGGER)
```

### Interfaces

Todas las interfaces están en carpetas `interfaces/` dentro de cada módulo:

```
src/
├── shared/interfaces/
│   ├── ILogger.ts
│   ├── IEventBus.ts
│   └── IFileSystemService.ts
├── modules/
│   ├── workspace/interfaces/
│   │   ├── ISpaceRepository.ts
│   │   └── ISpaceService.ts
│   ├── tasks/interfaces/
│   │   ├── ITaskRepository.ts
│   │   └── ITaskService.ts
│   └── analytics/interfaces/
│       └── IAnalyticsService.ts
```

---

## Uso del Service Container

### 1. Registrar Servicios

```typescript
import { container, ServiceNames } from '@/shared/di'
import { Logger } from '@/shared/utils/logger'
import { EventBus } from '@/shared/utils/event-bus'
import { TaskRepository } from '@/modules/tasks/repositories/TaskRepository'
import { TaskService } from '@/modules/tasks/services/TaskService'

// Core services
container().register(ServiceNames.LOGGER, () => new Logger(), true)
container().register(ServiceNames.EVENT_BUS, () => new EventBus(), true)

// Task services (con dependencias)
container().register(
  ServiceNames.TASK_REPOSITORY,
  () => new TaskRepository(),
  true
)

container().register(
  ServiceNames.TASK_SERVICE,
  () => {
    const repository = container().resolve<ITaskRepository>(ServiceNames.TASK_REPOSITORY)
    const logger = container().resolve<ILogger>(ServiceNames.LOGGER)
    const eventBus = container().resolve<IEventBus>(ServiceNames.EVENT_BUS)
    return new TaskService(repository, logger, eventBus)
  },
  true
)
```

### 2. Resolver Servicios

```typescript
import { container, ServiceNames } from '@/shared/di'
import type { ITaskService } from '@/modules/tasks/interfaces'

// En IPC handlers o main process
const taskService = container().resolve<ITaskService>(ServiceNames.TASK_SERVICE)
const result = await taskService.createTask(taskData)
```

---

## Interfaces Disponibles

### Core Interfaces

#### `ILogger`
```typescript
interface ILogger {
  debug(message: string, meta?: any): void
  info(message: string, meta?: any): void
  warn(message: string, meta?: any): void
  error(message: string, error?: any, meta?: any): void
}
```

#### `IEventBus`
```typescript
interface IEventBus {
  on(event: string, handler: (...args: any[]) => void): () => void
  emit(event: string, ...args: any[]): void
  off(event: string, handler: (...args: any[]) => void): void
  once(event: string, handler: (...args: any[]) => void): void
  removeAllListeners(event?: string): void
}
```

### Module Interfaces

Ver documentación completa en cada carpeta `interfaces/`:
- `ISpaceRepository`, `ISpaceService` - Workspace module
- `ITaskRepository`, `ITaskService` - Tasks module
- `IAnalyticsService` - Analytics module

---

## Ejemplo de Implementación

### Paso 1: Crear Interface

```typescript
// src/modules/example/interfaces/IExampleService.ts
export interface IExampleService {
  doSomething(input: string): Promise<Result<string>>
}
```

### Paso 2: Implementar Servicio con DI

```typescript
// src/modules/example/services/ExampleService.ts
import type { IExampleService } from '../interfaces'
import type { ILogger } from '@/shared/interfaces'

export class ExampleService implements IExampleService {
  constructor(
    private readonly logger: ILogger,
    // Otras dependencias...
  ) {}

  async doSomething(input: string): Promise<Result<string>> {
    this.logger.info('Doing something', { input })
    // Implementation...
    return { success: true, data: 'result' }
  }
}
```

### Paso 3: Registrar en Container

```typescript
// src/main/index.ts o bootstrap file
import { container, ServiceNames } from '@/shared/di'
import { ExampleService } from '@/modules/example/services/ExampleService'

container().register(
  'ExampleService',
  () => {
    const logger = container().resolve<ILogger>(ServiceNames.LOGGER)
    return new ExampleService(logger)
  },
  true // singleton
)
```

### Paso 4: Usar en IPC Handler

```typescript
// src/main/ipc/handlers/example-handlers.ts
import { container } from '@/shared/di'
import type { IExampleService } from '@/modules/example/interfaces'

ipcMain.handle('example:doSomething', async (_event, input: string) => {
  const service = container().resolve<IExampleService>('ExampleService')
  return await service.doSomething(input)
})
```

---

## Migration Strategy

### Enfoque Sin Romper Código Existente

**Paso 1: Crear interfaces (✅ COMPLETADO)**
- No modifica código existente
- Solo añade nuevos archivos

**Paso 2: Opcionalmente refactorizar servicios**
- Mantener código actual funcionando
- Crear versiones con DI en paralelo
- Migrar gradualmente

**Paso 3: Actualizar IPC handlers**
- Usar container en lugar de instancias directas
- Cambiar uno a la vez

### Ejemplo de Migración Gradual

```typescript
// ANTES (código actual - sigue funcionando)
const taskService = new TaskService()

// DESPUÉS (con DI - opcional)
const taskService = container().resolve<ITaskService>(ServiceNames.TASK_SERVICE)
```

---

## Testing con DI

### Unit Test con Mocks

```typescript
import { describe, it, expect, mock } from 'node:test'
import { TaskService } from '@/modules/tasks/services/TaskService'
import type { ITaskRepository, ILogger, IEventBus } from '@/shared/interfaces'

describe('TaskService', () => {
  it('should create task successfully', async () => {
    // Arrange - Create mocks
    const mockRepository: ITaskRepository = {
      create: mock.fn(async (task) => ({ success: true, data: task })),
      // Other methods...
    }

    const mockLogger: ILogger = {
      info: mock.fn(),
      error: mock.fn(),
      // Other methods...
    }

    const mockEventBus: IEventBus = {
      emit: mock.fn(),
      // Other methods...
    }

    // Create service with mocked dependencies
    const service = new TaskService(mockRepository, mockLogger, mockEventBus)

    // Act
    const result = await service.createTask({
      title: 'Test Task',
      spaceId: '123'
    })

    // Assert
    expect(result.success).toBe(true)
    expect(mockRepository.create).toHaveBeenCalledTimes(1)
    expect(mockLogger.info).toHaveBeenCalled()
  })
})
```

---

## Beneficios del Sistema DI

1. **Testabilidad**: Fácil crear mocks para unit tests
2. **Mantenibilidad**: Código desacoplado y modular
3. **Flexibilidad**: Fácil cambiar implementaciones
4. **Type Safety**: TypeScript garantiza tipos correctos
5. **Sin Dependencias**: No requiere librerías externas
6. **Performance**: Singleton caching para servicios pesados

---

## Próximos Pasos

1. ✅ Sprint 5.5.1 - Interfaces y Container (COMPLETADO)
2. ⏳ Sprint 5.5.2 - Refactorizar servicios (OPCIONAL)
3. ⏳ Sprint 5.5.3 - Tests unitarios (OPCIONAL)

**Nota:** Los sprints 5.5.2 y 5.5.3 son opcionales. El código actual sigue funcionando sin cambios.

---

## Referencias

- [Dependency Injection Pattern](https://en.wikipedia.org/wiki/Dependency_injection)
- [Service Locator Pattern](https://en.wikipedia.org/wiki/Service_locator_pattern)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
