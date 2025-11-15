# 📦 Space Manager

Sistema modular de gestión de espacios de trabajo digitales construido con Electron, React, TypeScript y TailwindCSS.

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 20+
- npm 9+

### Instalación

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build de producción
npm run build

# Empaquetar aplicación
npm run package
```

## 📖 Documentación

Toda la documentación del proyecto está disponible en la carpeta `/docs`:

- **[PROJECT_PLAN.md](./docs/PROJECT_PLAN.md)** - Plan maestro del proyecto
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Arquitectura completa del sistema
- **[SRS_COMPLETE.md](./docs/SRS_COMPLETE.md)** - Especificación de requerimientos
- **[DEVELOPMENT_GUIDE.md](./docs/DEVELOPMENT_GUIDE.md)** - Guía de desarrollo

### Documentación SQLite Analytics

- **[00_SQLITE_INDEX.md](./docs/00_SQLITE_INDEX.md)** - Índice de documentación SQLite
- **[SQLITE_EXECUTIVE_SUMMARY.md](./docs/SQLITE_EXECUTIVE_SUMMARY.md)** - Resumen ejecutivo
- **[SQLITE_QUICK_START.md](./docs/SQLITE_QUICK_START.md)** - Guía rápida
- **[SQLITE_GUIDE.md](./docs/SQLITE_GUIDE.md)** - Guía completa

## 🧱 Estructura del Proyecto

```
Space-manager/
├── docs/                       # Documentación completa
├── src/
│   ├── main/                   # Main process (Electron)
│   │   ├── index.ts
│   │   ├── windows/
│   │   ├── services/
│   │   └── controllers/
│   ├── preload/                # Preload scripts
│   │   └── index.ts
│   ├── renderer/               # Renderer process (React)
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   └── stores/
│   │   └── index.html
│   ├── shared/                 # Código compartido
│   │   ├── types/
│   │   ├── constants/
│   │   └── utils/
│   └── modules/                # Módulos funcionales
│       ├── workspace/
│       ├── tasks/
│       ├── analytics/
│       └── plugins/
├── tests/                      # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── resources/                  # Recursos (iconos, etc)
```

## 🛠 Stack Tecnológico

| Tecnología      | Propósito                        |
| --------------- | -------------------------------- |
| Electron 32+    | Aplicación de escritorio         |
| React 18        | UI Framework                     |
| TypeScript 5    | Lenguaje principal               |
| Vite 7          | Build tool                       |
| TailwindCSS 3   | Estilos                          |
| SQLite          | Base de datos (Analytics)        |
| Vitest          | Unit testing                     |
| Playwright      | E2E testing                      |

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev                 # Modo desarrollo con hot-reload
npm run dev:renderer        # Solo frontend (Vite)
npm run dev:main           # Solo main process con watch

# Build
npm run build              # Build completo
npm run build:main         # Build solo main process
npm run build:renderer     # Build solo renderer

# Testing
npm test                   # Run all tests
npm run test:unit          # Unit tests
npm run test:e2e           # E2E tests con Playwright
npm run test:coverage      # Coverage report

# Code Quality
npm run lint               # ESLint
npm run lint:fix           # ESLint auto-fix
npm run format             # Prettier
npm run typecheck          # TypeScript type checking

# Build & Package
npm run clean              # Limpiar dist/
npm run package            # Empaquetar para plataforma actual
npm run package:all        # Empaquetar para todas las plataformas
```

## 🎯 Estado del Proyecto

### ✅ Completado

- [x] Estructura de carpetas reorganizada
- [x] Configuración de TypeScript (multiple tsconfigs)
- [x] Configuración de ESLint y Prettier
- [x] Configuración de electron-vite
- [x] Tipos compartidos (shared/types/)
- [x] Servicios base (Database, FileSystem, EventBus)
- [x] Estructura de módulos base
- [x] Main process refactorizado
- [x] Preload script con API segura
- [x] Renderer base con React

### 🚧 En Progreso / Próximos Pasos

- [ ] Implementar módulos core (Workspace, Tasks, Analytics)
- [ ] Motor de ejecución de espacios
- [ ] UI Components (Dashboard, Space Editor, Task Manager)
- [ ] IPC Handlers completos
- [ ] Sistema de plugins
- [ ] Integración con calendario
- [ ] Tests unitarios y E2E

## 📄 Licencia

MIT

## 👥 Autor

Gabriel Medina

---

**Versión:** 1.0.0
**Última actualización:** Noviembre 2025
