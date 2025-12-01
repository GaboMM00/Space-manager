/**
 * Event Bus for decoupled module communication
 * Implements pub/sub pattern for cross-module events
 */

import { EventData } from '../types/common.types'
import { logger } from './logger'

/**
 * Event listener callback type
 */
export type EventListener<T = any> = (data: T) => void | Promise<void>

/**
 * Event subscription interface
 */
export interface EventSubscription {
  unsubscribe: () => void
}

/**
 * Event Bus implementation
 */
export class EventBus {
  private listeners: Map<string, Set<EventListener>>
  private wildcardListeners: Set<EventListener>
  private eventHistory: EventData[]
  private maxHistorySize: number

  constructor(maxHistorySize = 100) {
    this.listeners = new Map()
    this.wildcardListeners = new Set()
    this.eventHistory = []
    this.maxHistorySize = maxHistorySize
  }

  /**
   * Subscribe to an event
   */
  on<T = any>(event: string, listener: EventListener<T>): EventSubscription {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)!.add(listener)

    logger.debug('Event listener registered', { event })

    return {
      unsubscribe: () => this.off(event, listener)
    }
  }

  /**
   * Subscribe to an event (one-time)
   */
  once<T = any>(event: string, listener: EventListener<T>): EventSubscription {
    const onceListener: EventListener<T> = async (data: T) => {
      this.off(event, onceListener)
      await listener(data)
    }

    return this.on(event, onceListener)
  }

  /**
   * Subscribe to all events (wildcard)
   */
  onAny(listener: EventListener): EventSubscription {
    this.wildcardListeners.add(listener)

    logger.debug('Wildcard listener registered')

    return {
      unsubscribe: () => this.wildcardListeners.delete(listener)
    }
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, listener: EventListener): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(listener)

      // Clean up empty listener sets
      if (eventListeners.size === 0) {
        this.listeners.delete(event)
      }

      logger.debug('Event listener removed', { event })
    }
  }

  /**
   * Emit an event
   */
  async emit<T = any>(event: string, payload: T, source?: string): Promise<void> {
    const eventData: EventData<T> = {
      type: event,
      payload,
      timestamp: new Date().toISOString(),
      source
    }

    // Store in history
    this.addToHistory(eventData)

    logger.debug('Event emitted', { event, hasPayload: !!payload })

    // Call specific event listeners
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const promises: Promise<void>[] = []

      for (const listener of eventListeners) {
        try {
          const result = listener(payload)
          if (result instanceof Promise) {
            promises.push(result)
          }
        } catch (error) {
          logger.error('Error in event listener', error, { event })
        }
      }

      // Wait for all async listeners
      if (promises.length > 0) {
        await Promise.allSettled(promises)
      }
    }

    // Call wildcard listeners
    if (this.wildcardListeners.size > 0) {
      const promises: Promise<void>[] = []

      for (const listener of this.wildcardListeners) {
        try {
          const result = listener(eventData)
          if (result instanceof Promise) {
            promises.push(result)
          }
        } catch (error) {
          logger.error('Error in wildcard listener', error, { event })
        }
      }

      if (promises.length > 0) {
        await Promise.allSettled(promises)
      }
    }
  }

  /**
   * Emit event synchronously (fire and forget)
   */
  emitSync<T = any>(event: string, payload: T, source?: string): void {
    // Call emit but don't await
    this.emit(event, payload, source).catch((error) => {
      logger.error('Error emitting event', error, { event })
    })
  }

  /**
   * Get all listeners for an event
   */
  listenerCount(event: string): number {
    const eventListeners = this.listeners.get(event)
    return eventListeners ? eventListeners.size : 0
  }

  /**
   * Get all registered event types
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event)
      logger.debug('All listeners removed for event', { event })
    } else {
      this.listeners.clear()
      this.wildcardListeners.clear()
      logger.debug('All listeners removed')
    }
  }

  /**
   * Get event history
   */
  getHistory(eventType?: string, limit?: number): EventData[] {
    let history = this.eventHistory

    if (eventType) {
      history = history.filter(e => e.type === eventType)
    }

    if (limit && limit > 0) {
      history = history.slice(-limit)
    }

    return [...history] // Return copy
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = []
    logger.debug('Event history cleared')
  }

  /**
   * Add event to history
   */
  private addToHistory(event: EventData): void {
    this.eventHistory.push(event)

    // Maintain max history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }
  }
}

/**
 * Create default event bus instance
 */
export const createEventBus = (maxHistorySize?: number): EventBus => {
  return new EventBus(maxHistorySize)
}

/**
 * Global default event bus for quick usage
 */
export const eventBus = createEventBus()
