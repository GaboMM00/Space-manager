# Guía de Desarrollo - Space Manager

**Versión:** 1.0.0  
**Fecha:** 15 de Noviembre 2025  

---

## Tabla de Contenidos

1. [Configuración del Entorno](#1-configuración-del-entorno)
2. [Estructura del Proyecto](#2-estructura-del-proyecto)
3. [Convenciones de Código](#3-convenciones-de-código)
4. [Flujo de Trabajo Git](#4-flujo-de-trabajo-git)
5. [Testing](#5-testing)
6. [Debugging](#6-debugging)
7. [Performance](#7-performance)
8. [Despliegue](#8-despliegue)

---

## 1. Configuración del Entorno

### 1.1 Prerrequisitos

```bash
# Node.js 20+ LTS
node --version  # Debe mostrar v20.x.x

# npm 10+
npm --version   # Debe mostrar 10.x.x

# Git
git --version   # Debe mostrar 2.x.x
```

### 1.2 Instalación

```bash
# Clonar repositorio
git clone https://github.com/GaboMM00/Spacemanager.git
cd space-manager

# Instalar dependencias
npm install

# Dependencias principales ya incluidas:
# - better-sqlite3 (para analytics)
# - electron
# - react, react-dom
# - typescript
# - vite, electron-vite
# - tailwindcss

# Copiar variables de entorno
cp .env.example .env

# Configurar pre-commit hooks
npx husky install
```

### 1.3 Configuración de VS Code (Recomendado)

**Extensiones Requeridas:**
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "usernamehw.errorlens",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

**settings.json:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### 1.4 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia app en modo desarrollo
npm run dev:renderer     # Solo frontend (para UI work)
npm run dev:main         # Solo main process

# Build
npm run build           # Build completo para producción
npm run build:main      # Compilar main process
npm run build:renderer  # Compilar renderer

# Testing
npm run test            # Ejecutar todos los tests
npm run test:unit       # Solo tests unitarios
npm run test:e2e        # Solo tests E2E
npm run test:watch      # Tests en modo watch
npm run test:coverage   # Tests con cobertura

# Linting y Formateo
npm run lint            # Ejecutar ESLint
npm run lint:fix        # Fix auto de ESLint
npm run format          # Formatear con Prettier
npm run typecheck       # Verificar tipos TypeScript

# Otros
npm run clean           # Limpiar builds
npm run package         # Empaquetar para distribución
```

---

## 2. Estructura del Proyecto

### 2.1 Árbol de Directorios

```
space-manager/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── release.yml
│   └── ISSUE_TEMPLATE/
│
├── docs/                       # Documentación
│   ├── architecture/
│   ├── api/
│   └── guides/
│
├── resources/                  # Assets para empaquetado
│   ├── icons/
│   └── installer/
│
├── scripts/                    # Scripts de utilidad
│   ├── setup.ts
│   └── migrate.ts
│
├── src/
│   ├── main/                   # Main process (Node.js)
│   │   ├── index.ts           # Entry point
│   │   ├── app.ts             # App configuration
│   │   │
│   │   ├── windows/           # Window management
│   │   │   ├── MainWindow.ts
│   │   │   └── WindowManager.ts
│   │   │
│   │   ├── controllers/       # IPC handlers
│   │   │   ├── SpaceController.ts
│   │   │   ├── TaskController.ts
│   │   │   └── AnalyticsController.ts
│   │   │
│   │   ├── services/          # Business logic
│   │   │   ├── SpaceService.ts
│   │   │   ├── ExecutionService.ts
│   │   │   ├── DataStoreService.ts
│   │   │   └── SQLiteService.ts       # SQLite connection manager
│   │   │
│   │   └── utils/             # Helpers
│   │       ├── logger.ts
│   │       └── di-container.ts
│   │
│   ├── preload/               # Preload scripts
│   │   ├── index.ts
│   │   └── api.ts             # Exposed API
│   │
│   ├── renderer/              # Renderer process (React)
│   │   ├── src/
│   │   │   ├── main.tsx       # Entry point
│   │   │   ├── App.tsx        # Root component
│   │   │   │
│   │   │   ├── router/        # React Router config
│   │   │   │   └── index.tsx
│   │   │   │
│   │   │   ├── pages/         # Page components
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── SpaceEditor/
│   │   │   │   ├── Settings/
│   │   │   │   └── Analytics/
│   │   │   │
│   │   │   ├── components/    # Reusable components
│   │   │   │   ├── ui/        # Base UI components
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   └── ...
│   │   │   │   ├── layout/    # Layout components
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   └── Header.tsx
│   │   │   │   └── features/  # Feature components
│   │   │   │       ├── SpaceCard/
│   │   │   │       └── TaskList/
│   │   │   │
│   │   │   ├── hooks/         # Custom hooks
│   │   │   │   ├── useSpaces.ts
│   │   │   │   ├── useTasks.ts
│   │   │   │   └── useAnalytics.ts
│   │   │   │
│   │   │   ├── stores/        # Global state
│   │   │   │   ├── settingsStore.ts
│   │   │   │   └── uiStore.ts
│   │   │   │
│   │   │   ├── utils/         # Frontend utils
│   │   │   │   ├── formatters.ts
│   │   │   │   └── validators.ts
│   │   │   │
│   │   │   └── types/         # Frontend types
│   │   │       └── index.ts
│   │   │
│   │   ├── assets/            # Static assets
│   │   ├── styles/            # Global styles
│   │   └── index.html         # HTML template
│   │
│   ├── shared/                # Shared between processes
│   │   ├── types/             # Shared TypeScript types
│   │   │   ├── space.types.ts
│   │   │   ├── task.types.ts
│   │   │   └── common.types.ts
│   │   ├── constants/         # Shared constants
│   │   │   └── index.ts
│   │   ├── validators/        # Shared validators
│   │   │   └── schemas.ts
│   │   └── utils/             # Shared utilities
│   │       └── common.ts
│   │
│   └── modules/               # Business modules
│       ├── workspace/
│       │   ├── models/
│       │   ├── services/
│       │   └── repositories/
│       ├── execution/
│       ├── tasks/
│       ├── analytics/
│       └── plugins/
│
├── tests/                     # Tests
│   ├── unit/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   └── execution/
│   └── e2e/
│       └── scenarios/
│
├── .eslintrc.js              # ESLint config
├── .prettierrc               # Prettier config
├── .gitignore
├── electron-builder.yml      # Builder config
├── electron.vite.config.ts   # Vite config
├── package.json
├── tsconfig.json             # Base TS config
├── tsconfig.node.json        # Node.js TS config
├── tsconfig.web.json         # Renderer TS config
├── tailwind.config.js
├── vitest.config.ts          # Vitest config
└── README.md
```

### 2.2 Convención de Nombres de Archivos

```typescript
// Componentes React - PascalCase
SpaceCard.tsx
SpaceEditor.tsx
Dashboard.tsx

// Hooks - camelCase con prefijo 'use'
useSpaces.ts
useExecutionMonitor.ts

// Services - PascalCase con sufijo 'Service'
SpaceService.ts
ExecutionService.ts

// Utils - camelCase
logger.ts
formatters.ts

// Types - kebab-case con sufijo '.types'
space.types.ts
execution.types.ts

// Constants - UPPER_SNAKE_CASE o camelCase según contexto
constants.ts  // archivo
export const MAX_SPACES = 500;  // constante

// Tests - mismo nombre + '.test' o '.spec'
SpaceService.test.ts
useSpaces.test.ts
```

---

## 3. Convenciones de Código

### 3.1 TypeScript

#### Tipos vs Interfaces

```typescript
// ✅ USAR INTERFACE para objetos que pueden extenderse
interface Space {
  id: string;
  name: string;
  resources: Resource[];
}

interface ExtendedSpace extends Space {
  metadata: SpaceMetadata;
}

// ✅ USAR TYPE para:
// - Unions
type ResourceType = 'application' | 'url' | 'script' | 'file';

// - Intersections
type SpaceWithTasks = Space & { tasks: Task[] };

// - Mapped types
type PartialSpace = Partial<Space>;

// - Function signatures
type ExecutorFn = (resource: Resource) => Promise<void>;
```

#### Nomenclatura de Tipos

```typescript
// ✅ CORRECTO
interface User {
  id: string;
  name: string;
}

type UserId = string;
type UserRole = 'admin' | 'user';

// ❌ INCORRECTO (no usar prefijos como I o T)
interface IUser { }
type TUserId = string;
```

#### Enums vs Union Types

```typescript
// ✅ PREFERIR Union Types para valores simples
type Status = 'idle' | 'loading' | 'success' | 'error';

// ✅ USAR Enums solo cuando:
// 1. Necesitas valores numéricos
enum Priority {
  Low = 1,
  Medium = 2,
  High = 3
}

// 2. Necesitas reverse mapping
enum HttpStatus {
  OK = 200,
  NotFound = 404,
  ServerError = 500
}
```

#### Manejo de Null/Undefined

```typescript
// ✅ USAR Nullish coalescing
const name = user.name ?? 'Guest';

// ✅ USAR Optional chaining
const email = user?.profile?.email;

// ✅ DEFINIR tipos explícitamente
interface User {
  id: string;
  name: string;
  email?: string;          // Opcional
  metadata: object | null; // Puede ser null
}

// ❌ EVITAR 'any'
function processData(data: any) { }  // ❌

// ✅ USAR 'unknown' si el tipo es desconocido
function processData(data: unknown) {
  if (typeof data === 'string') {
    // TypeScript sabe que data es string aquí
  }
}
```

### 3.2 React

#### Estructura de Componentes

```typescript
// ✅ CORRECTO - Componente funcional con tipos
interface SpaceCardProps {
  space: Space;
  onExecute: (id: string) => void;
  onEdit: (id: string) => void;
  className?: string;
}

export const SpaceCard: React.FC<SpaceCardProps> = ({
  space,
  onExecute,
  onEdit,
  className
}) => {
  // Hooks primero
  const [isHovered, setIsHovered] = useState(false);
  
  // Funciones de manejo de eventos
  const handleExecute = () => {
    onExecute(space.id);
  };
  
  const handleEdit = () => {
    onEdit(space.id);
  };
  
  // Render
  return (
    <div 
      className={cn('space-card', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3>{space.name}</h3>
      <button onClick={handleExecute}>Execute</button>
      <button onClick={handleEdit}>Edit</button>
    </div>
  );
};

// ❌ INCORRECTO
export default function SpaceCard(props: any) {
  return <div>{props.space.name}</div>;
}
```

#### Custom Hooks

```typescript
// ✅ CORRECTO - Hook bien estructurado
export function useSpaces() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Cargar espacios al montar
  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await window.electronAPI.spaces.list();
      setSpaces(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createSpace = async (data: CreateSpaceDto) => {
    const space = await window.electronAPI.spaces.create(data);
    setSpaces(prev => [...prev, space]);
    return space;
  };

  const updateSpace = async (id: string, data: UpdateSpaceDto) => {
    const updated = await window.electronAPI.spaces.update(id, data);
    setSpaces(prev => prev.map(s => s.id === id ? updated : s));
    return updated;
  };

  const deleteSpace = async (id: string) => {
    await window.electronAPI.spaces.delete(id);
    setSpaces(prev => prev.filter(s => s.id !== id));
  };

  return {
    spaces,
    loading,
    error,
    createSpace,
    updateSpace,
    deleteSpace,
    refresh: loadSpaces
  };
}
```

#### Manejo de Estado

```typescript
// ✅ USAR Zustand para estado global
import { create } from 'zustand';

interface SettingsStore {
  theme: 'light' | 'dark';
  language: string;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: 'light',
  language: 'en',
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language })
}));

// Uso en componente
const { theme, setTheme } = useSettingsStore();

// ✅ USAR useState para estado local de UI
const [isOpen, setIsOpen] = useState(false);
const [selectedId, setSelectedId] = useState<string | null>(null);
```

### 3.3 CSS/Tailwind

#### Organización de Clases

```typescript
// ✅ USAR cn() helper para combinar clases
import { cn } from '@/utils/cn';

<div className={cn(
  'base-classes',
  'layout-classes',
  condition && 'conditional-classes',
  className  // Props externos al final
)} />

// ✅ EXTRAER clases repetidas a constantes
const buttonVariants = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  danger: 'bg-red-500 hover:bg-red-600 text-white'
};

<button className={cn('px-4 py-2 rounded', buttonVariants.primary)}>
  Click me
</button>

// ✅ USAR cva para variantes complejas
import { cva } from 'class-variance-authority';

const buttonStyles = cva(
  'px-4 py-2 rounded font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-blue-500 hover:bg-blue-600 text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
        danger: 'bg-red-500 hover:bg-red-600 text-white'
      },
      size: {
        sm: 'text-sm py-1 px-2',
        md: 'text-base py-2 px-4',
        lg: 'text-lg py-3 px-6'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

<button className={buttonStyles({ variant: 'primary', size: 'lg' })}>
  Click me
</button>
```

### 3.4 Services y Lógica de Negocio

```typescript
// ✅ CORRECTO - Servicio bien estructurado
export class SpaceService {
  constructor(
    private repository: ISpaceRepository,
    private validator: SpaceValidator,
    private eventBus: EventBus,
    private logger: Logger
  ) {}

  async createSpace(data: CreateSpaceDto): Promise<Space> {
    // 1. Log de entrada
    this.logger.info('Creating space', { data });

    try {
      // 2. Validación
      await this.validator.validate(data);

      // 3. Lógica de negocio
      const space: Space = {
        id: uuid(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        resources: []
      };

      // 4. Persistencia
      await this.repository.create(space);

      // 5. Eventos
      this.eventBus.emit('space:created', space);

      // 6. Log de éxito
      this.logger.info('Space created successfully', { spaceId: space.id });

      return space;

    } catch (error) {
      // 7. Log de error
      this.logger.error('Failed to create space', { error, data });
      throw error;
    }
  }

  // ... más métodos
}
```

### 3.5 Manejo de Errores

```typescript
// ✅ DEFINIR errores personalizados
export class SpaceNotFoundError extends Error {
  constructor(spaceId: string) {
    super(`Space not found: ${spaceId}`);
    this.name = 'SpaceNotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ✅ USAR try-catch apropiadamente
async function executeSpace(spaceId: string): Promise<ExecutionResult> {
  try {
    const space = await spaceService.getSpace(spaceId);
    
    if (!space) {
      throw new SpaceNotFoundError(spaceId);
    }

    return await executionService.execute(space);

  } catch (error) {
    if (error instanceof SpaceNotFoundError) {
      // Manejo específico
      logger.warn('Space not found', { spaceId });
      throw error;
    }

    if (error instanceof ValidationError) {
      // Otro manejo específico
      logger.error('Validation failed', { error });
      throw error;
    }

    // Error genérico
    logger.error('Unexpected error executing space', { error, spaceId });
    throw new Error('Failed to execute space');
  }
}
```

### 3.6 Async/Await

```typescript
// ✅ CORRECTO
async function loadData() {
  try {
    const spaces = await fetchSpaces();
    const tasks = await fetchTasks();
    return { spaces, tasks };
  } catch (error) {
    console.error('Failed to load data', error);
    throw error;
  }
}

// ✅ PARALELO cuando sea posible
async function loadData() {
  const [spaces, tasks] = await Promise.all([
    fetchSpaces(),
    fetchTasks()
  ]);
  return { spaces, tasks };
}

// ❌ EVITAR then/catch mezclado con async/await
async function loadData() {
  return fetchSpaces()
    .then(spaces => fetchTasks().then(tasks => ({ spaces, tasks })))
    .catch(error => console.error(error));
}
```

---

## 4. Flujo de Trabajo Git

### 4.1 Branching Strategy

```
main (producción, protegido)
  ├── develop (desarrollo activo, protegido)
  │   ├── feature/TASK-123-add-export-functionality
  │   ├── feature/TASK-124-improve-ui-performance
  │   ├── fix/TASK-125-execution-error-handling
  │   └── refactor/TASK-126-service-architecture
  └── release/v1.1.0 (preparación de release)
```

### 4.2 Convención de Nombres de Branches

```bash
# Features
feature/TASK-ID-short-description
feature/123-add-plugin-system
feature/124-calendar-integration

# Fixes
fix/TASK-ID-short-description
fix/125-execution-crash
fix/126-memory-leak

# Refactoring
refactor/TASK-ID-short-description
refactor/127-service-layer
refactor/128-component-structure

# Hotfixes (desde main)
hotfix/TASK-ID-critical-issue
hotfix/129-data-corruption

# Releases
release/vX.Y.Z
release/v1.1.0
```

### 4.3 Commits Convencionales

```bash
# Formato
<type>(<scope>): <subject>

<body>

<footer>

# Types
feat:     Nueva funcionalidad
fix:      Corrección de bug
docs:     Cambios en documentación
style:    Formateo, punto y coma, etc (no afecta código)
refactor: Refactorización de código
perf:     Mejora de performance
test:     Agregar o modificar tests
chore:    Mantenimiento, dependencias, configs
ci:       Cambios en CI/CD
build:    Cambios en sistema de build

# Ejemplos
feat(spaces): add export to JSON functionality

Implements export feature allowing users to export
individual spaces or all spaces at once.

Closes #123

fix(execution): handle missing applications gracefully

Previously the app would crash if an application was
not found. Now it shows a warning and continues with
the next resource.

Fixes #125

refactor(services): migrate to dependency injection

Refactored all services to use DI pattern for better
testability and maintainability.

BREAKING CHANGE: Service instantiation changed
```

### 4.4 Pull Request Process

**1. Crear Branch**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/123-add-export
```

**2. Desarrollar y Commitear**
```bash
# Hacer cambios
git add .
git commit -m "feat(spaces): add export functionality"

# Más cambios
git add .
git commit -m "test(spaces): add export tests"
```

**3. Push y PR**
```bash
git push origin feature/123-add-export

# Crear PR en GitHub
# Título: feat(spaces): Add export to JSON functionality
# Descripción completa con:
# - Qué cambia
# - Por qué
# - Cómo testear
# - Screenshots si aplica
```

**4. Code Review**
- Al menos 1 aprobación requerida
- Todos los checks de CI deben pasar
- Sin conflictos con base branch

**5. Merge**
```bash
# Squash and merge (default)
# Esto combina todos los commits en uno
```

### 4.5 Template de Pull Request

```markdown
## Descripción
Brief description of what this PR does.

## Tipo de Cambio
- [ ] Nueva funcionalidad (feature)
- [ ] Corrección de bug (fix)
- [ ] Refactoring
- [ ] Documentación
- [ ] Otro (especificar)

## ¿Cómo se ha testeado?
Describe los tests realizados para verificar los cambios.

- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Tests E2E
- [ ] Tests manuales

## Checklist
- [ ] Mi código sigue las convenciones del proyecto
- [ ] He realizado self-review de mi código
- [ ] He comentado código complejo o no obvio
- [ ] He actualizado la documentación correspondiente
- [ ] Mis cambios no generan nuevos warnings
- [ ] He agregado tests que prueban mi fix/feature
- [ ] Tests unitarios nuevos y existentes pasan localmente
- [ ] Cambios dependientes han sido mergeados

## Screenshots (si aplica)
![Before](url)
![After](url)

## Notas Adicionales
Cualquier información adicional relevante.
```

---

## 5. Testing

### 5.1 Estructura de Tests

```
tests/
├── unit/                    # Tests unitarios
│   ├── services/
│   │   ├── SpaceService.test.ts
│   │   └── ExecutionService.test.ts
│   ├── utils/
│   │   └── validators.test.ts
│   └── hooks/
│       └── useSpaces.test.ts
│
├── integration/             # Tests de integración
│   ├── execution/
│   │   └── space-execution.test.ts
│   └── persistence/
│       └── data-store.test.ts
│
└── e2e/                     # Tests end-to-end
    └── scenarios/
        ├── create-and-execute-space.spec.ts
        └── manage-tasks.spec.ts
```

### 5.2 Tests Unitarios

```typescript
// SpaceService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpaceService } from '@/modules/workspace/services/SpaceService';
import { MockRepository } from '@/tests/mocks/MockRepository';

describe('SpaceService', () => {
  let service: SpaceService;
  let mockRepository: MockRepository;

  beforeEach(() => {
    mockRepository = new MockRepository();
    service = new SpaceService(mockRepository);
  });

  describe('createSpace', () => {
    it('should create a space with valid data', async () => {
      // Arrange
      const spaceData = {
        name: 'Test Space',
        description: 'A test space'
      };

      // Act
      const result = await service.createSpace(spaceData);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeTruthy();
      expect(result.name).toBe('Test Space');
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining(spaceData)
      );
    });

    it('should throw error with duplicate name', async () => {
      // Arrange
      mockRepository.findByName.mockResolvedValue({ id: '123' });

      // Act & Assert
      await expect(
        service.createSpace({ name: 'Existing' })
      ).rejects.toThrow('Space with this name already exists');
    });

    it('should emit space:created event', async () => {
      // Arrange
      const eventSpy = vi.spyOn(service.eventBus, 'emit');

      // Act
      const space = await service.createSpace({ name: 'Test' });

      // Assert
      expect(eventSpy).toHaveBeenCalledWith('space:created', space);
    });
  });

  describe('executeSpace', () => {
    it('should execute all enabled resources', async () => {
      // Test implementation
    });

    it('should skip disabled resources', async () => {
      // Test implementation
    });

    it('should handle execution errors gracefully', async () => {
      // Test implementation
    });
  });
});
```

### 5.3 Tests de Componentes React

```typescript
// SpaceCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpaceCard } from '@/renderer/components/features/SpaceCard';

describe('SpaceCard', () => {
  const mockSpace = {
    id: '123',
    name: 'Test Space',
    description: 'Test description',
    resources: []
  };

  it('should render space name', () => {
    render(<SpaceCard space={mockSpace} onExecute={vi.fn()} />);
    
    expect(screen.getByText('Test Space')).toBeInTheDocument();
  });

  it('should call onExecute when execute button is clicked', () => {
    const onExecute = vi.fn();
    render(<SpaceCard space={mockSpace} onExecute={onExecute} />);
    
    const executeButton = screen.getByRole('button', { name: /execute/i });
    fireEvent.click(executeButton);
    
    expect(onExecute).toHaveBeenCalledWith('123');
  });

  it('should show resource count', () => {
    const spaceWithResources = {
      ...mockSpace,
      resources: [{ id: '1' }, { id: '2' }]
    };
    
    render(
      <SpaceCard space={spaceWithResources} onExecute={vi.fn()} />
    );
    
    expect(screen.getByText('2 resources')).toBeInTheDocument();
  });
});
```

### 5.4 Tests E2E

```typescript
// create-and-execute-space.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Create and Execute Space', () => {
  test('should create a new space and execute it', async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('/');

    // Click en botón de crear espacio
    await page.click('[data-testid="create-space-button"]');

    // Llenar formulario
    await page.fill('[data-testid="space-name-input"]', 'Work Space');
    await page.fill(
      '[data-testid="space-description-input"]',
      'My work environment'
    );

    // Agregar recurso
    await page.click('[data-testid="add-resource-button"]');
    await page.selectOption(
      '[data-testid="resource-type-select"]',
      'application'
    );
    await page.fill(
      '[data-testid="resource-path-input"]',
      '/Applications/Visual Studio Code.app'
    );

    // Guardar espacio
    await page.click('[data-testid="save-space-button"]');

    // Verificar que aparece en la lista
    await expect(page.locator('text=Work Space')).toBeVisible();

    // Ejecutar espacio
    await page.click('[data-testid="execute-space-123"]');

    // Verificar notificación de éxito
    await expect(
      page.locator('text=Space executed successfully')
    ).toBeVisible();
  });
});
```

### 5.5 Cobertura de Tests

```bash
# Ejecutar tests con cobertura
npm run test:coverage

# Objetivo de cobertura
statements: 80%
branches: 75%
functions: 80%
lines: 80%
```

---

## 6. Debugging

### 6.1 Debugging del Main Process

**VS Code launch.json:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Main Process",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
      "args": [
        ".",
        "--remote-debugging-port=9223"
      ],
      "outputCapture": "std",
      "sourceMaps": true,
      "resolveSourceMapLocations": [
        "${workspaceFolder}/**",
        "!**/node_modules/**"
      ]
    }
  ]
}
```

### 6.2 Debugging del Renderer Process

**Chrome DevTools:**
```typescript
// En el main process
const win = new BrowserWindow({
  webPreferences: {
    devTools: true
  }
});

// Abrir DevTools automáticamente en desarrollo
if (process.env.NODE_ENV === 'development') {
  win.webContents.openDevTools();
}
```

**React DevTools:**
```bash
# Instalar extensión
npm install -D @electron/remote
```

### 6.3 Logging

```typescript
// Logger configurado
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(app.getPath('userData'), 'logs/error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(app.getPath('userData'), 'logs/combined.log')
    })
  ]
});

if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Uso
logger.info('Space created', { spaceId: '123' });
logger.error('Failed to execute', { error, spaceId: '123' });
logger.debug('Processing resource', { resource });
```

---

## 7. Performance

### 7.1 Optimizaciones de React

```typescript
// ✅ Memoización de componentes
export const SpaceCard = React.memo<SpaceCardProps>(
  ({ space, onExecute }) => {
    // Component implementation
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.space.id === nextProps.space.id &&
           prevProps.space.updatedAt === nextProps.space.updatedAt;
  }
);

// ✅ useMemo para cálculos costosos
const sortedSpaces = useMemo(() => {
  return spaces.sort((a, b) => 
    a.name.localeCompare(b.name)
  );
}, [spaces]);

// ✅ useCallback para funciones
const handleExecute = useCallback((id: string) => {
  executeSpace(id);
}, [executeSpace]);

// ✅ Virtualización de listas largas
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={spaces.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <SpaceCard
      key={spaces[index].id}
      space={spaces[index]}
      style={style}
    />
  )}
</FixedSizeList>
```

### 7.2 Optimizaciones de Electron

```typescript
// ✅ Lazy loading de módulos
const module = await import('./heavy-module');

// ✅ Web Workers para tareas pesadas
const worker = new Worker('analytics-worker.js');
worker.postMessage({ type: 'calculate', data });

// ✅ Throttling de IPC calls
import { throttle } from 'lodash-es';

const throttledSave = throttle(async (data) => {
  await window.electronAPI.settings.update(data);
}, 1000);
```

### 7.3 Monitoreo de Performance

```typescript
// Performance markers
performance.mark('space-execution-start');
await executeSpace(spaceId);
performance.mark('space-execution-end');

performance.measure(
  'space-execution',
  'space-execution-start',
  'space-execution-end'
);

const measure = performance.getEntriesByName('space-execution')[0];
logger.info('Execution time', { duration: measure.duration });
```

---

## 8. Despliegue

### 8.1 Build para Producción

```bash
# Build completo
npm run build

# Empaquetar para plataforma actual
npm run package

# Empaquetar para todas las plataformas (macOS only)
npm run package:all
```

### 8.2 electron-builder Configuration

```yaml
# electron-builder.yml
appId: com.spacemanager.app
productName: Space Manager
copyright: Copyright © 2025 Space Manager Team

directories:
  buildResources: resources
  output: dist

files:
  - dist/main/**/*
  - dist/preload/**/*
  - dist/renderer/**/*
  - package.json

mac:
  category: public.app-category.productivity
  icon: resources/icons/icon.icns
  target:
    - dmg
    - zip
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: resources/entitlements.mac.plist
  entitlementsInherit: resources/entitlements.mac.plist

win:
  icon: resources/icons/icon.ico
  target:
    - nsis
    - portable

linux:
  icon: resources/icons
  category: Utility
  target:
    - AppImage
    - deb
    - rpm

nsis:
  oneClick: false
  perMachine: false
  allowToChangeInstallationDirectory: true
  deleteAppDataOnUninstall: false
```

### 8.3 Firma de Código

**macOS:**
```bash
# Configurar certificado
export CSC_LINK=/path/to/certificate.p12
export CSC_KEY_PASSWORD=password

# Notarización
export APPLE_ID=your@email.com
export APPLE_ID_PASSWORD=app-specific-password
```

**Windows:**
```bash
# Configurar certificado
export CSC_LINK=/path/to/certificate.pfx
export CSC_KEY_PASSWORD=password
```

### 8.4 Actualización Automática

```typescript
// auto-updater.ts
import { autoUpdater } from 'electron-updater';
import { app, dialog } from 'electron';

export function setupAutoUpdater() {
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update available',
      message: `Version ${info.version} is available. Downloading...`
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update ready',
      message: 'Update downloaded. App will restart to install.',
      buttons: ['Restart', 'Later']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', (err) => {
    dialog.showErrorBox(
      'Update Error',
      `Error in auto-updater: ${err.message}`
    );
  });
}
```

---

## Recursos Adicionales

### Documentación Oficial
- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev/)

### Guías del Proyecto
- [Arquitectura del Sistema](./ARCHITECTURE.md)
- [Especificación de Requisitos](./SRS_COMPLETE.md)
- [Plan Maestro de Desarrollo](./PROJECT_PLAN.md)

### Contacto
- GitHub Issues: https://github.com/GaboMM00/Spacemanager/issues
- Equipo de desarrollo: [emails del equipo]

---

**Última actualización:** 15 de Noviembre 2025  
**Versión:** 1.0.0
