# Testing Guide - Space Manager

## Testing Stack

Este proyecto utiliza una configuración de testing moderna para aplicaciones Electron + Vite + React + TypeScript:

### Tecnologías

- **Node.js Test Runner**: Para unit tests del backend (natinfo, sin dependencias externas)
- **Playwright**: Para E2E testing y testing de componentes React
- **@testing-library/react**: Para testing de componentes React
- **tsx**: Runtime de TypeScript para ejecutar tests

### ¿Por qué NO usamos Vitest?

Después de investigación extens iva, descubrimos que:

1. **Vitest 4.x tiene incompatibilidades con electron-vite** - Los bloques `describe()` no se ejecutan correctamente
2. **No hay recomendación oficial** - Ni Electron ni electron-vite recomiendan un framework específico de testing
3. **Spectron está deprecated** - El framework oficial anterior de Electron ya no se mantiene

Referencias:
- [Electron Testing Documentation](https://www.electronjs.org/docs/latest/development/testing)
- [electron-vite Issue #88](https://github.com/alex8088/electron-vite/issues/88)
- [Spectron Deprecated](https://github.com/electron-userland/spectron)

### Configuración Actual

**Unit Tests (Backend)**:
- Framework: Node.js Native Test Runner
- Runtime: tsx
- Comando: `npm test`
- Archivos: `tests/unit/**/*.spec.ts`

**E2E Tests**:
- Framework: Playwright
- Comando: `npm run test:e2e`
- Archivos: `tests/e2e/**/*.spec.ts`

## Scripts Disponibles

```json
{
  "test": "tsx --test tests/unit/modules/tasks/TaskService.spec.ts",
  "test:e2e": "playwright test tests/e2e/**/*.spec.ts",
  "test:e2e:ui": "playwright test tests/e2e/**/*.spec.ts --ui",
  "test:report": "playwright show-report"
}
```

## Estructura de Directorios

```
tests/
├── unit/                   # Unit tests con Node.js Test Runner
│   ├── modules/
│   │   ├── tasks/
│   │   │   └── TaskService.spec.ts
│   │   ├── workspace/
│   │   └── analytics/
│   ├── services/
│   └── shared/
├── integration/            # Integration tests
└── e2e/                    # End-to-end tests con Playwright
```

## Escribir Unit Tests

### Ejemplo con Node.js Test Runner

```typescript
import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { TaskService } from '../../../../src/modules/tasks/services/TaskService'

describe('TaskService', () => {
  let taskService: TaskService
  let mockRepository: any

  beforeEach(() => {
    mockRepository = {
      findAll: mock.fn(() => Promise.resolve([])),
      findById: mock.fn(() => Promise.resolve(null))
    }

    taskService = new TaskService(mockRepository)
  })

  describe('getAllTasks', () => {
    it('should return all tasks', async () => {
      const tasks = [{ id: '1', title: 'Test' }]
      mockRepository.findAll.mock.mockImplementationOnce(() => Promise.resolve(tasks))

      const result = await taskService.getAllTasks()

      assert.deepEqual(result, tasks)
      assert.equal(mockRepository.findAll.mock.callCount(), 1)
    })
  })
})
```

### API de Mocking

Node.js proporciona una API nativa de mocking:

```typescript
// Crear un mock
const mockFn = mock.fn(() => 'return value')

// Mock con implementación
mockFn.mock.mockImplementation(() => 'new value')
mockFn.mock.mockImplementationOnce(() => 'one time value')

// Verificar calls
mockFn.mock.callCount()           // Número de llamadas
mockFn.mock.calls[0].arguments    // Argumentos de la primera llamada
```

### Assertions

```typescript
import assert from 'node:assert/strict'

assert.equal(actual, expected)
assert.deepEqual(object1, object2)
assert.ok(value)  // truthy
assert.throws(() => { throw new Error() })
```

## Escribir E2E Tests

### Ejemplo con Playwright

```typescript
import { test, expect } from '@playwright/test'

test.describe('Space Manager App', () => {
  test('should create a new space', async ({ page }) => {
    await page.goto('/')

    await page.click('[data-testid="create-space-button"]')
    await page.fill('[data-testid="space-name"]', 'My New Space')
    await page.click('[data-testid="submit"]')

    await expect(page.locator('[data-testid="space-list"]')).toContainText('My New Space')
  })
})
```

## Estado Actual del Testing (Sprint 5.1)

### ✅ Completado

- Configuración de testing stack (Node.js Test Runner + Playwright)
- Instalación y configuración de dependencias
- Estructura de directorios de tests
- Ejemplo de test para TaskService

### ⚠️ En Progreso

Los tests actuales tienen un problema de arquitectura:
- Los servicios están fuertemente acoplados a implementaciones concretas
- Necesitamos inyección de dependencias adecuada para permitir mocking
- Esto requiere refactorización del código de producción

### 📋 Pendiente (Fase 5 Sprint 5.1)

1. Refactor TaskService para soportar dependency injection
2. Crear tests unitarios para:
   - AnalyticsService
   - SQLiteService
   - ExecutionOrchestrator
   - Executors (Application, URL, Script, File)
3. Tests de integración para flujos completos
4. Configurar coverage reporting
5. Lograr ≥80% de cobertura según especificación

## Mejores Prácticas

1. **Unit Tests**: Testear lógica de negocio en aislamiento con mocks
2. **Integration Tests**: Testear interacciones entre módulos
3. **E2E Tests**: Testear flujos completos de usuario
4. **Naming**: Usar `.spec.ts` para todos los archivos de test
5. **Organización**: Mantener misma estructura que `src/` en `tests/`
6. **Mocking**: Solo mockear dependencias externas, no lógica interna
7. **Assertions**: Ser específico - verificar el comportamiento esperado exacto

## Troubleshooting

### Tests no se encuentran

El patrón glob `tests/**/*.spec.ts` no funciona en Windows con tsx. Especifica archivos individuales:

```json
"test": "tsx --test tests/unit/modules/tasks/TaskService.spec.ts"
```

### Errores de TypeScript en tests

Asegúrate de que tsx esté instalado:

```bash
npm install --save-dev tsx
```

### Cannot read properties of undefined

Este error indica que estás usando implementaciones reales en lugar de mocks. Asegúrate de:
1. Crear mocks antes de instanciar el servicio
2. Usar dependency injection
3. Verificar que los mocks se están usando correctamente

## Referencias

- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
- [Electron Testing Guide](https://www.electronjs.org/docs/latest/development/testing)
