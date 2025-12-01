/**
 * IPC Main Process handler
 * Central IPC communication setup for Main process
 */

import { ipcMain as electronIPCMain, IpcMainInvokeEvent, WebContents } from 'electron'
import { IPCInvokeMap } from '../../shared/types/ipc.types'
import { Result } from '../../shared/types/common.types'
import { logger } from '../../shared/utils/logger'

/**
 * IPC Handler function type
 */
export type IPCHandler<TChannel extends keyof IPCInvokeMap> = (
  event: IpcMainInvokeEvent,
  ...args: IPCInvokeMap[TChannel]['args']
) => Promise<IPCInvokeMap[TChannel]['return']> | IPCInvokeMap[TChannel]['return']

/**
 * IPC Main manager class
 */
export class IPCMain {
  private handlers: Map<string, IPCHandler<any>>
  private static instance: IPCMain

  private constructor() {
    this.handlers = new Map()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): IPCMain {
    if (!IPCMain.instance) {
      IPCMain.instance = new IPCMain()
    }
    return IPCMain.instance
  }

  /**
   * Register IPC handler
   */
  handle<TChannel extends keyof IPCInvokeMap>(
    channel: TChannel,
    handler: IPCHandler<TChannel>
  ): void {
    if (this.handlers.has(channel)) {
      logger.warn('IPC handler already registered, overwriting', { channel })
    }

    this.handlers.set(channel, handler)

    electronIPCMain.handle(channel as string, async (event, ...args) => {
      const startTime = Date.now()
      logger.debug('IPC request received', { channel, argsCount: args.length })

      try {
        const result = await handler(event, ...(args as IPCInvokeMap[TChannel]['args']))
        const duration = Date.now() - startTime

        logger.debug('IPC request completed', { channel, duration })
        return result
      } catch (error) {
        const duration = Date.now() - startTime
        logger.error('IPC request failed', error, { channel, duration })

        // Return error result
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return {
          success: false,
          error: errorMessage,
          code: 'IPC_ERROR'
        } as Result
      }
    })

    logger.info('IPC handler registered', { channel })
  }

  /**
   * Remove IPC handler
   */
  removeHandler(channel: keyof IPCInvokeMap): void {
    if (this.handlers.has(channel)) {
      electronIPCMain.removeHandler(channel as string)
      this.handlers.delete(channel)
      logger.info('IPC handler removed', { channel })
    }
  }

  /**
   * Remove all handlers
   */
  removeAllHandlers(): void {
    for (const channel of this.handlers.keys()) {
      electronIPCMain.removeHandler(channel)
    }
    this.handlers.clear()
    logger.info('All IPC handlers removed')
  }

  /**
   * Send event to renderer process
   */
  static sendToRenderer<TEvent extends keyof IPCInvokeMap>(
    webContents: WebContents,
    event: TEvent,
    data: any
  ): void {
    if (!webContents.isDestroyed()) {
      webContents.send(event as string, data)
      logger.debug('Event sent to renderer', { event })
    } else {
      logger.warn('Cannot send event, webContents destroyed', { event })
    }
  }

  /**
   * Send event to all renderer processes
   */
  static broadcastToRenderers<TEvent extends keyof IPCInvokeMap>(
    event: TEvent,
    data: any
  ): void {
    const { BrowserWindow } = require('electron')
    const windows = BrowserWindow.getAllWindows()

    for (const window of windows) {
      if (!window.isDestroyed()) {
        window.webContents.send(event as string, data)
      }
    }

    logger.debug('Event broadcast to all renderers', { event, windowCount: windows.length })
  }

  /**
   * Get registered handler count
   */
  getHandlerCount(): number {
    return this.handlers.size
  }

  /**
   * Check if handler exists
   */
  hasHandler(channel: keyof IPCInvokeMap): boolean {
    return this.handlers.has(channel)
  }

  /**
   * Get all registered channels
   */
  getRegisteredChannels(): string[] {
    return Array.from(this.handlers.keys())
  }
}

/**
 * Helper function to create success result
 */
export function createSuccessResult<T>(data?: T): Result<T> {
  return {
    success: true,
    data
  }
}

/**
 * Helper function to create error result
 */
export function createErrorResult(error: string, code?: string): Result {
  return {
    success: false,
    error,
    code
  }
}

/**
 * Get singleton instance
 */
export const ipcMain = IPCMain.getInstance()
