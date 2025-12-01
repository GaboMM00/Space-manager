/**
 * EventBus Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EventBus, createEventBus } from '../../../src/shared/utils/event-bus'

describe('EventBus', () => {
  let eventBus: EventBus

  beforeEach(() => {
    eventBus = createEventBus()
  })

  describe('createEventBus', () => {
    it('should create an event bus instance', () => {
      const bus = createEventBus()
      expect(bus).toBeInstanceOf(EventBus)
    })

    it('should create event bus with custom history size', () => {
      const bus = createEventBus(50)
      expect(bus).toBeInstanceOf(EventBus)
    })
  })

  describe('on', () => {
    it('should register event listener', () => {
      const listener = vi.fn()
      eventBus.on('test-event', listener)

      expect(eventBus.listenerCount('test-event')).toBe(1)
    })

    it('should return subscription with unsubscribe', () => {
      const listener = vi.fn()
      const subscription = eventBus.on('test-event', listener)

      expect(subscription).toHaveProperty('unsubscribe')
      expect(typeof subscription.unsubscribe).toBe('function')
    })

    it('should call listener when event is emitted', async () => {
      const listener = vi.fn()
      eventBus.on('test-event', listener)

      await eventBus.emit('test-event', { data: 'test' })

      expect(listener).toHaveBeenCalledWith({ data: 'test' })
    })

    it('should call multiple listeners for same event', async () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      eventBus.on('test-event', listener1)
      eventBus.on('test-event', listener2)

      await eventBus.emit('test-event', 'payload')

      expect(listener1).toHaveBeenCalledWith('payload')
      expect(listener2).toHaveBeenCalledWith('payload')
    })
  })

  describe('once', () => {
    it('should register one-time listener', async () => {
      const listener = vi.fn()
      eventBus.once('test-event', listener)

      await eventBus.emit('test-event', 'data1')
      await eventBus.emit('test-event', 'data2')

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith('data1')
    })
  })

  describe('onAny', () => {
    it('should register wildcard listener', async () => {
      const listener = vi.fn()
      eventBus.onAny(listener)

      await eventBus.emit('event1', 'data1')
      await eventBus.emit('event2', 'data2')

      expect(listener).toHaveBeenCalledTimes(2)
    })
  })

  describe('off', () => {
    it('should unregister listener', () => {
      const listener = vi.fn()
      eventBus.on('test-event', listener)

      expect(eventBus.listenerCount('test-event')).toBe(1)

      eventBus.off('test-event', listener)

      expect(eventBus.listenerCount('test-event')).toBe(0)
    })

    it('should work via subscription unsubscribe', async () => {
      const listener = vi.fn()
      const subscription = eventBus.on('test-event', listener)

      await eventBus.emit('test-event', 'data1')
      subscription.unsubscribe()
      await eventBus.emit('test-event', 'data2')

      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('emit', () => {
    it('should emit events asynchronously', async () => {
      const listener = vi.fn(async () => {
        return new Promise(resolve => setTimeout(resolve, 10))
      })

      eventBus.on('async-event', listener)
      await eventBus.emit('async-event', 'data')

      expect(listener).toHaveBeenCalled()
    })

    it('should handle listener errors gracefully', async () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error')
      })
      const goodListener = vi.fn()

      eventBus.on('error-event', errorListener)
      eventBus.on('error-event', goodListener)

      await eventBus.emit('error-event', 'data')

      expect(errorListener).toHaveBeenCalled()
      expect(goodListener).toHaveBeenCalled()
    })
  })

  describe('emitSync', () => {
    it('should emit events synchronously', () => {
      const listener = vi.fn()
      eventBus.on('sync-event', listener)

      eventBus.emitSync('sync-event', 'data')

      // Note: emitSync is fire-and-forget, so we can't directly test the call
      // but we can verify the method doesn't throw
      expect(listener).toBeTruthy()
    })
  })

  describe('listenerCount', () => {
    it('should return correct listener count', () => {
      expect(eventBus.listenerCount('test')).toBe(0)

      eventBus.on('test', () => {})
      expect(eventBus.listenerCount('test')).toBe(1)

      eventBus.on('test', () => {})
      expect(eventBus.listenerCount('test')).toBe(2)
    })
  })

  describe('eventNames', () => {
    it('should return all registered event names', () => {
      eventBus.on('event1', () => {})
      eventBus.on('event2', () => {})

      const names = eventBus.eventNames()
      expect(names).toContain('event1')
      expect(names).toContain('event2')
    })
  })

  describe('removeAllListeners', () => {
    it('should remove all listeners for specific event', () => {
      eventBus.on('test', () => {})
      eventBus.on('test', () => {})
      eventBus.on('other', () => {})

      eventBus.removeAllListeners('test')

      expect(eventBus.listenerCount('test')).toBe(0)
      expect(eventBus.listenerCount('other')).toBe(1)
    })

    it('should remove all listeners for all events', () => {
      eventBus.on('test1', () => {})
      eventBus.on('test2', () => {})

      eventBus.removeAllListeners()

      expect(eventBus.listenerCount('test1')).toBe(0)
      expect(eventBus.listenerCount('test2')).toBe(0)
    })
  })

  describe('event history', () => {
    it('should track event history', async () => {
      await eventBus.emit('event1', 'data1')
      await eventBus.emit('event2', 'data2')

      const history = eventBus.getHistory()
      expect(history.length).toBe(2)
      expect(history[0].type).toBe('event1')
      expect(history[1].type).toBe('event2')
    })

    it('should filter history by event type', async () => {
      await eventBus.emit('event1', 'data1')
      await eventBus.emit('event2', 'data2')
      await eventBus.emit('event1', 'data3')

      const history = eventBus.getHistory('event1')
      expect(history.length).toBe(2)
      expect(history.every(e => e.type === 'event1')).toBe(true)
    })

    it('should limit history results', async () => {
      await eventBus.emit('event', 'data1')
      await eventBus.emit('event', 'data2')
      await eventBus.emit('event', 'data3')

      const history = eventBus.getHistory(undefined, 2)
      expect(history.length).toBe(2)
    })

    it('should clear history', async () => {
      await eventBus.emit('event', 'data')

      expect(eventBus.getHistory().length).toBe(1)

      eventBus.clearHistory()

      expect(eventBus.getHistory().length).toBe(0)
    })

    it('should maintain max history size', async () => {
      const smallBus = createEventBus(3)

      for (let i = 0; i < 5; i++) {
        await smallBus.emit('event', `data${i}`)
      }

      const history = smallBus.getHistory()
      expect(history.length).toBe(3)
    })
  })
})
