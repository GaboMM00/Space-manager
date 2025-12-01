/**
 * Data Store Types
 * Types and interfaces for the persistence layer
 */

import { BaseEntity } from './common.types'

/**
 * JSON Data Store format
 * All JSON files follow this structure
 */
export interface DataStoreFile<T> {
  version: string
  lastModified: string
  items: T[]
}

/**
 * JSON Schema definition
 */
export interface JSONSchema {
  $schema?: string
  type: string
  properties?: Record<string, any>
  required?: string[]
  additionalProperties?: boolean
  [key: string]: any
}

/**
 * Validation error detail
 */
export interface ValidationError {
  field: string
  message: string
  value?: any
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/**
 * Backup metadata
 */
export interface BackupMetadata {
  id: string
  fileName: string
  filePath: string
  originalPath: string
  timestamp: number
  size: number
  description?: string
}

/**
 * Migration definition
 */
export interface Migration {
  version: number
  description: string
  up: (data: any) => Promise<any>
  down?: (data: any) => Promise<any>
}

/**
 * Migration status
 */
export interface MigrationStatus {
  currentVersion: number
  targetVersion: number
  appliedMigrations: number[]
  lastMigration?: {
    version: number
    appliedAt: string
    description: string
  }
}

/**
 * File system operation options
 */
export interface FileSystemOptions {
  encoding?: BufferEncoding
  createDirectories?: boolean
  overwrite?: boolean
}

/**
 * Repository base interface
 */
export interface IRepository<T extends BaseEntity> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(item: Omit<T, keyof BaseEntity>): Promise<T>
  update(id: string, updates: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
  exists(id: string): Promise<boolean>
}

/**
 * Space entity (from domain)
 */
export interface Space extends BaseEntity {
  name: string
  description?: string
  icon?: string
  color?: string
  resources: Resource[]
  executionOrder: 'sequential' | 'parallel'
  autoExecute?: boolean
  tags?: string[]
}

/**
 * Resource entity
 */
export interface Resource extends BaseEntity {
  type: 'application' | 'url' | 'file' | 'script'
  name: string
  path: string
  args?: string[]
  enabled: boolean
  order: number
  retryCount?: number
  timeout?: number
}

/**
 * Task entity (for future sprints)
 */
export interface Task extends BaseEntity {
  spaceId: string
  name: string
  description?: string
  enabled: boolean
  schedule?: {
    type: 'once' | 'daily' | 'weekly' | 'monthly' | 'cron'
    value: string
    timezone?: string
  }
  lastRunAt?: string
  nextRunAt?: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'disabled'
}

/**
 * Create DTOs (for future use)
 */
export type CreateSpaceDto = Omit<Space, keyof BaseEntity>
export type UpdateSpaceDto = Partial<Omit<Space, keyof BaseEntity>>

export type CreateResourceDto = Omit<Resource, keyof BaseEntity>
export type UpdateResourceDto = Partial<Omit<Resource, keyof BaseEntity>>

export type CreateTaskDto = Omit<Task, keyof BaseEntity>
export type UpdateTaskDto = Partial<Omit<Task, keyof BaseEntity>>
