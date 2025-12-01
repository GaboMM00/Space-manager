/**
 * Common types shared between Main and Renderer processes
 */

/**
 * Base entity interface with common fields
 */
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

/**
 * Result wrapper for operations
 */
export interface Result<T = void> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

/**
 * Date range filter
 */
export interface DateRange {
  from: string
  to: string
}

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Log entry
 */
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: Error
}

/**
 * Event data
 */
export interface EventData<T = any> {
  type: string
  payload: T
  timestamp: string
  source?: string
}
