/**
 * Structured logging system for both Main and Renderer processes
 * Supports multiple log levels with context and formatting
 */

import { LogLevel, LogEntry } from '../types/common.types'

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableFile: boolean
  filePath?: string
  context?: Record<string, any>
}

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  enableConsole: true,
  enableFile: false
}

/**
 * Structured logger class
 */
export class Logger {
  private config: LoggerConfig
  private context: Record<string, any>

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.context = config.context || {}
  }

  /**
   * Create child logger with additional context
   */
  child(context: Record<string, any>): Logger {
    return new Logger({
      ...this.config,
      context: { ...this.context, ...context }
    })
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context)
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    const errorObject = error instanceof Error ? error : undefined
    this.log(LogLevel.ERROR, message, context, errorObject)
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    // Check if log level is enabled
    if (!this.shouldLog(level)) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.context, ...context },
      error
    }

    // Console output
    if (this.config.enableConsole) {
      this.writeToConsole(entry)
    }

    // File output (to be implemented in future)
    if (this.config.enableFile && this.config.filePath) {
      this.writeToFile(entry)
    }
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]
    const configLevelIndex = levels.indexOf(this.config.level)
    const messageLevelIndex = levels.indexOf(level)
    return messageLevelIndex >= configLevelIndex
  }

  /**
   * Write log entry to console
   */
  private writeToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()
    const contextStr = Object.keys(entry.context || {}).length > 0
      ? JSON.stringify(entry.context)
      : ''

    const logMessage = `[${timestamp}] [${entry.level.toUpperCase()}] ${entry.message} ${contextStr}`

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(logMessage)
        break
      case LogLevel.INFO:
        console.info(logMessage)
        break
      case LogLevel.WARN:
        console.warn(logMessage)
        break
      case LogLevel.ERROR:
        console.error(logMessage)
        if (entry.error) {
          console.error(entry.error)
        }
        break
    }
  }

  /**
   * Write log entry to file (placeholder for future implementation)
   */
  private writeToFile(_entry: LogEntry): void {
    // TODO: Implement file logging in Phase 2
    // This will require fs access from Main process
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.config.level
  }

  /**
   * Enable/disable console logging
   */
  setConsoleEnabled(enabled: boolean): void {
    this.config.enableConsole = enabled
  }

  /**
   * Enable/disable file logging
   */
  setFileEnabled(enabled: boolean): void {
    this.config.enableFile = enabled
  }
}

/**
 * Create default logger instance
 */
export const createLogger = (config?: Partial<LoggerConfig>): Logger => {
  return new Logger(config)
}

/**
 * Global default logger for quick usage
 */
export const logger = createLogger({
  level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
})
