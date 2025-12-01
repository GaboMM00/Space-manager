# Arquitectura Técnica - Space Manager

**Versión:** 1.0.0  
**Fecha:** 15 de Noviembre 2025  
**Estado:** Definitivo

---

## Tabla de Contenidos

1. [Visión General de la Arquitectura](#1-visión-general)
2. [Arquitectura de Capas](#2-arquitectura-de-capas)
3. [Patrones de Diseño](#3-patrones-de-diseño)
4. [Estructura de Módulos](#4-estructura-de-módulos)
5. [Comunicación Entre Procesos](#5-comunicación-entre-procesos)
6. [Sistema de Persistencia](#6-sistema-de-persistencia)
7. [Motor de Ejecución](#7-motor-de-ejecución)
8. [Sistema de Plugins](#8-sistema-de-plugins)
9. [Diagramas de Arquitectura](#9-diagramas)

---

## 1. Visión General

### 1.1 Principios Arquitectónicos

**SOLID:**
- **S**ingle Responsibility: Cada clase tiene una única responsabilidad
- **O**pen/Closed: Abierto a extensión, cerrado a modificación
- **L**iskov Substitution: Subtipos deben ser sustituibles por sus tipos base
- **I**nterface Segregation: Interfaces específicas mejor que generales
- **D**ependency Inversion: Depender de abstracciones, no de concreciones

**DRY (Don't Repeat Yourself):**
- Código reutilizable en utilities y helpers
- Componentes UI compartidos
- Lógica de negocio centralizada en servicios

**Separation of Concerns:**
- UI separada de lógica de negocio
- Lógica de negocio separada de persistencia
- Renderer process independiente del main process

**MVVM (Model-View-ViewModel):**
- Models: Entidades de datos puras
- Views: Componentes React (presentación pura)
- ViewModels: Lógica de presentación y estado

### 1.2 Stack Tecnológico Completo

```
┌─────────────────────────────────────────────────────┐
│                   Electron 32+                      │
├─────────────────────┬───────────────────────────────┤
│  Renderer Process   │     Main Process              │
│  ─────────────────  │     ─────────────             │
│  React 18           │     Node.js 20                │
│  TypeScript 5       │     TypeScript 5              │
│  TailwindCSS 3      │                               │
│  Zustand (state)    │     Services Layer            │
│  React Router       │     Controllers               │
│  Radix UI           │     Data Access               │
│                     │                               │
├─────────────────────┴───────────────────────────────┤
│              Build & Development                    │
│              ──────────────────────                 │
│              Vite (bundler)                         │
│              electron-vite (integration)            │
│              Vitest (testing)                       │
│              Playwright (E2E)                       │
└─────────────────────────────────────────────────────┘
```

---

## 2. Arquitectura de Capas

### 2.1 Diagrama de Capas

```
┌──────────────────────────────────────────────────────┐
│                  Presentation Layer                  │
│              (React Components + Views)              │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │Dashbrd │  │Editor  │  │Settings│  │Analytics│   │
│  └────────┘  └────────┘  └────────┘  └────────┘   │
└───────────────────────┬──────────────────────────────┘
                        │ Props / Events
┌───────────────────────▼──────────────────────────────┐
│               ViewModel Layer (Hooks)                │
│           (State Management + Presentation Logic)    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │useSpaces   │  │useTasks    │  │useAnalytics│    │
│  └────────────┘  └────────────┘  └────────────┘    │
└───────────────────────┬──────────────────────────────┘
                        │ IPC
┌───────────────────────▼──────────────────────────────┐
│                Business Logic Layer                  │
│              (Services + Domain Logic)               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │SpaceSvc    │  │TaskSvc     │  │ExecSvc     │    │
│  └────────────┘  └────────────┘  └────────────┘    │
└───────────────────────┬──────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────┐
│                Data Access Layer                     │
│           (Persistence + External APIs)              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │DataStore   │  │FileSystem  │  │Calendar API│    │
│  └────────────┘  └────────────┘  └────────────┘    │
└───────────────────────┬──────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────┐
│              Infrastructure Layer                    │
│         (OS APIs, File System, Process)              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │File I/O    │  │child_proc  │  │OS APIs     │    │
│  └────────────┘  └────────────┘  └────────────┘    │
└──────────────────────────────────────────────────────┘
```

### 2.2 Descripción de Capas

#### Presentation Layer (Renderer Process)
**Responsabilidad:** Interfaz de usuario y presentación visual

**Tecnologías:**
- React 18 con TypeScript
- TailwindCSS para estilos
- Radix UI para componentes accesibles
- React Router para navegación

**Componentes:**
- Pages: Vistas completas de la aplicación
- Layouts: Estructuras de página reutilizables
- Components: Elementos UI reutilizables
- Features: Componentes específicos de funcionalidad

**Reglas:**
- NO lógica de negocio directa
- Solo presentación y manejo de eventos de UI
- Comunicación con backend via hooks/services
- Estado local únicamente para UI (modals, forms)

#### ViewModel Layer (Custom Hooks)
**Responsabilidad:** Lógica de presentación y gestión de estado de UI

**Implementación:**
- Custom Hooks de React
- Zustand para estado global compartido
- React Query para caching de datos del backend

**Hooks Principales:**
```typescript
// Gestión de espacios
const useSpaces = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const createSpace = async (data: CreateSpaceDto) => {
    const space = await window.electronAPI.spaces.create(data);
    setSpaces(prev => [...prev, space]);
  };
  // ... más lógica
  return { spaces, createSpace, updateSpace, deleteSpace };
};

// Ejecución de espacios
const useSpaceExecution = (spaceId: string) => {
  const [status, setStatus] = useState<ExecutionStatus>('idle');
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const unsubscribe = window.electronAPI.onExecutionProgress(
      (data) => setProgress(data.progress)
    );
    return unsubscribe;
  }, []);
  
  const execute = async () => {
    setStatus('running');
    await window.electronAPI.spaces.execute(spaceId);
    setStatus('completed');
  };
  
  return { status, progress, execute };
};
```

**Reglas:**
- Abstraen comunicación con IPC
- Gestionan estado derivado de datos del backend
- Proveen API simple para componentes
- Manejan loading/error states

#### Business Logic Layer (Main Process)
**Responsabilidad:** Lógica de negocio central de la aplicación

**Servicios Principales:**

```typescript
// SpaceService
class SpaceService {
  constructor(
    private dataStore: DataStore,
    private validator: SpaceValidator,
    private eventBus: EventBus
  ) {}

  async createSpace(data: CreateSpaceDto): Promise<Space> {
    // 1. Validar datos
    await this.validator.validate(data);
    
    // 2. Crear entidad
    const space: Space = {
      id: uuid(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resources: []
    };
    
    // 3. Persistir
    await this.dataStore.spaces.create(space);
    
    // 4. Emitir evento
    this.eventBus.emit('space:created', space);
    
    return space;
  }

  async updateSpace(id: string, data: UpdateSpaceDto): Promise<Space> {
    // Validación, actualización, persistencia, eventos
  }

  async deleteSpace(id: string): Promise<void> {
    // Validación, eliminación, cleanup, eventos
  }

  async getSpace(id: string): Promise<Space | null> {
    return this.dataStore.spaces.findById(id);
  }

  async listSpaces(filters?: SpaceFilters): Promise<Space[]> {
    return this.dataStore.spaces.find(filters);
  }
}
```

**ExecutionService:**
```typescript
class ExecutionService {
  constructor(
    private orchestrator: ExecutionOrchestrator,
    private spaceService: SpaceService,
    private analyticsService: AnalyticsService,
    private logger: Logger
  ) {}

  async executeSpace(spaceId: string): Promise<ExecutionResult> {
    // 1. Obtener espacio
    const space = await this.spaceService.getSpace(spaceId);
    if (!space) throw new Error('Space not found');

    // 2. Crear contexto de ejecución
    const context: ExecutionContext = {
      spaceId,
      startTime: Date.now(),
      resources: space.resources.filter(r => r.enabled)
    };

    // 3. Ejecutar mediante orchestrator
    const result = await this.orchestrator.execute(context);

    // 4. Registrar métricas
    await this.analyticsService.recordExecution({
      spaceId,
      duration: Date.now() - context.startTime,
      success: result.success,
      errors: result.errors
    });

    // 5. Log
    this.logger.info('Space executed', { spaceId, result });

    return result;
  }
}
```

**Reglas:**
- Sin dependencias de UI
- Testeable de forma aislada
- Usa inyección de dependencias
- Emite eventos para comunicación desacoplada

#### Data Access Layer
**Responsabilidad:** Abstracción de persistencia y acceso a datos

**Estrategia de Persistencia Híbrida:**
- **JSON**: Configuración, espacios, tareas, settings (datos estructurados, bajo volumen)
- **SQLite**: Analytics y métricas (alto volumen, queries complejas, agregaciones)

**DataStore:**
```typescript
class DataStore {
  private cache: Map<string, any> = new Map();
  
  constructor(
    private fileSystem: FileSystemService,
    private validator: JSONValidator,
    private database: DatabaseService
  ) {}

  // Repository pattern para cada entidad
  get spaces() {
    return new SpaceRepository(this.fileSystem, this.validator);
  }

  get tasks() {
    return new TaskRepository(this.fileSystem, this.validator);
  }

  // Analytics usa SQLite para mejor performance
  get analytics() {
    return new AnalyticsRepository(this.database);
  }
}

// Repository base
abstract class BaseRepository<T> {
  constructor(
    protected fileSystem: FileSystemService,
    protected validator: JSONValidator
  ) {}

  abstract getFilePath(): string;
  abstract getSchema(): JSONSchema;

  async findAll(): Promise<T[]> {
    const data = await this.fileSystem.readJSON(this.getFilePath());
    return data.items || [];
  }

  async findById(id: string): Promise<T | null> {
    const items = await this.findAll();
    return items.find(item => item.id === id) || null;
  }

  async create(item: T): Promise<T> {
    const items = await this.findAll();
    items.push(item);
    await this.save(items);
    return item;
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    const items = await this.findAll();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Not found');
    
    items[index] = { ...items[index], ...updates };
    await this.save(items);
    return items[index];
  }

  async delete(id: string): Promise<void> {
    const items = await this.findAll();
    const filtered = items.filter(item => item.id !== id);
    await this.save(filtered);
  }

  protected async save(items: T[]): Promise<void> {
    const data = { version: '1.0', items };
    await this.validator.validate(data, this.getSchema());
    await this.fileSystem.writeJSON(this.getFilePath(), data);
  }
}
```

**FileSystemService:**
```typescript
class FileSystemService {
  constructor(private basePath: string) {}

  async readJSON<T>(filePath: string): Promise<T> {
    const fullPath = path.join(this.basePath, filePath);
    const content = await fs.promises.readFile(fullPath, 'utf-8');
    return JSON.parse(content);
  }

  async writeJSON(filePath: string, data: any): Promise<void> {
    const fullPath = path.join(this.basePath, filePath);
    const content = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(fullPath, content, 'utf-8');
  }

  async exists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.basePath, filePath);
    try {
      await fs.promises.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async createDirectory(dirPath: string): Promise<void> {
    const fullPath = path.join(this.basePath, dirPath);
    await fs.promises.mkdir(fullPath, { recursive: true });
  }
}
```

**Reglas:**
- Abstrae detalles de persistencia
- Validación de datos antes de guardar
- Manejo de errores de I/O
- Caching opcional para performance

---

## 3. Patrones de Diseño

### 3.1 MVVM (Model-View-ViewModel)

```
┌─────────────────────────────────────────────┐
│                  View (React)               │
│  ┌──────────────────────────────────────┐  │
│  │  <SpaceCard space={space}            │  │
│  │             onExecute={handleExec} />│  │
│  └──────────────────┬───────────────────┘  │
└─────────────────────┼───────────────────────┘
                      │ Props/Events
┌─────────────────────▼───────────────────────┐
│            ViewModel (Custom Hook)          │
│  ┌──────────────────────────────────────┐  │
│  │  const { spaces, executeSpace } =    │  │
│  │    useSpaces();                      │  │
│  │                                      │  │
│  │  const handleExecute = (id) => {     │  │
│  │    executeSpace(id);                 │  │
│  │  }                                   │  │
│  └──────────────────┬───────────────────┘  │
└─────────────────────┼───────────────────────┘
                      │ IPC Calls
┌─────────────────────▼───────────────────────┐
│             Model (Service Layer)           │
│  ┌──────────────────────────────────────┐  │
│  │  class SpaceService {                │  │
│  │    async executeSpace(id) {          │  │
│  │      // Business logic               │  │
│  │    }                                 │  │
│  │  }                                   │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**Beneficios:**
- Separación clara de responsabilidades
- UI totalmente desacoplada de lógica de negocio
- Testeable de forma independiente
- Reutilización de lógica en múltiples vistas

### 3.2 Repository Pattern

```typescript
// Abstracción
interface ISpaceRepository {
  findAll(): Promise<Space[]>;
  findById(id: string): Promise<Space | null>;
  create(space: Space): Promise<Space>;
  update(id: string, updates: Partial<Space>): Promise<Space>;
  delete(id: string): Promise<void>;
}

// Implementación concreta
class SpaceRepository implements ISpaceRepository {
  // Implementación específica de persistencia
}

// Uso en servicio
class SpaceService {
  constructor(private repository: ISpaceRepository) {}
  
  async createSpace(data: CreateSpaceDto): Promise<Space> {
    const space = this.mapDtoToEntity(data);
    return this.repository.create(space);
  }
}
```

**Beneficios:**
- Abstrae detalles de persistencia
- Fácil cambiar backend (JSON → SQLite → Cloud)
- Testeable con mocks
- Lógica de acceso a datos centralizada

### 3.3 Factory Pattern (Executors)

```typescript
// Factory
class ExecutorFactory {
  private executors: Map<ResourceType, IExecutor> = new Map();

  constructor() {
    this.executors.set('application', new ApplicationExecutor());
    this.executors.set('url', new URLExecutor());
    this.executors.set('script', new ScriptExecutor());
    this.executors.set('file', new FileExecutor());
  }

  getExecutor(type: ResourceType): IExecutor {
    const executor = this.executors.get(type);
    if (!executor) throw new Error(`No executor for type: ${type}`);
    return executor;
  }
}

// Interface común
interface IExecutor {
  execute(resource: Resource): Promise<ExecutionResult>;
  validate(resource: Resource): Promise<ValidationResult>;
  canExecute(resource: Resource): boolean;
}

// Implementaciones concretas
class ApplicationExecutor implements IExecutor {
  async execute(resource: ApplicationResource): Promise<ExecutionResult> {
    // Lanzar aplicación nativa
  }
  // ...
}

class URLExecutor implements IExecutor {
  async execute(resource: URLResource): Promise<ExecutionResult> {
    // Abrir URL en navegador
  }
  // ...
}
```

**Beneficios:**
- Extensible: Agregar nuevos tipos de recursos fácilmente
- Polimorfismo: Todos los executors comparten interfaz
- Single Responsibility: Cada executor maneja un solo tipo

### 3.4 Strategy Pattern (Execution Strategies)

```typescript
// Estrategia de ejecución
interface IExecutionStrategy {
  execute(resources: Resource[]): Promise<ExecutionResult[]>;
}

// Ejecución secuencial
class SequentialExecutionStrategy implements IExecutionStrategy {
  async execute(resources: Resource[]): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];
    for (const resource of resources) {
      const result = await this.executeOne(resource);
      results.push(result);
      if (!result.success && this.config.stopOnError) break;
    }
    return results;
  }
}

// Ejecución paralela
class ParallelExecutionStrategy implements IExecutionStrategy {
  async execute(resources: Resource[]): Promise<ExecutionResult[]> {
    const promises = resources.map(r => this.executeOne(r));
    return Promise.all(promises);
  }
}

// Orchestrator usa estrategia
class ExecutionOrchestrator {
  constructor(private strategy: IExecutionStrategy) {}

  setStrategy(strategy: IExecutionStrategy) {
    this.strategy = strategy;
  }

  async executeSpace(space: Space): Promise<ExecutionResult[]> {
    return this.strategy.execute(space.resources);
  }
}
```

**Beneficios:**
- Intercambiar algoritmos en runtime
- Agregar nuevas estrategias sin modificar código existente
- Configuración flexible por usuario

### 3.5 Observer Pattern (Event Bus)

```typescript
// Event Bus central
class EventBus {
  private listeners: Map<string, Set<EventListener>> = new Map();

  on(event: string, listener: EventListener): UnsubscribeFn {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // Retorna función para desuscribirse
    return () => this.off(event, listener);
  }

  off(event: string, listener: EventListener): void {
    this.listeners.get(event)?.delete(listener);
  }

  emit(event: string, data?: any): void {
    const listeners = this.listeners.get(event);
    if (!listeners) return;
    
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
}

// Uso en servicios
class SpaceService {
  constructor(private eventBus: EventBus) {}

  async createSpace(data: CreateSpaceDto): Promise<Space> {
    const space = await this.repository.create(data);
    this.eventBus.emit('space:created', space);
    return space;
  }
}

// Suscripción en otro módulo
class AnalyticsService {
  constructor(eventBus: EventBus) {
    eventBus.on('space:created', this.onSpaceCreated.bind(this));
    eventBus.on('space:executed', this.onSpaceExecuted.bind(this));
  }

  private onSpaceCreated(space: Space): void {
    this.trackEvent('space_created', { spaceId: space.id });
  }
}
```

**Beneficios:**
- Desacoplamiento total entre módulos
- Comunicación pub/sub flexible
- Fácil agregar nuevos listeners
- No hay dependencias circulares

### 3.6 Dependency Injection

```typescript
// Container de DI
class DIContainer {
  private services: Map<string, any> = new Map();

  register<T>(key: string, factory: () => T): void {
    this.services.set(key, factory);
  }

  resolve<T>(key: string): T {
    const factory = this.services.get(key);
    if (!factory) throw new Error(`Service not found: ${key}`);
    return factory();
  }
}

// Configuración de servicios
function setupDI(): DIContainer {
  const container = new DIContainer();

  // Infraestructura
  container.register('FileSystemService', () => 
    new FileSystemService(app.getPath('userData'))
  );
  container.register('EventBus', () => new EventBus());
  container.register('Logger', () => new Logger());

  // Data Access
  container.register('DataStore', () => 
    new DataStore(
      container.resolve('FileSystemService'),
      container.resolve('JSONValidator')
    )
  );

  // Business Logic
  container.register('SpaceService', () => 
    new SpaceService(
      container.resolve('DataStore'),
      container.resolve('SpaceValidator'),
      container.resolve('EventBus')
    )
  );

  container.register('ExecutionService', () => 
    new ExecutionService(
      container.resolve('ExecutionOrchestrator'),
      container.resolve('SpaceService'),
      container.resolve('AnalyticsService')
    )
  );

  return container;
}
```

**Beneficios:**
- Control total sobre creación de objetos
- Fácil mockear dependencias en tests
- Configuración centralizada
- Ciclo de vida gestionado

---

## 4. Estructura de Módulos

### 4.1 Módulo de Workspace

```
src/modules/workspace/
├── models/
│   ├── Space.ts               # Entidad Space
│   ├── Resource.ts            # Entidades de recursos
│   └── types.ts               # Tipos compartidos
├── services/
│   ├── SpaceService.ts        # Lógica de negocio
│   ├── ResourceService.ts
│   └── ValidationService.ts
├── repositories/
│   └── SpaceRepository.ts     # Acceso a datos
├── validators/
│   ├── SpaceValidator.ts      # Validaciones
│   └── ResourceValidator.ts
└── index.ts                   # Exports públicos
```

### 4.2 Módulo de Execution

```
src/modules/execution/
├── orchestrator/
│   ├── ExecutionOrchestrator.ts    # Coordinador principal
│   ├── ExecutionContext.ts
│   └── ExecutionQueue.ts
├── executors/
│   ├── IExecutor.ts                # Interface
│   ├── ExecutorFactory.ts
│   ├── ApplicationExecutor.ts      # Por tipo de recurso
│   ├── URLExecutor.ts
│   ├── ScriptExecutor.ts
│   └── FileExecutor.ts
├── strategies/
│   ├── IExecutionStrategy.ts
│   ├── SequentialStrategy.ts
│   └── ParallelStrategy.ts
└── index.ts
```

### 4.3 Módulo de Tasks

```
src/modules/tasks/
├── models/
│   ├── Task.ts
│   └── Reminder.ts
├── services/
│   ├── TaskService.ts
│   └── ReminderService.ts
├── repositories/
│   └── TaskRepository.ts
└── index.ts
```

### 4.4 Módulo de Analytics

```
src/modules/analytics/
├── models/
│   ├── ExecutionLog.ts
│   ├── Metrics.ts
│   └── Report.ts
├── services/
│   ├── AnalyticsService.ts
│   ├── MetricsAggregator.ts
│   └── ReportGenerator.ts
├── repositories/
│   └── AnalyticsRepository.ts  # SQLite-based
└── index.ts
```

**Nota:** Este módulo usa SQLite (better-sqlite3) para almacenamiento de métricas.

### 4.5 Módulo de Plugins

```
src/modules/plugins/
├── models/
│   ├── Plugin.ts
│   └── PluginManifest.ts
├── services/
│   ├── PluginLoader.ts
│   ├── PluginRegistry.ts
│   └── PluginSandbox.ts
├── api/
│   └── PluginAPI.ts          # API expuesta a plugins
└── index.ts
```

---

## 5. Comunicación Entre Procesos (IPC)

### 5.1 Arquitectura IPC

```
┌─────────────────────────────────────────────────┐
│         Renderer Process (React)                │
│                                                 │
│  window.electronAPI.spaces.create(data)        │
│                ↓                                │
│  ┌──────────────────────────────────────────┐  │
│  │      Preload Script (API Surface)        │  │
│  │  contextBridge.exposeInMainWorld(...)    │  │
│  └──────────────────┬───────────────────────┘  │
└─────────────────────┼───────────────────────────┘
                      │ IPC Channel
┌─────────────────────▼───────────────────────────┐
│          Main Process (Node.js)                 │
│                                                 │
│  ipcMain.handle('spaces:create', handler)      │
│                ↓                                │
│  ┌──────────────────────────────────────────┐  │
│  │         Controllers Layer                │  │
│  │  SpaceController.handleCreate()          │  │
│  └──────────────────┬───────────────────────┘  │
│                     ↓                           │
│  ┌──────────────────────────────────────────┐  │
│  │         Services Layer                   │  │
│  │  SpaceService.createSpace()              │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 5.2 Preload API

```typescript
// src/preload/api.ts
import { contextBridge, ipcRenderer } from 'electron';

// API tipada y segura
const electronAPI = {
  // Spaces
  spaces: {
    create: (data: CreateSpaceDto) => 
      ipcRenderer.invoke('spaces:create', data),
    
    update: (id: string, data: UpdateSpaceDto) => 
      ipcRenderer.invoke('spaces:update', id, data),
    
    delete: (id: string) => 
      ipcRenderer.invoke('spaces:delete', id),
    
    list: (filters?: SpaceFilters) => 
      ipcRenderer.invoke('spaces:list', filters),
    
    get: (id: string) => 
      ipcRenderer.invoke('spaces:get', id),
    
    execute: (id: string) => 
      ipcRenderer.invoke('spaces:execute', id),
  },

  // Tasks
  tasks: {
    create: (data: CreateTaskDto) => 
      ipcRenderer.invoke('tasks:create', data),
    
    update: (id: string, data: UpdateTaskDto) => 
      ipcRenderer.invoke('tasks:update', id, data),
    
    delete: (id: string) => 
      ipcRenderer.invoke('tasks:delete', id),
    
    list: (spaceId?: string) => 
      ipcRenderer.invoke('tasks:list', spaceId),
    
    toggle: (id: string) => 
      ipcRenderer.invoke('tasks:toggle', id),
  },

  // Analytics
  analytics: {
    getMetrics: (spaceId?: string, range?: DateRange) => 
      ipcRenderer.invoke('analytics:getMetrics', spaceId, range),
    
    exportReport: (format: 'csv' | 'json' | 'pdf', options: ExportOptions) => 
      ipcRenderer.invoke('analytics:exportReport', format, options),
  },

  // Settings
  settings: {
    get: () => 
      ipcRenderer.invoke('settings:get'),
    
    update: (data: Partial<AppSettings>) => 
      ipcRenderer.invoke('settings:update', data),
  },

  // Event listeners (Main → Renderer)
  onExecutionProgress: (callback: (progress: ExecutionProgress) => void) => {
    const listener = (_: any, data: ExecutionProgress) => callback(data);
    ipcRenderer.on('execution:progress', listener);
    return () => ipcRenderer.removeListener('execution:progress', listener);
  },

  onNotification: (callback: (notification: Notification) => void) => {
    const listener = (_: any, data: Notification) => callback(data);
    ipcRenderer.on('notification', listener);
    return () => ipcRenderer.removeListener('notification', listener);
  },

  onDataUpdated: (callback: (event: DataUpdateEvent) => void) => {
    const listener = (_: any, data: DataUpdateEvent) => callback(data);
    ipcRenderer.on('data:updated', listener);
    return () => ipcRenderer.removeListener('data:updated', listener);
  },
};

// Exponer API al renderer
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type augmentation para TypeScript
export type ElectronAPI = typeof electronAPI;

// En renderer, esto permitirá:
// window.electronAPI.spaces.create({ ... })
```

### 5.3 Controllers (Main Process)

```typescript
// src/main/controllers/SpaceController.ts
import { ipcMain } from 'electron';
import { SpaceService } from '@/modules/workspace/services/SpaceService';
import { Logger } from '@/shared/utils/Logger';

export class SpaceController {
  constructor(
    private spaceService: SpaceService,
    private logger: Logger
  ) {
    this.registerHandlers();
  }

  private registerHandlers(): void {
    ipcMain.handle('spaces:create', this.handleCreate.bind(this));
    ipcMain.handle('spaces:update', this.handleUpdate.bind(this));
    ipcMain.handle('spaces:delete', this.handleDelete.bind(this));
    ipcMain.handle('spaces:list', this.handleList.bind(this));
    ipcMain.handle('spaces:get', this.handleGet.bind(this));
    ipcMain.handle('spaces:execute', this.handleExecute.bind(this));
  }

  private async handleCreate(
    _event: Electron.IpcMainInvokeEvent,
    data: CreateSpaceDto
  ): Promise<Space> {
    try {
      this.logger.info('Creating space', { data });
      const space = await this.spaceService.createSpace(data);
      this.logger.info('Space created', { spaceId: space.id });
      return space;
    } catch (error) {
      this.logger.error('Failed to create space', { error, data });
      throw error;
    }
  }

  private async handleUpdate(
    _event: Electron.IpcMainInvokeEvent,
    id: string,
    data: UpdateSpaceDto
  ): Promise<Space> {
    try {
      this.logger.info('Updating space', { id, data });
      const space = await this.spaceService.updateSpace(id, data);
      this.logger.info('Space updated', { spaceId: space.id });
      return space;
    } catch (error) {
      this.logger.error('Failed to update space', { error, id, data });
      throw error;
    }
  }

  // ... más handlers
}
```

### 5.4 Manejo de Eventos Bidireccionales

```typescript
// Main Process envía eventos a Renderer
class ExecutionService {
  constructor(
    private mainWindow: BrowserWindow,
    private eventBus: EventBus
  ) {
    // Escuchar eventos internos
    this.eventBus.on('execution:progress', this.notifyProgress.bind(this));
    this.eventBus.on('execution:completed', this.notifyCompletion.bind(this));
  }

  private notifyProgress(progress: ExecutionProgress): void {
    this.mainWindow.webContents.send('execution:progress', progress);
  }

  private notifyCompletion(result: ExecutionResult): void {
    this.mainWindow.webContents.send('execution:completed', result);
  }
}

// Renderer Process escucha eventos
function useExecutionMonitor() {
  const [progress, setProgress] = useState<ExecutionProgress | null>(null);

  useEffect(() => {
    const unsubscribe = window.electronAPI.onExecutionProgress((data) => {
      setProgress(data);
    });
    return unsubscribe;
  }, []);

  return { progress };
}
```

---

## 6. Sistema de Persistencia

### 6.1 Arquitectura de Datos Híbrida

**Decisión Arquitectónica:** Sistema híbrido JSON + SQLite

```
┌──────────────────────────────────────────────────────┐
│              Application Layer                       │
│         (Services usando Repository)                 │
└───────────────────┬──────────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────────────┐
│            Repository Layer                          │
│  ┌────────────────────┐  ┌────────────────────────┐ │
│  │  JSON Repositories │  │  SQLite Repositories   │ │
│  │  - SpaceRepo       │  │  - AnalyticsRepo       │ │
│  │  - TaskRepo        │  │                        │ │
│  │  - SettingsRepo    │  │                        │ │
│  └────────┬───────────┘  └──────────┬─────────────┘ │
└───────────┼──────────────────────────┼───────────────┘
            │                          │
┌───────────▼──────────────┐  ┌────────▼──────────────┐
│    JSON DataStore        │  │   SQLite Connection   │
│  ┌──────────────────┐    │  │  ┌────────────────┐  │
│  │ Cache Layer      │    │  │  │ Connection Pool│  │
│  │ Validation       │    │  │  │ Query Builder  │  │
│  │ Migration        │    │  │  │ Transactions   │  │
│  └────────┬─────────┘    │  │  └────────┬───────┘  │
└───────────┼──────────────┘  └───────────┼───────────┘
            │                             │
┌───────────▼──────────────┐  ┌───────────▼───────────┐
│   FileSystem (fs)        │  │   SQLite Database     │
│  ┌──────────────────┐    │  │  ┌────────────────┐  │
│  │ spaces.json      │    │  │  │ analytics.db   │  │
│  │ tasks.json       │    │  │  │                │  │
│  │ settings.json    │    │  │  │ Tables:        │  │
│  │ plugins.json     │    │  │  │ - exec_logs    │  │
│  └──────────────────┘    │  │  │ - resource_ex  │  │
└──────────────────────────┘  │  │ - daily_met    │  │
                              │  │ - error_sum    │  │
                              │  └────────────────┘  │
                              └──────────────────────┘
```

**Distribución de Responsabilidades:**

| Tipo de Dato | Storage | Razón |
|--------------|---------|-------|
| Espacios | JSON | Baja frecuencia escritura, alta legibilidad |
| Tareas | JSON | Sincronización simple, backup fácil |
| Settings | JSON | Pocos datos, fácil editar manualmente |
| Plugins | JSON | Configuración portable |
| **Analytics** | **SQLite** | Gran volumen, queries complejas, agregaciones |

**Ventajas del Enfoque Híbrido:**
- ✅ JSON: Portable, legible, fácil backup manual
- ✅ SQLite: Queries eficientes, agregaciones SQL, escalabilidad
- ✅ No overhead de servidor externo
- ✅ Ambos embedded en la app

### 6.2 DataStore con Caching

```typescript
class DataStore {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  constructor(
    private fileSystem: FileSystemService,
    private validator: JSONValidator
  ) {}

  async read<T>(key: string, filePath: string): Promise<T> {
    // 1. Verificar cache
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }

    // 2. Leer del filesystem
    const data = await this.fileSystem.readJSON<T>(filePath);

    // 3. Actualizar cache
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    return data;
  }

  async write<T>(
    key: string,
    filePath: string,
    data: T,
    schema?: JSONSchema
  ): Promise<void> {
    // 1. Validar si hay schema
    if (schema) {
      await this.validator.validate(data, schema);
    }

    // 2. Crear backup antes de escribir
    if (await this.fileSystem.exists(filePath)) {
      await this.createBackup(filePath);
    }

    // 3. Escribir al filesystem
    await this.fileSystem.writeJSON(filePath, data);

    // 4. Invalidar cache
    this.cache.delete(key);
  }

  private async createBackup(filePath: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupPath = `backups/${path.basename(filePath)}.${timestamp}.bak`;
    await this.fileSystem.copy(filePath, backupPath);
  }

  clearCache(): void {
    this.cache.clear();
  }
}
```

### 6.3 Sistema de Migraciones

```typescript
interface Migration {
  version: string;
  up: (data: any) => Promise<any>;
  down: (data: any) => Promise<any>;
}

class MigrationManager {
  private migrations: Migration[] = [];

  register(migration: Migration): void {
    this.migrations.push(migration);
    this.migrations.sort((a, b) => 
      semver.compare(a.version, b.version)
    );
  }

  async migrate(data: any, targetVersion: string): Promise<any> {
    const currentVersion = data.version || '1.0.0';
    
    if (semver.eq(currentVersion, targetVersion)) {
      return data; // No migration needed
    }

    const isUpgrade = semver.gt(targetVersion, currentVersion);
    const relevantMigrations = this.getRelevantMigrations(
      currentVersion,
      targetVersion,
      isUpgrade
    );

    let migratedData = data;
    for (const migration of relevantMigrations) {
      migratedData = isUpgrade 
        ? await migration.up(migratedData)
        : await migration.down(migratedData);
    }

    migratedData.version = targetVersion;
    return migratedData;
  }

  private getRelevantMigrations(
    from: string,
    to: string,
    isUpgrade: boolean
  ): Migration[] {
    return this.migrations.filter(m => {
      if (isUpgrade) {
        return semver.gt(m.version, from) && semver.lte(m.version, to);
      } else {
        return semver.lte(m.version, from) && semver.gt(m.version, to);
      }
    });
  }
}

// Ejemplo de migración
const migration_1_1_0: Migration = {
  version: '1.1.0',
  async up(data) {
    // Agregar campo 'category' a spaces
    return {
      ...data,
      spaces: data.spaces.map((space: any) => ({
        ...space,
        category: space.category || 'General'
      }))
    };
  },
  async down(data) {
    // Remover campo 'category'
    return {
      ...data,
      spaces: data.spaces.map((space: any) => {
        const { category, ...rest } = space;
        return rest;
      })
    };
  }
};
```

### 6.4 SQLite para Analytics

#### 6.4.1 Configuración y Conexión

```typescript
// src/main/services/SQLiteService.ts
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

export class SQLiteService {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(
      app.getPath('userData'),
      'data',
      'analytics.db'
    );
  }

  async initialize(): Promise<void> {
    this.db = new Database(this.dbPath);
    
    // Configurar para mejor performance
    this.db.pragma('journal_mode = WAL');  // Write-Ahead Logging
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = -64000');  // 64MB cache
    this.db.pragma('temp_store = MEMORY');
    
    // Crear tablas si no existen
    await this.createTables();
    
    // Ejecutar migraciones
    await this.runMigrations();
  }

  private async createTables(): Promise<void> {
    this.db!.exec(`
      -- Tabla de logs de ejecución
      CREATE TABLE IF NOT EXISTS execution_logs (
        id TEXT PRIMARY KEY,
        space_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        duration INTEGER,
        success INTEGER NOT NULL,
        error_message TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      CREATE INDEX IF NOT EXISTS idx_execution_logs_space_id 
        ON execution_logs(space_id);
      CREATE INDEX IF NOT EXISTS idx_execution_logs_timestamp 
        ON execution_logs(timestamp);

      -- Tabla de ejecución de recursos individuales
      CREATE TABLE IF NOT EXISTS resource_executions (
        id TEXT PRIMARY KEY,
        execution_log_id TEXT NOT NULL,
        resource_id TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        success INTEGER NOT NULL,
        start_time INTEGER NOT NULL,
        end_time INTEGER,
        error_message TEXT,
        FOREIGN KEY (execution_log_id) 
          REFERENCES execution_logs(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_resource_executions_log_id 
        ON resource_executions(execution_log_id);
      CREATE INDEX IF NOT EXISTS idx_resource_executions_resource_id 
        ON resource_executions(resource_id);

      -- Tabla de métricas diarias agregadas
      CREATE TABLE IF NOT EXISTS daily_metrics (
        id TEXT PRIMARY KEY,
        space_id TEXT NOT NULL,
        date TEXT NOT NULL,
        total_executions INTEGER DEFAULT 0,
        successful_executions INTEGER DEFAULT 0,
        failed_executions INTEGER DEFAULT 0,
        total_duration INTEGER DEFAULT 0,
        avg_duration INTEGER DEFAULT 0,
        UNIQUE(space_id, date)
      );

      CREATE INDEX IF NOT EXISTS idx_daily_metrics_space_date 
        ON daily_metrics(space_id, date);

      -- Tabla de resumen de errores
      CREATE TABLE IF NOT EXISTS error_summary (
        id TEXT PRIMARY KEY,
        resource_id TEXT NOT NULL,
        error_type TEXT NOT NULL,
        error_message TEXT NOT NULL,
        occurrence_count INTEGER DEFAULT 1,
        first_seen INTEGER NOT NULL,
        last_seen INTEGER NOT NULL,
        UNIQUE(resource_id, error_type, error_message)
      );

      CREATE INDEX IF NOT EXISTS idx_error_summary_resource 
        ON error_summary(resource_id);

      -- Tabla de versiones (para migraciones)
      CREATE TABLE IF NOT EXISTS schema_versions (
        version INTEGER PRIMARY KEY,
        applied_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);
  }

  private async runMigrations(): Promise<void> {
    const currentVersion = this.getCurrentVersion();
    const migrations = this.getMigrations();

    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        this.db!.transaction(() => {
          migration.up(this.db!);
          this.db!.prepare(
            'INSERT INTO schema_versions (version) VALUES (?)'
          ).run(migration.version);
        })();
      }
    }
  }

  private getCurrentVersion(): number {
    try {
      const result = this.db!.prepare(
        'SELECT MAX(version) as version FROM schema_versions'
      ).get() as { version: number | null };
      return result?.version || 0;
    } catch {
      return 0;
    }
  }

  private getMigrations() {
    return [
      // Futuras migraciones aquí
      // {
      //   version: 2,
      //   up: (db: Database) => {
      //     db.exec('ALTER TABLE execution_logs ADD COLUMN user_id TEXT');
      //   }
      // }
    ];
  }

  getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async vacuum(): Promise<void> {
    this.db!.exec('VACUUM');
  }

  async backup(backupPath: string): Promise<void> {
    await this.db!.backup(backupPath);
  }
}
```

#### 6.4.2 Analytics Repository con SQLite

```typescript
// src/modules/analytics/repositories/AnalyticsRepository.ts
import { SQLiteService } from '@/main/services/SQLiteService';
import { v4 as uuid } from 'uuid';

export class AnalyticsRepository {
  constructor(private sqlite: SQLiteService) {}

  // Registrar ejecución completa
  async recordExecution(execution: {
    spaceId: string;
    timestamp: number;
    duration: number;
    success: boolean;
    errorMessage?: string;
    resources: Array<{
      resourceId: string;
      resourceType: string;
      success: boolean;
      startTime: number;
      endTime: number;
      errorMessage?: string;
    }>;
  }): Promise<void> {
    const db = this.sqlite.getDatabase();
    const executionId = uuid();

    // Transaction para garantizar consistencia
    db.transaction(() => {
      // 1. Insertar log de ejecución
      db.prepare(`
        INSERT INTO execution_logs 
          (id, space_id, timestamp, duration, success, error_message)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        executionId,
        execution.spaceId,
        execution.timestamp,
        execution.duration,
        execution.success ? 1 : 0,
        execution.errorMessage || null
      );

      // 2. Insertar ejecuciones de recursos
      const insertResource = db.prepare(`
        INSERT INTO resource_executions
          (id, execution_log_id, resource_id, resource_type, 
           success, start_time, end_time, error_message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const resource of execution.resources) {
        insertResource.run(
          uuid(),
          executionId,
          resource.resourceId,
          resource.resourceType,
          resource.success ? 1 : 0,
          resource.startTime,
          resource.endTime,
          resource.errorMessage || null
        );
      }

      // 3. Actualizar métricas diarias
      this.updateDailyMetrics(db, execution);

      // 4. Actualizar resumen de errores
      if (!execution.success && execution.resources) {
        this.updateErrorSummary(db, execution.resources);
      }
    })();
  }

  private updateDailyMetrics(db: Database, execution: any): void {
    const date = new Date(execution.timestamp).toISOString().split('T')[0];
    
    db.prepare(`
      INSERT INTO daily_metrics 
        (id, space_id, date, total_executions, successful_executions, 
         failed_executions, total_duration, avg_duration)
      VALUES (?, ?, ?, 1, ?, ?, ?, ?)
      ON CONFLICT(space_id, date) DO UPDATE SET
        total_executions = total_executions + 1,
        successful_executions = successful_executions + ?,
        failed_executions = failed_executions + ?,
        total_duration = total_duration + ?,
        avg_duration = (total_duration + ?) / (total_executions + 1)
    `).run(
      uuid(),
      execution.spaceId,
      date,
      execution.success ? 1 : 0,
      execution.success ? 0 : 1,
      execution.duration,
      execution.duration,
      execution.success ? 1 : 0,
      execution.success ? 0 : 1,
      execution.duration,
      execution.duration
    );
  }

  private updateErrorSummary(db: Database, resources: any[]): void {
    const failedResources = resources.filter(r => !r.success);
    
    for (const resource of failedResources) {
      if (!resource.errorMessage) continue;

      const errorType = this.categorizeError(resource.errorMessage);
      const now = Date.now();

      db.prepare(`
        INSERT INTO error_summary
          (id, resource_id, error_type, error_message, 
           occurrence_count, first_seen, last_seen)
        VALUES (?, ?, ?, ?, 1, ?, ?)
        ON CONFLICT(resource_id, error_type, error_message) DO UPDATE SET
          occurrence_count = occurrence_count + 1,
          last_seen = ?
      `).run(
        uuid(),
        resource.resourceId,
        errorType,
        resource.errorMessage,
        now,
        now,
        now
      );
    }
  }

  private categorizeError(message: string): string {
    if (message.includes('not found')) return 'NOT_FOUND';
    if (message.includes('permission')) return 'PERMISSION_DENIED';
    if (message.includes('timeout')) return 'TIMEOUT';
    if (message.includes('network')) return 'NETWORK_ERROR';
    return 'UNKNOWN';
  }

  // Obtener métricas de un espacio
  async getSpaceMetrics(
    spaceId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<SpaceMetrics> {
    const db = this.sqlite.getDatabase();

    const dateFilter = this.buildDateFilter(startDate, endDate);

    // Métricas generales
    const summary = db.prepare(`
      SELECT 
        COUNT(*) as total_executions,
        SUM(success) as successful_executions,
        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_executions,
        AVG(duration) as avg_duration,
        MAX(timestamp) as last_executed
      FROM execution_logs
      WHERE space_id = ?
        ${dateFilter.sql}
    `).get(spaceId, ...dateFilter.params) as any;

    // Ejecuciones por día
    const dailyData = db.prepare(`
      SELECT date, total_executions
      FROM daily_metrics
      WHERE space_id = ?
        ${dateFilter.sql.replace('timestamp', 'date')}
      ORDER BY date DESC
      LIMIT 30
    `).all(spaceId, ...dateFilter.params) as any[];

    const executionsByDay: Record<string, number> = {};
    dailyData.forEach(row => {
      executionsByDay[row.date] = row.total_executions;
    });

    // Recursos más usados
    const resourceUsage = db.prepare(`
      SELECT 
        resource_id,
        COUNT(*) as executions,
        AVG(CASE WHEN success = 1 THEN 1.0 ELSE 0.0 END) as success_rate,
        AVG(end_time - start_time) as avg_duration
      FROM resource_executions re
      JOIN execution_logs el ON re.execution_log_id = el.id
      WHERE el.space_id = ?
        ${dateFilter.sql}
      GROUP BY resource_id
      ORDER BY executions DESC
      LIMIT 10
    `).all(spaceId, ...dateFilter.params) as any[];

    // Errores comunes
    const commonErrors = db.prepare(`
      SELECT 
        resource_id,
        error_type,
        error_message,
        occurrence_count,
        last_seen
      FROM error_summary
      WHERE resource_id IN (
        SELECT DISTINCT resource_id 
        FROM resource_executions re
        JOIN execution_logs el ON re.execution_log_id = el.id
        WHERE el.space_id = ?
      )
      ORDER BY occurrence_count DESC
      LIMIT 5
    `).all(spaceId) as any[];

    return {
      spaceId,
      totalExecutions: summary.total_executions || 0,
      successfulExecutions: summary.successful_executions || 0,
      failedExecutions: summary.failed_executions || 0,
      averageDuration: Math.round(summary.avg_duration || 0),
      lastExecuted: summary.last_executed,
      executionsByDay,
      mostUsedResources: resourceUsage.map(r => ({
        resourceId: r.resource_id,
        executions: r.executions,
        successRate: r.success_rate,
        avgDuration: Math.round(r.avg_duration || 0)
      })),
      commonErrors: commonErrors.map(e => ({
        resourceId: e.resource_id,
        errorType: e.error_type,
        errorMessage: e.error_message,
        occurrenceCount: e.occurrence_count,
        lastSeen: e.last_seen
      }))
    };
  }

  private buildDateFilter(startDate?: Date, endDate?: Date) {
    const params: number[] = [];
    let sql = '';

    if (startDate) {
      sql += ' AND timestamp >= ?';
      params.push(startDate.getTime());
    }

    if (endDate) {
      sql += ' AND timestamp <= ?';
      params.push(endDate.getTime());
    }

    return { sql, params };
  }

  // Limpiar datos antiguos (mantener solo últimos X días)
  async cleanOldData(daysToKeep: number = 90): Promise<void> {
    const db = this.sqlite.getDatabase();
    const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

    db.prepare(`
      DELETE FROM execution_logs
      WHERE timestamp < ?
    `).run(cutoffDate);

    // Las resource_executions se eliminan automáticamente por CASCADE

    db.prepare(`
      DELETE FROM daily_metrics
      WHERE date < date('now', '-${daysToKeep} days')
    `).run();
  }

  // Exportar datos para backup o análisis
  async exportData(spaceId?: string): Promise<any> {
    const db = this.sqlite.getDatabase();

    const whereClause = spaceId ? 'WHERE space_id = ?' : '';
    const params = spaceId ? [spaceId] : [];

    const executions = db.prepare(`
      SELECT * FROM execution_logs ${whereClause}
      ORDER BY timestamp DESC
    `).all(...params);

    const resources = db.prepare(`
      SELECT re.* FROM resource_executions re
      JOIN execution_logs el ON re.execution_log_id = el.id
      ${whereClause}
    `).all(...params);

    return {
      executions,
      resources,
      exportedAt: new Date().toISOString(),
      spaceId: spaceId || 'all'
    };
  }
}

interface SpaceMetrics {
  spaceId: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
  lastExecuted?: number;
  executionsByDay: Record<string, number>;
  mostUsedResources: Array<{
    resourceId: string;
    executions: number;
    successRate: number;
    avgDuration: number;
  }>;
  commonErrors: Array<{
    resourceId: string;
    errorType: string;
    errorMessage: string;
    occurrenceCount: number;
    lastSeen: number;
  }>;
}
```

#### 6.4.3 Integración en Dependency Injection

```typescript
// Actualizar setupDI() para incluir SQLite
function setupDI(): DIContainer {
  const container = new DIContainer();

  // ... otras configuraciones ...

  // SQLite Service
  container.register('SQLiteService', () => {
    const sqlite = new SQLiteService();
    sqlite.initialize(); // Inicializar de forma síncrona o async
    return sqlite;
  });

  // Analytics Repository (ahora usa SQLite)
  container.register('AnalyticsRepository', () => 
    new AnalyticsRepository(
      container.resolve('SQLiteService')
    )
  );

  // Analytics Service
  container.register('AnalyticsService', () => 
    new AnalyticsService(
      container.resolve('AnalyticsRepository'),
      container.resolve('EventBus'),
      container.resolve('Logger')
    )
  );

  return container;
}
```

#### 6.4.4 Analytics Service (actualizado para SQLite)

```typescript
export class AnalyticsService {
  constructor(
    private repository: AnalyticsRepository,
    private eventBus: EventBus,
    private logger: Logger
  ) {
    // Escuchar eventos de ejecución
    this.eventBus.on('execution:completed', this.onExecutionCompleted.bind(this));
  }

  private async onExecutionCompleted(result: ExecutionResult): Promise<void> {
    try {
      await this.repository.recordExecution({
        spaceId: result.spaceId,
        timestamp: Date.now(),
        duration: result.duration,
        success: result.success,
        errorMessage: result.error?.message,
        resources: result.resources.map(r => ({
          resourceId: r.resourceId,
          resourceType: r.resourceType,
          success: r.success,
          startTime: new Date(r.startTime).getTime(),
          endTime: new Date(r.endTime).getTime(),
          errorMessage: r.error
        }))
      });

      this.logger.info('Execution metrics recorded', {
        spaceId: result.spaceId,
        success: result.success
      });
    } catch (error) {
      this.logger.error('Failed to record execution metrics', { error });
    }
  }

  async getMetrics(
    spaceId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<SpaceMetrics | SpaceMetrics[]> {
    if (spaceId) {
      return this.repository.getSpaceMetrics(spaceId, startDate, endDate);
    }

    // Si no hay spaceId, devolver métricas de todos los espacios
    // Implementación omitida por brevedad
    return [];
  }

  async cleanOldData(daysToKeep: number = 90): Promise<void> {
    await this.repository.cleanOldData(daysToKeep);
    this.logger.info('Old analytics data cleaned', { daysToKeep });
  }
}
```

---

### 6.5 Comparativa: JSON vs SQLite en el Proyecto

| Aspecto | JSON (Spaces/Tasks) | SQLite (Analytics) |
|---------|---------------------|-------------------|
| **Volumen** | Bajo (<1000 items) | Alto (100k+ logs) |
| **Frecuencia escritura** | Baja (user actions) | Alta (cada ejecución) |
| **Queries** | Simples (by ID) | Complejas (agregaciones) |
| **Legibilidad** | Alta (editable) | No requerida |
| **Backup** | Simple (copy file) | Ambos (copy + export) |
| **Performance** | Adecuada | Superior |
| **Migraciones** | Custom (JSON) | SQL nativo |

---

## 7. Sistema de Base de Datos (SQLite para Analytics)

### 7.1 Arquitectura de Persistencia Híbrida

**Decisión Arquitectónica:**
```
JSON Files (FileSystemService)          SQLite Database (DatabaseService)
├── spaces.json                         └── analytics.db
│   - Configuración de espacios             ├── execution_logs
│   - Recursos                              ├── resource_errors  
│   - Metadatos                             ├── daily_metrics
│                                           └── user_sessions
├── tasks.json
│   - Checklists
│   - Recordatorios
│
└── settings.json
    - Preferencias
    - Configuración UI
```

**Justificación:**
- JSON: Datos estructurados, bajo volumen, fácil backup/portabilidad
- SQLite: Alto volumen de eventos, queries complejas, agregaciones eficientes

### 7.2 Esquema de Base de Datos

```sql
-- Tabla principal de logs de ejecución
CREATE TABLE execution_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  space_id TEXT NOT NULL,
  started_at TEXT NOT NULL,           -- ISO 8601 timestamp
  completed_at TEXT,                  -- ISO 8601 timestamp
  duration_ms INTEGER,                -- Duración en milisegundos
  success BOOLEAN NOT NULL,
  error_message TEXT,
  resources_total INTEGER NOT NULL,
  resources_success INTEGER NOT NULL,
  resources_failed INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para queries comunes
CREATE INDEX idx_execution_logs_space_id 
  ON execution_logs(space_id);
CREATE INDEX idx_execution_logs_started_at 
  ON execution_logs(started_at);
CREATE INDEX idx_execution_logs_success 
  ON execution_logs(success);

-- Tabla de errores de recursos
CREATE TABLE resource_errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  execution_log_id INTEGER NOT NULL,
  resource_id TEXT NOT NULL,
  resource_type TEXT NOT NULL,        -- application, url, script, file
  error_type TEXT NOT NULL,           -- not_found, permission_denied, timeout
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (execution_log_id) REFERENCES execution_logs(id) ON DELETE CASCADE
);

CREATE INDEX idx_resource_errors_resource_id 
  ON resource_errors(resource_id);
CREATE INDEX idx_resource_errors_error_type 
  ON resource_errors(error_type);

-- Tabla de métricas agregadas diarias
CREATE TABLE daily_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,                 -- YYYY-MM-DD
  space_id TEXT NOT NULL,
  execution_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  total_duration_ms INTEGER NOT NULL DEFAULT 0,
  avg_duration_ms REAL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, space_id)
);

CREATE INDEX idx_daily_metrics_date 
  ON daily_metrics(date);
CREATE INDEX idx_daily_metrics_space_id 
  ON daily_metrics(space_id);

-- Tabla de sesiones de usuario
CREATE TABLE user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_start TEXT NOT NULL,
  session_end TEXT,
  duration_ms INTEGER,
  spaces_executed TEXT,               -- JSON array de space_ids
  total_executions INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_sessions_start 
  ON user_sessions(session_start);

-- Tabla de métricas por recurso
CREATE TABLE resource_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resource_id TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  execution_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  avg_duration_ms REAL,
  last_executed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(resource_id)
);

CREATE INDEX idx_resource_metrics_resource_id 
  ON resource_metrics(resource_id);
```

### 7.3 DatabaseService

```typescript
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

export class DatabaseService {
  private db: Database.Database;
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(
      app.getPath('userData'),
      'data',
      'analytics.db'
    );
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    // Crear directorio si no existe
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Abrir/crear base de datos
    this.db = new Database(this.dbPath);
    
    // Configuración para performance
    this.db.pragma('journal_mode = WAL');      // Write-Ahead Logging
    this.db.pragma('synchronous = NORMAL');    // Balance seguridad/speed
    this.db.pragma('foreign_keys = ON');       // Integridad referencial
    
    // Crear tablas si no existen
    this.createTables();
    
    // Ejecutar migraciones pendientes
    this.runMigrations();
  }

  private createTables(): void {
    // Tabla de versiones de schema
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tablas principales
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS execution_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        space_id TEXT NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        duration_ms INTEGER,
        success BOOLEAN NOT NULL,
        error_message TEXT,
        resources_total INTEGER NOT NULL,
        resources_success INTEGER NOT NULL,
        resources_failed INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_execution_logs_space_id 
        ON execution_logs(space_id);
      CREATE INDEX IF NOT EXISTS idx_execution_logs_started_at 
        ON execution_logs(started_at);
      CREATE INDEX IF NOT EXISTS idx_execution_logs_success 
        ON execution_logs(success);

      -- Más tablas...
    `);
  }

  private runMigrations(): void {
    const currentVersion = this.getCurrentSchemaVersion();
    const migrations = this.getMigrations();

    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        this.db.transaction(() => {
          migration.up(this.db);
          this.db.prepare(
            'INSERT INTO schema_migrations (version) VALUES (?)'
          ).run(migration.version);
        })();
      }
    }
  }

  private getCurrentSchemaVersion(): number {
    try {
      const result = this.db.prepare(
        'SELECT MAX(version) as version FROM schema_migrations'
      ).get() as { version: number | null };
      return result.version || 0;
    } catch {
      return 0;
    }
  }

  // API pública
  public prepare(sql: string): Database.Statement {
    return this.db.prepare(sql);
  }

  public transaction<T>(fn: () => T): () => T {
    return this.db.transaction(fn);
  }

  public exec(sql: string): void {
    this.db.exec(sql);
  }

  public close(): void {
    this.db.close();
  }

  // Queries comunes optimizadas
  public getExecutionLogs(filters: ExecutionLogFilters): ExecutionLog[] {
    let sql = 'SELECT * FROM execution_logs WHERE 1=1';
    const params: any[] = [];

    if (filters.spaceId) {
      sql += ' AND space_id = ?';
      params.push(filters.spaceId);
    }

    if (filters.startDate) {
      sql += ' AND started_at >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      sql += ' AND started_at <= ?';
      params.push(filters.endDate);
    }

    if (filters.success !== undefined) {
      sql += ' AND success = ?';
      params.push(filters.success ? 1 : 0);
    }

    sql += ' ORDER BY started_at DESC LIMIT ?';
    params.push(filters.limit || 100);

    return this.db.prepare(sql).all(...params) as ExecutionLog[];
  }

  public getDailyMetrics(
    spaceId?: string,
    startDate?: string,
    endDate?: string
  ): DailyMetric[] {
    let sql = 'SELECT * FROM daily_metrics WHERE 1=1';
    const params: any[] = [];

    if (spaceId) {
      sql += ' AND space_id = ?';
      params.push(spaceId);
    }

    if (startDate) {
      sql += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND date <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY date DESC';

    return this.db.prepare(sql).all(...params) as DailyMetric[];
  }

  // Agregaciones
  public getSpaceStats(spaceId: string, days: number = 30): SpaceStats {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString();

    const stats = this.db.prepare(`
      SELECT 
        COUNT(*) as total_executions,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_executions,
        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_executions,
        AVG(duration_ms) as avg_duration_ms,
        MIN(duration_ms) as min_duration_ms,
        MAX(duration_ms) as max_duration_ms
      FROM execution_logs
      WHERE space_id = ? AND started_at >= ?
    `).get(spaceId, sinceStr) as SpaceStats;

    return stats;
  }

  // Mantenimiento
  public vacuum(): void {
    this.db.exec('VACUUM');
  }

  public analyze(): void {
    this.db.exec('ANALYZE');
  }

  public backup(destinationPath: string): void {
    this.db.backup(destinationPath);
  }
}
```

### 7.4 AnalyticsRepository

```typescript
export class AnalyticsRepository {
  constructor(private db: DatabaseService) {}

  async recordExecution(log: ExecutionLogDto): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO execution_logs (
        space_id, started_at, completed_at, duration_ms,
        success, error_message, resources_total,
        resources_success, resources_failed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      log.spaceId,
      log.startedAt,
      log.completedAt,
      log.durationMs,
      log.success ? 1 : 0,
      log.errorMessage || null,
      log.resourcesTotal,
      log.resourcesSuccess,
      log.resourcesFailed
    );

    // Actualizar métricas agregadas
    await this.updateDailyMetrics(log.spaceId, log.startedAt);

    return result.lastInsertRowid as number;
  }

  async recordResourceError(error: ResourceErrorDto): Promise<void> {
    this.db.prepare(`
      INSERT INTO resource_errors (
        execution_log_id, resource_id, resource_type,
        error_type, error_message, stack_trace
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      error.executionLogId,
      error.resourceId,
      error.resourceType,
      error.errorType,
      error.errorMessage,
      error.stackTrace || null
    );
  }

  private async updateDailyMetrics(
    spaceId: string,
    timestamp: string
  ): Promise<void> {
    const date = timestamp.split('T')[0]; // YYYY-MM-DD

    // Calcular métricas del día
    const metrics = this.db.prepare(`
      SELECT 
        COUNT(*) as execution_count,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as success_count,
        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_count,
        SUM(duration_ms) as total_duration_ms,
        AVG(duration_ms) as avg_duration_ms
      FROM execution_logs
      WHERE space_id = ? AND DATE(started_at) = ?
    `).get(spaceId, date);

    // Upsert en daily_metrics
    this.db.prepare(`
      INSERT INTO daily_metrics (
        date, space_id, execution_count, success_count,
        failed_count, total_duration_ms, avg_duration_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(date, space_id) DO UPDATE SET
        execution_count = excluded.execution_count,
        success_count = excluded.success_count,
        failed_count = excluded.failed_count,
        total_duration_ms = excluded.total_duration_ms,
        avg_duration_ms = excluded.avg_duration_ms,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      date,
      spaceId,
      metrics.execution_count,
      metrics.success_count,
      metrics.failed_count,
      metrics.total_duration_ms,
      metrics.avg_duration_ms
    );
  }

  async getSpaceMetrics(
    spaceId: string,
    startDate: string,
    endDate: string
  ): Promise<SpaceMetrics> {
    const stats = this.db.getSpaceStats(spaceId, 30);
    const daily = this.db.getDailyMetrics(spaceId, startDate, endDate);
    
    return {
      spaceId,
      totalExecutions: stats.total_executions,
      successfulExecutions: stats.successful_executions,
      failedExecutions: stats.failed_executions,
      averageDuration: stats.avg_duration_ms,
      dailyBreakdown: daily
    };
  }

  async getMostUsedSpaces(limit: number = 10): Promise<SpaceUsage[]> {
    return this.db.prepare(`
      SELECT 
        space_id,
        COUNT(*) as execution_count,
        AVG(duration_ms) as avg_duration_ms,
        MAX(started_at) as last_executed_at
      FROM execution_logs
      WHERE started_at >= datetime('now', '-30 days')
      GROUP BY space_id
      ORDER BY execution_count DESC
      LIMIT ?
    `).all(limit) as SpaceUsage[];
  }

  async getMostProblematicResources(limit: number = 10): Promise<ResourceError[]> {
    return this.db.prepare(`
      SELECT 
        resource_id,
        resource_type,
        COUNT(*) as error_count,
        MAX(created_at) as last_error_at,
        error_type,
        error_message
      FROM resource_errors
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY resource_id
      ORDER BY error_count DESC
      LIMIT ?
    `).all(limit) as ResourceError[];
  }

  async cleanup(daysToKeep: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffStr = cutoffDate.toISOString();

    // Eliminar logs antiguos (cascade eliminará resource_errors)
    const result = this.db.prepare(`
      DELETE FROM execution_logs
      WHERE started_at < ?
    `).run(cutoffStr);

    // Vacuum para recuperar espacio
    if (result.changes > 1000) {
      this.db.vacuum();
    }
  }
}
```

### 7.5 Migraciones de Esquema

```typescript
interface Migration {
  version: number;
  description: string;
  up: (db: Database.Database) => void;
  down: (db: Database.Database) => void;
}

export const migrations: Migration[] = [
  {
    version: 1,
    description: 'Initial schema',
    up: (db) => {
      db.exec(`
        CREATE TABLE execution_logs (...);
        CREATE TABLE resource_errors (...);
        CREATE TABLE daily_metrics (...);
        -- etc.
      `);
    },
    down: (db) => {
      db.exec(`
        DROP TABLE IF EXISTS execution_logs;
        DROP TABLE IF EXISTS resource_errors;
        DROP TABLE IF EXISTS daily_metrics;
      `);
    }
  },
  {
    version: 2,
    description: 'Add user sessions tracking',
    up: (db) => {
      db.exec(`
        CREATE TABLE user_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_start TEXT NOT NULL,
          session_end TEXT,
          duration_ms INTEGER,
          spaces_executed TEXT,
          total_executions INTEGER DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX idx_user_sessions_start 
          ON user_sessions(session_start);
      `);
    },
    down: (db) => {
      db.exec('DROP TABLE IF EXISTS user_sessions;');
    }
  },
  {
    version: 3,
    description: 'Add resource metrics aggregation',
    up: (db) => {
      db.exec(`
        CREATE TABLE resource_metrics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          resource_id TEXT NOT NULL,
          resource_type TEXT NOT NULL,
          execution_count INTEGER NOT NULL DEFAULT 0,
          success_count INTEGER NOT NULL DEFAULT 0,
          failed_count INTEGER NOT NULL DEFAULT 0,
          avg_duration_ms REAL,
          last_executed_at TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(resource_id)
        );

        CREATE INDEX idx_resource_metrics_resource_id 
          ON resource_metrics(resource_id);
      `);
    },
    down: (db) => {
      db.exec('DROP TABLE IF EXISTS resource_metrics;');
    }
  }
];
```

### 7.6 Performance y Mantenimiento

```typescript
export class AnalyticsMaintenanceService {
  constructor(
    private db: DatabaseService,
    private logger: Logger
  ) {}

  // Ejecutar mantenimiento periódico
  async runMaintenance(): Promise<void> {
    this.logger.info('Starting analytics database maintenance');

    try {
      // 1. Limpiar logs antiguos (>90 días)
      await this.cleanupOldLogs(90);

      // 2. Optimizar índices
      this.db.analyze();

      // 3. Recuperar espacio
      if (await this.shouldVacuum()) {
        this.db.vacuum();
      }

      // 4. Backup automático
      await this.createBackup();

      this.logger.info('Analytics maintenance completed');
    } catch (error) {
      this.logger.error('Analytics maintenance failed', { error });
    }
  }

  private async cleanupOldLogs(days: number): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const deleted = this.db.prepare(`
      DELETE FROM execution_logs
      WHERE started_at < ?
    `).run(cutoff.toISOString());

    this.logger.info('Cleaned up old logs', { deleted: deleted.changes });
  }

  private async shouldVacuum(): Promise<boolean> {
    const stats = this.db.prepare(`
      SELECT 
        page_count * page_size as total_size,
        (page_count - freelist_count) * page_size as used_size
      FROM pragma_page_count(), pragma_page_size(), pragma_freelist_count()
    `).get() as { total_size: number; used_size: number };

    const wastedSpace = stats.total_size - stats.used_size;
    const wastedPercent = (wastedSpace / stats.total_size) * 100;

    // Vacuum si hay >20% espacio desperdiciado
    return wastedPercent > 20;
  }

  private async createBackup(): Promise<void> {
    const backupDir = path.join(app.getPath('userData'), 'backups');
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupPath = path.join(backupDir, `analytics-${timestamp}.db`);

    await fs.promises.mkdir(backupDir, { recursive: true });
    this.db.backup(backupPath);

    // Mantener solo últimos 7 backups
    await this.cleanupOldBackups(backupDir, 7);
  }

  private async cleanupOldBackups(dir: string, keep: number): Promise<void> {
    const files = await fs.promises.readdir(dir);
    const backups = files
      .filter(f => f.startsWith('analytics-'))
      .sort()
      .reverse();

    for (const file of backups.slice(keep)) {
      await fs.promises.unlink(path.join(dir, file));
    }
  }
}
```

### 7.7 Testing con SQLite

```typescript
// analytics.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseService } from '@/main/services/DatabaseService';
import { AnalyticsRepository } from '@/modules/analytics/repositories/AnalyticsRepository';
import fs from 'fs';
import path from 'path';

describe('AnalyticsRepository', () => {
  let db: DatabaseService;
  let repository: AnalyticsRepository;
  let testDbPath: string;

  beforeEach(() => {
    // Crear DB temporal en memoria para tests
    testDbPath = ':memory:'; // o usar archivo temporal
    db = new DatabaseService(testDbPath);
    repository = new AnalyticsRepository(db);
  });

  afterEach(() => {
    db.close();
    // Limpiar archivo temporal si se usó
  });

  describe('recordExecution', () => {
    it('should record execution log', async () => {
      const log = {
        spaceId: 'space-123',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationMs: 1500,
        success: true,
        resourcesTotal: 3,
        resourcesSuccess: 3,
        resourcesFailed: 0
      };

      await repository.recordExecution(log);

      const logs = db.getExecutionLogs({ spaceId: 'space-123' });
      expect(logs).toHaveLength(1);
      expect(logs[0].space_id).toBe('space-123');
      expect(logs[0].success).toBe(1);
    });

    it('should update daily metrics', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      await repository.recordExecution({
        spaceId: 'space-123',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationMs: 1500,
        success: true,
        resourcesTotal: 3,
        resourcesSuccess: 3,
        resourcesFailed: 0
      });

      const metrics = db.getDailyMetrics('space-123', today, today);
      expect(metrics).toHaveLength(1);
      expect(metrics[0].execution_count).toBe(1);
    });
  });

  describe('getMostUsedSpaces', () => {
    it('should return spaces ordered by usage', async () => {
      // Setup: Crear múltiples ejecuciones
      // ...
      
      const mostUsed = await repository.getMostUsedSpaces(5);
      expect(mostUsed[0].execution_count).toBeGreaterThan(mostUsed[1].execution_count);
    });
  });
});
```

---

## 8. Motor de Ejecución

### 7.1 Execution Orchestrator

```typescript
class ExecutionOrchestrator {
  constructor(
    private factory: ExecutorFactory,
    private eventBus: EventBus,
    private logger: Logger,
    private config: ExecutionConfig
  ) {}

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const { resources } = context;
    const results: ResourceExecutionResult[] = [];
    
    this.eventBus.emit('execution:started', {
      spaceId: context.spaceId,
      totalResources: resources.length
    });

    try {
      for (let i = 0; i < resources.length; i++) {
        const resource = resources[i];
        
        // Notificar progreso
        this.eventBus.emit('execution:progress', {
          spaceId: context.spaceId,
          current: i + 1,
          total: resources.length,
          resource: resource.name
        });

        // Ejecutar recurso
        const result = await this.executeResource(resource);
        results.push(result);

        // Manejar errores
        if (!result.success && this.config.stopOnError) {
          this.logger.warn('Stopping execution due to error', {
            spaceId: context.spaceId,
            resource: resource.name
          });
          break;
        }

        // Aplicar delay si está configurado
        if (resource.delay) {
          await this.delay(resource.delay);
        }
      }

      const success = results.every(r => r.success);
      
      this.eventBus.emit('execution:completed', {
        spaceId: context.spaceId,
        success,
        results
      });

      return {
        success,
        results,
        duration: Date.now() - context.startTime
      };

    } catch (error) {
      this.logger.error('Execution failed', {
        spaceId: context.spaceId,
        error
      });

      this.eventBus.emit('execution:failed', {
        spaceId: context.spaceId,
        error: error.message
      });

      throw error;
    }
  }

  private async executeResource(
    resource: Resource
  ): Promise<ResourceExecutionResult> {
    const startTime = Date.now();

    try {
      // 1. Obtener executor apropiado
      const executor = this.factory.getExecutor(resource.type);

      // 2. Validar recurso
      const validation = await executor.validate(resource);
      if (!validation.valid) {
        return {
          resourceId: resource.id,
          success: false,
          error: validation.error,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString()
        };
      }

      // 3. Verificar si puede ejecutar
      if (!executor.canExecute(resource)) {
        return {
          resourceId: resource.id,
          success: false,
          error: 'Resource cannot be executed on this platform',
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString()
        };
      }

      // 4. Ejecutar
      await executor.execute(resource);

      return {
        resourceId: resource.id,
        success: true,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Resource execution failed', {
        resource,
        error
      });

      return {
        resourceId: resource.id,
        success: false,
        error: error.message,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString()
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 7.2 Executor Implementations

```typescript
// Application Executor
class ApplicationExecutor implements IExecutor {
  async execute(resource: ApplicationResource): Promise<void> {
    const { path, arguments: args, workingDirectory } = resource;

    // Spawn proceso
    const process = spawn(path, args || [], {
      cwd: workingDirectory,
      detached: true,
      stdio: 'ignore'
    });

    // Desacoplar proceso del padre
    process.unref();
  }

  async validate(resource: ApplicationResource): Promise<ValidationResult> {
    const exists = await fs.promises.access(resource.path)
      .then(() => true)
      .catch(() => false);

    if (!exists) {
      return {
        valid: false,
        error: `Application not found: ${resource.path}`
      };
    }

    return { valid: true };
  }

  canExecute(resource: ApplicationResource): boolean {
    // Verificar si el ejecutable es compatible con la plataforma
    const ext = path.extname(resource.path).toLowerCase();
    
    if (process.platform === 'win32') {
      return ['.exe', '.bat', '.cmd'].includes(ext);
    } else if (process.platform === 'darwin') {
      return ['.app', ''].includes(ext);
    } else {
      return true; // Linux acepta cualquier ejecutable
    }
  }
}

// URL Executor
class URLExecutor implements IExecutor {
  async execute(resource: URLResource): Promise<void> {
    const { url, browser, incognito } = resource;

    if (browser) {
      // Abrir en navegador específico
      await this.openInBrowser(url, browser, incognito);
    } else {
      // Abrir en navegador por defecto
      await shell.openExternal(url);
    }
  }

  async validate(resource: URLResource): Promise<ValidationResult> {
    try {
      new URL(resource.url);
      return { valid: true };
    } catch {
      return {
        valid: false,
        error: `Invalid URL: ${resource.url}`
      };
    }
  }

  canExecute(resource: URLResource): boolean {
    return true; // URLs son multiplataforma
  }

  private async openInBrowser(
    url: string,
    browser: string,
    incognito?: boolean
  ): Promise<void> {
    const browserPaths = {
      chrome: {
        win32: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        linux: 'google-chrome'
      },
      firefox: {
        win32: 'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
        darwin: '/Applications/Firefox.app/Contents/MacOS/firefox',
        linux: 'firefox'
      }
    };

    const browserPath = browserPaths[browser]?.[process.platform];
    if (!browserPath) {
      throw new Error(`Browser ${browser} not supported on ${process.platform}`);
    }

    const args = [url];
    if (incognito) {
      args.unshift(browser === 'chrome' ? '--incognito' : '--private-window');
    }

    spawn(browserPath, args, {
      detached: true,
      stdio: 'ignore'
    }).unref();
  }
}

// Script Executor
class ScriptExecutor implements IExecutor {
  async execute(resource: ScriptResource): Promise<void> {
    const { path, interpreter, arguments: args } = resource;

    const command = this.getInterpreterCommand(interpreter);
    const fullArgs = [path, ...(args || [])];

    const process = spawn(command, fullArgs, {
      detached: true,
      stdio: 'pipe'
    });

    // Capturar output para logging
    process.stdout.on('data', (data) => {
      console.log(`[Script ${resource.name}] ${data}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`[Script ${resource.name}] ${data}`);
    });

    process.unref();
  }

  async validate(resource: ScriptResource): Promise<ValidationResult> {
    const exists = await fs.promises.access(resource.path)
      .then(() => true)
      .catch(() => false);

    if (!exists) {
      return {
        valid: false,
        error: `Script not found: ${resource.path}`
      };
    }

    return { valid: true };
  }

  canExecute(resource: ScriptResource): boolean {
    return this.isInterpreterAvailable(resource.interpreter);
  }

  private getInterpreterCommand(interpreter: string): string {
    const commands = {
      powershell: 'powershell.exe',
      bash: 'bash',
      python: 'python'
    };
    return commands[interpreter] || interpreter;
  }

  private isInterpreterAvailable(interpreter: string): boolean {
    // Verificar si el intérprete está disponible en el sistema
    const command = this.getInterpreterCommand(interpreter);
    try {
      execSync(`${command} --version`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}
```

---

## 8. Sistema de Plugins

### 8.1 Plugin Architecture

```
┌─────────────────────────────────────────────┐
│          Host Application                   │
│  ┌──────────────────────────────────────┐  │
│  │     Plugin Registry                  │  │
│  │  - Loaded Plugins                    │  │
│  │  - Plugin Manifests                  │  │
│  └──────────────────┬───────────────────┘  │
│                     │                       │
│  ┌──────────────────▼───────────────────┐  │
│  │     Plugin Loader                    │  │
│  │  - Load Plugin Code                  │  │
│  │  - Validate Manifest                 │  │
│  │  - Initialize Sandbox                │  │
│  └──────────────────┬───────────────────┘  │
│                     │                       │
│  ┌──────────────────▼───────────────────┐  │
│  │     Plugin Sandbox                   │  │
│  │  - Isolated Context                  │  │
│  │  - Limited API Access                │  │
│  │  - Permission Checks                 │  │
│  └──────────────────┬───────────────────┘  │
└─────────────────────┼───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│              Plugin Code                    │
│  ┌──────────────────────────────────────┐  │
│  │  manifest.json                       │  │
│  │  index.js                            │  │
│  │  ui/ (optional)                      │  │
│  │  assets/ (optional)                  │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 8.2 Plugin Manifest

```typescript
// manifest.json
interface PluginManifest {
  id: string;                    // Identificador único
  name: string;                  // Nombre legible
  version: string;               // Versión semántica
  author: string;                // Autor del plugin
  description: string;           // Descripción
  homepage?: string;             // URL del proyecto
  main: string;                  // Entry point (ej: 'index.js')
  
  // Compatibilidad
  engines: {
    spaceManager: string;        // Versión compatible (ej: '>=1.0.0')
  };
  
  // Permisos solicitados
  permissions: PluginPermission[];
  
  // Puntos de extensión
  contributes?: {
    commands?: CommandContribution[];
    menus?: MenuContribution[];
    views?: ViewContribution[];
    settings?: SettingContribution[];
  };
  
  // Dependencias
  dependencies?: Record<string, string>;
}

// Ejemplo de manifest.json
{
  "id": "pomodoro-timer",
  "name": "Pomodoro Timer",
  "version": "1.0.0",
  "author": "DevCommunity",
  "description": "Simple Pomodoro timer for focused work",
  "main": "index.js",
  "engines": {
    "spaceManager": ">=1.0.0"
  },
  "permissions": [
    "notifications:show",
    "ui:extend"
  ],
  "contributes": {
    "commands": [
      {
        "id": "pomodoro.start",
        "title": "Start Pomodoro Timer"
      }
    ],
    "views": [
      {
        "id": "pomodoro-timer-panel",
        "title": "Pomodoro Timer",
        "location": "sidebar"
      }
    ]
  }
}
```

### 8.3 Plugin API

```typescript
// API expuesta a plugins
class PluginAPI {
  constructor(
    private pluginId: string,
    private manifest: PluginManifest,
    private permissions: Set<PluginPermission>,
    private services: {
      spaces: SpaceService;
      tasks: TaskService;
      analytics: AnalyticsService;
    },
    private eventBus: EventBus
  ) {}

  // Acceso a datos (según permisos)
  get spaces() {
    this.checkPermission('spaces:read');
    return {
      list: () => this.services.spaces.listSpaces(),
      get: (id: string) => this.services.spaces.getSpace(id),
      // create/update/delete requieren permiso write
    };
  }

  get tasks() {
    this.checkPermission('tasks:read');
    return {
      list: (spaceId?: string) => this.services.tasks.listTasks(spaceId),
      // ...
    };
  }

  // UI Extensions
  get ui() {
    this.checkPermission('ui:extend');
    return {
      addCommand: (command: Command) => {
        this.validateCommand(command);
        this.registerCommand(command);
      },

      addMenuItem: (item: MenuItem) => {
        this.validateMenuItem(item);
        this.registerMenuItem(item);
      },

      showNotification: (message: string, type?: NotificationType) => {
        this.checkPermission('notifications:show');
        new Notification('Space Manager - ' + this.manifest.name, {
          body: message,
          icon: this.getPluginIcon()
        });
      },

      createPanel: (config: PanelConfig) => {
        return new PluginPanel(this.pluginId, config);
      }
    };
  }

  // Sistema de eventos
  on(event: string, handler: Function): void {
    const namespaced = `plugin:${this.pluginId}:${event}`;
    this.eventBus.on(namespaced, handler);
  }

  emit(event: string, data?: any): void {
    const namespaced = `plugin:${this.pluginId}:${event}`;
    this.eventBus.emit(namespaced, data);
  }

  // Storage del plugin
  get storage() {
    return {
      get: async (key: string) => {
        return this.getPluginStorage(key);
      },
      set: async (key: string, value: any) => {
        return this.setPluginStorage(key, value);
      },
      delete: async (key: string) => {
        return this.deletePluginStorage(key);
      }
    };
  }

  // Helpers
  private checkPermission(permission: PluginPermission): void {
    if (!this.permissions.has(permission)) {
      throw new Error(
        `Plugin ${this.pluginId} does not have permission: ${permission}`
      );
    }
  }

  private getPluginIcon(): string {
    // Retornar path al icono del plugin
    return path.join(this.getPluginPath(), 'icon.png');
  }
}
```

### 8.4 Plugin Loader

```typescript
class PluginLoader {
  constructor(
    private pluginsDir: string,
    private registry: PluginRegistry,
    private validator: ManifestValidator
  ) {}

  async loadPlugin(pluginPath: string): Promise<Plugin> {
    // 1. Leer manifest
    const manifestPath = path.join(pluginPath, 'manifest.json');
    const manifest = await this.readManifest(manifestPath);

    // 2. Validar manifest
    await this.validator.validate(manifest);

    // 3. Verificar compatibilidad
    this.checkCompatibility(manifest);

    // 4. Verificar permisos
    await this.requestPermissions(manifest);

    // 5. Crear sandbox
    const sandbox = this.createSandbox(manifest);

    // 6. Cargar código del plugin
    const pluginCode = await this.loadPluginCode(
      path.join(pluginPath, manifest.main)
    );

    // 7. Ejecutar en sandbox
    const plugin = this.executeInSandbox(sandbox, pluginCode, manifest);

    // 8. Registrar plugin
    this.registry.register(plugin);

    return plugin;
  }

  private createSandbox(manifest: PluginManifest): PluginSandbox {
    const permissions = new Set(manifest.permissions);
    
    const api = new PluginAPI(
      manifest.id,
      manifest,
      permissions,
      this.getServices(),
      this.getEventBus()
    );

    return {
      console: console, // Logger limitado
      setTimeout: setTimeout,
      setInterval: setInterval,
      clearTimeout: clearTimeout,
      clearInterval: clearInterval,
      spaceManager: api, // API principal
      // NO hay acceso a: require, process, fs, etc.
    };
  }

  private executeInSandbox(
    sandbox: PluginSandbox,
    code: string,
    manifest: PluginManifest
  ): Plugin {
    const context = vm.createContext(sandbox);
    
    try {
      const script = new vm.Script(code, {
        filename: manifest.main,
        timeout: 5000 // 5 segundos timeout para carga
      });

      const exports = script.runInContext(context);

      // El plugin debe exportar activate y deactivate
      if (typeof exports.activate !== 'function') {
        throw new Error('Plugin must export activate function');
      }

      return {
        id: manifest.id,
        manifest,
        activate: exports.activate,
        deactivate: exports.deactivate || (() => {}),
        isActive: false
      };

    } catch (error) {
      throw new Error(`Failed to load plugin ${manifest.id}: ${error.message}`);
    }
  }
}
```

---

## 9. Diagramas de Arquitectura

### 9.1 Componentes del Sistema

```
┌──────────────────────────────────────────────────────────┐
│                  Space Manager                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │            Frontend (Renderer Process)             │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │ │
│  │  │Dashboard │  │ Editor   │  │Analytics │         │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘         │ │
│  │       │             │             │                │ │
│  │  ┌────▼─────────────▼─────────────▼─────┐         │ │
│  │  │       Custom Hooks (ViewModels)      │         │ │
│  │  │  - useSpaces  - useTasks             │         │ │
│  │  │  - useAnalytics - useSettings        │         │ │
│  │  └────────────────┬─────────────────────┘         │ │
│  └───────────────────┼───────────────────────────────┘ │
│                      │ IPC                             │
│  ┌───────────────────▼───────────────────────────────┐ │
│  │           Backend (Main Process)                  │ │
│  │                                                   │ │
│  │  ┌──────────────────────────────────────────┐   │ │
│  │  │          Controllers                     │   │ │
│  │  │  - SpaceController                       │   │ │
│  │  │  - TaskController                        │   │ │
│  │  │  - AnalyticsController                   │   │ │
│  │  └──────────────────┬───────────────────────┘   │ │
│  │                     │                           │ │
│  │  ┌──────────────────▼───────────────────────┐   │ │
│  │  │          Services                        │   │ │
│  │  │  ┌────────────┐  ┌────────────┐         │   │ │
│  │  │  │SpaceService│  │TaskService │         │   │ │
│  │  │  └────┬───────┘  └────┬───────┘         │   │ │
│  │  │  ┌────▼────────────────▼───────┐        │   │ │
│  │  │  │ ExecutionOrchestrator       │        │   │ │
│  │  │  └─────────────────────────────┘        │   │ │
│  │  └──────────────────┬───────────────────────┘   │ │
│  │                     │                           │ │
│  │  ┌──────────────────▼───────────────────────┐   │ │
│  │  │       Data Access Layer                  │   │ │
│  │  │  - DataStore  - Repositories             │   │ │
│  │  │  - FileSystemService                     │   │ │
│  │  └──────────────────┬───────────────────────┘   │ │
│  │                     │                           │ │
│  │  ┌──────────────────▼───────────────────────┐   │ │
│  │  │       Infrastructure                     │   │ │
│  │  │  - File I/O  - OS APIs  - Process Mgmt  │   │ │
│  │  └──────────────────────────────────────────┘   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │                Plugin System                      │  │
│  │  - PluginLoader  - PluginAPI  - PluginSandbox    │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### 9.2 Flujo de Ejecución de Espacio

```
Usuario                 Renderer              Main                Services           Executors
  │                        │                    │                     │                  │
  │ Click "Execute"        │                    │                     │                  │
  ├───────────────────────>│                    │                     │                  │
  │                        │ IPC: execute       │                     │                  │
  │                        ├───────────────────>│                     │                  │
  │                        │                    │ executeSpace()      │                  │
  │                        │                    ├────────────────────>│                  │
  │                        │                    │                     │ Validar recursos │
  │                        │                    │                     │──────────┐       │
  │                        │                    │                     │<─────────┘       │
  │                        │                    │                     │ Foreach resource │
  │                        │                    │                     ├─────────────────>│
  │                        │                    │                     │                  │ execute()
  │                        │                    │                     │                  │──────┐
  │                        │                    │                     │                  │<─────┘
  │                        │                    │                     │<─────────────────┤
  │                        │                    │                     │ Aplicar delay    │
  │                        │                    │                     │──────────┐       │
  │                        │                    │                     │<─────────┘       │
  │                        │ Event: progress    │                     │                  │
  │                        │<───────────────────┤<────────────────────┤                  │
  │ Progress update        │                    │                     │                  │
  │<───────────────────────┤                    │                     │                  │
  │                        │                    │                     │ ... (next res)   │
  │                        │                    │                     │                  │
  │                        │                    │ Result              │                  │
  │                        │<───────────────────┤<────────────────────┤                  │
  │ Notification           │                    │                     │                  │
  │<───────────────────────┤                    │                     │                  │
  │                        │                    │                     │                  │
```

---

**Fin del Documento de Arquitectura Técnica**

Este documento define la arquitectura completa del sistema Space Manager, incluyendo:
- Visión general y principios arquitectónicos
- Arquitectura de capas detallada
- Patrones de diseño aplicados
- Estructura de módulos
- Sistema de comunicación IPC
- Persistencia de datos
- Motor de ejecución
- Sistema de plugins
- Diagramas de arquitectura

La arquitectura está diseñada para ser escalable, mantenible y extensible, siguiendo las mejores prácticas de desarrollo de software y patrones establecidos.
