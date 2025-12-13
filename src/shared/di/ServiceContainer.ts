/**
 * Service Container
 * Lightweight dependency injection container
 * Phase 5.5 Sprint 5.5.1 - Dependency Injection Infrastructure
 *
 * Simple Service Locator pattern without external dependencies
 */

type ServiceFactory<T> = () => T
type ServiceInstance<T> = T

/**
 * Service Container for managing dependencies
 * Uses singleton pattern for container itself
 */
export class ServiceContainer {
  private static instance: ServiceContainer
  private services = new Map<string, ServiceFactory<any>>()
  private singletons = new Map<string, ServiceInstance<any>>()

  private constructor() {}

  /**
   * Get container instance (singleton)
   */
  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer()
    }
    return ServiceContainer.instance
  }

  /**
   * Register a service with a factory function
   * @param name - Service identifier
   * @param factory - Factory function to create the service
   * @param singleton - Whether to cache the instance
   */
  register<T>(name: string, factory: ServiceFactory<T>, singleton = true): void {
    this.services.set(name, factory)
    if (!singleton) {
      // Remove from singletons if re-registering as non-singleton
      this.singletons.delete(name)
    }
  }

  /**
   * Resolve a service by name
   * @param name - Service identifier
   * @returns Service instance
   */
  resolve<T>(name: string): T {
    const factory = this.services.get(name)
    if (!factory) {
      throw new Error(`Service not registered: ${name}`)
    }

    // Check if singleton exists
    if (this.singletons.has(name)) {
      return this.singletons.get(name) as T
    }

    // Create new instance
    const instance = factory()

    // Cache if registered as singleton
    if (this.services.has(name)) {
      this.singletons.set(name, instance)
    }

    return instance
  }

  /**
   * Check if service is registered
   * @param name - Service identifier
   */
  has(name: string): boolean {
    return this.services.has(name)
  }

  /**
   * Clear all services
   */
  clear(): void {
    this.services.clear()
    this.singletons.clear()
  }

  /**
   * Reset container (mainly for testing)
   */
  static reset(): void {
    ServiceContainer.instance = new ServiceContainer()
  }
}

/**
 * Helper function to get container instance
 */
export const container = (): ServiceContainer => ServiceContainer.getInstance()
