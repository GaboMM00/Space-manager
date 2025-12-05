/**
 * Workspace Module Types
 * Types and interfaces for workspace management
 */

import { BaseEntity } from '../../../shared/types/common.types'

/**
 * Resource type enum
 */
export type ResourceType = 'application' | 'url' | 'file' | 'script'

/**
 * Execution order enum
 */
export type ExecutionOrder = 'sequential' | 'parallel'

/**
 * Resource entity
 */
export interface Resource extends BaseEntity {
  type: ResourceType
  name: string
  path: string
  args?: string[]
  enabled: boolean
  order: number
  retryCount?: number
  timeout?: number
  workingDirectory?: string
  delay?: number
}

/**
 * Space entity
 */
export interface Space extends BaseEntity {
  name: string
  description?: string
  icon?: string
  color?: string
  resources: Resource[]
  executionOrder: ExecutionOrder
  autoExecute?: boolean
  tags?: string[]
}

/**
 * DTOs for creating and updating spaces
 */
export type CreateSpaceDto = Omit<Space, keyof BaseEntity | 'resources'> & {
  resources: CreateResourceDto[]
}
export type UpdateSpaceDto = Partial<Omit<Space, keyof BaseEntity | 'resources'>> & {
  resources?: Resource[]
}

/**
 * DTOs for creating and updating resources
 */
export type CreateResourceDto = Omit<Resource, keyof BaseEntity>
export type UpdateResourceDto = Partial<Omit<Resource, keyof BaseEntity>>

/**
 * Export/Import format
 */
export interface SpaceExport {
  version: string
  exportedAt: string
  space: Space
}

/**
 * Space validation error
 */
export interface SpaceValidationError {
  field: string
  message: string
  value?: any
}

/**
 * Resource validation error
 */
export interface ResourceValidationError {
  field: string
  message: string
  value?: any
  resourceIndex?: number
}

/**
 * Validation result for spaces
 */
export interface SpaceValidationResult {
  valid: boolean
  errors: SpaceValidationError[]
}

/**
 * Validation result for resources
 */
export interface ResourceValidationResult {
  valid: boolean
  errors: ResourceValidationError[]
}

/**
 * Space statistics
 */
export interface SpaceStats {
  totalSpaces: number
  totalResources: number
  enabledSpaces: number
  disabledSpaces: number
  resourcesByType: Record<ResourceType, number>
}

/**
 * Space search filters
 */
export interface SpaceSearchFilters {
  query?: string
  tags?: string[]
  hasResources?: boolean
  executionOrder?: ExecutionOrder
}

/**
 * Space sort options
 */
export type SpaceSortField = 'name' | 'createdAt' | 'updatedAt' | 'resourceCount'
export type SpaceSortOrder = 'asc' | 'desc'

export interface SpaceSortOptions {
  field: SpaceSortField
  order: SpaceSortOrder
}
