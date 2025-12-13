/**
 * IEventBus Interface
 * Event bus service interface for dependency injection
 * Phase 5.5 Sprint 5.5.1 - Dependency Injection Infrastructure
 */

export interface IEventBus {
  on(event: string, handler: (...args: any[]) => void): () => void
  emit(event: string, ...args: any[]): void
  off(event: string, handler: (...args: any[]) => void): void
  once(event: string, handler: (...args: any[]) => void): void
  removeAllListeners(event?: string): void
}
