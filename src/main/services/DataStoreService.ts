/**
 * DataStoreService
 * Central service for data persistence with validation
 */

import Ajv, { ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'
import { logger } from '../../shared/utils/logger'
import { Result, BaseEntity } from '../../shared/types/common.types'
import {
  JSONSchema,
  ValidationResult,
  ValidationError,
  DataStoreFile
} from '../../shared/types/data-store.types'
import { FileSystemService } from './FileSystemService'

/**
 * Data store error codes
 */
export enum DataStoreErrorCode {
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  PARSE_ERROR = 'PARSE_ERROR',
  SAVE_ERROR = 'SAVE_ERROR'
}

/**
 * Base Repository class implementing the Repository pattern
 */
export abstract class BaseRepository<T extends BaseEntity> {
  protected ajv: Ajv
  protected validateFn: ValidateFunction | null = null

  constructor(
    protected fileSystem: FileSystemService,
    protected schema: JSONSchema
  ) {
    this.ajv = new Ajv({ allErrors: true })
    addFormats(this.ajv)
    this.compileSchema()
  }

  /**
   * Get the file path for this repository
   */
  protected abstract getFilePath(): string

  /**
   * Compile JSON schema for validation
   */
  private compileSchema(): void {
    try {
      this.validateFn = this.ajv.compile(this.schema)
      logger.debug('Schema compiled successfully', {
        repository: this.constructor.name
      })
    } catch (error) {
      logger.error('Failed to compile schema', error, {
        repository: this.constructor.name
      })
    }
  }

  /**
   * Validate data against schema
   */
  protected validate(data: any): ValidationResult {
    if (!this.validateFn) {
      return {
        valid: false,
        errors: [{ field: 'schema', message: 'Schema not compiled' }]
      }
    }

    const valid = this.validateFn(data)

    if (!valid && this.validateFn.errors) {
      const errors: ValidationError[] = this.validateFn.errors.map((err) => ({
        field: err.instancePath || err.schemaPath,
        message: err.message || 'Validation error',
        value: err.data
      }))

      return { valid: false, errors }
    }

    return { valid: true, errors: [] }
  }

  /**
   * Read data store file
   */
  protected async readDataStore(): Promise<Result<DataStoreFile<T>>> {
    const filePath = this.getFilePath()
    const exists = await this.fileSystem.exists(filePath)

    if (!exists) {
      // Return empty data store if file doesn't exist
      const emptyStore: DataStoreFile<T> = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        items: []
      }
      return { success: true, data: emptyStore }
    }

    const result = await this.fileSystem.readJSON<DataStoreFile<T>>(filePath)

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        code: DataStoreErrorCode.FILE_NOT_FOUND
      }
    }

    return { success: true, data: result.data! }
  }

  /**
   * Write data store file
   */
  protected async writeDataStore(dataStore: DataStoreFile<T>): Promise<Result<void>> {
    // Validate entire data store
    const validation = this.validate(dataStore)

    if (!validation.valid) {
      const errorMessages = validation.errors.map((e) => `${e.field}: ${e.message}`).join(', ')
      logger.warn('Validation failed', { errors: validation.errors })
      return {
        success: false,
        error: `Validation failed: ${errorMessages}`,
        code: DataStoreErrorCode.VALIDATION_FAILED
      }
    }

    // Update lastModified timestamp
    dataStore.lastModified = new Date().toISOString()

    const result = await this.fileSystem.writeJSON(this.getFilePath(), dataStore, {
      createDirectories: true
    })

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        code: DataStoreErrorCode.SAVE_ERROR
      }
    }

    logger.debug('Data store saved successfully', {
      repository: this.constructor.name,
      itemCount: dataStore.items.length
    })

    return { success: true }
  }

  /**
   * Generate unique ID (UUID v4)
   */
  protected generateId(): string {
    // Generate UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  /**
   * Get current timestamp
   */
  protected getTimestamp(): string {
    return new Date().toISOString()
  }

  /**
   * Find all items
   */
  async findAll(): Promise<T[]> {
    const result = await this.readDataStore()

    if (!result.success || !result.data) {
      logger.error('Failed to read data store', { repository: this.constructor.name })
      return []
    }

    return result.data.items
  }

  /**
   * Find item by ID
   */
  async findById(id: string): Promise<T | null> {
    const items = await this.findAll()
    return items.find((item) => item.id === id) || null
  }

  /**
   * Check if item exists
   */
  async exists(id: string): Promise<boolean> {
    const item = await this.findById(id)
    return item !== null
  }

  /**
   * Create new item
   */
  async create(data: Omit<T, keyof BaseEntity>): Promise<Result<T>> {
    const dataStoreResult = await this.readDataStore()

    if (!dataStoreResult.success || !dataStoreResult.data) {
      return {
        success: false,
        error: dataStoreResult.error,
        code: dataStoreResult.code
      }
    }

    const now = this.getTimestamp()
    const newItem: T = {
      ...data,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now
    } as T

    dataStoreResult.data.items.push(newItem)

    const saveResult = await this.writeDataStore(dataStoreResult.data)

    if (!saveResult.success) {
      return {
        success: false,
        error: saveResult.error,
        code: saveResult.code
      }
    }

    logger.info('Item created', {
      repository: this.constructor.name,
      itemId: newItem.id
    })

    return { success: true, data: newItem }
  }

  /**
   * Update existing item
   */
  async update(id: string, updates: Partial<T>): Promise<Result<T>> {
    const dataStoreResult = await this.readDataStore()

    if (!dataStoreResult.success || !dataStoreResult.data) {
      return {
        success: false,
        error: dataStoreResult.error,
        code: dataStoreResult.code
      }
    }

    const index = dataStoreResult.data.items.findIndex((item) => item.id === id)

    if (index === -1) {
      return {
        success: false,
        error: `Item not found with id: ${id}`,
        code: DataStoreErrorCode.FILE_NOT_FOUND
      }
    }

    const updatedItem: T = {
      ...dataStoreResult.data.items[index],
      ...updates,
      id, // Preserve original ID
      createdAt: dataStoreResult.data.items[index].createdAt, // Preserve createdAt
      updatedAt: this.getTimestamp()
    }

    dataStoreResult.data.items[index] = updatedItem

    const saveResult = await this.writeDataStore(dataStoreResult.data)

    if (!saveResult.success) {
      return {
        success: false,
        error: saveResult.error,
        code: saveResult.code
      }
    }

    logger.info('Item updated', {
      repository: this.constructor.name,
      itemId: id
    })

    return { success: true, data: updatedItem }
  }

  /**
   * Delete item
   */
  async delete(id: string): Promise<Result<void>> {
    const dataStoreResult = await this.readDataStore()

    if (!dataStoreResult.success || !dataStoreResult.data) {
      return {
        success: false,
        error: dataStoreResult.error,
        code: dataStoreResult.code
      }
    }

    const initialLength = dataStoreResult.data.items.length
    dataStoreResult.data.items = dataStoreResult.data.items.filter((item) => item.id !== id)

    if (dataStoreResult.data.items.length === initialLength) {
      return {
        success: false,
        error: `Item not found with id: ${id}`,
        code: DataStoreErrorCode.FILE_NOT_FOUND
      }
    }

    const saveResult = await this.writeDataStore(dataStoreResult.data)

    if (!saveResult.success) {
      return {
        success: false,
        error: saveResult.error,
        code: saveResult.code
      }
    }

    logger.info('Item deleted', {
      repository: this.constructor.name,
      itemId: id
    })

    return { success: true }
  }

  /**
   * Delete all items
   */
  async deleteAll(): Promise<Result<void>> {
    const dataStoreResult = await this.readDataStore()

    if (!dataStoreResult.success || !dataStoreResult.data) {
      return {
        success: false,
        error: dataStoreResult.error,
        code: dataStoreResult.code
      }
    }

    dataStoreResult.data.items = []

    const saveResult = await this.writeDataStore(dataStoreResult.data)

    if (!saveResult.success) {
      return {
        success: false,
        error: saveResult.error,
        code: saveResult.code
      }
    }

    logger.info('All items deleted', { repository: this.constructor.name })

    return { success: true }
  }

  /**
   * Count items
   */
  async count(): Promise<number> {
    const items = await this.findAll()
    return items.length
  }
}
