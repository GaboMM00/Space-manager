/**
 * Base ViewModel class
 * Provides common functionality for all ViewModels in MVVM pattern
 */

import { EventBus, createEventBus } from '../../../shared/utils/event-bus'
import { logger } from '../../../shared/utils/logger'

/**
 * ViewModel state
 */
export interface ViewModelState {
  isLoading: boolean
  error: string | null
}

/**
 * Base ViewModel abstract class
 */
export abstract class BaseViewModel<TState extends ViewModelState = ViewModelState> {
  protected state: TState
  protected eventBus: EventBus
  protected logger = logger.child({ viewModel: this.constructor.name })

  constructor(initialState: TState) {
    this.state = initialState
    this.eventBus = createEventBus()

    this.logger.debug('ViewModel initialized')
  }

  /**
   * Get current state
   */
  getState(): Readonly<TState> {
    return { ...this.state }
  }

  /**
   * Set loading state
   */
  protected setLoading(isLoading: boolean): void {
    this.setState({ isLoading } as Partial<TState>)
  }

  /**
   * Set error state
   */
  protected setError(error: string | null): void {
    this.setState({ error } as Partial<TState>)

    if (error) {
      this.logger.error('ViewModel error', new Error(error))
    }
  }

  /**
   * Clear error state
   */
  protected clearError(): void {
    this.setError(null)
  }

  /**
   * Update state (to be implemented by subclasses)
   */
  protected abstract setState(updates: Partial<TState>): void

  /**
   * Emit state change event
   */
  protected emitStateChange(): void {
    this.eventBus.emit('state:changed', this.state)
  }

  /**
   * Subscribe to state changes
   */
  onStateChange(callback: (state: TState) => void): () => void {
    const subscription = this.eventBus.on('state:changed', callback)
    return subscription.unsubscribe
  }

  /**
   * Execute async operation with loading state
   */
  protected async executeWithLoading<T>(
    operation: () => Promise<T>,
    errorMessage = 'Operation failed'
  ): Promise<T | null> {
    this.setLoading(true)
    this.clearError()

    try {
      const result = await operation()
      this.setLoading(false)
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : errorMessage
      this.setError(message)
      this.setLoading(false)
      return null
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.eventBus.removeAllListeners()
    this.logger.debug('ViewModel destroyed')
  }
}
