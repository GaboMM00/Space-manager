/**
 * Bus de eventos para comunicación interna
 */

import { EventEmitter } from 'events';
import { createLogger } from '@shared/utils';

const logger = createLogger('EventBus');

type EventHandler = (...args: any[]) => void;

export class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Aumentar límite de listeners
  }

  /**
   * Emite un evento
   */
  emit(event: string, ...args: any[]): boolean {
    logger.debug(`Event emitted: ${event}`, { argsCount: args.length });
    return super.emit(event, ...args);
  }

  /**
   * Se suscribe a un evento
   */
  on(event: string, handler: EventHandler): this {
    logger.debug(`Subscribed to event: ${event}`);
    return super.on(event, handler);
  }

  /**
   * Se suscribe a un evento una sola vez
   */
  once(event: string, handler: EventHandler): this {
    logger.debug(`Subscribed once to event: ${event}`);
    return super.once(event, handler);
  }

  /**
   * Remueve un listener
   */
  off(event: string, handler: EventHandler): this {
    logger.debug(`Unsubscribed from event: ${event}`);
    return super.off(event, handler);
  }

  /**
   * Remueve todos los listeners de un evento
   */
  removeAllListeners(event?: string): this {
    if (event) {
      logger.debug(`Removed all listeners for event: ${event}`);
    } else {
      logger.debug('Removed all listeners');
    }
    return super.removeAllListeners(event);
  }
}

// Singleton instance
let instance: EventBus | null = null;

export function getEventBus(): EventBus {
  if (!instance) {
    instance = new EventBus();
  }
  return instance;
}
