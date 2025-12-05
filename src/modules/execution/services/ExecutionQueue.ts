/**
 * Execution Queue Service
 * Manages queuing and concurrent execution of spaces
 * Phase 1 Sprint 1.4 - Execution Engine
 */

import type {
  ExecutionQueueItem,
  ExecutionStatus,
  ExecutionResult
} from '../types/execution.types'
import { createLogger } from '../../../shared/utils/logger'
import type { EventBus } from '../../../shared/utils/event-bus'

/**
 * Service for managing execution queue
 */
export class ExecutionQueue {
  private readonly logger = createLogger('ExecutionQueue')
  private queue: ExecutionQueueItem[] = []
  private running: Map<string, ExecutionQueueItem> = new Map()
  private completed: Map<string, ExecutionQueueItem> = new Map()
  private maxConcurrent: number

  constructor(
    private eventBus: EventBus,
    options: { maxConcurrent?: number } = {}
  ) {
    this.maxConcurrent = options.maxConcurrent || 1
    this.logger.info('ExecutionQueue initialized', { maxConcurrent: this.maxConcurrent })
  }

  /**
   * Add a space execution to the queue
   */
  public enqueue(spaceId: string, spaceName: string, priority: number = 0): string {
    const id = this.generateId()
    const item: ExecutionQueueItem = {
      id,
      spaceId,
      spaceName,
      status: 'idle',
      priority,
      createdAt: Date.now()
    }

    this.queue.push(item)
    this.sortQueue()

    this.logger.info('Execution enqueued', {
      id,
      spaceId,
      spaceName,
      priority,
      queueSize: this.queue.length
    })

    this.eventBus.emit('queue:item-added', {
      id,
      spaceId,
      spaceName,
      position: this.queue.findIndex((i) => i.id === id)
    })

    return id
  }

  /**
   * Start execution of queued items
   */
  public async processQueue(): Promise<void> {
    while (this.queue.length > 0 && this.running.size < this.maxConcurrent) {
      const item = this.queue.shift()
      if (!item) break

      this.startExecution(item)
    }
  }

  /**
   * Start execution of a queue item
   */
  private startExecution(item: ExecutionQueueItem): void {
    item.status = 'running'
    item.startedAt = Date.now()
    this.running.set(item.id, item)

    this.logger.info('Execution started', {
      id: item.id,
      spaceId: item.spaceId,
      runningCount: this.running.size
    })

    this.eventBus.emit('queue:execution-started', {
      id: item.id,
      spaceId: item.spaceId,
      spaceName: item.spaceName
    })
  }

  /**
   * Mark execution as completed
   */
  public completeExecution(id: string, result: ExecutionResult): void {
    const item = this.running.get(id)
    if (!item) {
      this.logger.warn('Tried to complete unknown execution', { id })
      return
    }

    item.status = result.success ? 'completed' : 'failed'
    item.completedAt = Date.now()
    item.result = result

    this.running.delete(id)
    this.completed.set(id, item)

    this.logger.info('Execution completed', {
      id,
      spaceId: item.spaceId,
      success: result.success,
      duration: result.duration
    })

    this.eventBus.emit('queue:execution-completed', {
      id,
      spaceId: item.spaceId,
      success: result.success,
      duration: result.duration
    })

    // Process next item in queue
    this.processQueue()
  }

  /**
   * Cancel execution
   */
  public cancelExecution(id: string): boolean {
    // Check if in queue
    const queueIndex = this.queue.findIndex((item) => item.id === id)
    if (queueIndex !== -1) {
      const item = this.queue.splice(queueIndex, 1)[0]
      item.status = 'cancelled'
      item.completedAt = Date.now()
      this.completed.set(id, item)

      this.logger.info('Queued execution cancelled', { id, spaceId: item.spaceId })
      this.eventBus.emit('queue:execution-cancelled', { id, spaceId: item.spaceId })
      return true
    }

    // Check if running
    const runningItem = this.running.get(id)
    if (runningItem) {
      runningItem.status = 'cancelled'
      runningItem.completedAt = Date.now()
      this.running.delete(id)
      this.completed.set(id, runningItem)

      this.logger.info('Running execution cancelled', { id, spaceId: runningItem.spaceId })
      this.eventBus.emit('queue:execution-cancelled', { id, spaceId: runningItem.spaceId })
      return true
    }

    return false
  }

  /**
   * Get queue item by ID
   */
  public getItem(id: string): ExecutionQueueItem | undefined {
    // Check queue
    const queueItem = this.queue.find((item) => item.id === id)
    if (queueItem) return queueItem

    // Check running
    const runningItem = this.running.get(id)
    if (runningItem) return runningItem

    // Check completed
    return this.completed.get(id)
  }

  /**
   * Get all queue items
   */
  public getAllItems(): ExecutionQueueItem[] {
    return [...this.queue, ...Array.from(this.running.values()), ...Array.from(this.completed.values())]
  }

  /**
   * Get queued items
   */
  public getQueuedItems(): ExecutionQueueItem[] {
    return [...this.queue]
  }

  /**
   * Get running items
   */
  public getRunningItems(): ExecutionQueueItem[] {
    return Array.from(this.running.values())
  }

  /**
   * Get completed items
   */
  public getCompletedItems(): ExecutionQueueItem[] {
    return Array.from(this.completed.values())
  }

  /**
   * Get queue status
   */
  public getStatus(): {
    queued: number
    running: number
    completed: number
    maxConcurrent: number
  } {
    return {
      queued: this.queue.length,
      running: this.running.size,
      completed: this.completed.size,
      maxConcurrent: this.maxConcurrent
    }
  }

  /**
   * Clear completed items
   */
  public clearCompleted(): void {
    const count = this.completed.size
    this.completed.clear()
    this.logger.info('Completed items cleared', { count })
  }

  /**
   * Clear all items
   */
  public clearAll(): void {
    this.queue = []
    this.running.clear()
    this.completed.clear()
    this.logger.info('All queue items cleared')
  }

  /**
   * Set max concurrent executions
   */
  public setMaxConcurrent(max: number): void {
    if (max < 1) {
      throw new Error('Max concurrent must be at least 1')
    }

    this.maxConcurrent = max
    this.logger.info('Max concurrent updated', { maxConcurrent: max })
    this.processQueue()
  }

  /**
   * Sort queue by priority (higher priority first)
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority
      }
      // If same priority, sort by creation time (FIFO)
      return a.createdAt - b.createdAt
    })
  }

  /**
   * Generate unique ID for queue item
   */
  private generateId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }
}
