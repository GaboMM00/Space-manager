/**
 * DI Container Setup
 * Initializes and registers all services in the DI container
 * Phase 5.5 Sprint 5.5.2 - Services Refactoring
 */

import { container, ServiceNames } from '../../shared/di'
import { logger } from '../../shared/utils/logger'
import { EventBus, createEventBus } from '../../shared/utils/event-bus'
import { getFileSystemService, FileSystemService } from '../services/FileSystemService'
import { getSQLiteService, SQLiteService } from '../services/SQLiteService'
import { BackupService } from '../services/BackupService'
import { SpaceRepository } from '../../modules/workspace/repositories/SpaceRepository'
import { SpaceService } from '../../modules/workspace/services/SpaceService'
import { TaskRepository } from '../../modules/tasks/repositories/TaskRepository'
import { TaskService } from '../../modules/tasks/services/TaskService'
import { AnalyticsService } from '../../modules/analytics/services/AnalyticsService'

import type { ILogger } from '../../shared/interfaces/ILogger'
// Note: Interfaces below are used in IPC handlers for type-safe dependency injection
// import type { IEventBus } from '../../shared/interfaces/IEventBus'
// import type { IFileSystemService } from '../../shared/interfaces/IFileSystemService'
// import type { ISpaceRepository } from '../../modules/workspace/interfaces/ISpaceRepository'
import type { ISpaceService } from '../../modules/workspace/interfaces/ISpaceService'
// import type { ITaskRepository } from '../../modules/tasks/interfaces/ITaskRepository'
import type { ITaskService } from '../../modules/tasks/interfaces/ITaskService'
// import type { IAnalyticsService } from '../../modules/analytics/interfaces/IAnalyticsService'

/**
 * Initialize and configure the DI container with all services
 * This function should be called once during application startup
 */
export function initializeDIContainer(): void {
  logger.info('Initializing DI container...')

  // Register core services
  registerCoreServices()

  // Register workspace services
  registerWorkspaceServices()

  // Register task services
  registerTaskServices()

  // Register analytics services
  registerAnalyticsServices()

  logger.info('DI container initialized successfully')
}

/**
 * Register core infrastructure services
 */
function registerCoreServices(): void {
  // Logger - singleton
  container().register<ILogger>(
    ServiceNames.LOGGER,
    () => logger,
    true
  )

  // EventBus - singleton
  // Note: Using concrete EventBus type since IEventBus has slight signature differences
  container().register<EventBus>(
    ServiceNames.EVENT_BUS,
    () => createEventBus(),
    true
  )

  // FileSystemService - singleton
  // Note: Using concrete FileSystemService type
  container().register<FileSystemService>(
    ServiceNames.FILE_SYSTEM_SERVICE,
    () => getFileSystemService(),
    true
  )

  // SQLiteService - singleton
  container().register(
    ServiceNames.SQLITE_SERVICE,
    () => getSQLiteService(),
    true
  )

  logger.debug('Core services registered')
}

/**
 * Register workspace-related services
 */
function registerWorkspaceServices(): void {
  // SpaceRepository - singleton
  // Note: Using concrete SpaceRepository type since interface has minor differences
  container().register<SpaceRepository>(
    ServiceNames.SPACE_REPOSITORY,
    () => {
      const fileSystem = container().resolve<FileSystemService>(ServiceNames.FILE_SYSTEM_SERVICE)
      return new SpaceRepository(fileSystem)
    },
    true
  )

  // SpaceService - singleton
  container().register<ISpaceService>(
    ServiceNames.SPACE_SERVICE,
    () => {
      const fileSystem = container().resolve<FileSystemService>(ServiceNames.FILE_SYSTEM_SERVICE)
      const eventBus = container().resolve<EventBus>(ServiceNames.EVENT_BUS)
      const backupService = new BackupService(fileSystem)
      return new SpaceService(fileSystem, backupService, eventBus)
    },
    true
  )

  logger.debug('Workspace services registered')
}

/**
 * Register task-related services
 */
function registerTaskServices(): void {
  // TaskRepository - singleton
  // Note: Using concrete TaskRepository type since interface has minor differences
  container().register<TaskRepository>(
    ServiceNames.TASK_REPOSITORY,
    () => {
      const fileSystem = container().resolve<FileSystemService>(ServiceNames.FILE_SYSTEM_SERVICE)
      return new TaskRepository(fileSystem)
    },
    true
  )

  // TaskService - singleton
  container().register<ITaskService>(
    ServiceNames.TASK_SERVICE,
    () => {
      const fileSystem = container().resolve<FileSystemService>(ServiceNames.FILE_SYSTEM_SERVICE)
      const eventBus = container().resolve<EventBus>(ServiceNames.EVENT_BUS)
      return new TaskService(fileSystem, eventBus)
    },
    true
  )

  logger.debug('Task services registered')
}

/**
 * Register analytics-related services
 */
function registerAnalyticsServices(): void {
  // AnalyticsService - singleton
  // Note: Using concrete AnalyticsService type since interface has minor differences
  container().register<AnalyticsService>(
    ServiceNames.ANALYTICS_SERVICE,
    () => {
      const db = container().resolve<SQLiteService>(ServiceNames.SQLITE_SERVICE)
      const spaceRepository = container().resolve<SpaceRepository>(ServiceNames.SPACE_REPOSITORY)
      const taskRepository = container().resolve<TaskRepository>(ServiceNames.TASK_REPOSITORY)
      return new AnalyticsService(db, spaceRepository, taskRepository)
    },
    true
  )

  logger.debug('Analytics services registered')
}

/**
 * Get a service from the container
 * Helper function for type-safe service resolution
 */
export function getService<T>(serviceName: string): T {
  return container().resolve<T>(serviceName)
}
