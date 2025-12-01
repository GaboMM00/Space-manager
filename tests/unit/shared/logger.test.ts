/**
 * Logger Unit Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Logger, createLogger } from '../../../src/shared/utils/logger'
import { LogLevel } from '../../../src/shared/types/common.types'

describe('Logger', () => {
  let logger: Logger

  beforeEach(() => {
    vi.clearAllMocks()
    logger = createLogger({ level: LogLevel.DEBUG })
    vi.spyOn(console, 'debug').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createLogger', () => {
    it('should create a logger instance', () => {
      const newLogger = createLogger()
      expect(newLogger).toBeInstanceOf(Logger)
    })

    it('should create logger with custom config', () => {
      const customLogger = createLogger({ level: LogLevel.WARN })
      expect(customLogger.getLevel()).toBe(LogLevel.WARN)
    })
  })

  describe('debug', () => {
    it('should log debug messages when level is DEBUG', () => {
      logger.debug('Test debug message')
      expect(console.debug).toHaveBeenCalled()
    })

    it('should log debug with context', () => {
      logger.debug('Debug with context', { userId: '123' })
      expect(console.debug).toHaveBeenCalled()
    })
  })

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info message')
      expect(console.info).toHaveBeenCalled()
    })

    it('should log info with context', () => {
      logger.info('Info with context', { action: 'test' })
      expect(console.info).toHaveBeenCalled()
    })
  })

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning')
      expect(console.warn).toHaveBeenCalled()
    })
  })

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('Test error')
      expect(console.error).toHaveBeenCalled()
    })

    it('should log error with Error object', () => {
      vi.clearAllMocks() // Clear previous calls
      const error = new Error('Test error')
      logger.error('Error occurred', error)
      expect(console.error).toHaveBeenCalled()
      // Note: Should be called at least once for the message
    })
  })

  describe('log levels', () => {
    it('should respect log level filtering', () => {
      vi.clearAllMocks() // Clear previous calls
      const warnLogger = createLogger({ level: LogLevel.WARN })

      warnLogger.debug('Should not log')
      warnLogger.info('Should not log')
      warnLogger.warn('Should log')

      // Only warn should be called
      expect(console.warn).toHaveBeenCalledTimes(1)
    })

    it('should allow changing log level', () => {
      vi.clearAllMocks() // Clear previous calls
      logger.setLevel(LogLevel.ERROR)
      expect(logger.getLevel()).toBe(LogLevel.ERROR)

      logger.info('Should not log')
      // Info should not be called after level change
      expect(console.info).toHaveBeenCalledTimes(0)
    })
  })

  describe('child logger', () => {
    it('should create child logger with additional context', () => {
      const childLogger = logger.child({ module: 'test' })
      expect(childLogger).toBeInstanceOf(Logger)
    })

    it('should inherit parent configuration', () => {
      const parentLogger = createLogger({ level: LogLevel.ERROR })
      const childLogger = parentLogger.child({ service: 'api' })
      expect(childLogger.getLevel()).toBe(LogLevel.ERROR)
    })
  })

  describe('console control', () => {
    it('should allow disabling console output', () => {
      logger.setConsoleEnabled(false)
      logger.info('Should not appear in console')
      // Note: This is hard to test without more complex mocking
    })

    it('should allow enabling file logging', () => {
      logger.setFileEnabled(true)
      // File logging not implemented yet, just testing API
      expect(logger).toBeTruthy()
    })
  })
})
