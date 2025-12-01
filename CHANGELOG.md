# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Phase 1 Sprint 1.1 (Architecture Base)

**Shared Types:**
- Added `common.types.ts` with base types: `BaseEntity`, `Result<T>`, `PaginationParams`, `PaginatedResponse`, `DateRange`, `LogLevel`, `LogEntry`, `EventData`
- Added `ipc.types.ts` with typed IPC communication channels and message definitions
- Added `IPC_CHANNELS` and `IPC_EVENTS` constants for type-safe IPC
- Added `IPCInvokeMap` and `IPCEventMap` for complete type safety
- Added DTOs for Spaces, Resources, Execution, and System operations

**Logger Utility:**
- Implemented structured logging system (`src/shared/utils/logger.ts`)
- Support for multiple log levels: DEBUG, INFO, WARN, ERROR
- Context-based logging with metadata support
- Child logger creation for module-specific logging
- Configurable console output
- Placeholder for future file logging
- 15 unit tests with 100% coverage

**Event Bus Utility:**
- Implemented pub/sub event bus (`src/shared/utils/event-bus.ts`)
- Support for event subscriptions with `on()`, `once()`, and `onAny()`
- Async and sync event emission
- Event history tracking with configurable size
- Wildcard listeners for cross-cutting concerns
- Subscription management with unsubscribe functionality
- 22 unit tests with 100% coverage

**IPC Communication System:**
- Created `IPCMain` class for centralized IPC handler management
- Type-safe IPC handler registration
- Automatic error handling and logging
- Helper functions `createSuccessResult()` and `createErrorResult()`
- Support for sending events to specific or all renderer processes
- System handlers implemented: `system:ping` and `system:info`

**Preload API:**
- Exposed typed IPC API to renderer process
- Implemented system methods: `ping()`, `getInfo()`
- Placeholders for future modules (spaces, tasks, analytics)
- Event listener support with `on()` and `once()`
- Type-safe communication via `window.api`

**Main Process:**
- Integrated IPC handlers registration on app startup
- Structured logging throughout application lifecycle
- System handler registration for ping and system info

**Renderer (MVVM Base):**
- Created `BaseViewModel` abstract class for MVVM pattern
- State management with loading and error states
- Event-based state change notifications
- Async operation handling with automatic loading states
- Lifecycle management with `destroy()` method

**React Hooks:**
- Implemented `useIPCInvoke<TData, TArgs>()` for typed IPC calls
- Implemented `useIPCListener<TData>()` for event subscriptions
- Implemented `useIPCOnce<TData>()` for one-time events
- Implemented `useSystemPing()` for IPC latency testing
- Implemented `useSystemInfo()` for system information retrieval

**UI Components:**
- Updated App.tsx to demonstrate IPC communication
- Added ping test button with latency display
- Added system information card
- Visual indicators for Phase 1 Sprint 1.1 completion

**Testing Infrastructure:**
- Configured Vitest for unit testing
- Added test scripts: `npm test`, `npm run test:ui`, `npm run test:coverage`
- Created comprehensive test suites for Logger (15 tests)
- Created comprehensive test suites for EventBus (22 tests)
- **Total: 37 tests passing** with excellent coverage

**Type Safety:**
- Full TypeScript support across Main and Renderer processes
- Window API type declarations (`window.d.ts`)
- Zero TypeScript errors with `npm run typecheck`

### Changed

- Updated `src/main/index.ts` to initialize IPC handlers on startup
- Enhanced logging throughout the application
- Modified App.tsx to demonstrate MVVM architecture

### Documentation

- All code includes JSDoc comments for public APIs
- Inline documentation for complex logic
- Type definitions serve as documentation

---

## [1.0.0] - 2025-11-30

### Added - Phase 0 (Planning and Configuration)

**Sprint 0.1 - Documentation Base**
- Created complete architecture documentation (ARCHITECTURE.md)
- Defined system requirements specification (SRS_COMPLETE.md)
- Established project plan with phases and sprints (PROJECT_PLAN.md)
- Corrected SQLite schema design with 6 critical fixes
- Created SQLITE_SCHEMA.sql with production-ready database design
- Documented all corrections in SQLITE_CORRECTIONS_LOG.md

**Sprint 0.2 - Project Configuration**
- Initialized Electron + Vite + React + TypeScript project
- Configured Tailwind CSS with custom color palette
- Set up ESLint and Prettier
- Created comprehensive README.md
- Created detailed ROADMAP.md with 7-step workflow process
- Created SETUP_GUIDE.txt for future projects
- Configured build system for Windows, macOS, and Linux

---

**Project**: Space Manager v1.0.0
**Stack**: Electron 32.2.6, Vite 5.4.11, React 18.3.1, TypeScript 5.6.3, Tailwind CSS 4.1.17
**Team**: Gabriel Medina, Ángel Pérez, Cristian Espinoza
