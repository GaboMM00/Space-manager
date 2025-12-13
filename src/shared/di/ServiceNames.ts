/**
 * Service Names
 * Constants for service identifiers in DI container
 * Phase 5.5 Sprint 5.5.1 - Dependency Injection Infrastructure
 */

export const ServiceNames = {
  // Core Services
  LOGGER: 'Logger',
  EVENT_BUS: 'EventBus',
  FILE_SYSTEM_SERVICE: 'FileSystemService',

  // Workspace Module
  SPACE_REPOSITORY: 'SpaceRepository',
  SPACE_SERVICE: 'SpaceService',

  // Tasks Module
  TASK_REPOSITORY: 'TaskRepository',
  TASK_SERVICE: 'TaskService',

  // Analytics Module
  ANALYTICS_SERVICE: 'AnalyticsService',
  SQLITE_SERVICE: 'SQLiteService',

  // Execution Module
  EXECUTION_ORCHESTRATOR: 'ExecutionOrchestrator'
} as const

export type ServiceName = (typeof ServiceNames)[keyof typeof ServiceNames]
